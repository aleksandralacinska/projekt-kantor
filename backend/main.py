from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend import crud
from backend.models import Account, Base
from backend.schemes import UserCreate, UserLogin
from backend.crud import create_transaction, get_user_balances, get_user_by_email, create_user
from backend.database import engine, SessionLocal
from passlib.context import CryptContext
from backend import models
from decimal import Decimal
import requests

# Tworzenie tabel w bazie danych na podstawie zdefiniowanych modeli
Base.metadata.create_all(bind=engine)

# Inicjalizacja aplikacji FastAPI
app = FastAPI()

# Konfiguracja CORS – pozwala na dostęp do API z dowolnego źródła (np. frontend React lub mobilny)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfiguracja hashowania haseł przy użyciu bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency – sesja bazy danych
def get_db():
    """
    Generator sesji bazy danych. Tworzy i zwraca sesję, a po zakończeniu zamyka połączenie.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def fetch_exchange_rates_from_nbp():
    """
    Pobiera aktualne kursy wymiany walut z API NBP.

    Zwraca:
    - Słownik, gdzie klucze to kody walut (np. "USD"), a wartości to ich kursy względem PLN.

    Wyrzuca:
    - Wyjątek, jeśli wystąpi błąd podczas pobierania kursów.
    """
    try:
        response = requests.get("https://api.nbp.pl/api/exchangerates/tables/A?format=json")
        response.raise_for_status()
        data = response.json()

        # Konwersja kursów na słownik
        rates = {rate["code"]: Decimal(rate["mid"]) for rate in data[0]["rates"]}
        rates["PLN"] = Decimal("1.0")  # PLN jako waluta bazowa
        return rates
    except requests.RequestException as e:
        raise Exception("Błąd podczas pobierania kursów z API NBP: " + str(e))

@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint do rejestracji nowego użytkownika.

    - Sprawdza, czy użytkownik o podanym emailu już istnieje.
    - Tworzy nowego użytkownika oraz domyślne konta walutowe.
    """
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@app.post("/login/")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """
    Endpoint do logowania użytkownika.

    - Sprawdza poprawność emaila i hasła.
    - Zwraca podstawowe informacje o użytkowniku po poprawnym logowaniu.
    """
    db_user = get_user_by_email(db, email=user.email)
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
        },
    }

@app.get("/balance/")
def get_balance(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Endpoint do pobierania sald użytkownika.

    - Wymaga podania `user_id` jako parametru zapytania.
    - Zwraca słownik z saldami dla każdej waluty.
    """
    balances = get_user_balances(db, user_id=user_id)
    if balances is None:
        raise HTTPException(status_code=404, detail="User not found or no balances")
    return {"balances": balances}

class DepositRequest(BaseModel):
    """
    Klasa walidująca dane wejściowe dla endpointu `/deposit/`.
    """
    user_id: int
    currency: str
    amount: float

@app.post("/deposit/")
def deposit_funds(request: DepositRequest, db: Session = Depends(get_db)):
    """
    Endpoint do zasilania konta użytkownika.

    - Waliduje dane wejściowe (kwota, waluta, user_id).
    - Dodaje kwotę do salda odpowiedniego konta.
    - Tworzy wpis w tabeli `transactions`.
    """
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Kwota zasilenia musi być większa od 0")

    account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == request.currency
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Konto nie zostało znalezione")

    account.balance += Decimal(request.amount)
    db.commit()
    db.refresh(account)

    create_transaction(
        db=db,
        user_id=request.user_id,
        type="deposit",
        amount=request.amount,
        currency=request.currency
    )

    return {"message": "Saldo zostało zaktualizowane", "new_balance": float(account.balance)}

class ExchangeRequest(BaseModel):
    """
    Klasa walidująca dane wejściowe dla endpointu `/exchange/`.
    """
    user_id: int
    source_currency: str
    target_currency: str
    amount: float

@app.post("/exchange/")
def exchange_currency(request: ExchangeRequest, db: Session = Depends(get_db)):
    """
    Endpoint do wymiany walut.

    - Waliduje waluty i kwoty.
    - Przelicza wartość według kursu z NBP.
    - Aktualizuje salda kont użytkownika.
    - Dodaje wpis w tabeli `transactions`.
    """
    try:
        rates = fetch_exchange_rates_from_nbp()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    source_currency = request.source_currency.upper()
    target_currency = request.target_currency.upper()

    if source_currency not in rates:
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta źródłowa")
    if target_currency not in rates:
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta docelowa")

    source_rate = rates[source_currency]
    target_rate = rates[target_currency]
    conversion_rate = source_rate / target_rate
    exchanged_amount = Decimal(request.amount) * conversion_rate

    source_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == source_currency
    ).first()
    target_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == target_currency
    ).first()

    if not source_account:
        raise HTTPException(status_code=404, detail="Nie znaleziono konta źródłowego")
    if not target_account:
        target_account = Account(
            user_id=request.user_id,
            currency=target_currency,
            balance=Decimal("0.0"),
        )
        db.add(target_account)
        db.commit()
        db.refresh(target_account)

    if source_account.balance < Decimal(request.amount):
        raise HTTPException(status_code=400, detail="Niewystarczające środki na koncie")

    source_account.balance -= Decimal(request.amount)
    target_account.balance += exchanged_amount

    db.commit()
    db.refresh(source_account)
    db.refresh(target_account)

    create_transaction(
        db=db,
        user_id=request.user_id,
        type="exchange",
        amount=request.amount,
        currency=source_currency,
        target_currency=target_currency,
        exchange_rate=float(conversion_rate),
    )

    return {
        "message": "Wymiana zakończona pomyślnie",
        "source_balance": float(source_account.balance),
        "target_balance": float(target_account.balance),
        "conversion_rate": float(conversion_rate),
        "exchanged_amount": float(exchanged_amount),
    }
