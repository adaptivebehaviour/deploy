from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from app.routes import routers
# from pydantic import BaseModel
# from app.modules.module import run as run_module

manifest = None
with open(Path(__file__).parent.parent / "manifest.json", 'r') as f:
    manifest = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=manifest["url"]["frontend"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router)

# @app.get("/")
# async def get():
#     return run_module()

# @app.post("/")
# async def post(baseModel: BaseModel):
#     return run_module(baseModel.model_dump_json())