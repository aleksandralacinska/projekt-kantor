from sqlalchemy.orm import Session
from backend.models import User, Account
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
