"""A basic module for a Python project."""

import argparse
import json
from .. import utils

default_response = 'No response from module.py'
response = ''

def respond(message: str = default_response):
    global response
    response = response + '\n' + message
    return response


def run() -> str:
    
    """Return the default message."""
    return respond()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("string", type=str, help="A required string argument.")
    parser.add_argument("--boolean", action="store_true", help="An optional boolean argument.")
    parser.add_argument("--json_string", type=str, default="{}", help="A stringified JSON object.")
    parsed = parser.parse_args()
    json_object = json.loads(parsed.json_string)
    print(run())