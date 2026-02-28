"""
Reassura API Backend Tests
Tests for users, circles, footprints, notifications, and travel endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test API root returns correct message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Reassura API" in data["message"]

class TestUsersAPI:
    """User endpoint tests"""
    
    def test_get_all_users(self):
        """Test getting all users"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify user structure
        user = data[0]
        assert "id" in user
        assert "name" in user
        assert "emoji" in user
    
    def test_get_current_user(self):
        """Test getting current user returns Rinade"""
        response = requests.get(f"{BASE_URL}/api/users/current/me")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Rinade"
        assert data["is_current_user"] == True
        assert "status" in data
        assert "status_emoji" in data
    
    def test_get_specific_user(self):
        """Test getting a specific user by ID"""
        response = requests.get(f"{BASE_URL}/api/users/user-mum")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Mum"
        assert data["id"] == "user-mum"
    
    def test_get_nonexistent_user(self):
        """Test getting non-existent user returns 404"""
        response = requests.get(f"{BASE_URL}/api/users/nonexistent-user-id")
        assert response.status_code == 404

class TestCirclesAPI:
    """Circle endpoint tests"""
    
    def test_get_all_circles(self):
        """Test getting all circles"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify circle structure
        circle = data[0]
        assert "id" in circle
        assert "name" in circle
        assert "member_ids" in circle
    
    def test_get_specific_circle(self):
        """Test getting family circle"""
        response = requests.get(f"{BASE_URL}/api/circles/circle-family")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Family"
        assert "user-you" in data["member_ids"]
    
    def test_get_circle_members(self):
        """Test getting circle members"""
        response = requests.get(f"{BASE_URL}/api/circles/circle-family/members")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have current user
        names = [u["name"] for u in data]
        assert "Rinade" in names

class TestFootprintsAPI:
    """Footprint endpoint tests"""
    
    def test_get_all_footprints(self):
        """Test getting all footprints"""
        response = requests.get(f"{BASE_URL}/api/footprints")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            fp = data[0]
            assert "user_id" in fp
            assert "status" in fp
            assert "user_name" in fp
    
    def test_get_circle_footprints(self):
        """Test getting footprints for a specific circle"""
        response = requests.get(f"{BASE_URL}/api/footprints/circle/circle-family")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestNotificationsAPI:
    """Notification endpoint tests"""
    
    def test_get_all_notifications(self):
        """Test getting all notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_user_notifications(self):
        """Test getting notifications for current user"""
        response = requests.get(f"{BASE_URL}/api/notifications/user/user-you")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestTravelAPI:
    """Travel endpoint tests"""
    
    def test_get_active_travel(self):
        """Test getting active travel"""
        response = requests.get(f"{BASE_URL}/api/travel")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_user_travel(self):
        """Test getting user travel history"""
        response = requests.get(f"{BASE_URL}/api/travel/user/user-sara")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestPlacesAPI:
    """Places endpoint tests"""
    
    def test_get_all_places(self):
        """Test getting all places"""
        response = requests.get(f"{BASE_URL}/api/places")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_user_places(self):
        """Test getting places for current user"""
        response = requests.get(f"{BASE_URL}/api/places/user/user-you")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

class TestReactionsAPI:
    """Reactions endpoint tests"""
    
    def test_get_all_reactions(self):
        """Test getting all reactions"""
        response = requests.get(f"{BASE_URL}/api/reactions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
