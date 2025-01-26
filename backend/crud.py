from sqlalchemy.orm import Session
from backend.models import Transaction, User, Account
from backend.schemes import UserCreate
from passlib.hash import bcrypt

# Lista obsługiwanych walut
SUPPORTED_CURRENCIES = ["PLN", "USD", "EUR"]

def get_user_by_email(db: Session, email: str):
    """
    Pobiera użytkownika z bazy danych na podstawie adresu e-mail.
    
    Parametry:
    - db (Session): Sesja bazy danych.
    - email (str): Adres e-mail użytkownika.
    
    Zwraca:
    - Obiekt `User`, jeśli użytkownik istnieje, w przeciwnym razie `None`.
    """
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    """
    Tworzy nowego użytkownika w bazie danych i inicjalizuje jego domyślne konta walutowe.

    Parametry:
    - db (Session): Sesja bazy danych.
    - user (UserCreate): Dane nowego użytkownika (email, hasło, imię, nazwisko).

    Kroki:
    1. Hashuje hasło użytkownika przy użyciu `bcrypt`.
    2. Tworzy nowy rekord w tabeli `users`.
    3. Tworzy domyślne konta walutowe (`PLN`, `USD`, `EUR`) w tabeli `accounts` z zerowym saldem.
    4. Zapisuje zmiany w bazie.

    Zwraca:
    - Obiekt `User` reprezentujący nowo utworzonego użytkownika.
    """
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
    Pobiera salda użytkownika we wszystkich walutach.

    Parametry:
    - db (Session): Sesja bazy danych.
    - user_id (int): ID użytkownika.

    Zwraca:
    - Słownik, gdzie kluczami są kody walut (np. `PLN`, `USD`), a wartościami są salda kont.
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
    Tworzy nowy zapis transakcji w tabeli `transactions`.

    Parametry:
    - db (Session): Sesja bazy danych.
    - user_id (int): ID użytkownika wykonującego transakcję.
    - type (str): Typ transakcji (`deposit`, `withdrawal`, `exchange`).
    - amount (float): Kwota transakcji w walucie źródłowej.
    - currency (str): Kod waluty źródłowej (np. `PLN`).
    - target_currency (str, opcjonalne): Kod waluty docelowej (np. `EUR`), używane w wymianie walut.
    - exchange_rate (float, opcjonalne): Kurs wymiany walut (waluta źródłowa -> docelowa).

    Kroki:
    1. Tworzy obiekt `Transaction` na podstawie podanych danych.
    2. Dodaje transakcję do bazy danych.
    3. Zapisuje zmiany i odświeża transakcję.

    Zwraca:
    - Obiekt `Transaction` reprezentujący nowo utworzoną transakcję.
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
