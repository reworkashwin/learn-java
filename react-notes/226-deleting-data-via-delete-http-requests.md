# Deleting Data (via DELETE HTTP Requests)

## Introduction

We've learned how to **fetch** data from a backend and how to **send** data to a backend. But what about **removing** data? In most real-world applications, users need to be able to delete things — remove items from a list, clear saved preferences, or undo selections. That means our React app needs to send **DELETE requests** (or similar update requests) to the backend.

In this lesson, we wire up the "remove place" functionality so that when a user clicks to remove a selected place, it's not just removed from the UI — it's also removed on the backend.

---

## The Problem: Deletion Only Happens Locally

Right now, when the user clicks on a place in the "selected" box and chooses to clear it, the place disappears from the screen. But if you reload the page, it comes right back — because nothing was ever sent to the backend. The `user-places.json` file on the server still contains that place.

How would the backend know to remove it? We never told it to!

---

## Implementing Optimistic Deletion

The approach here mirrors what we did when adding places — **optimistic updating**:

1. **Update the UI immediately** (remove the place from state)
2. **Then send the HTTP request** to the backend
3. **If the request fails**, roll back the UI change and show an error

Here's the flow inside `handleRemovePlace`:

```jsx
async function handleRemovePlace() {
  // Step 1: Update state optimistically
  setUserPlaces((prevPlaces) =>
    prevPlaces.filter((place) => place.id !== selectedPlace.current.id)
  );

  // Step 2: Send the updated list to the backend
  try {
    await updateUserPlaces(
      userPlaces.filter((p) => p.id !== selectedPlace.current.id)
    );
  } catch (error) {
    // Step 3: Roll back on failure
    setUserPlaces(userPlaces); // restore old state
    setErrorUpdatingPlaces({
      message: error.message || "Failed to delete place.",
    });
  }
}
```

### Why optimistic updating?

Because it gives the user **instant feedback**. They click "remove" and the place vanishes immediately. No waiting for a network round-trip. If something goes wrong, we undo it. This is the same pattern used by apps like Gmail (undo send), Trello (drag-and-drop), and more.

---

## Important: Update the `useCallback` Dependencies

Since `handleRemovePlace` now references `userPlaces` state (to compute the filtered list sent to the backend), you **must** add `userPlaces` to the `useCallback` dependency array:

```jsx
const handleRemovePlace = useCallback(async function handleRemovePlace() {
  // ...uses userPlaces...
}, [userPlaces]);
```

Why? Because if `userPlaces` changes and the function isn't recreated, it would close over **stale** data and send the wrong list to the backend. This is a classic closure bug in React.

---

## Error Handling and Rollback

When the request fails, two things happen:

1. **State is rolled back**: `setUserPlaces(userPlaces)` restores the previous state (before the optimistic update)
2. **An error message is shown**: We set the error state with a descriptive message

You can test this by intentionally breaking the backend URL — the place reappears in the list and the error modal shows up.

---

## ✅ Key Takeaways

- Deleting data follows the **same optimistic updating pattern** as creating/updating data
- Always **roll back state** and **show an error** if the backend request fails
- When using `useCallback`, update your dependency array whenever you reference new state or props inside the callback

## ⚠️ Common Mistakes

- Forgetting to add state variables to `useCallback` dependencies — leads to stale closures
- Not handling the error case — the UI says "deleted" but the backend still has it

## 💡 Pro Tip

The optimistic update pattern (update UI → send request → rollback on failure) is one of the most important UX patterns in modern frontend development. Master it once, use it everywhere.
