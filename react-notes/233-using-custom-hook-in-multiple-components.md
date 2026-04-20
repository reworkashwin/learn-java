# Using A Custom Hook in Multiple Components

## Introduction

We've built a `useFetch` hook and used it in `App.jsx`. But the whole point of creating a custom hook was **reusability**. Let's prove it works by using the same hook in a second component — `AvailablePlaces.jsx` — which has almost identical fetching logic.

---

## The Setup

`AvailablePlaces.jsx` currently has its own `useState` + `useEffect` code for:

- Fetching available places
- Managing loading state
- Managing error state
- Storing the results

Sound familiar? It's the same pattern as `App.jsx`. Let's replace it with `useFetch`.

---

## Swapping in the Custom Hook

```jsx
import { useFetch } from "../hooks/useFetch";
import { fetchAvailablePlaces } from "../http";

export default function AvailablePlaces({ onSelectPlace }) {
  const {
    isFetching,
    error,
    fetchedData: availablePlaces,
  } = useFetch(fetchAvailablePlaces, []);

  // ... rest of the component (JSX only!)
}
```

That's it. We removed:
- Three `useState` calls
- One `useEffect` block
- The async helper function inside the effect

The component went from 50+ lines of state management boilerplate to a single hook call.

---

## Proving Independence

Here's a critical point to verify: using `useFetch` in `AvailablePlaces` is **completely independent** from using it in `App`.

When you add a new place in the app (which updates `App`'s user places state), the available places list doesn't change. Each component has its own isolated copy of:
- `fetchedData`
- `isFetching`
- `error`

They share the same **hook code**, but not the same **state instances**.

---

## The Remaining Challenge: Data Transformation

There's one complication. `AvailablePlaces` doesn't just fetch places — it also **sorts them by distance** using the user's geolocation. That sorting logic ran inside the old `useEffect`, and it's gone now.

How do we bring it back? We'll tackle that in the next lesson, but the key insight is: the hook doesn't need to change. We'll solve this by modifying what we pass as the `fetchFn`.

---

## ✅ Key Takeaways

- Custom hooks can be used in **any number of components** — each gets independent state
- Sharing a hook means sharing **logic**, not **data**
- Replacing manual `useState` + `useEffect` with a custom hook dramatically reduces component boilerplate

## ⚠️ Common Mistakes

- Thinking that `useFetch` in Component A and Component B share state — they don't
- Removing the old code before verifying the hook works — always test incrementally

## 💡 Pro Tip

A great way to test your custom hook is to temporarily keep both the old code and the new hook call in the component. Compare the outputs. Once you're confident they match, remove the old code. This is safer than a blind replacement.
