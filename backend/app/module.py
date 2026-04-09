from typing import Callable
from pathlib import Path
import app.utils as utils 

class Operations():

    def __init__(self, operations: dict = {str, Callable}):
        self.operations = operations

    def hasOperation(self, operation: str):
        return operation in self.operations

    def run(self, *args, **kwargs):
        id = 'help'
        if len(args) > 0:
            arg = args[0]
            if type(arg) == str and self.hasOperation(arg):
                id = arg
        args = args[1:]
        result = self.operations[id](*args, **kwargs)
        return result

class Module():
    def __init__(self, id: str, path: Path, operations: dict[str, Callable] = {}):
        self.id = id
        self.path = path
        for key in ['init', 'help']:
            if key not in operations:
                operations[key] = getattr(self, key)
        self.operations = Operations(operations)

    def init(self, *args, **kwargs):
        return None

    def help(self):
        return utils.read(self.path / "help.md")

    def run(self, *args, **kwargs):
        return self.operations.run(*args, **kwargs)