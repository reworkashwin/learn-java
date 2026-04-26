# Using Programmatic (Imperative) Navigation

## Introduction

So far, we've been using the `<Link>` component to navigate between pages in our Next.js app. But what if you need to navigate **programmatically** — say, after a form submission, or when a button is clicked instead of a link? That's where imperative navigation comes in. In this section, we'll learn how to use the `useRouter` hook to push users to a new page entirely through JavaScript code — no anchor tags required.

---

## Concept 1: Why Navigate Programmatically?

### 🧠 What is it?

Programmatic navigation means triggering a route change from JavaScript code rather than relying on a clickable `<Link>` or `<a>` tag in your JSX.

### ❓ Why do we need it?

Think about scenarios like:
- After a user submits a form, you want to redirect them to a different page
- A button press should navigate somewhere, but you don't want an anchor tag (maybe for semantic or styling reasons)
- You need to conditionally navigate based on some logic

In all these cases, you can't just render a `<Link>`. You need to **tell** the router: "Hey, go to this page now."

### ⚙️ How it works

Next.js provides the `useRouter` hook from `next/router`. This hook gives you access to a `router` object with methods like:
- `router.push('/some-path')` — navigates to a new page (like clicking a link)
- `router.replace('/some-path')` — replaces the current page in the history stack
- `router.query` — access URL parameters

### 💡 Insight

`router.push()` is the programmatic equivalent of the `<Link>` component. It pushes a new page onto the navigation stack, so the user can still hit the back button to return.

---

## Concept 2: Implementing Programmatic Navigation with `useRouter`

### 🧠 What is it?

A step-by-step approach to navigating away from a component using a button click and the `useRouter` hook.

### ⚙️ How it works

