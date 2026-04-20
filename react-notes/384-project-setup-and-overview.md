# Project Setup & Overview

## Introduction

Before diving into TanStack Query, let's understand the project structure we'll be working with. This section comes with a starting project that has both a **React frontend** and a **Node.js backend** — two separate projects in one.

---

## Project Structure

### Frontend (React)

The `src/` folder contains a pre-built React application with:
- Multiple components already created
- Event listing and detail pages
- Forms for creating events
- Standard React project structure

The focus of this section isn't building these components — it's about **how they communicate with the backend** using TanStack Query.

### Backend (Node + Express)

Inside the project, there's a `backend/` folder containing:
- A Node.js/Express server in `app.js`
- API endpoints for CRUD operations on events
- Dummy data to work with

You don't need to know Node.js or Express — the backend is provided as-is. It's there to give us a real API to talk to.

---

## Setting Up Locally

### Step 1: Install Frontend Dependencies

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Backend Server

```bash
# In the backend/ folder
npm start
```

Keep this running throughout the section.

### Step 4: Start the Frontend Server

```bash
# In a NEW terminal, back in the root project folder
npm run dev
```

You need **two terminals running simultaneously** — one for the backend, one for the frontend.

---

## Official Documentation

The official TanStack Query documentation is excellent and worth bookmarking:

- Search for "TanStack Query" online
- Make sure you're looking at the **latest version** (v5 at the time of this course)

The docs cover every feature in detail — we'll cover the key features in this section, but the docs are your go-to reference for edge cases and advanced usage.

---

## ✅ Key Takeaways

- This project has two parts: a React frontend and a Node.js backend
- You need two terminal processes running (frontend + backend)
- The backend is pre-built — no Node.js knowledge required
- Consult the official TanStack Query docs for the latest API reference
