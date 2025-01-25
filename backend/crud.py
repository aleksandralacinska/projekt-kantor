from sqlalchemy.orm import Session
from backend.models import User, Account
from backend.schemes import UserCreate
from passlib.hash import bcrypt

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

    # Tworzenie domyślnego konta w PLN
    default_account = Account(user_id=db_user.id, currency="PLN", balance=0.0)
    db.add(default_account)
    db.commit()
    db.refresh(default_account)
    return db_user

def get_user_balances(db: Session, user_id: int):
    """
    Pobiera salda użytkownika dla wszystkich walut.
    """
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    if not accounts:
        return None
    return {account.currency: float(account.balance) for account in accounts}