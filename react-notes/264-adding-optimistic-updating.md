# Adding Optimistic Updating with useOptimistic

## Introduction

Disabling buttons while waiting for the backend is good, but there's something even better — making the UI update **instantly**, before the server confirms the change. This is called **optimistic updating**, and React provides a dedicated hook for it: `useOptimistic`.

The idea is simple but powerful: assume the operation will succeed, show the result immediately, and roll back if it fails. This is how every modern app feels snappy — think liking a post on social media. It responds instantly, right?

---

## What is useOptimistic?

`useOptimistic` is a React hook that creates a **temporary state** — a value that's shown while a form action is in progress. Once the action completes, this temporary state is automatically discarded and the "real" state takes over.

It's specifically designed to work with form actions.

---

## How useOptimistic Works

### Step 1: Set It Up

```jsx
import { useOptimistic } from 'react';

function Opinion({ votes }) {
  const [optimisticVotes, setVotesOptimistically] = useOptimistic(
    votes,                           // Initial/real value
    (previousVotes, mode) =>         // Update function
      mode === 'up' ? previousVotes + 1 : previousVotes - 1
  );
}
```

Let's break down the two arguments:

1. **`votes`** (first argument): The real/actual value. This is what the UI shows when no form action is pending.

2. **The updater function** (second argument): This is called when you trigger an optimistic update. It receives:
   - `previousVotes`: The current optimistic state
   - `mode`: Whatever value *you* pass when triggering the update

### Step 2: Trigger the Optimistic Update

Inside your form actions, call `setVotesOptimistically` **before** the async operation:

```jsx
async function upvoteAction() {
  setVotesOptimistically('up');   // Instantly update the UI
  await upvoteOpinion(id);        // Then send the request
}

async function downvoteAction() {
  setVotesOptimistically('down'); // Instantly update the UI
  await downvoteOpinion(id);      // Then send the request
}
```

The `'up'` and `'down'` strings are passed as the `mode` parameter to the updater function.

### Step 3: Use the Optimistic Value in JSX

Replace the original `votes` with `optimisticVotes`:

```jsx
<span>{optimisticVotes}</span>
```

---

## The Lifecycle of an Optimistic Update

Here's what happens step by step:

1. User clicks upvote
2. `setVotesOptimistically('up')` is called
3. The updater function runs: `previousVotes + 1` → UI shows the new count **instantly**
4. `await upvoteOpinion(id)` sends the request to the backend
5. Backend processes the vote (takes ~1 second)
6. Action function resolves
7. React **discards** the optimistic state
8. The "real" UI state takes over (which now includes the updated vote from the backend)

The transition from step 7 to 8 is seamless — users don't notice a switch because the optimistic value and the real value should be the same (assuming the request succeeded).

---

## What Happens When the Request Fails?

This is the magic of `useOptimistic`. If the backend returns an error:

1. The optimistic state shows the updated count instantly
2. The request fails
3. The action function completes (with or without error handling)
4. React discards the optimistic state
5. The **original** value (before the optimistic update) is restored

The UI **rolls back automatically**. The user sees the number tick up, then tick back down. No extra code needed.

---

## The Updater Function Explained

```jsx
(previousVotes, mode) => mode === 'up' ? previousVotes + 1 : previousVotes - 1
```

Think of this like a reducer:
- **First parameter** (`previousVotes`): Always provided by React — it's the current state
- **Additional parameters** (`mode`): Whatever you pass to `setVotesOptimistically`

You can pass as many arguments as you want. Zero? Fine. Ten? Also fine. Whatever you pass to `setVotesOptimistically(arg1, arg2, ...)` shows up after the first parameter in the updater.

---

## Important: Must Be Called Inside Form Actions

`useOptimistic` is designed to work with form actions. It must be invoked from within a form action because React uses the action's lifecycle to determine when to discard the optimistic state.

```jsx
// ✅ Correct: inside a form action
async function upvoteAction() {
  setVotesOptimistically('up');
  await upvoteOpinion(id);
}

// ❌ Wrong: outside a form action
function handleClick() {
  setVotesOptimistically('up');  // Won't know when to revert
}
```

---

## ✅ Key Takeaways

- `useOptimistic` creates a **temporary state** that's shown while a form action is pending
- Call the setter (`setVotesOptimistically`) **before** the async operation for instant UI feedback
- Once the action completes, the optimistic state is automatically discarded
- If the request fails, the UI **rolls back** to the previous value automatically
- Must be used **inside form actions** — React uses the action lifecycle to manage the temporary state

## ⚠️ Common Mistakes

- Calling `setVotesOptimistically` **after** the `await` — this defeats the purpose; the update should happen *before* the request
- Using the original `votes` prop in JSX instead of `optimisticVotes` — the optimistic value won't be visible
- Trying to use `useOptimistic` outside of form actions — it needs the action lifecycle to function correctly

## 💡 Pro Tip

Optimistic updates are perfect for operations that almost always succeed: likes, votes, toggles, simple CRUD. For operations that often fail (complex validations, payments, operations with strict preconditions), it might be better to show a loading state instead. A vote rolling back looks fine; a payment confirmation rolling back is alarming.
