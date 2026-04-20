# Navigating Programmatically

## Introduction

So far, we've been navigating between pages by rendering `Link` or `NavLink` components that the user clicks. That's the **default and preferred** approach. But what happens when you need to navigate from inside your code — not because the user clicked a link, but because some **programmatic event** occurred? Maybe a form was submitted, a timer expired, or an API call succeeded. For these scenarios, React Router gives us the `useNavigate` hook.

---

## When Would You Navigate Programmatically?

Let's be clear about when this is appropriate:

- **After a form submission** — redirect the user to a success or list page
- **After a timer expires** — redirect to login after session timeout
- **After an API response** — navigate to a detail page after creating a resource
- **After authentication** — redirect to the dashboard after login

What you should **NOT** do is use `useNavigate` to create buttons that act like links. If the user just needs to go to another page, use `<Link>` — that's what it's for.

---

## The `useNavigate` Hook

```jsx
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  function handleSubmit() {
    // ... some logic (form submission, API call, etc.)
    navigate('/products');
  }

  return (
    <div>
      <h1>Home</h1>
      <button onClick={handleSubmit}>Go to Products</button>
    </div>
  );
}
```

### How It Works

1. Import `useNavigate` from `react-router-dom`
2. Call it inside your component to get the `navigate` function
3. Call `navigate('/path')` whenever you need to trigger a route change

The `navigate` function accepts the same path strings you'd use in `<Link to="...">` — both absolute and relative paths work.

---

## Important Distinction: Imperative vs Declarative

| Approach | Type | When to Use |
|---|---|---|
| `<Link>` / `<NavLink>` | Declarative | User-initiated navigation (clicking) |
| `useNavigate()` | Imperative | Code-initiated navigation (after logic) |

Declarative navigation (links) is always preferred when the user's intent is simply "go to this page." Imperative navigation is for when **something in your code** decides it's time to move.

---

## ✅ Key Takeaways

- `useNavigate` returns a function that triggers programmatic route changes
- Use it for logic-driven navigation (form submissions, redirects, timers)
- Don't use it as a replacement for `<Link>` — links are the right tool for clickable navigation
- It supports both absolute (`/products`) and relative (`products`) paths

## ⚠️ Common Mistakes

- Creating buttons with `useNavigate` when a `<Link>` would suffice — this hurts accessibility (links are semantic for navigation)
- Calling `navigate()` during render instead of inside an event handler or effect

## 💡 Pro Tip

`navigate(-1)` works like the browser's back button — it goes one step back in the history stack. `navigate(-2)` goes two steps back. This is useful for "Go Back" buttons in detail views.
