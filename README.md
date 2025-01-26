# projekt-kantor
Zagadnienia sieciowe w systemach mobilnych

# Uruchomienie aplikacji
1. Pobierz najnowszą wersję PostgreSQL i pythona
2. Po zalogowaniu się na PostgreSQL tworzymy lokalną bazę danych komendą: CREATE DATABASE kantor_app;
3. Po tworzeniu bazy danych podłączamy się do niej przy pomocy: \c kantor_app
4. Po podłączeniu się do bazy danych wklejamy kod do SQL:
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    surname VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.0
);
 
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    currency CHAR(3) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    rate NUMERIC(10, 4),
    timestamp TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    currency CHAR(3) NOT NULL,
    rate NUMERIC(10, 4) NOT NULL,
    date DATE NOT NULL
);
 
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);
5. Sprawdź swoje ip przy pomocy terminala Windows wpisując ipconfig
6. Swoje Ipv4 musisz wkleić do pliku services/config.js
7. Otwórz terminal w projekcie i podziel go na pół, jeden terminal będzie obsługiwał backend a drugi frontend
8. Zainstaluj niezbędne biblioteki w terminalu projektu: pip install fastapi uvicorn psycopg2 sqlalchemy pydantic oraz npm install
9. W jednym terminalu włączamy frontend przy pomocy komendy npx expo start -c a w drugim terminalu włączamy backend przy pomocy komendy uvicorn backend.main:app --host (twojeIP) --port 8000 --reload
10. Jeśli brakuje jakichś zainstalowanych bibliotek, doinstaluj zgodnie ze wskazówkami terminala.