from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper to serialize ObjectId
def serialize_doc(doc):
    if doc:
        doc.pop("_id", None)
    return doc

# ==================== MODELS ====================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    emoji: str
    circle_ids: List[str] = []
    status: str = "home"  # home, on_the_way, arrived, all_good, offline, travelling
    status_emoji: str = "🏠"
    status_message: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    home_city: str = "London, UK"
    battery_level: Optional[int] = None  # 0-100
    is_driving: bool = False
    driving_behavior: Optional[str] = None  # smooth, moderate, fast
    speed_mph: Optional[int] = None
    ghost_mode: bool = False
    is_current_user: bool = False

class UserCreate(BaseModel):
    name: str
    emoji: str
    circle_ids: List[str] = []
    is_current_user: bool = False

class UserStatusUpdate(BaseModel):
    status: str
    status_emoji: str
    status_message: Optional[str] = None

class Circle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    emoji: str = "👨‍👩‍👧‍👦"
    color: str = "#7A9E87"  # sage green default
    member_ids: List[str] = []
    privacy: str = "invite_only"  # invite_only, members_can_invite, open
    show_last_updated: bool = True
    show_peace_score: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CircleCreate(BaseModel):
    name: str
    emoji: str = "👨‍👩‍👧‍👦"
    color: str = "#7A9E87"
    member_ids: List[str] = []
    privacy: str = "invite_only"
    show_last_updated: bool = True
    show_peace_score: bool = True

class Reaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    reaction_type: str  # heart, thumbs_up, thinking, message
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReactionCreate(BaseModel):
    from_user_id: str
    to_user_id: str
    reaction_type: str
    message: Optional[str] = None

class Footprint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_emoji: str
    status: str
    status_emoji: str
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EmergencyAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    circle_ids: List[str] = []
    notified_users: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False

