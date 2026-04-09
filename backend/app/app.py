from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.utils as utils
from pathlib import Path
from pydantic import BaseModel
from app.module import Module


APP_PATH = Path(__file__).parent
MANIFEST = utils.read_json(APP_PATH.parent / "manifest.json")
APP = Module('app', APP_PATH)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=MANIFEST["url"]["frontend"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def get():
    return APP.run()

@app.post("/")
async def post(baseModel: BaseModel):
    APP.run(baseModel.model_dump_json())