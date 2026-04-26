# Linking & Navigating

## Introduction

We've got routes defined and components rendering — but how do users actually *navigate* between them? Clicking a button or a link should take you to a different route without reloading the entire page. If we use regular HTML `<a>` tags, the browser sends a full request to the server, reloading the app from scratch. That defeats the whole purpose of a Single Page Application.

React Router provides two key tools for navigation: the `Link` component for declarative navigation and the `useNavigate` hook for programmatic navigation.

---

## Concept 1: Why Not Regular Anchor Tags?

### 🧠 What is it?

The HTML `<a>` element creates hyperlinks. When clicked, the browser sends an HTTP request to the server and loads a brand-new page.

### ❓ Why is this a problem in React?

Using `<a href="/create-post">` technically works — you'll land on the right route. But it causes a **full page reload**:
- The entire React app is re-downloaded and re-initialized
- All in-memory state is lost
- The user sees a brief flash while the page reloads
- It's slow and wasteful

### 💡 Insight

Watch the browser's refresh icon when clicking a regular anchor tag. If it briefly turns into a stop/cross icon, that means a new request was sent. In an SPA, this should never happen during internal navigation.

---

## Concept 2: The Link Component

### 🧠 What is it?

`Link` is a component from `react-router-dom` that renders an anchor tag under the hood but **prevents the browser's default behavior** of sending a new HTTP request. Instead, it tells React Router to update the URL and render the matching route — all on the client side.

### ⚙️ How it works

```jsx
import { Link } from 'react-router-dom';

function MainHeader() {
  return (
    <header>
      <Link to="/create-post">New Post</Link>
    </header>
  );
}
```

- Uses `to` prop instead of `href`
- Renders an `<a>` tag in the DOM (for accessibility and semantics)
- Intercepts the click to prevent full-page navigation
- Updates the URL via the History API
- React Router renders the matching component

### 🧪 Example

```jsx
// Before — causes full reload ❌
<a href="/create-post">New Post</a>

// After — client-side navigation ✅
<Link to="/create-post">New Post</Link>
```

### 💡 Insight

The `Link` component is for when you have a clickable element that should navigate somewhere. It's the **declarative** approach — you say *where* to go, and React Router handles the *how*.

---

## Concept 3: Programmatic Navigation with useNavigate

### 🧠 What is it?

Sometimes you need to navigate from inside code — not from a user clicking a link. For example, after closing a modal backdrop or after submitting a form. The `useNavigate` hook gives you a function to trigger navigation programmatically.

### ❓ Why can't we always use Link?

`Link` works when you have a visible clickable element. But what about:
- Clicking a modal backdrop (a `<div>`, not a link)
- Navigating after an async operation completes
- Redirecting based on some condition in code

These situations require **imperative** navigation.

### ⚙️ How it works

```jsx
import { useNavigate } from 'react-router-dom';

function Modal({ children }) {
  const navigate = useNavigate();

  function closeHandler() {
    navigate('..'); // go up to parent route
  }

  return (
    <>
      <div className="backdrop" onClick={closeHandler} />
      <dialog>{children}</dialog>
    </>
  );
}
```

### 💡 Insight

`useNavigate` returns a function. Call it with a path to navigate there. You can use:
- **Absolute paths**: `navigate('/create-post')` — goes to that exact URL
- **Relative paths**: `navigate('..')` — goes up one level in the route hierarchy (like `cd ..` in a terminal)

---

## Concept 4: Relative Paths with ".."

### 🧠 What is it?

Just like `..` in a terminal moves you up one directory, `..` in React Router moves you up one level in the **route hierarchy**.

### ⚙️ How it works

If you're on `/create-post` (which is a child route of `/`), navigating to `..` takes you to `/`.

This makes your components more **reusable** — they don't need to know the exact URL structure. They just say "go up one level," and React Router figures out the rest.

### 🧪 Example

```jsx
// In the Modal component (used by NewPost at /create-post):
navigate('..');  // navigates to the parent route: /

// Equivalent absolute path:
navigate('/');
```

### 💡 Insight

Relative paths make your routing more flexible. If you later change the URL structure, relative paths still work because they're based on the route hierarchy, not hardcoded URLs.

---

## Concept 5: Closing the Modal with Link and useNavigate

### 🧠 What is it?

In our app, the modal needs to close in two scenarios:
1. **Clicking the backdrop** → use `useNavigate` (programmatic, it's a div click)
2. **Clicking the Cancel button** → use `Link` (declarative, it's a clickable element)

### 🧪 Example

**Modal backdrop — programmatic:**
```jsx
const navigate = useNavigate();
const closeHandler = () => navigate('..');

<div className="backdrop" onClick={closeHandler} />
```

**Cancel button — declarative:**
```jsx
<Link to="..">Cancel</Link>
```

Both achieve the same result — navigating to the parent route — but using the approach that fits each situation.

---

## ✅ Key Takeaways

- **Never** use regular `<a>` tags for internal navigation — they cause full page reloads
- Use `<Link to="...">` for declarative, click-based navigation
- Use `useNavigate()` for programmatic navigation from within code
- Relative paths (`..`) navigate up the route hierarchy — great for flexibility
- `Link` renders an anchor tag under the hood but prevents the browser default

## ⚠️ Common Mistakes

- Using `href` instead of `to` on the `Link` component — `href` is for regular anchors
- Using `<a>` tags instead of `<Link>` — causes full app reload
- Forgetting to import `Link` or `useNavigate` from `react-router-dom`
- Hardcoding absolute paths everywhere when relative paths would be more flexible

## 💡 Pro Tips

- Use `Link` whenever you have a visible navigation element (buttons, menu items)
- Use `useNavigate` for navigation that happens as a side effect of some action
- Relative paths (`..`) keep your components decoupled from the URL structure
- You can also pass a number to `navigate(-1)` to go back one step in browser history
