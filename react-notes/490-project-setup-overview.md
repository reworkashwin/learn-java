# Project Setup & Overview

## Introduction

Before we dive into animations, let's get the project set up and understand what we're working with. This section uses a **Challenges app** — a fully functional React application that we'll progressively enhance with animations throughout the module.

---

## Concept 1: Setting Up the Project

### 🧠 What is it?

The starting project is a pre-built React application (using Vite) that includes all the core functionality — creating challenges, managing them, switching between tabs — but has **zero animations**.

### ⚙️ How it works

You have two options to get started:

**Option A — Local Setup:**
1. Download the attached ZIP file
2. Extract it to a folder
3. Run `npm install` to install all dependencies
4. Run `npm run dev` to start the development server
5. Visit the URL shown in the terminal (usually `http://localhost:5173`)

**Option B — CodeSandbox:**
1. Click the CodeSandbox link provided
2. Everything is already set up — no installs needed
3. Start coding right away in the browser

### 💡 Insight

CodeSandbox is great for quick experimentation, but if you want the full development experience (hot reloading, terminal access, debugging), go with the local setup.

---

## Concept 2: Exploring the App

### 🧠 What is it?

The Challenges app is a feature-rich application where users can create and manage personal challenges. Each challenge has a title, image, deadline, and status.

### ⚙️ How it works

Here's what the app can do out of the box:

- **Starting screen** — A landing page (which we'll later animate with scroll-based effects)
- **Challenges page** — Where users manage their challenges
- **Add a new challenge** — Opens a modal with a form for title, date, and image selection
- **View challenge details** — Expand/collapse details for each challenge
- **Mark challenges** — Complete or fail challenges
- **Tab switching** — Filter challenges by status (Active, Completed, Failed)

### 🧪 Example

Try creating a challenge: click "Add Challenge," fill in a title, pick a date, select an image, and submit. Then try expanding its details, changing its status, and switching tabs. Everything works — it's all functional.

### 💡 Insight

The key observation here is: **the app works perfectly fine without animations**. It's functional, usable, and looks decent. But "decent" and "delightful" are two different things — and animations are what bridge that gap.

---

## ✅ Key Takeaways

- The project can be set up locally (with `npm install` + `npm run dev`) or via CodeSandbox
- The app is a fully functional Challenges manager — create, view, complete, and fail challenges
- Everything works but has **no animations** — that's our job throughout this section

## ⚠️ Common Mistakes

- Forgetting to run `npm install` before `npm run dev` when using the local setup
- Using `.js` instead of `.jsx` file extensions — this is a Vite project, so `.jsx` is required for files containing JSX
