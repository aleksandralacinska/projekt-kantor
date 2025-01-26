from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    """
    Reprezentuje dane wejściowe wymagane do utworzenia nowego użytkownika.

    Pola:
    - email: Adres e-mail użytkownika. Walidowany jako poprawny format e-maila (`EmailStr`).
    - password: Hasło użytkownika. Walidacja wymusza długość od 6 do 128 znaków.
    - name: Imię użytkownika (ciąg znaków).
    - surname: Nazwisko użytkownika (ciąg znaków).
    """
    email: EmailStr
    password: constr(min_length=6, max_length=128)
    name: str
    surname: str

class UserLogin(BaseModel):
    """
    Reprezentuje dane wejściowe wymagane do logowania użytkownika.

    Pola:
    - email: Adres e-mail użytkownika. Walidowany jako poprawny format e-maila (`EmailStr`).
    - password: Hasło użytkownika. Walidacja wymusza długość od 6 do 128 znaków.
    """
    email: EmailStr  # Walidacja formatu e-maila.
    password: constr(min_length=6, max_length=128)  # Hasło musi spełniać wymogi długości.
