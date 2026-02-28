#!/usr/bin/env python3
"""
Detailed test to show the exact response from profile update endpoint
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment configuration
BACKEND_URL = "https://invite-circle-demo.preview.emergentagent.com/api"

def detailed_profile_test():
    """Show exact response from profile update endpoint"""
    print("🧪 Detailed Profile Update Test...")
    
    try:
        # Get users first
        users_response = requests.get(f"{BACKEND_URL}/users")
        users = users_response.json()
        test_user = users[0]
        user_id = test_user['id']
        
        print(f"📝 Testing profile update for user: {test_user.get('name')} (ID: {user_id})")
        
        # Test profile update with minimal data
        profile_update_data = {
            "profile_picture": "test_base64_data"
        }
        
        profile_response = requests.put(
            f"{BACKEND_URL}/users/{user_id}/profile",
            json=profile_update_data
        )
        
        print(f"📊 Response Status: {profile_response.status_code}")
        print(f"📄 Response Headers: {dict(profile_response.headers)}")
        
        if profile_response.status_code == 200:
            response_data = profile_response.json()
            print("📝 Full Response Data:")
            print(json.dumps(response_data, indent=2, default=str))
            
            # Check for _id field specifically
            if '_id' in response_data:
                print(f"⚠️ Found _id field in response: {response_data['_id']}")
                print(f"   Type: {type(response_data['_id'])}")
                return False, response_data
            else:
                print("✅ No _id field found in response")
                return True, response_data
        else:
            print(f"❌ Request failed with status: {profile_response.status_code}")
            print(f"Response: {profile_response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, None

def check_other_endpoints_for_id_field():
    """Check if other endpoints also have the _id field issue"""
    print("\n🔍 Checking other endpoints for _id field...")
    
    endpoints_to_check = [
        ("GET", "/users", "users list"),
        ("GET", "/users/current/me", "current user"), 
        ("GET", "/circles", "circles list"),
        ("GET", "/footprints", "footprints"),
        ("GET", "/notifications", "notifications")
    ]
    
    id_field_issues = []
    
    for method, endpoint, description in endpoints_to_check:
        try:
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check if it's a list or single object
                    items_to_check = data if isinstance(data, list) else [data]
                    
                    for item in items_to_check[:1]:  # Check first item only
                        if '_id' in item:
                            id_field_issues.append(f"{description}: contains _id field")
                            print(f"⚠️ {description}: Found _id field")
                            break
                    else:
                        print(f"✅ {description}: No _id field")
                else:
                    print(f"❌ {description}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    return id_field_issues

def main():
    """Main testing function"""
    print("🚀 Detailed Profile Update Analysis")
    print("=" * 60)
    
    # Test profile update endpoint in detail
    profile_success, profile_data = detailed_profile_test()
    
    # Check other endpoints for comparison
    id_field_issues = check_other_endpoints_for_id_field()
    
    print("\n" + "=" * 60)
    print("📊 ANALYSIS SUMMARY:")
    print(f"Profile Update Working: {'Yes' if profile_success else 'No'}")
    print(f"_id Field Issues Found: {len(id_field_issues)}")
    
    if id_field_issues:
        print("\n🔍 Endpoints with _id field issues:")
        for issue in id_field_issues:
            print(f"  - {issue}")
    
    return profile_success and len(id_field_issues) == 0

if __name__ == "__main__":
    main()