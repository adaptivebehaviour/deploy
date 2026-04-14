"""Integration tests for API routes."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Hello, World!" in response.text


def test_greet():
    response = client.get("/greet/Drew")
    assert response.status_code == 200
    assert response.json()["message"] == "Hello, Drew! Welcome to My App."


def test_list_users():
    response = client.get("/users/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_user():
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"
