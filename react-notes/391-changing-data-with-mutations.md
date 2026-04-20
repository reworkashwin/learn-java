# Changing Data with Mutations

## Introduction

So far in our React Query journey, we've been all about **fetching** data — pulling events from the backend and displaying them. But what about the other direction? What about **sending** data to the backend — creating a new event, for example?

This is where **mutations** come in. React Query isn't just a data-fetching library — it's a full-fledged server state management tool, and that includes writing data, not just reading it.

---

## The Concept: useMutation

### 🧠 What is it?

`useMutation` is a React Query hook specifically designed for **data-changing operations** — POST, PUT, PATCH, DELETE requests. Anything that **modifies** data on the server.

### ❓ Why not just use useQuery?

Technically, you *could* send a POST request inside a `useQuery` function — you write the HTTP logic yourself anyway. But `useQuery` is built with **reading** in mind:

- It fires the request **automatically** when the component renders
- It caches the response
- It refetches on window focus

None of that behavior makes sense for a "create event" request. You don't want to create an event every time someone navigates to the page!

`useMutation` is optimized differently:
- It does **NOT** fire automatically on render
- It only fires when **you tell it to** (via the `mutate` function)
- It gives you loading, error, and success states specific to the mutation

---

## Setting Up a Mutation

### ⚙️ How it works

```jsx
import { useMutation } from '@tanstack/react-query';
import { createNewEvent } from '../util/http.js';

function NewEvent() {
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  // ...
}
```

Here's the breakdown:

1. **`mutationFn`** — The function that sends the actual HTTP request (just like `queryFn` for `useQuery`)
2. **`mutate`** — A function you call to **trigger** the mutation whenever you want
3. **`isPending`** — `true` while the request is in flight
4. **`isError` / `error`** — Tell you if something went wrong

### 🧪 Passing Data to mutate

Notice you pass the data directly to `mutate()`:

```jsx
mutate({ event: formData });
```

React Query forwards this data to your `mutationFn`. No need for wrapper functions — just pass it right in.

---

## Handling Mutation States

Just like with `useQuery`, you get states you can use to show feedback:

```jsx
{isPending && <p>Submitting...</p>}
{!isPending && (
  <>
    <button type="button">Cancel</button>
    <button type="submit">Create</button>
  </>
)}
{isError && (
  <ErrorBlock
    title="Failed to create event"
    message={error.info?.message || 'Please check your inputs and try again.'}
  />
)}
```

This gives your users proper feedback:
- A loading indicator while the request is being sent
- Error messages if something goes wrong
- Buttons only when they can actually interact

---

## ✅ Key Takeaways

- **`useQuery`** = fetching/reading data (fires automatically)
- **`useMutation`** = changing/writing data (fires on demand)
- Call `mutate(data)` to trigger the mutation with your payload
- Destructure `isPending`, `isError`, and `error` for UI feedback
- You do **not** need a `mutationKey` (unlike `queryKey`) — mutations are about changing data, not caching it

## ⚠️ Common Mistakes

- Forgetting to pass the data in the right shape — match what your backend expects
- Not handling the error state — always give users feedback when mutations fail
- Using `useQuery` for POST requests — it works, but the behavior (auto-firing, caching) is wrong for mutations

## 💡 Pro Tip

The `mutate` function is **not** async — it fires and forgets. If you need to do something *after* the mutation succeeds, use the `onSuccess` callback in the mutation config (we'll cover that next!).
