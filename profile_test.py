#!/usr/bin/env python3
"""
Test the missing profile update endpoint specifically
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment configuration
BACKEND_URL = "https://private-family-app.preview.emergentagent.com/api"

def test_profile_update_endpoint():
    """Test PUT /api/users/{user_id}/profile endpoint with profile_picture field"""
    print("🧪 Testing Profile Update Endpoint...")
    
    try:
        # First get users to get a valid user_id
        print("📋 Getting users list...")
        users_response = requests.get(f"{BACKEND_URL}/users")
        if users_response.status_code != 200:
            print(f"❌ FAIL: Could not get users list - Status: {users_response.status_code}")
            return False
            
        users = users_response.json()
        if not users:
            print("❌ FAIL: No users found")
            return False
            
        # Use the first user for testing
        test_user = users[0]
        user_id = test_user['id']
        original_name = test_user.get('name', 'Unknown')
        
        print(f"📝 Testing profile update for user: {original_name} (ID: {user_id})")
        
        # Test profile update with profile_picture field
        profile_update_data = {
            "name": f"{original_name}_updated",
            "profile_picture": "test_base64_data",
            "home_city": "London, UK - Updated",
            "ghost_mode": True
        }
        
        print("🔄 Updating user profile...")
        profile_response = requests.put(
            f"{BACKEND_URL}/users/{user_id}/profile",
            json=profile_update_data
        )
        
        if profile_response.status_code != 200:
            print(f"❌ FAIL: Profile update failed - Status: {profile_response.status_code}")
            print(f"Response: {profile_response.text}")
            return False
            
        updated_user = profile_response.json()
        
        # Verify the update worked
        if updated_user.get('name') != profile_update_data['name']:
            print(f"❌ FAIL: Name not updated correctly. Expected: {profile_update_data['name']}, Got: {updated_user.get('name')}")
            return False
            
        if updated_user.get('profile_picture') != profile_update_data['profile_picture']:
            print(f"❌ FAIL: profile_picture field not updated correctly. Expected: {profile_update_data['profile_picture']}, Got: {updated_user.get('profile_picture')}")
            return False
            
        if updated_user.get('home_city') != profile_update_data['home_city']:
            print(f"❌ FAIL: home_city not updated correctly. Expected: {profile_update_data['home_city']}, Got: {updated_user.get('home_city')}")
            return False
            
        if updated_user.get('ghost_mode') != profile_update_data['ghost_mode']:
            print(f"❌ FAIL: ghost_mode not updated correctly. Expected: {profile_update_data['ghost_mode']}, Got: {updated_user.get('ghost_mode')}")
            return False
        
        # Check that _id field is not present (MongoDB ObjectId handling)
        if '_id' in updated_user:
            print("❌ FAIL: Response contains _id field (MongoDB ObjectId not properly handled)")
            return False
            
        print("✅ PASS: Profile update endpoint working correctly")
        print(f"✅ Profile picture field accepted: {updated_user.get('profile_picture')}")
        print(f"✅ Updated fields: name, profile_picture, home_city, ghost_mode")
        print(f"✅ No _id field in response (proper ObjectId handling)")
        
        # Restore original data for cleanup
        print("🔄 Restoring original user data...")
        restore_data = {
            "name": original_name,
            "home_city": "London, UK",
            "ghost_mode": False
        }
        
        restore_response = requests.put(
            f"{BACKEND_URL}/users/{user_id}/profile",
            json=restore_data
        )
        
        if restore_response.status_code == 200:
            print("✅ Original user data restored")
        else:
            print("⚠️ Warning: Could not restore original user data")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Network error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {e}")
        return False

def investigate_circles_issue():
    """Investigate why there are 3 circles instead of 2"""
    print("\n🔍 Investigating circles count issue...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/circles")
        if response.status_code == 200:
            circles = response.json()
            print(f"📊 Found {len(circles)} circles:")
            for i, circle in enumerate(circles, 1):
                print(f"  {i}. {circle.get('name')} (ID: {circle.get('id')})")
            return circles
        else:
            print(f"❌ Could not get circles: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error investigating circles: {e}")
        return []

def investigate_travel_issue():
    """Investigate why Sara's travel is not found"""
    print("\n🔍 Investigating travel issue...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/travel")
        if response.status_code == 200:
            travels = response.json()
            print(f"📊 Found {len(travels)} active travels:")
            for i, travel in enumerate(travels, 1):
                print(f"  {i}. User: {travel.get('user_name')}, Flight: {travel.get('flight_number')}, Status: {travel.get('status')}")
            return travels
        else:
            print(f"❌ Could not get travel data: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error investigating travel: {e}")
        return []

def main():
    """Main testing function"""
    print("🚀 Reassura API Profile Update Testing")
    print("=" * 60)
    
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"📅 Test Time: {datetime.now().isoformat()}")
    print()
    
    # Test the missing profile update endpoint
    profile_test_passed = test_profile_update_endpoint()
    
    # Investigate previous test failures
    circles = investigate_circles_issue()
    travels = investigate_travel_issue()
    
    print("\n" + "=" * 60)
    print("📊 INVESTIGATION SUMMARY:")
    print(f"✅ Profile Update Endpoint: {'PASS' if profile_test_passed else 'FAIL'}")
    print(f"🔍 Circles Count: {len(circles)} found (expected 2)")  
    print(f"🔍 Active Travels: {len(travels)} found")
    
    return profile_test_passed

if __name__ == "__main__":
    main()