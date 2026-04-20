# Using the "pending" State from useActionState()

## Introduction

In the previous lecture, we saw the problem: clicking vote buttons causes a delay, and during that delay, users can click multiple times. Now we'll fix this by **disabling both buttons while a vote is being processed**.

Instead of using `useFormStatus` (which requires a separate child component), we'll use the `pending` value from `useActionState` — directly in the same component.

---

## The Challenge: Two Actions, One Form

Our form has two buttons with separate `formAction` props. We want to disable **both** buttons when either one is clicked. This means we need to track the pending state of both actions and combine them.

---

## Calling useActionState Twice

Since `useActionState` can only handle one action at a time, we call it twice — once for each action:

```jsx
const [upvoteState, upvoteFormAction, upvotePending] = useActionState(upvoteAction, null);
const [downvoteState, downvoteFormAction, downvotePending] = useActionState(downvoteAction, null);
```

Breaking this down:
- **First call**: wraps `upvoteAction` and gives us `upvotePending`
- **Second call**: wraps `downvoteAction` and gives us `downvotePending`
- The initial state is `null` because we don't manage any form state here (no errors, no entered values)

---

## Using the Wrapped Actions

Now substitute the wrapped actions into the buttons:

```jsx
<button formAction={upvoteFormAction} disabled={upvotePending || downvotePending}>
  👍
</button>
<button formAction={downvoteFormAction} disabled={upvotePending || downvotePending}>
  👎
</button>
```

The `disabled` logic is the same for both buttons: if **either** vote is pending, **both** buttons are disabled. This prevents users from spamming votes while one is being processed.

---

## Why Not useFormStatus Here?

We *could* use `useFormStatus`, but that would require:
1. Creating a separate child component for the buttons
2. Moving the JSX out of the `Opinion` component

Using `useActionState` directly keeps everything in one component, which is simpler for this case.

### When to use which:

| Approach | Use When |
|----------|----------|
| `useFormStatus` | You want a reusable component (like a Submit button) |
| `useActionState` pending | You need pending state in the same component as the form |

---

## The State Values We Don't Use

Notice we extract `upvoteState` and `downvoteState` but never use them. When destructuring arrays, you still need to extract earlier elements to reach later ones. If you find this awkward, you could use placeholder names:

```jsx
const [, upvoteFormAction, upvotePending] = useActionState(upvoteAction, null);
const [, downvoteFormAction, downvotePending] = useActionState(downvoteAction, null);
```

The leading comma skips the first element.

---

## The User Experience Now

1. User clicks the upvote button
2. Both buttons are immediately disabled
3. After the backend responds (~1 second), the vote count updates
4. Both buttons are re-enabled

No more double-clicking, no more confusing behavior. But we can still do better — the user has to wait a full second before seeing the vote count change. That's where optimistic updates come in.

---

## ✅ Key Takeaways

- `useActionState` returns a third value: `pending` (boolean), which is `true` while the action is executing
- You can call `useActionState` **multiple times** for different actions
- Combine pending states with `||` to disable multiple related buttons
- Pass `null` as the initial state if you don't need form state management

## ⚠️ Common Mistakes

- Forgetting to use the **wrapped** action (`upvoteFormAction`) instead of the original (`upvoteAction`) — the hook returns a new function that you must use
- Only disabling the clicked button — users can still click the other button during the delay
- Passing the initial state as `undefined` instead of `null` — while functionally similar, being explicit with `null` communicates intent

## 💡 Pro Tip

The pattern of calling `useActionState` twice works, but if you have many actions (5+), consider restructuring. Maybe combine related actions into a single action that takes a parameter, or use a single `useActionState` with a reducer-like pattern.
