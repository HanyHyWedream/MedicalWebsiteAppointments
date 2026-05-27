import bcrypt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from database import get_connection
from jose import jwt, JWTError
from datetime import datetime, timedelta

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "medicare_secret_key_2024"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

class RegisterUser(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    role: str = "patient"

class LoginUser(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))

def create_token(user_id: int, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_admin(payload: dict = Depends(decode_token)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return payload

def require_patient(payload: dict = Depends(decode_token)):
    if payload.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patients only")
    return payload

@router.post("/register")
def register(user: RegisterUser):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already exists")

        hashed_pwd = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (%s, %s, %s, %s, %s)",
            (user.full_name, user.email, hashed_pwd, user.phone, user.role)
        )
        user_id = cursor.lastrowid

        # If registering as patient, add to patients table too
        if user.role == "patient":
            cursor.execute(
                "INSERT INTO patients (user_id) VALUES (%s)",
                (user_id,)
            )

        conn.commit()
        return {"message": "Account created successfully"}
    finally:
        cursor.close()
        conn.close()

@router.post("/login")
def login(user: LoginUser):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        db_user = cursor.fetchone()

        if not db_user or not verify_password(user.password, db_user[3]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(user_id=db_user[0], role=db_user[5])
        return {
            "message": "Login successful",
            "token": token,
            "user_id": db_user[0],
            "role": db_user[5],
            "full_name": db_user[1]
        }
    finally:
        cursor.close()
        conn.close()