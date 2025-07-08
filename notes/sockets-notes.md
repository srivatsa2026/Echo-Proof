# Socket.IO Complete Guide - Events, Client & Server

## 🔄 Concept Overview

- **`socket.emit(event, data)`**: Sends an event with data
- **`socket.on(event, callback)`**: Listens for an event and handles it with a callback

## 💻 Basic Example: Simple Chat Application

### 📁 Server (Node.js + Socket.IO)

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// When a client connects
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a "chat message" event from the client
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);

    // Emit the message to all clients
    io.emit('chat message', msg);
  });

  // When the client disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
```

### 🌐 Client (HTML + JS)

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Chat</title>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const socket = io(); // connect to server

        // Send message on form submit
        document.querySelector("form").addEventListener("submit", (e) => {
          e.preventDefault();
          const input = document.getElementById("message");
          const msg = input.value;
          socket.emit("chat message", msg); // 🔼 emit to server
          input.value = '';
        });

        // Listen for messages from server
        socket.on("chat message", (msg) => {
          const item = document.createElement("li");
          item.textContent = msg;
          document.getElementById("messages").appendChild(item);
        });
      });
    </script>
  </head>
  <body>
    <ul id="messages"></ul>
    <form><input id="message" autocomplete="off" /><button>Send</button></form>
  </body>
</html>
```

### 🧠 Event Flow Summary

| Event | Where | Description |
|-------|-------|-------------|
| `socket.emit('chat message', msg)` | Client | Sends message to server |
| `socket.on('chat message', callback)` | Server | Receives message from client |
| `io.emit('chat message', msg)` | Server | Broadcasts to all clients |
| `socket.on('chat message', callback)` | Client | Receives message from server |

## ⚛️ React + Node.js Example

### 🧱 Tech Stack
- **Frontend**: React (with socket.io-client)
- **Backend**: Node.js + Express + socket.io

### 📁 Project Structure
```
/server
  └── index.js
/client
  └── src/
       ├── App.js
       └── index.js
```

### 🔧 Step 1: Server Setup (Node.js + Socket.IO)

```javascript
// /server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // Enable CORS for client-server communication

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Listen for messages from client
  socket.on('chat message', (msg) => {
    console.log('📨 Message received:', msg);

    // Broadcast message to all clients
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
```

### ⚛️ Step 2: React Client Setup

**Install dependencies:**
```bash
cd client
npm install socket.io-client
```

```javascript
// /client/src/App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect to backend

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat message', (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    socket.emit('chat message', message); // Send to server
    setMessage('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>React Chat</h2>
      <ul>
        {chat.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSend}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
```

### 🏁 Running the Application

**Start the server:**
```bash
cd server
npm install express socket.io cors
node index.js
```

**Start the client:**
```bash
cd client
npm start
```

## 🚀 Enhanced Example with Multiple Events

### 🧠 Events We'll Add:
- ✅ **user joined** — When a user joins
- ❌ **user left** — When a user leaves
- 📝 **typing** — Show when someone is typing
- 💬 **chat message** — Send and receive chat messages

### 🧑‍💻 Enhanced Backend

```javascript
// /server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User joins with a name
  socket.on('user joined', (username) => {
    socket.username = username;
    console.log(`${username} joined`);
    io.emit('user joined', `${username} has joined the chat`);
  });

  // Receive message
  socket.on('chat message', (msg) => {
    io.emit('chat message', { user: socket.username, message: msg });
  });

  // Typing event
  socket.on('typing', () => {
    socket.broadcast.emit('typing', `${socket.username} is typing...`);
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('user left', `${socket.username} has left the chat`);
    }
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
```

### ⚛️ Enhanced React Frontend

