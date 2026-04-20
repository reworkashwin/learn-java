# Onwards to the Main Project: The Foodies App

## Introduction

We've covered the fundamentals of Next.js routing — static routes, dynamic routes, layouts, and navigation. Now it's time to leave the demo project behind and build something real: the **Foodies App** (also called the Meals App).

---

## What Is the Foodies App?

This is the main project for the rest of this Next.js section. It's a community-driven food sharing platform where users can browse and share meals. Think of it as a simplified recipe-sharing app built with Next.js.

---

## The Starting Project Structure

The provided project has been cleaned up from the demo. Here's what's included:

### Key Directories and Files

- **`app/` folder**: Contains the root `layout.js` and `page.js` — but all the demo pages (about, blog) have been removed
- **`assets/` folder**: Contains images needed for the application (logos, food images)
- **`public/` folder**: Contains publicly accessible images
- **Updated styles**: Fresh CSS files for the new design
- **Updated `layout.js`**: This isn't an empty shell — it includes an SVG graphic that renders behind the header for aesthetic purposes

### The Root Layout

The root layout already has the basic HTML skeleton set up, plus a decorative SVG that creates a visual background element behind the site header. This is just for aesthetics — the important part is that the layout still uses `children` to render the active page content.

---

## What We'll Build

Over the coming lectures, we'll add:

- A proper navigation header with links
- A meals browsing page
- A meal sharing page
- A community page
- Dynamic meal detail pages
- Data fetching from a database
- Form handling for submitting new meals
- Image uploads
- And much more

---

## ✅ Key Takeaways

- The Foodies App is the hands-on project for learning Next.js features in depth
- The starting project comes with pre-configured assets, styles, and a base layout
- Everything we learned about routing, layouts, and navigation will be applied and expanded upon

## 💡 Pro Tip

Take the time to explore the starting project before diving in. Open the `assets/` folder to see what images are available. Look at `globals.css` for pre-built styles. Understanding what's already provided saves you from reinventing the wheel.
