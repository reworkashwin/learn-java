# A Demo App: Introduction

## Introduction

Now it's time to level up. You've learned the basics of form actions — synchronous actions, `useActionState`, validation, form clearing. But real applications don't just validate input on the client side. They **send data to a backend**, handle **async operations**, and deal with **loading states**.

To explore these advanced features, we're working with a brand new project — an **anonymous opinion-sharing app** where users can post opinions and upvote/downvote them. And yes, this time there's a **backend** involved.

---

## The Project Structure

This project has two parts:

### 1. The Backend (Node/Express)

A simple Express server that:
- Stores data in a `db.json` file (simulating a database)
- Exposes API endpoints for fetching, submitting, and voting on opinions
- Includes **artificial delays** to simulate real-world server latency

You don't need to understand the backend code deeply — just know what endpoints are available.

### 2. The Frontend (React)

A React application that:
- Fetches and displays opinions from the backend
- Provides a form to submit new opinions
- Has upvote/downvote buttons for each opinion

---

## Getting It Running

If you're working locally, you need **two terminal windows**:

```bash
# Terminal 1: Start the backend
cd backend
npm install
npm start

# Terminal 2: Start the frontend
cd project-root
npm install
npm run dev
```

Visit `localhost:5173` and you should see a page with:
- Two pre-existing opinions (loaded from the backend)
- A form to submit new opinions

---

## What We'll Build

Over the next lectures, we'll handle the form submission using **React's form actions** features. But this time:

- The action function will be **async** (sending HTTP requests)
- We'll use `useFormStatus` to show loading states
- We'll implement **optimistic updates** with `useOptimistic`
- We'll handle **multiple form actions** in a single form

---

## Why This Matters

Most React tutorials show form handling in isolation — just client-side validation and local state. But real applications always involve:

- Network requests that take time
- UI feedback during loading
- Error handling for failed requests
- Optimistic UI for snappy user experiences

This demo app is the perfect playground for all of that.

---

## ✅ Key Takeaways

- This project combines a **React frontend** with a **Node/Express backend**
- The backend has artificial delays to help us practice handling async operations
- We'll progressively add features: async form actions → loading states → optimistic updates
- Make sure **both servers** (frontend and backend) are running before proceeding

## 💡 Pro Tip

Before diving into form handling code, take a quick look at the backend's `app.js` file. Understanding the available API endpoints and what data they expect will make the frontend work much smoother. You don't need to memorize it — just skim the routes.
