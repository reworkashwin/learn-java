# Onwards to a New Project Setup

## Introduction

At this point, you've learned all the fundamental routing concepts: route definitions, links, NavLinks, dynamic routes, relative vs absolute paths, and index routes. Now it's time to level up. The upcoming lectures dive into **advanced routing features**, especially around **data fetching and submission**. But first, we need a new project setup to work with.

---

## The New Project Structure

The new project comes with **two folders**:

### 1. `backend-api/`

A dummy backend application built with Node.js/Express. This provides a REST API that the React frontend will communicate with. Key points:

- **You don't need to write any code here** — it's pre-built for you
- It's standard Express.js code (not React-related)
- It serves as a data source for our React app
- You can explore the code if curious, but understanding it isn't required

### 2. `react-frontend/`

The React application you'll be working on throughout this section. It comes with:

- Pre-built components with default styling
- A starting structure ready for routing enhancements
- Everything you need to explore advanced React Router features

---

## Running Both Servers

This is important — **both servers must run simultaneously** in separate terminal windows:

### Backend Server

```bash
cd backend-api
npm install       # first time only
npm start         # starts the backend server
```

Keep this running the entire time you're working on the project. Stop it with `Ctrl+C` when you're done, but **restart it** whenever you come back.

### Frontend Server

```bash
cd react-frontend
npm install       # first time only
npm start         # starts the React dev server
```

### Why Both?

The React frontend will send HTTP requests to the backend API. If the backend isn't running, those requests fail. Think of it like a restaurant: the frontend is the waiter (user interface), and the backend is the kitchen (data). You need both operational.

---

## ✅ Key Takeaways

- The project has two independent applications: a backend API and a React frontend
- Both servers must run in **separate terminal windows** simultaneously
- Run `npm install` in each folder before starting for the first time
- The backend is pre-built — focus your effort on the React frontend

## 💡 Pro Tip

Use split terminal views in VS Code (`Ctrl+\`` then split) to keep both server outputs visible at once. This makes it easy to spot backend errors when your frontend requests fail.
