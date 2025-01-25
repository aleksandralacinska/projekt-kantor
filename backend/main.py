from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend import crud
from backend.models import Account, Base
from backend.schemes import UserCreate, UserLogin
from backend.crud import get_user_balances, get_user_by_email, create_user
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
    """
    Endpoint obsługujący zasilenie konta użytkownika.
    """
    # Debugowanie danych wejściowych
    print(f"ODEBRANE DANE: {request.dict()}")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Kwota zasilenia musi być większa od 0")

    account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == request.currency
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Konto nie zostało znalezione")

    # Konwersja amount na Decimal
    account.balance += Decimal(request.amount)
    db.commit()
    db.refresh(account)

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
    print(f"Żądanie wymiany: {request.dict()}")

    # Pobierz kursy z API NBP
    try:
        response = requests.get("https://api.nbp.pl/api/exchangerates/tables/A?format=json")
        response.raise_for_status()
        rates = {rate["code"].upper(): Decimal(rate["mid"]) for rate in response.json()[0]["rates"]}
        rates["PLN"] = Decimal("1.0")  # Dodanie PLN jako waluty bazowej
        print(f"Kursy walut: {rates}")
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Błąd podczas pobierania kursów walut z NBP")

    # Walidacja walut
    source_currency = request.source_currency.upper()
    target_currency = request.target_currency.upper()

    if source_currency not in rates:
        print(f"Nieobsługiwana waluta źródłowa: {source_currency}")
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta źródłowa")

    if target_currency not in rates:
        print(f"Nieobsługiwana waluta docelowa: {target_currency}")
        raise HTTPException(status_code=400, detail="Nieobsługiwana waluta docelowa")

    # Pobierz konta użytkownika dla obu walut
    source_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == source_currency
    ).first()

    if not source_account:
        print(f"Nie znaleziono konta dla waluty źródłowej: {source_currency}")
        raise HTTPException(status_code=404, detail="Nie znaleziono konta dla waluty źródłowej")

    # Pobierz lub utwórz konto docelowe
    target_account = db.query(Account).filter(
        Account.user_id == request.user_id, Account.currency == target_currency
    ).first()

    if not target_account:
        print(f"Tworzenie nowego konta dla waluty docelowej: {target_currency}")
        target_account = Account(
            user_id=request.user_id,
            currency=target_currency,
            balance=Decimal("0.0"),
        )
        db.add(target_account)
        db.commit()
        db.refresh(target_account)

    # Sprawdź, czy użytkownik ma wystarczające środki
    source_amount = Decimal(request.amount)
    if source_account.balance < source_amount:
        print("Niewystarczające środki na koncie")
        raise HTTPException(status_code=400, detail="Niewystarczające środki na koncie")

    # Oblicz ilość waluty docelowej
    source_rate = rates[source_currency]
    target_rate = rates[target_currency]
    conversion_rate = source_rate / target_rate  # Przelicznik kursowy
    exchanged_amount = (source_amount / conversion_rate).quantize(Decimal("0.01"))  # Kwota docelowa zaokrąglona do 2 miejsc
    print(f"Przeliczona kwota: {exchanged_amount} {target_currency} przy kursie {conversion_rate}")

    # Zaktualizuj salda użytkownika
    source_account.balance -= source_amount.quantize(Decimal("0.01"))  # Zaokrąglenie dla salda
    target_account.balance += exchanged_amount

    db.commit()
    db.refresh(source_account)
    db.refresh(target_account)

    print(f"Nowe saldo źródłowe: {source_account.balance}")
    print(f"Nowe saldo docelowe: {target_account.balance}")

    return {
        "message": "Wymiana zakończona pomyślnie",
        "source_balance": float(source_account.balance),
        "target_balance": float(target_account.balance),
        "conversion_rate": float(conversion_rate),
        "exchanged_amount": float(exchanged_amount),
    }
