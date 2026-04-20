# Adding Another Route via the Filesystem

## Introduction

We've seen that Next.js uses server components — components rendered on the server and sent as HTML to the browser. We also know that the special `page.js` filename tells Next.js "this is a page." But what if you want **more than one page**? How do you tell Next.js about a second route, like `/about`?

This is where the **file-based routing** system of Next.js really shines. Instead of configuring routes in code (like React Router), you simply create folders and files. Let's see how.

---

## The App Directory Is Your Router

In a standard React app, you'd reach for React Router to define routes. In Next.js, you don't need that. The `app` directory itself acts as your router.

### How It Works

To add a new route, you follow two steps:

1. **Create a folder** inside the `app` directory with the name of the route segment you want
2. **Add a `page.js` file** inside that folder

The folder name becomes the URL path segment. The `page.js` file tells Next.js "yes, this is a real route — render something here."

### Example: Creating an `/about` Route

```
app/
├── page.js          ← handles "/"
└── about/
    └── page.js      ← handles "/about"
```

Inside `about/page.js`:

```jsx
export default function AboutPage() {
  return (
    <main>
      <h1>About Us</h1>
    </main>
  );
}
```

That's it. Visit `localhost:3000/about` and you'll see "About Us" on the screen.

---

## Why Just a Folder Isn't Enough

Here's a detail that trips people up: adding a folder alone does **nothing**. If you create an `about/` folder but don't put a `page.js` inside it, visiting `/about` gives you a **404 error**.

Think of it this way:
- The **folder** declares the URL path
- The **`page.js` file** declares the content

You need both. The folder without `page.js` is like creating a room in a building but never putting anything inside — visitors walk in and find nothing.

---

## The Component Name Doesn't Matter

Inside your `page.js`, you export a React component function. You can name it anything:

```jsx
export default function WhateverYouWant() {
  return <h1>About Us</h1>;
}
```

Next.js doesn't care about the component name. It only cares about the **file name** (`page.js`) and the **folder structure**.

---

## ✅ Key Takeaways

- Next.js uses **file-based routing** — no React Router needed
- Add a **folder** inside `app/` to create a new URL path segment
- Add a **`page.js`** inside that folder to define the page content
- A folder without `page.js` results in a 404
- The exported component name is irrelevant — only the filename matters

## ⚠️ Common Mistakes

- Creating a folder but forgetting the `page.js` file inside it
- Thinking component names affect routing (they don't)

## 💡 Pro Tip

This routing pattern scales naturally. Nested folders create nested routes: `app/products/details/page.js` → `/products/details`. You'll see this in action with dynamic routes later.
