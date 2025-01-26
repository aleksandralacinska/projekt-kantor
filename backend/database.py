from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Adres połączenia do PostgreSQL
# Określa lokalizację bazy danych, nazwę użytkownika, hasło oraz nazwę bazy.
DATABASE_URL = "postgresql://postgres:postgres@localhost/kantor_app"

# Tworzenie silnika połączenia z bazą danych
# Silnik odpowiada za komunikację między aplikacją a bazą danych.
engine = create_engine(DATABASE_URL)

# Tworzenie klasy sesji
# - autocommit=False: transakcje muszą być jawnie zatwierdzane.
# - autoflush=False: dane nie są automatycznie zapisywane w bazie przed wykonaniem zapytania.
# - bind=engine: sesje używają skonfigurowanego silnika połączenia.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bazowa klasa modelu
# Wszystkie klasy reprezentujące tabele w bazie danych będą dziedziczyć z tej klasy.
Base = declarative_base()
