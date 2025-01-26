from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

# Model użytkownika
class User(Base):
    """
    Model reprezentujący użytkownika aplikacji.

    Kolumny:
    - id: Unikalny identyfikator użytkownika.
    - email: Adres e-mail użytkownika (unikalny).
    - password_hash: Zhashowane hasło użytkownika.
    - name: Imię użytkownika (opcjonalne).
    - surname: Nazwisko użytkownika (opcjonalne).
    - created_at: Data i godzina utworzenia użytkownika (domyślnie bieżący czas).

    Relacje:
    - accounts: Relacja z kontami użytkownika (`Account`), z opcją kaskadowego usuwania.
    - transactions: Relacja z transakcjami użytkownika (`Transaction`), z opcją kaskadowego usuwania.
    """
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
    """
    Model reprezentujący konto walutowe użytkownika.

    Kolumny:
    - id: Unikalny identyfikator konta.
    - user_id: Id użytkownika (klucz obcy do `users`).
    - currency: Kod waluty konta (np. PLN, USD, EUR).
    - balance: Saldo konta w danej walucie (domyślnie 0.00).

    Relacje:
    - user: Relacja do modelu `User` (właściciel konta).
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    currency = Column(String, nullable=False)  # Kod waluty (np. PLN, USD, EUR)
    balance = Column(Numeric(15, 2), default=0.0)  # Saldo konta w danej walucie

    # Relacja z użytkownikiem
    user = relationship("User", back_populates="accounts")

# Model transakcji
class Transaction(Base):
    """
    Model reprezentujący transakcję finansową użytkownika.

    Kolumny:
    - id: Unikalny identyfikator transakcji.
    - user_id: Id użytkownika (klucz obcy do `users`).
    - type: Typ transakcji (np. "deposit" dla wpłaty, "exchange" dla wymiany walut).
    - amount: Kwota transakcji.
    - currency: Kod waluty związanej z transakcją.
    - target_currency: Kod waluty docelowej (dla wymiany walut, opcjonalne).
    - exchange_rate: Kurs wymiany walut (dla transakcji typu "exchange", opcjonalne).
    - created_at: Data i godzina utworzenia transakcji (domyślnie bieżący czas).

    Relacje:
    - user: Relacja do modelu `User` (właściciel transakcji).
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Klucz obcy do użytkownika
    type = Column(String, nullable=False)  # Typ transakcji: "deposit" lub "exchange"
    amount = Column(Numeric(15, 2), nullable=False)  # Kwota transakcji
    currency = Column(String, nullable=False)  # Waluta transakcji
    target_currency = Column(String, nullable=True)  # Waluta docelowa (dla wymiany)
    exchange_rate = Column(Numeric(15, 6), nullable=True)  # Kurs wymiany (dla wymiany)
    created_at = Column(DateTime, default=datetime.utcnow)  # Data transakcji

    # Relacja z użytkownikiem
    user = relationship("User", back_populates="transactions")
