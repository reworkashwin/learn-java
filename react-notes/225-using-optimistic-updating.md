# Using Optimistic Updating

## Introduction

When a user clicks a button to select a place, should they wait 2 seconds staring at a spinner while the request completes? Probably not. That's where **optimistic updating** comes in — a technique where you **update the UI immediately** and send the request in the background. If something goes wrong, you roll back. This creates a snappy, responsive user experience.

---

## What Is Optimistic Updating?

The traditional approach to data mutations:
1. User clicks → Show loading spinner
2. Send request to backend
3. Wait for response
4. Update the UI

**Optimistic updating** flips the order:
1. User clicks → **Update the UI immediately**
2. Send request to backend in the background
3. If it succeeds → Great, everything's in sync
4. If it fails → **Roll back the UI change** and show an error

The "optimism" is the assumption that the request will succeed (which it does the vast majority of the time). You give the user instant feedback and only handle the rare failure case.

---

## Implementing Optimistic Updates

```jsx
async function handleSelectPlace(selectedPlace) {
  // Step 1: Update state IMMEDIATELY (before the request)
  setUserPlaces((prevPlaces) => {
    if (prevPlaces.some((place) => place.id === selectedPlace.id)) {
      return prevPlaces;
    }
    return [selectedPlace, ...prevPlaces];
  });

  // Step 2: Send request in the background
  try {
    await updateUserPlaces([selectedPlace, ...userPlaces]);
  } catch (error) {
    // Step 3: ROLLBACK if it fails
    setUserPlaces(userPlaces);  // Revert to the previous state
    setErrorUpdatingPlaces({
      message: error.message || 'Failed to update places.',
    });
  }
}
```

### The Key Insight: State Update Comes First

Notice the order:
1. `setUserPlaces(...)` — UI updates instantly
2. `await updateUserPlaces(...)` — request sent after

The user sees the change immediately. No spinner, no waiting. If the request fails, we **rollback** by setting the state back to its previous value (`userPlaces` — which still holds the old value since state updates are batched).

### Why Rollback Works

Remember: `userPlaces` (the state variable) still holds the **old** value when we enter the `catch` block. The state update from Step 1 hasn't been reflected in this variable yet — it'll only be available in the next render. So `setUserPlaces(userPlaces)` effectively reverts the change.

---

## Why Not Show a Loading Spinner?

You certainly *can* show a spinner. There's nothing wrong with it:

```jsx
// Alternative: Wait for the request before updating UI
setIsUpdating(true);
await updateUserPlaces([selectedPlace, ...userPlaces]);
setUserPlaces((prev) => [selectedPlace, ...prev]);
setIsUpdating(false);
```

But this means the user waits for the network round-trip before seeing any change. For operations where:
- The success rate is very high
- The user expects instant feedback
- The cost of a brief rollback is low

...optimistic updating is usually the better UX.

---

## Still Handle Errors Gracefully

Even with optimistic updating, you **must** handle failures. Rolling back silently would confuse the user — "I clicked that, why did it disappear?" Show an error message:

```jsx
const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

// In the catch block:
catch (error) {
  setUserPlaces(userPlaces);  // Rollback
  setErrorUpdatingPlaces({
    message: error.message || 'Failed to update places.',
  });
}
```

Display it with a modal or notification:

```jsx
{errorUpdatingPlaces && (
  <Modal open={!!errorUpdatingPlaces} onClose={handleError}>
    <Error
      title="An error occurred!"
      message={errorUpdatingPlaces.message}
      onConfirm={handleError}
    />
  </Modal>
)}
```

### Dismissing the Error

```jsx
function handleError() {
  setErrorUpdatingPlaces(null);  // Clear error, close modal
}
```

---

## When to Use Optimistic vs. Traditional Updates

| Scenario | Approach |
|----------|----------|
| Toggling a like/favorite | Optimistic ✅ |
| Adding item to a list | Optimistic ✅ |
| Submitting a payment | Traditional (show spinner) ❌ |
| Creating a new account | Traditional ❌ |
| Fetching initial data | Neither — you have to wait for data |

**Rule of thumb**: Use optimistic updating when the operation is **low-risk** and **easily reversible**. Use traditional loading states when the operation is **critical** or **irreversible**.

---

## ✅ Key Takeaways

- Optimistic updating means updating the UI first, sending the request second
- If the request fails, **roll back** the state to its previous value
- This provides instant feedback and a much better user experience
- Always show error messages after a rollback — don't let changes silently disappear
- Use this pattern for low-risk, reversible operations
- Use traditional loading spinners for critical operations (payments, account creation)
- No loading state management needed — that's one of the benefits

## ⚠️ Common Mistakes

- **Not handling errors at all** — if the request fails silently, UI and backend get out of sync
- **Not rolling back on failure** — the UI shows a state that doesn't match the server
- **Using optimistic updates for critical operations** — don't optimistically assume a payment succeeded!

## 💡 Pro Tip

In complex apps, you might combine optimistic updates with a **queue** of pending operations. If the user makes several quick changes, each one is sent to the backend in order. If any fails, you can roll back just that specific change. Libraries like React Query handle this complexity for you with their `useMutation` hook and `onMutate` callback.
