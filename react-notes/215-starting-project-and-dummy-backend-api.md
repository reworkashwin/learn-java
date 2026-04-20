# Starting Project & Dummy Backend API

## Introduction

Before diving into the code, let's set up the playground. This module uses a **PlacePicker** application where users can browse and select places. The critical difference from earlier versions of this project? All the data — places, images, user selections — lives on a **backend server**, not inside the React project.

This note covers the project structure and the dummy backend API you'll be working with.

---

## Project Structure: Two Separate Servers

This project requires **two running processes**:

1. **Frontend (React)** — the Vite development server serving your React app
2. **Backend (Node.js)** — a separate API server that stores and serves data

```
project/
├── src/              ← React frontend code
├── backend/          ← Node.js backend API
│   ├── app.js        ← Backend logic & endpoints
│   ├── data/         ← Data files (JSON)
│   └── images/       ← Place images
├── package.json      ← Frontend dependencies
└── ...
```

### Starting Both Servers

```bash
# Terminal 1: Start the React frontend
npm install
npm run dev

# Terminal 2: Start the backend API
cd backend
npm install
node app.js
```

Both processes must be running simultaneously. The frontend runs on one port, the backend on another (typically `localhost:3000`).

---

## The Dummy Backend API

The backend is a simple Node.js server with a few endpoints:

### Available Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/places` | Fetch all available places |
| `GET` | `/user-places` | Fetch the user's selected places |
| `PUT` | `/user-places` | Update the user's selected places |

### What the Backend Controls

Remember the previous note: the backend decides which requests are allowed. This API only exposes these three routes. Any other request will be rejected. This is the security model in action — the backend acts as a gatekeeper.

---

## Important Caveats

### Shared User Data
In this demo, all users share the same selection data. In a real app, you'd have authentication and per-user data. But for learning HTTP requests, this simplification is fine.

### Not a Backend Course
The focus here is on the **React side** — how to send requests, handle responses, manage loading and error states. The backend is just a tool to practice with.

### Prerequisites
You should be familiar with basic web concepts like URLs, HTTP methods (GET, POST, PUT), and status codes (200, 404, 500). If these terms are unfamiliar, brush up on web fundamentals before continuing.

---

## ✅ Key Takeaways

- The project uses two separate servers: React frontend + Node.js backend
- Both must be running for the app to work
- The backend exposes specific endpoints for fetching and updating place data
- All data and images are stored on the backend, not in the React project
- This is a simplified demo — real apps would have authentication and per-user data
