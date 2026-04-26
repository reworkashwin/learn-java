# Onwards to a Bigger Project

## Introduction

You've mastered the basics of NextJS file-based routing — creating pages, dynamic routes, and navigation. But now it's time to level up. In this section, we leave behind the simple news demo project and jump into building a **real-world Meetup application** from scratch. This is where things get exciting: we'll combine everything we've learned and add powerful NextJS features like data fetching, backend integration, and database storage.

Why does this matter? Because building a complete project is where the learning *really* sticks. You'll see how all the pieces fit together in a realistic scenario.

---

## Concept 1: Transitioning to a Real Project

### 🧠 What is it?

We're moving from a small demo project (the dummy news app) to a **bigger, more feature-rich NextJS project** — a Meetup application. This new project comes with a starting template that includes some pre-built React components, but the `pages/` folder is empty so we can practice file-based routing from scratch.

### ❓ Why do we need it?

The basics of routing, pages, and navigation are important — but they're just the foundation. To truly understand NextJS, you need to build something that involves:

- Multiple pages with different purposes
- Dynamic routes with encoded parameters
- Data fetching from a backend
- Storing data in a database

A bigger project forces you to connect all these dots.

### ⚙️ How it works

- A brand-new NextJS project is created using `npx create-next-app`
- The project is cleaned up and comes with pre-built **React components** (not NextJS-specific — just standard React)
- The `pages/` folder starts empty — we'll create all the pages ourselves
- The `styles/` folder has basic styles ready to go

Think of it as a workshop where the tools (components) are laid out for you, but the actual building is up to you.

### 💡 Insight

> The starting project deliberately separates concerns: React components live in a `components/` folder, and page-level components go in `pages/`. This separation is a NextJS best practice — only files in `pages/` become routable pages.

---

## Concept 2: What We're Building — The Meetup App

### 🧠 What is it?

The Meetup application has three core pages:

1. **All Meetups Page** — Fetches and displays a list of meetups
2. **New Meetup Page** — A form to create a new meetup (which gets sent to a backend and stored in a database)
3. **Meetup Detail Page** — A dynamic page that shows details for a specific meetup based on its ID in the URL

### ❓ Why do we need it?

This project covers the most common patterns in real-world web apps:

- Listing data from a source
- Creating new data via forms
- Viewing detail pages with dynamic routes

If you can build this, you can build most CRUD-style applications with NextJS.

### ⚙️ How it works

| Page | Route | Description |
|------|-------|-------------|
| All Meetups | `/` | Displays a list of all meetups |
| New Meetup | `/new-meetup` | Form to add a new meetup |
| Meetup Detail | `/[meetupId]` | Dynamic page showing details for one meetup |

The detail page uses a **dynamic route** — the meetup ID is encoded directly into the URL. When the page loads, it reads that ID and fetches the appropriate data.

### 💡 Insight

> This is very similar to the React tutorial project, but with a key difference — we'll leverage NextJS-specific features like **server-side rendering**, **API routes**, and **pre-rendering** that React alone doesn't offer out of the box.

---

## Concept 3: What's Coming Next

### 🧠 What is it?

Beyond just routing and rendering, this project will introduce several powerful NextJS concepts:

- **Data fetching** — How NextJS helps you load data before the page renders
- **Blending backend and frontend code** — Writing server-side logic alongside your React components
- **Building an API** — Creating API routes within your NextJS app
- **Database integration** — Storing and retrieving meetup data

### ❓ Why do we need it?

In a plain React app, you'd need a separate backend server, separate API endpoints, and separate deployment. NextJS lets you do it all in one project. That's a massive productivity boost.

### 💡 Insight

> Think of NextJS as a full-stack framework disguised as a frontend tool. You get React's component model *plus* server-side capabilities — all in one codebase.

---

## ✅ Key Takeaways

- We're transitioning from a basic demo to a **full meetup application**
- The starting project has pre-built React components but an empty `pages/` folder
- The app has three pages: list of meetups, new meetup form, and meetup detail (dynamic route)
- Upcoming topics include data fetching, API routes, and database integration
- NextJS blurs the line between frontend and backend — and that's a feature, not a bug

## ⚠️ Common Mistakes

- **Assuming you need the React tutorial first** — You don't. The starting project is self-contained
- **Putting everything in the `pages/` folder** — Only page components go there. Regular React components belong in a separate folder like `components/`

## 💡 Pro Tips

- Keep your `pages/` folder clean — it should only contain route-level components
- Use the starting project template as-is — resist the urge to restructure before understanding the flow
- As the project grows, pay attention to how NextJS handles the boundary between client and server code
