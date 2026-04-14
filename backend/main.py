import uvicorn
from app.app import app

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True) # TODO: Remove reload=True when not in development.

