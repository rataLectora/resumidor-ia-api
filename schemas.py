from pydantic import BaseModel


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
        from_atributes = True
    

