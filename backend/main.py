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