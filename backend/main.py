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
# Tworzenie tabel w bazie danych
Base.metadata.create_all(bind=engine)

# Inicjalizacja aplikacji
app = FastAPI()

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfiguracja hashowania haseł
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency – połączenie z bazą danych
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def fetch_exchange_rates_from_nbp():
    """
    Pobiera kursy wymiany walut z API NBP.
    """
    try:
        response = requests.get("https://api.nbp.pl/api/exchangerates/tables/A?format=json")
        response.raise_for_status()
        data = response.json()

        # Przetwarzanie danych: konwertujemy listę kursów na słownik
        rates = {rate["code"]: Decimal(rate["mid"]) for rate in data[0]["rates"]}
        rates["PLN"] = Decimal("1.0")  # Dodanie PLN jako waluty bazowej
        return rates
    except requests.RequestException as e:
        raise Exception("Błąd podczas pobierania kursów z API NBP: " + str(e))

@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@app.post("/login/")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
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
    balances = get_user_balances(db, user_id=user_id)
    if balances is None:
        raise HTTPException(status_code=404, detail="User not found or no balances")
    return {"balances": balances}

# Klasa walidująca dane wejściowe
class DepositRequest(BaseModel):
    user_id: int
    currency: str
    amount: float

@app.post("/deposit/")
def deposit_funds(request: DepositRequest, db: Session = Depends(get_db)):
    # Walidacja danych
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Kwota zasilenia musi być większa od 0")

    account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == request.currency
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Konto nie zostało znalezione")

    # Aktualizacja salda
    account.balance += Decimal(request.amount)
    db.commit()
    db.refresh(account)

    # Dodanie transakcji
    create_transaction(
        db=db,
        user_id=request.user_id,
        type="deposit",
        amount=request.amount,
        currency=request.currency
    )

    return {"message": "Saldo zostało zaktualizowane", "new_balance": float(account.balance)}

class ExchangeRequest(BaseModel):
    user_id: int
    source_currency: str
    target_currency: str
    amount: float

@app.post("/exchange/")
def exchange_currency(request: ExchangeRequest, db: Session = Depends(get_db)):
    """
    Endpoint obsługujący wymianę walut.
    """
    try:
        # Pobierz kursy walut
        rates = fetch_exchange_rates_from_nbp()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Walidacja walut
    source_currency = request.source_currency.upper()
    target_currency = request.target_currency.upper()

    if source_currency not in rates:
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta źródłowa")
    if target_currency not in rates:
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta docelowa")

    # Pobierz kursy
    source_rate = rates[source_currency]
    target_rate = rates[target_currency]

    # Przelicznik walut
    conversion_rate = source_rate / target_rate
    exchanged_amount = Decimal(request.amount) * conversion_rate

    # Pobierz konta użytkownika
    source_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == source_currency
    ).first()
    target_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == target_currency
    ).first()

    if not source_account:
        raise HTTPException(status_code=404, detail="Nie znaleziono konta źródłowego")
    if not target_account:
        # Utwórz nowe konto dla waluty docelowej
        target_account = Account(
            user_id=request.user_id,
            currency=target_currency,
            balance=Decimal("0.0"),
        )
        db.add(target_account)
        db.commit()
        db.refresh(target_account)

    # Sprawdź saldo na koncie źródłowym
    if source_account.balance < Decimal(request.amount):
        raise HTTPException(status_code=400, detail="Niewystarczające środki na koncie")

    # Aktualizuj salda kont
    source_account.balance -= Decimal(request.amount)
    target_account.balance += exchanged_amount

    db.commit()
    db.refresh(source_account)
    db.refresh(target_account)

    # Dodaj transakcję
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


@app.post("/transaction/")
def add_transaction(
    user_id: int,
    type: str,
    amount: float,
    currency: str,
    target_currency: str = None,
    exchange_rate: float = None,
    db: Session = Depends(get_db)
):
    """
    Endpoint do dodawania transakcji.
    """
    if type not in ["deposit", "exchange"]:
        raise HTTPException(status_code=400, detail="Nieobsługiwany typ transakcji.")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Kwota musi być większa od 0.")

    # Utwórz transakcję
    transaction = create_transaction(
        db,
        user_id=user_id,
        type=type,
        amount=amount,
        currency=currency,
        target_currency=target_currency,
        exchange_rate=exchange_rate,
    )

    return {"message": "Transakcja dodana pomyślnie", "transaction": transaction}
