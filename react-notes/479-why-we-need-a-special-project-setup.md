# Why We Need a Special Project Setup

## Introduction

You've learned a ton of React features throughout this course — but here's a twist: **some React features can't be used in every React project**. Sounds strange, right? Features like **React Server Components**, **Server Actions**, and the **`use()` hook with Promises** are officially part of React, yet they require a special project setup to work. Standard Vite-based React projects? They can't use them. So what gives? Let's break down *why* and *how* to set things up so you can unlock these powerful features.

---

## Concept 1: The Problem with Standard React Projects

### 🧠 What is it?

Certain React features — specifically React Server Components, Server Actions, and the `use()` hook for Promises — are **not available** in standard "vanilla" React projects like those created with Vite.

### ❓ Why do we need it?

These features involve code that needs to run **on the server side**, not just in the browser. A standard React project only gives you the browser side — there's no server environment baked in. So there's nowhere for that server-side code to execute.

### ⚙️ How it works

For these features to work, the project setup needs to:

1. **Split the code** into two packages:
   - Code that **never runs in the browser** (server-only)
   - Code that **does run in the browser** (client-side)
2. **Provide a server-side environment** where the server-only code can execute

Without this automatic splitting and server environment, these features simply can't function. That's why you need a framework that handles all of this behind the scenes.

### 💡 Insight

Think of it like a restaurant: the kitchen (server) and the dining room (browser) are two different environments. Some tasks — like cooking food — *must* happen in the kitchen. If your restaurant has no kitchen, those tasks simply can't be done. Standard React projects are like a dining room with no kitchen.

---

## Concept 2: Next.js as the Solution

### 🧠 What is it?

**Next.js** is a full-stack React framework that builds on top of React and provides the exact project setup needed to support React Server Components, Server Actions, and the `use()` hook.

### ❓ Why do we need it?

Because Next.js:
- Automatically **splits your code** into server-side and client-side bundles
- Provides a **server environment** for server-side code to execute
- Sets up **multi-page routing** with file-based page definitions (`page.js` files)

### ⚙️ How it works

1. Download or create a Next.js project
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Define pages using `page.js` files in the `app` folder
5. Use components in those pages to compose your UI

In Next.js projects, you can use the `@` import alias to reference the root project folder, making imports cleaner:

```jsx
import MyComponent from '@/components/MyComponent';
```

### 🧪 Example

For this section, you'll work with a simple Next.js project with just one page. You don't need to know advanced Next.js features — the basics are enough to explore these special React features.

### 💡 Insight

At the time of learning, Next.js is one of the few frameworks that fully supports these features. The React ecosystem is evolving, and more setups may support them in the future — but for now, Next.js is your go-to.

---

## ✅ Key Takeaways

- React Server Components, Server Actions, and `use()` with Promises are **part of React** but need special project setups
- Standard Vite-based projects **cannot** use these features
- These features require **server-side execution** and **automatic code splitting**
- **Next.js** provides the setup needed to unlock them
- You only need a basic understanding of Next.js to get started

## ⚠️ Common Mistakes

- Trying to use Server Components or Server Actions in a Vite project and wondering why they don't work
- Assuming all React features work in all React projects
- Skipping the Next.js fundamentals before diving into these features

## 💡 Pro Tips

- Start the Next.js dev server with `npm run dev` and keep the terminal visible — you'll see server-side logs there
- Familiarize yourself with the `app/page.js` file structure — it's the entry point for your pages in Next.js
- Don't worry about advanced Next.js features for now — focus on understanding these React-specific concepts
