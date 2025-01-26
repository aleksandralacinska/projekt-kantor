from sqlalchemy.orm import Session
from backend.models import Transaction, User, Account
from backend.schemes import UserCreate
from passlib.hash import bcrypt

# Lista obsługiwanych walut
SUPPORTED_CURRENCIES = ["PLN", "USD", "EUR"]

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = bcrypt.hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        surname=user.surname,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Tworzenie domyślnych kont walutowych
    for currency in SUPPORTED_CURRENCIES:
        account = Account(user_id=db_user.id, currency=currency, balance=0.0)
        db.add(account)

    db.commit()
    return db_user

def get_user_balances(db: Session, user_id: int):
    """
    Pobiera salda użytkownika dla wszystkich walut.
    """
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    return {account.currency: float(account.balance) for account in accounts}

def create_transaction(
    db: Session,
    user_id: int,
    type: str,
    amount: float,
    currency: str,
    target_currency: str = None,
    exchange_rate: float = None,
):
    """
    Tworzy nową transakcję w bazie danych.
    """
    transaction = Transaction(
        user_id=user_id,
        type=type,
        amount=amount,
        currency=currency,
        target_currency=target_currency,
        exchange_rate=exchange_rate,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction