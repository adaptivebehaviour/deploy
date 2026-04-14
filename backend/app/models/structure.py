"""Structure model."""

from pydantic import BaseModel

class Structure(BaseModel):
    """Generic Structure model."""

    id: str
    type: str
    structure: dict
    content: list
