import pytest
from app import app, calculate_wpm, world_level

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_calculate_wpm():
    assert calculate_wpm(250, 60) == 50.0
    assert calculate_wpm(100, 30) == 40.0
    assert calculate_wpm(100, 0) == 0.0
    assert calculate_wpm(-10, 60) == 0.0

def test_world_level():
    assert world_level(0) == 0
    assert world_level(49) == 0
    assert world_level(50) == 1
    assert world_level(149) == 1
    assert world_level(200) == 2
    assert world_level(5000) == 5

def test_health(client):
    rv = client.get('/health')
    assert rv.status_code == 200
    assert rv.get_json() == {"status": "ok"}

def test_api_stats(client):
    rv = client.post('/api/stats', json={"chars": 250, "seconds": 60})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["wpm"] == 50.0
    assert data["level"] == 2

def test_index(client):
    rv = client.get('/')
    assert rv.status_code == 200