class EmergencyCreate(BaseModel):
    user_id: str
    circle_ids: List[str] = []

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # morning_prompt, safety_alert, place_arrival, low_battery, driving_alert, check_in, sos
    title: str
    message: str
    related_user_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Place(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    type: str  # home, work, school, gym, custom
    is_danger_zone: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PlaceCreate(BaseModel):
    user_id: str
    name: str
    type: str
    is_danger_zone: bool = False

class Travel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_emoji: str
    flight_number: Optional[str] = None
    origin_code: str
    origin_name: str
    destination_code: str
    destination_name: str
    departure_time: str
    arrival_time: str
    origin_timezone: str
    destination_timezone: str
    progress: int = 0  # 0-100
    altitude_ft: Optional[int] = None
    status: str = "scheduled"  # scheduled, in_flight, landed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelCreate(BaseModel):
    user_id: str
    flight_number: Optional[str] = None
    origin_code: str
    origin_name: str
    destination_code: str
    destination_name: str
    departure_time: str
    arrival_time: str
    origin_timezone: str
    destination_timezone: str

class CheckInRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    responded: bool = False

# ==================== SEED DATA ====================

async def seed_database():
    """Initialize database with mock data"""
    
    # Check if already seeded
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        return
    
    # Create users
    users = [
        {
            "id": "user-you",
            "name": "You",
            "emoji": "👩🏾",
            "circle_ids": ["circle-family", "circle-friends"],
            "status": "home",
            "status_emoji": "🏠",
            "status_message": None,
            "updated_at": datetime.utcnow(),
            "home_city": "London, UK",
            "battery_level": 85,
            "is_driving": False,
            "ghost_mode": False,
            "is_current_user": True
        },
        {
            "id": "user-mum",
            "name": "Mum",
            "emoji": "👩🏾",
            "circle_ids": ["circle-family"],
            "status": "home",
            "status_emoji": "🏠",
            "status_message": "Just got home, all good",
            "updated_at": datetime.utcnow(),
            "home_city": "London, UK",
            "battery_level": 72,
            "is_driving": False,
            "ghost_mode": False,
            "is_current_user": False
        },
        {
            "id": "user-dad",
            "name": "Dad",
            "emoji": "👨🏾",
            "circle_ids": ["circle-family"],
            "status": "all_good",
            "status_emoji": "❤️",
            "status_message": "Having a good day",
            "updated_at": datetime.utcnow(),
            "home_city": "London, UK",
            "battery_level": 45,
            "is_driving": False,
            "ghost_mode": False,
            "is_current_user": False
        },
        {
            "id": "user-jamie",
            "name": "Jamie",
            "emoji": "🧑🏾",
            "circle_ids": ["circle-family"],
            "status": "on_the_way",
            "status_emoji": "🚗",
            "status_message": "10 mins away",
            "updated_at": datetime.utcnow(),
            "home_city": "London, UK",
            "battery_level": 28,
            "is_driving": True,
            "driving_behavior": "smooth",
            "speed_mph": 35,
            "ghost_mode": False,
            "is_current_user": False
        },
        {
            "id": "user-sara",
            "name": "Sara",
            "emoji": "👩🏾",
            "circle_ids": ["circle-friends"],
            "status": "travelling",
            "status_emoji": "✈️",
            "status_message": "In the air, see you soon",
            "updated_at": datetime.utcnow(),
            "home_city": "London, UK",
            "battery_level": 62,
            "is_driving": False,
            "ghost_mode": False,
            "is_current_user": False
        }
    ]
    
    # Create circles
    circles = [
        {
            "id": "circle-family",
            "name": "Family",
            "emoji": "👨‍👩‍👧‍👦",
            "color": "#7A9E87",
            "member_ids": ["user-you", "user-mum", "user-dad", "user-jamie"],
            "privacy": "invite_only",
            "show_last_updated": True,
            "show_peace_score": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "circle-friends",
            "name": "Friends",
            "emoji": "👫",
            "color": "#C9A84C",
            "member_ids": ["user-you", "user-sara"],
            "privacy": "invite_only",
            "show_last_updated": True,
            "show_peace_score": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Create footprints
    footprints = [
        {
            "id": "footprint-1",
            "user_id": "user-mum",
            "user_name": "Mum",
            "user_emoji": "👩🏾",
            "status": "home",
            "status_emoji": "🏠",
            "message": "Just got home, all good",
            "created_at": datetime.utcnow()
        },
        {
            "id": "footprint-2",
            "user_id": "user-jamie",
            "user_name": "Jamie",
            "user_emoji": "🧑🏾",
            "status": "on_the_way",
            "status_emoji": "🚗",
            "message": "10 mins away",
            "created_at": datetime.utcnow()
        },
        {
            "id": "footprint-3",
            "user_id": "user-sara",
            "user_name": "Sara",
            "user_emoji": "👩🏾",
            "status": "travelling",
            "status_emoji": "✈️",
            "message": "In the air, see you soon",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Create travel for Sara
    travel = {
        "id": "travel-sara",
        "user_id": "user-sara",
        "user_name": "Sara",
        "user_emoji": "👩🏾",
        "flight_number": "BA75",
        "origin_code": "LHR",
        "origin_name": "London Heathrow",
        "destination_code": "LOS",
        "destination_name": "Lagos Murtala Muhammed",
        "departure_time": "14:15 BST",
        "arrival_time": "22:30 WAT",
        "origin_timezone": "BST",
        "destination_timezone": "WAT",
        "progress": 62,
        "altitude_ft": 35000,
        "status": "in_flight",
        "created_at": datetime.utcnow()
    }
    
    # Create notifications
    notifications = [
        {
            "id": "notif-1",
            "user_id": "user-you",
            "type": "morning_prompt",
            "title": "Good morning! 👋",
            "message": "Leaving for work today? Let your circle know.",
            "read": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": "notif-2",
            "user_id": "user-you",
            "type": "safety_alert",
            "title": "Jamie hasn't checked in",
            "message": "Jamie set a safety window ending at 8:00am.",
            "related_user_id": "user-jamie",
            "read": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Create places
    places = [
        {
            "id": "place-home",
            "user_id": "user-you",
            "name": "Home",
            "type": "home",
            "is_danger_zone": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": "place-work",
            "user_id": "user-you",
            "name": "Work",
            "type": "work",
            "is_danger_zone": False,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert all data
    await db.users.insert_many(users)
    await db.circles.insert_many(circles)
    await db.footprints.insert_many(footprints)
    await db.travel.insert_one(travel)
    await db.notifications.insert_many(notifications)
    await db.places.insert_many(places)
    
    logging.info("Database seeded successfully!")

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Reassura API - Peace of mind as a service 🌿"}

# Users
@api_router.get("/users")
async def get_users():
    users = await db.users.find().to_list(100)
    return [serialize_doc(u) for u in users]

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(user)

@api_router.get("/users/current/me")
async def get_current_user():
    user = await db.users.find_one({"is_current_user": True})
    if not user:
        raise HTTPException(status_code=404, detail="Current user not found")
    return serialize_doc(user)

@api_router.put("/users/{user_id}/status")
async def update_user_status(user_id: str, status_update: UserStatusUpdate):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {
        "status": status_update.status,
        "status_emoji": status_update.status_emoji,
        "status_message": status_update.status_message,
        "updated_at": datetime.utcnow()
    }
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    # Create footprint
    footprint = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": user["name"],
        "user_emoji": user["emoji"],
        "status": status_update.status,
        "status_emoji": status_update.status_emoji,
        "message": status_update.status_message,
        "created_at": datetime.utcnow()
    }
    await db.footprints.insert_one(footprint)
    
    updated_user = await db.users.find_one({"id": user_id})
    return serialize_doc(updated_user)

@api_router.put("/users/{user_id}/profile")
async def update_user_profile(user_id: str, profile_data: dict):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    allowed_fields = ["name", "emoji", "home_city", "ghost_mode", "profile_picture"]
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    updated_user = await db.users.find_one({"id": user_id})
    return serialize_doc(updated_user)

# Circles
@api_router.get("/circles")
async def get_circles():
    circles = await db.circles.find().to_list(100)
    return [serialize_doc(c) for c in circles]

@api_router.get("/circles/{circle_id}")
async def get_circle(circle_id: str):
    circle = await db.circles.find_one({"id": circle_id})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    return serialize_doc(circle)

@api_router.get("/circles/{circle_id}/members")
async def get_circle_members(circle_id: str):
    circle = await db.circles.find_one({"id": circle_id})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    members = await db.users.find({"id": {"$in": circle["member_ids"]}}).to_list(100)
    return [serialize_doc(m) for m in members]

@api_router.post("/circles")
async def create_circle(circle_data: CircleCreate):
    circle = Circle(**circle_data.dict())
    await db.circles.insert_one(circle.dict())
    return circle.dict()

# Reactions
@api_router.get("/reactions")
async def get_reactions():
    reactions = await db.reactions.find().to_list(100)
    return [serialize_doc(r) for r in reactions]

@api_router.post("/reactions")
async def create_reaction(reaction_data: ReactionCreate):
    reaction = Reaction(**reaction_data.dict())
    await db.reactions.insert_one(reaction.dict())
    return reaction.dict()

# Footprints
@api_router.get("/footprints")
async def get_footprints():
    footprints = await db.footprints.find().sort("created_at", -1).to_list(50)
    return [serialize_doc(f) for f in footprints]

@api_router.get("/footprints/circle/{circle_id}")
async def get_footprints_by_circle(circle_id: str):
    circle = await db.circles.find_one({"id": circle_id})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    footprints = await db.footprints.find(
        {"user_id": {"$in": circle["member_ids"]}}
    ).sort("created_at", -1).to_list(50)
    return [serialize_doc(f) for f in footprints]

# Emergency
@api_router.post("/emergency")
async def send_emergency_alert(alert_data: EmergencyCreate):
    user = await db.users.find_one({"id": alert_data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all users in the circles to notify
    notified_users = []
    for circle_id in alert_data.circle_ids:
        circle = await db.circles.find_one({"id": circle_id})
        if circle:
            notified_users.extend(circle["member_ids"])
    
    # Remove duplicates and self
    notified_users = list(set(notified_users))
    if alert_data.user_id in notified_users:
        notified_users.remove(alert_data.user_id)
    
    alert = EmergencyAlert(
        user_id=alert_data.user_id,
        user_name=user["name"],
        circle_ids=alert_data.circle_ids,
        notified_users=notified_users
    )
    await db.emergency_alerts.insert_one(alert.dict())
    
    # Create notifications for all notified users
    for notify_user_id in notified_users:
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": notify_user_id,
            "type": "sos",
            "title": f"EMERGENCY - {user['name']} needs help! 🚨",
            "message": f"{user['name']} has sent an emergency alert.",
            "related_user_id": alert_data.user_id,
            "read": False,
            "created_at": datetime.utcnow()
        }
        await db.notifications.insert_one(notification)
    
    return alert.dict()

# Notifications
@api_router.get("/notifications")
async def get_notifications():
    notifications = await db.notifications.find().sort("created_at", -1).to_list(50)
    return [serialize_doc(n) for n in notifications]

@api_router.get("/notifications/user/{user_id}")
async def get_user_notifications(user_id: str):
    notifications = await db.notifications.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(50)
    return [serialize_doc(n) for n in notifications]

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    result = await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}

# Places
@api_router.get("/places")
async def get_places():
    places = await db.places.find().to_list(100)
    return [serialize_doc(p) for p in places]

@api_router.get("/places/user/{user_id}")
async def get_user_places(user_id: str):
    places = await db.places.find({"user_id": user_id}).to_list(100)
    return [serialize_doc(p) for p in places]

@api_router.post("/places")
async def create_place(place_data: PlaceCreate):
    place = Place(**place_data.dict())
    await db.places.insert_one(place.dict())
    return place.dict()

# Travel
@api_router.get("/travel")
async def get_active_travel():
    travel = await db.travel.find({"status": {"$ne": "landed"}}).to_list(100)
    return [serialize_doc(t) for t in travel]

@api_router.get("/travel/user/{user_id}")
async def get_user_travel(user_id: str):
    travel = await db.travel.find({"user_id": user_id}).sort("created_at", -1).to_list(10)
    return [serialize_doc(t) for t in travel]

@api_router.post("/travel")
async def create_travel(travel_data: TravelCreate):
    user = await db.users.find_one({"id": travel_data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    travel = Travel(
        **travel_data.dict(),
        user_name=user["name"],
        user_emoji=user["emoji"]
    )
    await db.travel.insert_one(travel.dict())
    
    # Update user status to travelling
    await db.users.update_one(
        {"id": travel_data.user_id},
        {"$set": {
            "status": "travelling",
            "status_emoji": "✈️",
            "status_message": f"Flying to {travel_data.destination_name}",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return travel.dict()

@api_router.put("/travel/{travel_id}/land")
async def mark_travel_landed(travel_id: str):
    travel = await db.travel.find_one({"id": travel_id})
    if not travel:
        raise HTTPException(status_code=404, detail="Travel not found")
    
    await db.travel.update_one(
        {"id": travel_id},
        {"$set": {"status": "landed", "progress": 100}}
    )
    
    # Update user status
    await db.users.update_one(
        {"id": travel["user_id"]},
        {"$set": {
            "status": "arrived",
            "status_emoji": "📍",
            "status_message": f"Landed safely in {travel['destination_name']}",
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Create footprint
    footprint = {
        "id": str(uuid.uuid4()),
        "user_id": travel["user_id"],
        "user_name": travel["user_name"],
        "user_emoji": travel["user_emoji"],
        "status": "arrived",
        "status_emoji": "📍",
        "message": f"Landed safely in {travel['destination_name']}",
        "created_at": datetime.utcnow()
    }
    await db.footprints.insert_one(footprint)
    
    return {"success": True, "message": f"{travel['user_name']} has landed safely!"}

@api_router.put("/travel/{travel_id}/progress")
async def update_travel_progress(travel_id: str, progress: int):
    travel = await db.travel.find_one({"id": travel_id})
    if not travel:
        raise HTTPException(status_code=404, detail="Travel not found")
    
    await db.travel.update_one(
        {"id": travel_id},
        {"$set": {"progress": min(100, max(0, progress))}}
    )
    
    updated = await db.travel.find_one({"id": travel_id})
    return serialize_doc(updated)

# Check-in Requests
@api_router.post("/checkin")
async def send_checkin_request(from_user_id: str, to_user_id: str):
    from_user = await db.users.find_one({"id": from_user_id})
    to_user = await db.users.find_one({"id": to_user_id})
    
    if not from_user or not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    checkin = CheckInRequest(from_user_id=from_user_id, to_user_id=to_user_id)
    await db.checkin_requests.insert_one(checkin.dict())
    
    # Create notification
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": to_user_id,
        "type": "check_in",
        "title": f"{from_user['name']} sent a check-in nudge",
        "message": "Can you check in? 🌿",
        "related_user_id": from_user_id,
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(notification)
    
    # Create footprint
    footprint = {
        "id": str(uuid.uuid4()),
        "user_id": from_user_id,
        "user_name": from_user["name"],
        "user_emoji": from_user["emoji"],
        "status": "check_in_sent",
        "status_emoji": "👋",
        "message": f"Sent {to_user['name']} a check-in nudge",
        "created_at": datetime.utcnow()
    }
    await db.footprints.insert_one(footprint)
    
    return checkin.dict()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_database()
    logger.info("Reassura API started 🌿")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
