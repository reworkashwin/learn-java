# Handling Errors

## Introduction

What happens when data fetching fails? When a Promise rejects? When the server can't read the database? You need a safety net — and in React, that safety net is called an **Error Boundary**. Combined with Suspense and the `use()` hook, Error Boundaries create a complete pattern for handling **loading**, **success**, and **error** states. Let's see how this all fits together.

---

## Concept 1: What Is an Error Boundary?

### 🧠 What is it?

An **Error Boundary** is a special React component that catches JavaScript errors thrown by its child components. It prevents the entire app from crashing and displays a fallback UI instead.

### ❓ Why do we need it?

Without error boundaries, a single failing component crashes the entire page. With error boundaries, you can catch the error and show a friendly message — "Something went wrong" — instead of a white screen of death.

### ⚙️ How it works

Error Boundaries must be built as **class components** — they use special lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) that aren't available in function components. This is one of the few remaining use cases for class-based components.

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>{this.props.fallback || 'Something went wrong.'}</p>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 💡 Insight

Error Boundaries are one of those "set it and forget it" components. You build it once and reuse it throughout your app. It doesn't need special project setups — it works in any React project.

---

## Concept 2: Combining Error Boundary with Suspense

### 🧠 What is it?

The power pattern: wrapping both **ErrorBoundary** and **Suspense** around a data-fetching component. This gives you three states handled elegantly:

1. **Loading** → Suspense shows the fallback
2. **Success** → The component renders with data
3. **Error** → ErrorBoundary catches and displays the error

### ⚙️ How it works

```jsx
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import UsePromiseDemo from '@/components/UsePromisesDemo';

export default function Home() {
  const fetchUsersPromise = new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        // ... fetch data
        resolve(users);
      } catch (err) {
        reject(new Error('Failed to load users'));
      }
    }, 2000);
  });

  return (
    <ErrorBoundary fallback="Something went wrong">
      <Suspense fallback={<p>Loading users...</p>}>
        <UsePromiseDemo usersPromise={fetchUsersPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 🧪 Example

The nesting order matters:
```
ErrorBoundary (catches errors)
  └── Suspense (shows loading state)
       └── Component (fetches and renders data)
```

If the Promise **resolves** → data renders normally
If the Promise is **pending** → Suspense shows "Loading users..."
If the Promise **rejects** → ErrorBoundary shows "Something went wrong" + error message

### 💡 Insight

This is a clean separation of concerns:
- **The component** handles the happy path (rendering data)
- **Suspense** handles the loading state
- **ErrorBoundary** handles failures

No `if/else` chains, no `isLoading` state, no `error` state — each concern has its own component.

---

## Concept 3: Testing the Error Flow

### 🧠 What is it?

You can test the error flow by deliberately rejecting the Promise.

### ⚙️ How it works

Modify the Promise in `page.js` to reject instead of resolve:

```jsx
const fetchUsersPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('Failed to fetch users'));
  }, 2000);
});
```

### 🧪 Example

When you reload:
1. "Loading users..." appears (Suspense fallback)
2. After 2 seconds, the error message appears (ErrorBoundary fallback)
3. The rest of the page remains functional — only the error boundary area is affected

### 💡 Insight

The Promise constructor actually takes two arguments: `resolve` and `reject`. When you call `reject(new Error(...))`, the Promise fails, and the `use()` hook propagates that error up to the nearest ErrorBoundary.

---

## Concept 4: Error Boundaries vs. Next.js Error Handling

### 🧠 What is it?

Next.js has its own error handling mechanisms (like `error.js` files), but React's ErrorBoundary pattern is more granular and works in any React project.

### ⚙️ How it works

| Feature | ErrorBoundary | Next.js `error.js` |
|---|---|---|
| Works in any React project | ✅ Yes | ❌ Next.js only |
| Granularity | Per-component | Per-route |
| Requires class component | ✅ Yes | ❌ No |
| Integrates with Suspense | ✅ Yes | ✅ Yes |

### 💡 Insight

Use ErrorBoundary when you want fine-grained error handling around specific components. Use Next.js `error.js` for route-level error handling. They can coexist in the same project.

---

## ✅ Key Takeaways

- **Error Boundaries** catch errors from child components and display fallback UI
- They must be built as **class components** (one of the few remaining use cases)
- Combine **ErrorBoundary + Suspense + `use()`** for complete loading/success/error handling
- The nesting order is: `ErrorBoundary > Suspense > DataComponent`
- Error Boundaries work in **any** React project — no special setup needed
- Rejected Promises from `use()` automatically propagate to the nearest ErrorBoundary

## ⚠️ Common Mistakes

- Putting Suspense outside ErrorBoundary — errors won't be caught during the loading phase
- Forgetting that ErrorBoundary must be a class component
- Not providing a `fallback` prop to ErrorBoundary — users see nothing on error

## 💡 Pro Tips

- Build one reusable ErrorBoundary component and use it throughout your app
- Add a "retry" button in your ErrorBoundary fallback to let users try again
- Use the `error.message` in development for debugging, but show user-friendly messages in production
- This Suspense + ErrorBoundary pattern replaces complex loading/error state management with simple component composition