1. **Import `useRouter`** from `next/router`
2. **Call `useRouter()`** at the top level of your component (remember — it's a React hook, so it must follow the rules of hooks!)
3. **Define a handler function** that calls `router.push('/desired-path')`
4. **Attach the handler** to a button's `onClick`

### 🧪 Example

```jsx
import { useRouter } from 'next/router';

function MeetupItem(props) {
  const router = useRouter();

  function showDetailsHandler() {
    router.push('/' + props.id);
  }

  return (
    <li>
      <h3>{props.title}</h3>
      <button onClick={showDetailsHandler}>Show Details</button>
    </li>
  );
}
```

When the "Show Details" button is clicked, the app navigates to `/<meetup-id>` — the dynamic detail page for that specific meetup.

### ⚠️ Common Mistakes

- **Calling `useRouter()` inside a handler function** — This breaks the rules of hooks. Always call hooks at the root level of your component function, never inside event handlers or conditionally.
- **Forgetting to construct the dynamic path** — If your page uses dynamic routing (like `[meetupId].js`), you need to build the URL with the actual ID: `'/' + props.id`.

### 💡 Insight

Even though we used a `<button>` here to demonstrate programmatic navigation, using a `<Link>` component is technically more correct semantically — links render as `<a>` tags, which is what browsers and screen readers expect for navigation. Use programmatic navigation when you genuinely need it (like after form submissions), not just as a substitute for links.

---

## Concept 3: `router.push()` vs `<Link>`

### 🧠 What is it?

Two ways to achieve the same navigation — one declarative, one imperative.

### ⚙️ How it works

| Feature | `<Link>` | `router.push()` |
|---------|----------|------------------|
| Approach | Declarative (JSX) | Imperative (JS code) |
| Renders | An `<a>` tag | No visible element |
| Use case | Clickable links | After logic, form submission |
| Back button | ✅ Works | ✅ Works |
| SEO friendly | ✅ Yes (crawlable link) | ❌ No (no link in HTML) |

### 💡 Insight

When in doubt, prefer `<Link>`. Reach for `router.push()` when you need to navigate as a **side effect** of some action — like submitting a form, completing an operation, or responding to some event that doesn't have a natural link element.

---

## ✅ Key Takeaways

- Use `useRouter` from `next/router` for programmatic navigation
- Call `router.push('/path')` to navigate to a new page imperatively
- Always call `useRouter()` at the **root level** of your component — never inside handlers or conditions
- Construct dynamic paths by concatenating the base route with dynamic values like `props.id`
- Prefer `<Link>` for regular navigation; use `router.push()` for navigation triggered by logic or events

## 💡 Pro Tips

- `router.push()` returns a Promise — you can `await` it if you need to do something after navigation completes
- Use `router.replace()` instead of `push()` when you don't want the user to be able to go back to the current page (e.g., after login)
# Using Programmatic (Imperative) Navigation

## Introduction

So far, we've been using the `<Link>` component to navigate between pages in our Next.js app. But what happens when you need to navigate **programmatically** — like after a form submission, or when a button click should trigger navigation instead of an anchor tag? That's where imperative navigation comes in, and Next.js makes it surprisingly easy with the `useRouter` hook.

---

## Concept 1: Programmatic Navigation with `useRouter`

### 🧠 What is it?

Programmatic navigation means navigating to a different page **through code** rather than through a clickable `<Link>` component. Instead of rendering an anchor tag, you trigger navigation inside a function — for example, after a button click or a form submission.

In Next.js, this is done using the `useRouter` hook from `next/router`.

### ❓ Why do we need it?

Think about it — not every navigation should be a link. Sometimes you want to:

- Navigate away **after submitting a form**
- Redirect users **based on some condition** (authentication, validation, etc.)
- Use a `<button>` instead of an `<a>` tag for UI/UX reasons

In all these cases, you can't just slap a `<Link>` around your element. You need to **push** the user to a new route from within your JavaScript logic.

### ⚙️ How it works

1. **Import `useRouter`** from `next/router`
2. **Call `useRouter()`** at the top level of your component (it's a React hook — rules of hooks apply!)
3. **Use `router.push('/some-path')`** inside your event handler to navigate

The `push` method works just like the `<Link>` component — it pushes a new page onto the browser's history stack, so the user can still go back.

### 🧪 Example

```jsx
import { useRouter } from 'next/router';

function MeetupItem(props) {
  const router = useRouter();

  function showDetailsHandler() {
    router.push('/' + props.id);
  }

  return (
    <li>
      <h3>{props.title}</h3>
      <button onClick={showDetailsHandler}>Show Details</button>
    </li>
  );
}
```

Here, clicking the "Show Details" button calls `showDetailsHandler`, which uses `router.push()` to navigate to the dynamic meetup detail page — e.g., `/m1`, `/m2`, etc.

### 💡 Insight

The `router` object isn't just for navigation. It also gives you access to:

- `router.query` — the dynamic segments and query parameters from the URL
- `router.pathname` — the current route pattern
- `router.push()` — navigate forward (like `<Link>`)
- `router.replace()` — navigate without adding to history (useful for redirects)

---

## Concept 2: Constructing Dynamic Paths Programmatically

### 🧠 What is it?

When navigating to a **dynamic route** (like `[meetupId].js`), you need to construct the path dynamically using data available in your component — typically from props.

### ⚙️ How it works

Since each meetup item receives its `id` via props, you can build the URL string dynamically:

```jsx
router.push('/' + props.id);
```

This navigates to `/m1`, `/m2`, etc., which Next.js matches against the `[meetupId].js` dynamic page.

### 💡 Insight

You could achieve the same result with a `<Link>` component:

```jsx
<Link href={'/' + props.id}>Show Details</Link>
```

Both approaches work. The `<Link>` approach is better for accessibility (it renders a proper `<a>` tag), but `router.push()` is essential when navigation needs to happen **as a side effect** — like after form submission or an API call completes.

---

## ✅ Key Takeaways

- Use `useRouter` from `next/router` for programmatic navigation
- Call `router.push('/path')` to navigate — it's the programmatic equivalent of `<Link>`
- Always call `useRouter()` at the **root level** of your component (hooks rules!)
- Build dynamic paths using props or state: `router.push('/' + props.id)`
- Prefer `<Link>` for regular clickable navigation; use `router.push()` for logic-driven navigation

## ⚠️ Common Mistakes

- **Calling `useRouter()` inside an event handler** — it's a React hook and must be called at the top level of the component function, not inside callbacks or conditionals
- **Using `router.push()` where a `<Link>` would be better** — links are more accessible and SEO-friendly for standard navigation

## 💡 Pro Tips

- Use `router.replace()` instead of `router.push()` when you don't want the user to go back to the previous page (e.g., after login redirect)
- The `router` object also exposes `router.back()` to programmatically go back in history
