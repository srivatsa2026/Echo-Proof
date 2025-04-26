from flask import Flask
from flask_cors import CORS  
from flask_socketio import SocketIO,emit
from controllers import user_bp

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# Register the user blueprint with the Flask app
app.register_blueprint(user_bp)


@socketio.on("connect")
def handle_connect():
    """Handles client connection."""
    print("🔌 Client connected!")
    emit("response", {"text": "Connected! Say something or start recording."})

@socketio.on("message")
def handle_message(data):
    """Handles incoming messages from the client."""
    print(f"📩 Received message: {data}")
    emit("response", {"text": f"Received: {data}"})


@socketio.on("disconnect")
def handle_disconnect():
    """Handles client disconnection."""
    print("🔌 Client disconnected!")



if __name__ == '__main__':
    print("🚀 Starting EmotionVox server at http://localhost:5050")
    
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, use_reloader=False)
