from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

# Model użytkownika
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacja z kontami użytkownika
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    # Relacja z transakcjami
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


# Model konta walutowego
class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    currency = Column(String, nullable=False)  # Kod waluty (np. PLN, USD, EUR)
    balance = Column(Numeric(15, 2), default=0.0)  # Saldo konta w danej walucie

    # Relacja z użytkownikiem
    user = relationship("User", back_populates="accounts")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Klucz obcy do użytkownika
    type = Column(String, nullable=False)  # Typ transakcji: "deposit" lub "exchange"
    amount = Column(Numeric(15, 2), nullable=False)  # Kwota transakcji
    currency = Column(String, nullable=False)  # Waluta transakcji
    target_currency = Column(String, nullable=True)  # Waluta docelowa (dla wymiany)
    exchange_rate = Column(Numeric(15, 6), nullable=True)  # Kurs wymiany (dla wymiany)
    created_at = Column(DateTime, default=datetime.utcnow)  # Data transakcji

    user = relationship("User", back_populates="transactions")