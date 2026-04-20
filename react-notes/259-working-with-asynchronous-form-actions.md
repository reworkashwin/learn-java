# Working with Asynchronous Form Actions

## Introduction

So far, our form action validates inputs and manages form state — but it doesn't actually *do* anything with the valid data. In a real app, you'd send that data to a backend. And that's exactly what we'll do now by turning our action function into an **async** form action.

The great news? React fully supports async form actions. You don't need any workarounds or third-party libraries.

---

## The Setup: Context with Backend Communication

In our demo app, we have a context that provides an `addOpinion` function. This function:
- Sends a POST request to the backend
- Stores the new opinion in the database
- Updates the local state to show the new opinion in the UI

```jsx
// Inside OpinionsContext
async function addOpinion(opinion) {
  const response = await fetch('http://localhost:3000/opinions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opinion),
  });
  // ... handle response, update state
}
```

---

## Accessing Context in the Component

To call `addOpinion` from our form action, we need access to the context. In React 19+, you can use the `use()` hook:

```jsx
import { use } from 'react';
import { OpinionsContext } from '../store/opinions-context';

function NewOpinion() {
  const { addOpinion } = use(OpinionsContext);
  // ...
}
```

The `use()` hook is a new React 19 feature that works similarly to `useContext()` but with some additional capabilities. Either hook works fine here.

---

## Making the Action Async

Now, in our form action, after validation passes, we call `addOpinion`:

```jsx
async function shareOpinionAction(prevState, formData) {
  const title = formData.get('title');
  const body = formData.get('body');
  const userName = formData.get('userName');

  // ... validation logic ...

  if (errors.length > 0) {
    return { errors, enteredValues: { title, body, userName } };
  }

  // Send to backend
  await addOpinion({ title, body, userName });

  // Clear the form
  return { errors: null };
}
```

Two critical details here:

### 1. The `async` keyword
Adding `async` before the function makes it return a Promise. React detects this and handles it appropriately.

### 2. The `await` keyword
We `await addOpinion(...)` **before** returning the success state. This ensures the form isn't cleared until the backend confirms the data was stored.

---

## How React Handles Async Actions

When your form action is async, React does something special:

- It waits for the Promise returned by the action function to **resolve**
- Only then does it internally mark the form submission as complete
- This "pending" period is what enables features like `useFormStatus` and `useOptimistic` (covered next)

Think of it this way: React is watching your async action. While the request is in flight, React knows the form is "pending." Once the Promise resolves, React knows it's done. This gives us hooks to react (pun intended) to the submission lifecycle.

---

## Synchronous vs Asynchronous Actions

| Feature | Synchronous | Asynchronous |
|---------|------------|--------------|
| Uses `async/await` | No | Yes |
| Returns a Promise | No | Yes |
| Form clears instantly | Yes | After Promise resolves |
| Supports pending state | Technically, but instant | Yes, meaningful duration |
| Supports optimistic updates | Not typically | Yes |

Both types are fully supported. React doesn't force you to choose — use whichever fits your use case.

---

## The Result

After this change:
1. User fills the form with valid data and clicks Submit
2. The action function sends data to the backend
3. There's a brief pause (due to network request)
4. The form clears and the new opinion appears in the list
5. The opinion persists on reload (it's stored on the backend)

---

## ✅ Key Takeaways

- React form actions can be **async functions** — just add `async` and use `await`
- React waits for the returned Promise to resolve before marking the submission complete
- Use `await` before clearing the form to ensure the backend operation finished first
- Access context functions using `use()` (React 19) or `useContext()` inside the component

## ⚠️ Common Mistakes

- Forgetting `await` before the async operation — this clears the form immediately, even if the request fails
- Making the **component function** itself async — React does not allow this; only the action function can be async
- Not wrapping the fetch call in the context — putting raw `fetch` calls directly in form actions works but makes components harder to test and reuse

## 💡 Pro Tip

The `await` in your action function is what makes all the upcoming features (pending state, optimistic updates) actually useful. Without it, the "pending" window is instantaneous and there's nothing to show. Always await your async operations inside form actions.
