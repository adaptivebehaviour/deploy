"""Get routes."""

from fastapi import APIRouter

from app.modules import run as run_module

router = APIRouter(tags=["get"])


@router.get("/")
async def get():
    return run_module()
