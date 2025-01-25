from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend import crud
from backend.models import Base
from backend.schemes import UserCreate, UserLogin
from backend.crud import get_user_balances, get_user_by_email, create_user
from backend.database import engine, SessionLocal
from passlib.context import CryptContext
from backend import models

# Tworzenie tabel w bazie danych
Base.metadata.create_all(bind=engine)

# Inicjalizacja aplikacji
app = FastAPI()

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Możesz dodać konkretne adresy, np. ["http://192.168.1.15:19006"]
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
    return {"message": "Login successful", "user": {"email": db_user.email, "name": db_user.name}}

@app.get("/balance/")
def get_balance(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Endpoint do pobierania salda użytkownika.
    """
    balances = get_user_balances(db, user_id=user_id)
    if balances is None:
        raise HTTPException(status_code=404, detail="User not found or no balances")
    return {"balances": balances}