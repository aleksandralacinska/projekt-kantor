from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6, max_length=128)
    name: str
    surname: str

class UserLogin(BaseModel):
    email: EmailStr  # Walidacja e-maila
    password: constr(min_length=6, max_length=128)  # Hasło musi mieć długość od 6 do 128 znaków
