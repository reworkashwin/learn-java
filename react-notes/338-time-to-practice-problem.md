# Time to Practice: Problem

## Introduction

Before diving into advanced routing features, it's time to **practice the fundamentals**. Hands-on practice is where real learning happens — reading and watching only get you so far. This exercise tests everything covered so far about React Router.

---

## The Challenge

In the `react-frontend/src/App.js` file, you'll find a series of tasks to complete. Here's what you're expected to do:

### Task List

1. **Install `react-router-dom`** — the routing package hasn't been installed yet
2. **Create page components** — `HomePage`, `EventsPage`, `EventDetailPage`, `NewEventPage`, `EditEventPage`
3. **Set up route definitions** with appropriate paths:
   - `/` → HomePage
   - `/events` → EventsPage
   - `/events/:eventId` → EventDetailPage
   - `/events/new` → NewEventPage
   - `/events/:eventId/edit` → EditEventPage
4. **Add a root layout** with the `MainNavigation` component wrapping all pages
5. **Add working links** in the MainNavigation
6. **Highlight active links** using `NavLink`
7. **Display a list of dummy events** on the EventsPage with links to detail pages
8. **Show the event ID** on the EventDetailPage using `useParams`
9. **(Bonus)** Add a nested layout route with `EventsNavigation` wrapping all `/events` routes

---

## How to Approach This

1. **Try every task yourself first** — struggle is part of learning
2. Don't look at the solution until you've genuinely attempted it
3. The bonus task (#9) involves something not explicitly covered — it's okay if you can't do it
4. Reference the previous lectures if you get stuck on syntax

---

## ✅ Key Takeaway

The best way to solidify routing knowledge is to build routes from scratch. This exercise covers the full spectrum: installation, route definitions, dynamic routes, layouts, NavLinks, and nested layouts. Give it your best shot before checking the solution.