```javascript
// /client/src/App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState('');
  const [isTyping, setIsTyping] = useState('');

  useEffect(() => {
    // Event listeners
    socket.on('chat message', (data) => {
      setChat((prev) => [...prev, `${data.user}: ${data.message}`]);
    });

    socket.on('user joined', (msg) => {
      setChat((prev) => [...prev, `🟢 ${msg}`]);
    });

    socket.on('user left', (msg) => {
      setChat((prev) => [...prev, `🔴 ${msg}`]);
    });

    socket.on('typing', (msg) => {
      setIsTyping(msg);
      setTimeout(() => setIsTyping(''), 2000); // Clear after 2s
    });

    return () => {
      socket.off('chat message');
      socket.off('user joined');
      socket.off('user left');
      socket.off('typing');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing');
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('user joined', username);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>React Chat</h2>

      {!username ? (
        <form onSubmit={handleUsernameSubmit}>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      ) : (
        <>
          <ul>
            {chat.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
          {isTyping && <p style={{ color: 'gray' }}>{isTyping}</p>}

          <form onSubmit={handleSend}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
```

### 📊 Enhanced Event Summary

| Event Name | Triggered From | Handled On | Purpose |
|------------|----------------|------------|---------|
| `user joined` | React | Server & React | Broadcast when someone joins |
| `user left` | Server | React | Broadcast when someone leaves |
| `chat message` | React | Server & React | Send/receive chat messages |
| `typing` | React | React | Show typing indicator |

## 🔄 Understanding socket.on and io.emit

### 💡 Socket.IO Architecture Basics

Each client that connects to your server gets a unique `socket` object.

The server has access to:
- **`socket`** → refers to one specific client connection
- **`io`** → refers to the entire server, can broadcast to all clients

### ✅ Method Comparison

| Method | Where used | Who it sends to / listens to |
|--------|------------|------------------------------|
| `socket.emit` | client or server | Sends data to one specific connection |
| `io.emit` | server | Sends data to all connected clients |
| `socket.on` | client or server | Listens for an event from the other side |

### 🧠 Communication Flow

**🔹 From Client ➡️ Server**
```javascript
// ✅ Client sends
socket.emit('eventName', data);

// ✅ Server listens
socket.on('eventName', (data) => {
  // handle it
});
```

**🔹 From Server ➡️ Client**
```javascript
// ✅ Server sends (to all clients)
io.emit('eventName', data);
// or to specific client
socket.emit('eventName', data);

// ✅ Client listens
socket.on('eventName', (data) => {
  // handle it
});
```

### 📦 Real Example

**Client:**
```javascript
// React or browser JS
socket.emit('joinRoom', 'room123');   // client sends
socket.on('welcome', (msg) => {       // client listens
  console.log(msg);
});
```

**Server:**
```javascript
socket.on('joinRoom', (roomId) => {   // server listens
  socket.join(roomId);
  socket.emit('welcome', `Welcome to room: ${roomId}`); // server sends
});
```

## 🏠 Room-Based Communication

### ✅ Broadcasting Options

| Expression | Sends To | Sender Receives? |
|------------|----------|------------------|
| `io.emit('event', data)` | All connected clients | ✅ Yes |
| `socket.broadcast.emit('event')` | All except the sender | ❌ No |
| `socket.to(roomId).emit('event')` | All in a room, except sender | ❌ No |
| `io.to(roomId).emit('event')` | All in a room, including sender | ✅ Yes |

### 💡 Room Example

**Server:**
```javascript
socket.on('join_room', (roomId) => {
  socket.join(roomId);

  // Notify others in the room
  socket.to(roomId).emit('user_joined', {
    userId: socket.id,
    message: 'A new user has joined the room.'
  });
});
```

**Client:**
```javascript
socket.emit('join_room', 'room123');

socket.on('user_joined', (data) => {
  console.log(data.message);
});
```

### 🧠 Broadcasting Summary

| You want to send to... | Use |
|------------------------|-----|
| All clients everywhere | `io.emit(...)` |
| All except the sender | `socket.broadcast.emit(...)` |
| Everyone in a room, except the sender | `socket.to(roomId).emit(...)` |
| Everyone in a room, including the sender | `io.to(roomId).emit(...)` |
| Only the sender | `socket.emit(...)` |

## 🔥 Key Takeaways

1. **`socket.emit`** sends events, **`socket.on`** listens for events
2. **`io.emit`** broadcasts to all clients from the server
3. **`socket.to(roomId).emit`** sends to specific rooms
4. Always clean up event listeners in React with `socket.off()`
5. Use `useEffect` cleanup to prevent memory leaks

This covers the fundamentals of Socket.IO events and real-time communication patterns!