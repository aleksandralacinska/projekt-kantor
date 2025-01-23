from sqlalchemy.orm import Session
from backend.models import User
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
    return db_user
