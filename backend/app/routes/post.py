"""Post routes."""

from fastapi import APIRouter

from app.models import Structure
from app.modules import run as run_module

router = APIRouter(tags=["post"])

@router.post("/")
async def post(structure: Structure):
    return run_module(structure.model_dump_json())
