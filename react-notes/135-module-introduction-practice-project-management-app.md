# Module Introduction: Practice Project — Project Management App

## Introduction

It's time to put everything together. This section is a **hands-on practice project** where you'll build a complete React Project Management application from scratch. No new concepts — just the satisfying experience of combining Components, State, Refs, and Portals into a real, functional app.

---

## What We're Building

A **Project Management App** with these features:

- **Create projects** with a title, description, and due date
- **View project details** — select a project from a sidebar to see its info
- **Add tasks** to individual projects
- **Clear tasks** and **delete projects**
- **Empty state** — a prompt to create/select a project when none is active

It's a relatively simple CRUD app, but it exercises nearly every concept covered so far.

---

## Skills You'll Practice

| Concept | How It's Used |
|---------|---------------|
| **Components** | Sidebar, ProjectDetails, NewProject, Tasks, Modal |
| **Props** | Passing project data, callbacks between components |
| **State** | Managing the list of projects, selected project, tasks |
| **Refs** | Reading form inputs (title, description, date) |
| **Portals** | Modal dialogs for confirmations |
| **Conditional rendering** | Showing different views based on selection |
| **Lifting state up** | Shared state management across sidebar and main content |
| **Tailwind CSS** | Styling (pre-configured in the starter project) |

---

## The Challenge Approach

The instructor strongly recommends trying to build this **on your own first** before watching the solution. Here's a suggested approach:

### Step 1: Plan the Component Structure
Think about what components you need and how they relate to each other. Sketch a rough tree.

### Step 2: Build the Static UI
Get the layout and components rendering with hardcoded data. Focus on structure, not functionality.

### Step 3: Add State Management
Figure out where state should live (usually the `App` component for this project) and wire up the data flow.

### Step 4: Add Interactivity
Connect buttons, forms, and user inputs to state-changing functions.

### Step 5: Polish
Add validation, empty states, delete confirmations, and styling refinements.

---

## Starter Project Setup

The starting project comes with:
- **Tailwind CSS pre-installed** — utility-first CSS framework
- A basic `App` component with minimal markup
- All necessary dependencies configured

### Local Setup
```bash
npm install
npm run dev
```

### Key Reminder About Tailwind
Tailwind uses utility classes directly in JSX:
```jsx
<h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
```

Check the [Tailwind CSS docs](https://tailwindcss.com/docs) for available classes if you're styling on your own.

---

## What Matters Most

> "Get the React code right. The styling is not that important."

Don't get stuck on making it look perfect — focus on:
- Correct component architecture
- Proper state management and data flow
- Clean use of refs where appropriate
- Working functionality

You can always improve the styling later.

---

## ✅ Key Takeaways

- This is a **practice section** — no new concepts, just application of what you've learned
- Try building it yourself before watching the solution
- Focus on **architecture and functionality** over styling
- The project exercises: components, props, state, refs, portals, conditional rendering, and lifting state up

## 💡 Pro Tips

- Start simple — get something working, then iterate
- If you get stuck, revisit the specific lecture that covered the concept you're struggling with
- There's no single "right" solution — different component structures and state designs can all be valid
- Keep your component files focused — each component should have one clear responsibility
