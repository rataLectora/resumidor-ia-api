from sqlalchemy import Column,Integer,String,Text,ForeignKey,DateTime,JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer,primary_key=True,index=True)
    email = Column(String,unique=True,index=True,nullable=False)
    password_hash = Column(String,nullable=False)
    
    # con la siguiente linea se establece la relacion
    #la cual indica que un usuario puede tener muchos documentos
    
    documents = relationship("Document",back_populates="owner")
    
    
 
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer,primary_key=True,index=True)
    original_text = Column(Text,nullable=False)
    ai_summary = Column(Text,nullable=False)
    suggested_questions = Column(JSON,default=list)
    created_at = Column(DateTime(timezone=True),server_default= func.now())
    
    #se establece la llave foranea que conecta con el usuario
    
    owner_id = Column(Integer,ForeignKey("users.id"))
    
    owner = relationship("User",back_populates="documents")