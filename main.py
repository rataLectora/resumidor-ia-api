from fastapi import FastAPI


app = FastAPI(
    title= "API  de resúmenes con IA",
    description= "Backend para la gestion y resumen de los textos",
    version= "1.0.0"
)

@app.get("/")

def verificar_estado():
    return {"mensaje": "El servidor FastAPI está funcionando sin problemas"}


@app.get("/favicon.ico")

def favicon():
    return {}