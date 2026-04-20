# Sending an HTTP Request via a Form Action

## Introduction

We've wired up the upvote and downvote buttons with separate form actions. Now it's time to make them actually *do* something — send HTTP requests to the backend to register votes, then update the UI with the results.

This lecture connects all the dots: context functions, async form actions, and component props working together.

---

## Adding Backend Communication to Context

First, we update the context functions (`upvoteOpinion` and `downvoteOpinion`) to send real HTTP requests:

```jsx
// In OpinionsContext
async function upvoteOpinion(id) {
  const response = await fetch(`http://localhost:3000/opinions/${id}/upvote`, {
    method: 'POST',
  });

  if (!response.ok) {
    return; // Don't update UI if the request failed
  }

  // Update local state...
}

async function downvoteOpinion(id) {
  const response = await fetch(`http://localhost:3000/opinions/${id}/downvote`, {
    method: 'POST',
  });

  if (!response.ok) {
    return;
  }

  // Update local state...
}
```

Both functions follow the same pattern: send a POST request with the opinion's ID in the URL, check for errors, and update state only on success.

---

## Connecting Form Actions to Context

In the `Opinion` component, grab the context functions and use them in the form actions:

```jsx
import { use } from 'react';
import { OpinionsContext } from '../store/opinions-context';

function Opinion({ id, title, body, votes }) {
  const { upvoteOpinion, downvoteOpinion } = use(OpinionsContext);

  async function upvoteAction() {
    await upvoteOpinion(id);
  }

  async function downvoteAction() {
    await downvoteOpinion(id);
  }

  return (
    <form>
      <button formAction={upvoteAction}>👍</button>
      <span>{votes}</span>
      <button formAction={downvoteAction}>👎</button>
    </form>
  );
}
```

---

## Why These Actions Must Live Inside the Component

Notice that both action functions use `id` — a prop. And they call context functions obtained via a hook. Both of these are only available inside the component function. This is a case where moving actions outside the component is **not possible**.

---

## Making Actions Async

Since `upvoteOpinion` and `downvoteOpinion` are async (they send fetch requests), the form actions should be async too:

```jsx
async function upvoteAction() {
  await upvoteOpinion(id);
}
```

The `await` is critical here because:
1. It makes React aware that this action is in-flight
2. It enables `useActionState` to track the `pending` status
3. It lets `useOptimistic` know when to revert temporary state

Without `await`, React would consider the action complete immediately, and all pending/optimistic features would be useless.

---

## The UX Problem

After this change, clicking the vote button works — but there's a delay (due to the backend's artificial latency). During that delay:
- The button is still clickable
- The vote count doesn't change
- Rapidly clicking creates confusing behavior as votes update in bursts

This is the exact problem we'll solve in the next lectures with `useActionState` pending states and `useOptimistic`.

---

## ✅ Key Takeaways

- Context functions that make HTTP requests should be `async`
- Form actions that call async context functions should also be `async` with `await`
- When the action function needs **props** or **context**, it must stay inside the component
- The `await` in the form action is what enables React's pending/optimistic features

## ⚠️ Common Mistakes

- Forgetting to pass the `id` to the context function — the backend needs to know which opinion to update
- Not making the action async — without `async/await`, React marks the action as instantly complete
- Hammering the button during the delay — we'll fix this with disabled states in the next lecture

## 💡 Pro Tip

Even though we skipped `try/catch` for simplicity, in production you should always wrap fetch calls in error handling. Network failures, server errors, and timeouts are inevitable. A good pattern is to handle errors in the context and expose an error state that components can display.
