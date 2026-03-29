from pydantic import BaseModel
from datetime import datetime


#clase asociaciada a lo que se recibe por parte del cliente 
#ya sea desde el propio front o usando Postman por ejemplo
class UserCreate(BaseModel):
    email: str
    password: str
    

#clase de lo que se le responde al cliente segun la peticion    
class UserResponse(BaseModel):
    id: int
    email: str
    
    class Config:
        from_attributes= True
    

class Token (BaseModel):
    access_token : str
    token_type: str


class DocumentCreate(BaseModel):
    original_text : str
    

class DocumentResponse(BaseModel):
    id: int
    original_text: str
    ai_summary: str
    created_at: datetime
    owner_id : int
    
    class Config:
        from_attributes = True