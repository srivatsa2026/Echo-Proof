import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import logging
import uuid
from datetime import datetime
import json
from utils import get_supabase_client
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
CORS(app, resources={r"/api/*": {"origins": "*"}})
# Initialize Supabase client
supabase = get_supabase_client()

# A dictionary to store rooms and their participants
rooms = {}
# A dictionary to store user information
users = {}
# A dictionary to store room messages history
room_messages = {}

@app.route('/')
def index():
    return "Chat Server is running!"

# Handle client connection
@socketio.on('connect')
def handle_connect():
    """Handles client connection."""
    print("the request from the connect event is ",request)
    user_id = request.sid
    logger.info(f"🔌 Client connected: {user_id}")
    
    # Generate a unique user ID
    users[user_id] = {
        "sid": user_id,
        "name": f"User-{str(uuid.uuid4())[:8]}",  # Generate a random username
        "rooms": [],
        "status": "online"
    }
    
    emit("connection_status", {
        "status": "connected",
        "message": "Connected to the chat server. You can now join a room.",
        "userId": user_id
    })

# Handle client disconnection
@socketio.on('disconnect')
def handle_disconnect():
    """Handles client disconnection."""
    user_id = request.sid
    logger.info(f"🔌 Client disconnected: {user_id}")
    
    # Remove user from all rooms they were in
    if user_id in users:
        for room_id in users[user_id]["rooms"]:
            if room_id in rooms and user_id in rooms[room_id]:
                rooms[room_id].remove(user_id)
                # Get updated participants
                participants = get_room_participants(room_id)
                
                # Notify others in the room
                emit("user_left", {
                    "message": f"{users[user_id]['name']} has left the room.",
                    "userId": user_id,
                    "username": users[user_id]['name'],
                    "participants": participants
                }, room=room_id)
        
        # Remove user from users dictionary
        del users[user_id]

# Helper function to get room participants
def get_room_participants(room_id):
    """Returns list of participants for a room."""
    participants = []
    if room_id in rooms:
        for uid in rooms[room_id]:
            if uid in users:
                participants.append({
                    "id": uid,
                    "name": users[uid]["name"],
                    "status": users[uid]["status"],
                    "isCurrentUser": False  # This will be adjusted on the client
                })
    return participants

# Handle a user joining a room
@socketio.on("join")
def handle_join(data):
    """Handles joining a room."""
    user_id = request.sid
    room_id = data.get("room")
    user_name = data.get("username", users.get(user_id, {}).get("name", "Unknown User"))
    
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return
    
    logger.info(f"User {user_id} ({user_name}) joined room: {room_id}")
    
    # Update user info
    if user_id in users:
        users[user_id]["name"] = user_name
        users[user_id]["status"] = "online"
        if room_id not in users[user_id]["rooms"]:
            users[user_id]["rooms"].append(room_id)
    
    # Join the room
    join_room(room_id)
    
    # Track the participants in the room
    if room_id not in rooms:
        rooms[room_id] = []
    if user_id not in rooms[room_id]:
        rooms[room_id].append(user_id)
    
    # Create room history if it doesn't exist
    if room_id not in room_messages:
        room_messages[room_id] = []
    
    # Get current participants
    participants = get_room_participants(room_id)
    
    # Send a join confirmation to the user who joined
    emit("join_success", {
        "message": f"You have joined the room: {room_id}",
        "roomId": room_id,
        "participants": participants,
        "history": room_messages.get(room_id, [])
    })
    
    # Broadcast to other clients in the room
    emit("user_joined", {
        "message": f"{user_name} has joined the room!",
        "username": user_name,
        "userId": user_id,
        "participants": participants
    }, room=room_id, include_self=False)

