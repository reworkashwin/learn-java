# Module Summary: Form Actions

## Introduction

Let's take a step back and look at the complete picture. Over the past lectures, we've built a comprehensive toolkit for handling forms in React using the **form actions** feature. Here's everything you now know, organized into a clear mental model.

---

## The Core Concept: Form Action Functions

At its heart, a form action is just a function that you pass to a form's `action` prop:

```jsx
<form action={myActionFunction}>
```

React calls this function when the form is submitted and automatically:
- Collects all input values into a `FormData` object
- Passes that object to your function
- Resets the form after the action completes

---

## The Full Toolkit

### 1. useActionState — Manage What the Action Returns

```jsx
const [formState, formAction, pending] = useActionState(actionFn, initialState);
```

- Your action function can **return values** (errors, messages, etc.)
- `formState` holds whatever your action returned
- `formAction` is the wrapped action to pass to the form
- `pending` tells you if the action is currently running

**Use it for**: Validation errors, form repopulation, any state derived from form submission.

### 2. useFormStatus — Track Submission Status in Child Components

```jsx
// Must be in a child component inside the form
const { pending } = useFormStatus();
```

- Imported from `react-dom`
- Reads the status of the nearest parent `<form>`
- Great for building reusable submit buttons

**Use it for**: Disabling buttons, showing spinners, changing button text during submission.

### 3. useOptimistic — Instant UI Feedback

```jsx
const [optimisticValue, setOptimistically] = useOptimistic(realValue, updaterFn);
```

- Creates a temporary state shown during form submission
- Automatically reverts when the action completes
- Rolls back on failure

**Use it for**: Vote counts, toggles, likes — anything where you want instant feedback.

### 4. formAction on Buttons — Multiple Actions per Form

```jsx
<button formAction={action1}>Save</button>
<button formAction={action2}>Delete</button>
```

- Override the form's `action` with button-specific actions
- Each button triggers its own function

**Use it for**: Forms with multiple operations (upvote/downvote, save/publish, approve/reject).

---

## Sync vs Async Actions

| | Synchronous | Asynchronous |
|---|---|---|
| Keyword | Regular function | `async function` |
| Use case | Local validation | Backend requests |
| Pending duration | Instant | Meaningful |
| Optimistic updates | Not needed | Very useful |
| useFormStatus | Works but instant | Shows real loading |

Both are fully supported. Choose based on whether you need to do async work.

---

## The Decision: Form Actions vs onSubmit

Form actions are **not** the only way to handle form submissions in React. The traditional approach works fine too:

```jsx
// Traditional approach — still valid!
<form onSubmit={(e) => {
  e.preventDefault();
  // manual handling...
}}>
```

### When to use form actions:
- You want automatic `FormData` collection
- You need async submission tracking (`pending`, optimistic)
- You're building with React 19+
- You want cleaner code for form-heavy applications

### When to stick with onSubmit:
- You need fine-grained control over the submission process
- You're working with React < 19
- Your form handling is simple and doesn't need the extra features

---

## The Mental Model

Think of form actions as a **pipeline**:

```
User submits form
    → React collects FormData
    → Your action function runs
    → (Optimistic state shown immediately)
    → (Pending state is true)
    → Action function resolves
    → (Optimistic state reverted)
    → (Pending state is false)
    → Returned value becomes formState
    → Form resets
```

Every hook in the toolkit plugs into a different stage of this pipeline.

---

## ✅ Key Takeaways

- **Form actions** = functions passed to `action` prop, automatically receiving `FormData`
- **useActionState** = manage returned values + pending state
- **useFormStatus** = read submission status in child components (from `react-dom`)
- **useOptimistic** = temporary state for instant UI updates
- **formAction on buttons** = different actions for different buttons
- All of this is optional — `onSubmit` still works perfectly fine

## 💡 Pro Tip

Don't try to use all of these features everywhere. Start with basic form actions and `useActionState`. Add `useFormStatus` when you need reusable UI components. Reach for `useOptimistic` only when you have async operations where instant feedback genuinely improves the user experience. Build complexity gradually.
