"""API route modules."""

from .get import router as get_router
from .post import router as post_router

routers = (get_router, post_router)
