import json
import re
from pathlib import Path


def title(id: str):
    return id.replace('-', ' ').title()

def slug(id: str):
    return id.replace(' ', '-').lower()

def is_slug(id: str):
    alpha_hyphen_pattern = re.compile(r'^[A-Za-z-]+$')
    return alpha_hyphen_pattern.fullmatch(id)

def is_json(source: str):
    if (source.startswith('{') and source.endswith('}')) or \
           (source.startswith('[') and source.endswith(']')):  
        try:
            json.loads(source)
            return True
        except Exception:
            return False

def parse_path(path: str | Path):
    if isinstance(path, Path):
        return path
    return Path(path.replace('>', '/'))


def resolve_path(path: Path | str, file: str | None = None):
    resolved_path = parse_path(path)
    if file is not None and resolved_path.name != file:
        resolved_path = resolved_path / parse_path(file)
    return resolved_path

def read(path: Path | str):
    path = resolve_path(path)
    if(path.exists()):
        with open(path, 'r') as f:
            return f.read()
    return None

def write(path: Path | str, data: str):
    path = resolve_path(path)
    with open(path, 'w') as f:
        f.write(data)
    return data

def read_json(path: Path | str):
    path = resolve_path(path)
    if(path.exists()):
        with open(path, 'r') as f:
            return json.load(f)
    return None

def write_json(data: dict, path: Path | str):
    path = resolve_path(path)
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)
    return data