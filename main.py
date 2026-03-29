from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas
from database import engine, get_db

from datetime import datetime,timedelta,timezone
import jwt
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
models.Base.metadata.create_all(bind = engine)

app = FastAPI(
    title= "API  de resúmenes con IA",
    description= "Backend para la gestion y resumen de los textos",
    version= "1.0.0"
)

pwd_context = CryptContext(schemes=["bcrypt"],deprecated ="auto")

def get_password_hash(password):
    return pwd_context.hash(password)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES =30 #TIEMPO EN EL QUE EL TOKEN EXPIRA EN MINUTOS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/")

def verify_password(plain_password,hashed_password):
    return pwd_context.verify(plain_password,hashed_password)

def create_access_token(data:dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token:str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        email:str = payload.get("sub")
        
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="El token ha exprirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Token invalido")
    
    user = db.query(models.User).filter(models.User.email == email).first()
      
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "Usuario no encontrado")
    
    return user
    
        

@app.get("/")

def verificar_estado():
    return {"mensaje": "El servidor FastAPI está funcionando sin problemas"}


@app.get("/favicon.ico")

def favicon():
    return {}

@app.post("/usuarios/",response_model=schemas.UserResponse,status_code=status.HTTP_201_CREATED)
def crear_usuario(user: schemas.UserCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.User).filter(models.User.email == user.email).first()
    
    if usuario_existente:
        raise HTTPException(status_code=400,detail="El correo ya está registrado")
    
    
    hashed_password =get_password_hash(user.password)
    
    nuevo_usuario = models.User(email = user.email, password_hash = hashed_password)
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


@app.post("/login/",response_model=schemas.Token)

def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Credenciales incorrectas"
        )
    
    access_token =  create_access_token(data={"sub": user.email})
    
    return {"access_token":access_token, "token_type": "bearer"}


@app.get ("/perfil/", response_model=schemas.UserResponse)
def obtener_perfil(usuario_actual: models.User = Depends(get_current_user)):
    return usuario_actual