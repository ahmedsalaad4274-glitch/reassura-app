#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Reassura
Tests all API endpoints to verify functionality and data structures
"""

import requests
import json
from datetime import datetime
import sys

# Backend URL from frontend .env
BACKEND_URL = "https://peace-of-mind-8.preview.emergentagent.com/api"

class ReassuraAPITester:
    def __init__(self):
        self.passed_tests = []
        self.failed_tests = []
        
    def log_result(self, test_name, success, response=None, expected=None, actual=None):
        """Log test results with details"""
        if success:
            self.passed_tests.append(test_name)
            print(f"✅ PASS: {test_name}")
        else:
            self.failed_tests.append({
                'name': test_name,
                'response': response,
                'expected': expected,
                'actual': actual
            })
            print(f"❌ FAIL: {test_name}")
            if expected and actual:
                print(f"   Expected: {expected}")
                print(f"   Actual: {actual}")
            if response:
                print(f"   Response: {response}")
    
    def test_welcome_endpoint(self):
        """Test GET /api/ - Should return welcome message"""
        try:
            response = requests.get(f"{BACKEND_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Reassura API" in data["message"]:
                    self.log_result("Welcome endpoint", True)
                    return True
                else:
                    self.log_result("Welcome endpoint", False, 
                                  expected="Message containing 'Reassura API'", 
                                  actual=data)
            else:
                self.log_result("Welcome endpoint", False, 
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Welcome endpoint", False, response=str(e))
        return False
    
    def test_users_list(self):
        """Test GET /api/users - Should return list of 5 users"""
        try:
            response = requests.get(f"{BACKEND_URL}/users")
            
            if response.status_code == 200:
                users = response.json()
                
                # Check count
                if len(users) != 5:
                    self.log_result("Users list count", False,
                                  expected="5 users", actual=f"{len(users)} users")
                    return False
                
                # Check for expected users
                user_names = [user.get('name') for user in users]
                expected_names = ['You', 'Mum', 'Dad', 'Jamie', 'Sara']
                
                if all(name in user_names for name in expected_names):
                    self.log_result("Users list endpoint", True)
                    return True
                else:
                    missing = [name for name in expected_names if name not in user_names]
                    self.log_result("Users list endpoint", False,
                                  expected=expected_names, actual=f"Missing: {missing}")
            else:
                self.log_result("Users list endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Users list endpoint", False, response=str(e))
        return False
    
    def test_current_user(self):
        """Test GET /api/users/current/me - Should return current user (You)"""
        try:
            response = requests.get(f"{BACKEND_URL}/users/current/me")
            
            if response.status_code == 200:
                user = response.json()
                
                if user.get('name') == 'You' and user.get('is_current_user') is True:
                    self.log_result("Current user endpoint", True)
                    return True
                else:
                    self.log_result("Current user endpoint", False,
                                  expected="User with name 'You' and is_current_user=True",
                                  actual=f"name='{user.get('name')}', is_current_user={user.get('is_current_user')}")
            else:
                self.log_result("Current user endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Current user endpoint", False, response=str(e))
        return False
    
    def test_user_status_update(self):
        """Test PUT /api/users/user-you/status - Update status"""
        try:
            status_data = {
                "status": "on_the_way",
                "status_emoji": "🚗",
                "status_message": "Heading out now"
            }
            
            response = requests.put(f"{BACKEND_URL}/users/user-you/status", json=status_data)
            
            if response.status_code == 200:
                user = response.json()
                
                # Verify status was updated
                if (user.get('status') == 'on_the_way' and 
                    user.get('status_emoji') == '🚗' and 
                    user.get('status_message') == 'Heading out now'):
                    self.log_result("User status update endpoint", True)
                    return True
                else:
                    self.log_result("User status update endpoint", False,
                                  expected=status_data,
                                  actual=f"status={user.get('status')}, emoji={user.get('status_emoji')}, message={user.get('status_message')}")
            else:
                self.log_result("User status update endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("User status update endpoint", False, response=str(e))
        return False
    
    def test_circles_list(self):
        """Test GET /api/circles - Should return 2 circles (Family and Friends)"""
        try:
            response = requests.get(f"{BACKEND_URL}/circles")
            
            if response.status_code == 200:
                circles = response.json()
                
                # Check count
                if len(circles) != 2:
                    self.log_result("Circles list count", False,
                                  expected="2 circles", actual=f"{len(circles)} circles")
                    return False
                
                # Check for expected circles
                circle_names = [circle.get('name') for circle in circles]
                expected_names = ['Family', 'Friends']
                
                if all(name in circle_names for name in expected_names):
                    self.log_result("Circles list endpoint", True)
                    return True
                else:
                    self.log_result("Circles list endpoint", False,
                                  expected=expected_names, actual=circle_names)
            else:
                self.log_result("Circles list endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Circles list endpoint", False, response=str(e))
        return False
    
    def test_circle_members(self):
        """Test GET /api/circles/circle-family/members - Should return 4 members"""
        try:
            response = requests.get(f"{BACKEND_URL}/circles/circle-family/members")
            
            if response.status_code == 200:
                members = response.json()
                
                # Check count
                if len(members) != 4:
                    self.log_result("Circle members count", False,
                                  expected="4 members", actual=f"{len(members)} members")
                    return False
                
                # Check for expected members in family circle
                member_names = [member.get('name') for member in members]
                expected_names = ['You', 'Mum', 'Dad', 'Jamie']
                
                if all(name in member_names for name in expected_names):
                    self.log_result("Circle members endpoint", True)
                    return True
                else:
                    missing = [name for name in expected_names if name not in member_names]
                    self.log_result("Circle members endpoint", False,
                                  expected=expected_names, actual=f"Missing: {missing}")
            else:
                self.log_result("Circle members endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Circle members endpoint", False, response=str(e))
        return False
    
    def test_footprints(self):
        """Test GET /api/footprints - Should return recent footprints"""
        try:
            response = requests.get(f"{BACKEND_URL}/footprints")
            
            if response.status_code == 200:
                footprints = response.json()
                
                # Should return at least some footprints
                if len(footprints) > 0:
                    # Verify footprint structure
                    first_footprint = footprints[0]
                    required_fields = ['id', 'user_id', 'user_name', 'status', 'status_emoji', 'created_at']
                    
                    if all(field in first_footprint for field in required_fields):
                        self.log_result("Footprints endpoint", True)
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in first_footprint]
                        self.log_result("Footprints endpoint", False,
                                      expected=f"Fields: {required_fields}",
                                      actual=f"Missing: {missing_fields}")
                else:
                    self.log_result("Footprints endpoint", False,
                                  expected="At least 1 footprint", actual="0 footprints")
            else:
                self.log_result("Footprints endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Footprints endpoint", False, response=str(e))
        return False
    
    def test_travel(self):
        """Test GET /api/travel - Should return active travel for Sara"""
        try:
            response = requests.get(f"{BACKEND_URL}/travel")
            
            if response.status_code == 200:
                travels = response.json()
                
                # Should return Sara's travel
                sara_travel = None
                for travel in travels:
                    if travel.get('user_name') == 'Sara':
                        sara_travel = travel
                        break
                
                if sara_travel:
                    # Verify travel structure
                    required_fields = ['id', 'user_name', 'flight_number', 'origin_name', 'destination_name', 'status']
                    
                    if all(field in sara_travel for field in required_fields):
                        self.log_result("Travel endpoint", True)
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in sara_travel]
                        self.log_result("Travel endpoint", False,
                                      expected=f"Fields: {required_fields}",
                                      actual=f"Missing: {missing_fields}")
                else:
                    self.log_result("Travel endpoint", False,
                                  expected="Travel for Sara", actual="No travel found for Sara")
            else:
                self.log_result("Travel endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Travel endpoint", False, response=str(e))
        return False
    
    def test_emergency_alert(self):
        """Test POST /api/emergency - Send emergency alert"""
        try:
            alert_data = {
                "user_id": "user-you",
                "circle_ids": ["circle-family"]
            }
            
            response = requests.post(f"{BACKEND_URL}/emergency", json=alert_data)
            
            if response.status_code == 200:
                alert = response.json()
                
                # Verify alert structure
                if (alert.get('user_id') == 'user-you' and 
                    'circle-family' in alert.get('circle_ids', []) and
                    alert.get('user_name') == 'You'):
                    self.log_result("Emergency alert endpoint", True)
                    return True
                else:
                    self.log_result("Emergency alert endpoint", False,
                                  expected="Alert with user_id='user-you', circle_ids=['circle-family']",
                                  actual=f"user_id={alert.get('user_id')}, circle_ids={alert.get('circle_ids')}")
            else:
                self.log_result("Emergency alert endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Emergency alert endpoint", False, response=str(e))
        return False
    
    def test_notifications(self):
        """Test GET /api/notifications - Should return notifications"""
        try:
            response = requests.get(f"{BACKEND_URL}/notifications")
            
            if response.status_code == 200:
                notifications = response.json()
                
                # Should return at least some notifications (seed data + emergency alert)
                if len(notifications) > 0:
                    # Verify notification structure
                    first_notification = notifications[0]
                    required_fields = ['id', 'user_id', 'type', 'title', 'message', 'read', 'created_at']
                    
                    if all(field in first_notification for field in required_fields):
                        self.log_result("Notifications endpoint", True)
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in first_notification]
                        self.log_result("Notifications endpoint", False,
                                      expected=f"Fields: {required_fields}",
                                      actual=f"Missing: {missing_fields}")
                else:
                    self.log_result("Notifications endpoint", False,
                                  expected="At least 1 notification", actual="0 notifications")
            else:
                self.log_result("Notifications endpoint", False,
                              response=f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Notifications endpoint", False, response=str(e))
        return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Reassura API Backend Tests")
        print(f"📍 Testing endpoint: {BACKEND_URL}")
        print("-" * 60)
        
        # Run all tests
        tests = [
            self.test_welcome_endpoint,
            self.test_users_list,
            self.test_current_user,
            self.test_user_status_update,
            self.test_circles_list,
            self.test_circle_members,
            self.test_footprints,
            self.test_travel,
            self.test_emergency_alert,
            self.test_notifications
        ]
        
        for test in tests:
            test()
            print()
        
        # Summary
        print("-" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {len(self.passed_tests)}")
        print(f"❌ Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {len(self.passed_tests) / (len(self.passed_tests) + len(self.failed_tests)) * 100:.1f}%")
        
        if self.failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for fail in self.failed_tests:
                print(f"  - {fail['name']}")
                if fail.get('expected') and fail.get('actual'):
                    print(f"    Expected: {fail['expected']}")
                    print(f"    Actual: {fail['actual']}")
                if fail.get('response'):
                    print(f"    Response: {fail['response']}")
        
        return len(self.failed_tests) == 0

if __name__ == "__main__":
    tester = ReassuraAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)