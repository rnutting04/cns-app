from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os

app = FastAPI()
SECRET_KEY = os.environ["JWT_SECRET"]

# Allow CORS from your frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/parse")
async def parse(request:Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="No TOKEN GET OUT")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"message": "Parsing service is alive!"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token Expired")
    except jwt.InvalidToken:
        raise HTTPException(status_code=401, detail="Invalid Token")