# Handle a user leaving a room
@socketio.on("leave")
def handle_leave(data):
    """Handles leaving a room."""
    user_id = request.sid
    room_id = data.get("room")
    
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return
    
    # Remove room from user's list
    if user_id in users and room_id in users[user_id]["rooms"]:
        users[user_id]["rooms"].remove(room_id)
    
    # Remove user from room's participants
    if room_id in rooms and user_id in rooms[room_id]:
        rooms[room_id].remove(user_id)
        
        # If room is empty, clean up
        if len(rooms[room_id]) == 0:
            del rooms[room_id]
            if room_id in room_messages:
                del room_messages[room_id]
    
    # Leave the socket.io room
    leave_room(room_id)
    
    # Get updated participants
    participants = get_room_participants(room_id)
    
    # Notify the user who left
    emit("leave_success", {
        "message": f"You have left the room: {room_id}",
        "roomId": room_id
    })
    
    # Notify others in the room
    if user_id in users:
        emit("user_left", {
            "message": f"{users[user_id]['name']} has left the room.",
            "userId": user_id,
            "username": users[user_id]['name'],
            "participants": participants
        }, room=room_id)
    
    logger.info(f"User {user_id} left room: {room_id}")

# Handle incoming messages and broadcast them to the room
@socketio.on("message")
def handle_message(data):
    """Handles incoming messages."""
    user_id = request.sid
    userDbId = data.get("userDbId")
    smart_wallet_address = data.get("smart_wallet_address")
    room_id = data.get("room")
    message_text = data.get("message")
    user_name = data.get("username", users.get(user_id, {}).get("name", "Unknown User"))
    timestamp = datetime.now().isoformat()
    # logger.info(f"userDbId is {userDbId} and the smart wallet address is {smart_wallet_address}")
    if not room_id or not message_text:
        emit("error", {"message": "Room ID and message are required."})
        return
    
    # Check if room exists
    if room_id not in rooms:
        emit("error", {"message": "Room does not exist or you are not in this room."})
        return
    
    # Check if user is in the room
    if user_id not in rooms[room_id]:
        emit("error", {"message": "You are not in this room."})
        return
    
    logger.info(f"📩 Received message in room {room_id} from {user_name} and the smart address is {smart_wallet_address}: {message_text} and the request.sid is {request.sid} and the request is {request}")
    
    # Create message object
    message_obj = {
        "id": f"msg-{timestamp}-{user_id}",
        "sender": {
            "id": user_id,
            "name": user_name
        },
        "content": message_text,
        "timestamp": timestamp
    }
    
    # Store message in history
    if room_id in room_messages:
        room_messages[room_id].append(message_obj)
    
    # Broadcast the message to everyone in the room EXCEPT the sender
    emit("message_received", message_obj, room=room_id, include_self=False)
    db_response = supabase.table("messages").insert({
        "chatroom_id": room_id,
        "sender_id": userDbId,
        "message_text": message_text,
        "sent_at": timestamp
    }).execute()
    logger.info(f"DB response: {db_response}")
    # Send confirmation to the sender
    emit("message_sent", message_obj)

# Get room participants
@socketio.on("get_participants")
def handle_get_participants(data):
    """Returns the participants in a room."""
    room_id = data.get("room")
    
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return
    
    participants = get_room_participants(room_id)
    
    emit("participants_list", {
        "room": room_id,
        "participants": participants
    })

# Get message history for a room
@socketio.on("get_history")
def handle_get_history(data):
    """Returns the message history for a room."""
    room_id = data.get("room")
    
    if not room_id:
        emit("error", {"message": "Room ID is required."})
        return
    
    history = room_messages.get(room_id, [])
    
    emit("history", {
        "room": room_id,
        "messages": history
    })

# Update user status
@socketio.on("update_status")
def handle_update_status(data):
    """Updates a user's status."""
    user_id = request.sid
    status = data.get("status")
    
    if not status or status not in ["online", "away", "busy"]:
        emit("error", {"message": "Valid status is required (online, away, busy)."})
        return
    
    if user_id in users:
        old_status = users[user_id]["status"]
        users[user_id]["status"] = status
        
        # Notify all rooms the user is in
        for room_id in users[user_id]["rooms"]:
            participants = get_room_participants(room_id)
            emit("status_updated", {
                "userId": user_id,
                "username": users[user_id]["name"],
                "oldStatus": old_status,
                "newStatus": status,
                "participants": participants
            }, room=room_id)

if __name__ == '__main__':
    logger.info("🚀 Starting chat server at http://localhost:5050")
    try:
        socketio.run(app, host="0.0.0.0", port=5050, debug=True)
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        logger.warning("Eventlet not available, falling back to Flask development server")
        socketio.run(app, host="0.0.0.0", port=5050, debug=True)