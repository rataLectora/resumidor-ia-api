from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind = engine)

app = FastAPI(
    title= "API  de resúmenes con IA",
    description= "Backend para la gestion y resumen de los textos",
    version= "1.0.0"
)

pwd_context = CryptContext(schemes=["bcrypt"],deprecated ="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

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