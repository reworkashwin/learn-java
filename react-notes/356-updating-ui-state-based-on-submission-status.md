# Updating the UI State Based on the Submission Status

## Introduction

When a user submits a form, there's often a delay before the backend responds. During that time, the user sees... nothing. No feedback, no indication that something is happening. They might click "Save" again, submitting duplicate data. We need to show submission state — and React Router makes this straightforward with `useNavigation`.

---

## The Problem

After adding a backend delay (simulating real-world network latency), clicking "Save" on a form gives **zero visual feedback**. The button just sits there. The user has no idea whether:
- The form is being submitted
- Something went wrong
- They should wait or try again

---

## useNavigation to the Rescue (Again)

We already used `useNavigation` to show loading states during route transitions. It works for **form submissions too**, because submitting a form is a type of transition in React Router.

```jsx
import { useNavigation } from "react-router-dom";

function EventForm() {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      {/* ...inputs */}
      <button disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Save"}
      </button>
    </Form>
  );
}
```

---

## How navigation.state Works for Submissions

`navigation.state` cycles through these values:

| State | Meaning |
|-------|---------|
| `"idle"` | No transition or submission in progress |
| `"submitting"` | An action is currently being executed |
| `"loading"` | The action completed, now loading the next page |

When you submit a form:
1. State changes to `"submitting"` → action runs
2. State changes to `"loading"` → redirect/navigation happens
3. State changes to `"idle"` → everything settled

---

## What You Can Do with isSubmitting

### Disable buttons to prevent double-submission
```jsx
<button disabled={isSubmitting}>Save</button>
<button disabled={isSubmitting}>Cancel</button>
```

### Change button text for visual feedback
```jsx
<button>
  {isSubmitting ? "Submitting..." : "Save"}
</button>
```

### Show a spinner or progress indicator
```jsx
{isSubmitting && <LoadingSpinner />}
```

---

## ✅ Key Takeaways

- `useNavigation()` tracks the state of both route transitions AND form submissions
- `navigation.state === "submitting"` means an action is currently running
- Use this to **disable buttons**, **change text**, or **show spinners** during submission
- This prevents users from accidentally submitting forms multiple times
- The hook works in any component rendered by the current route — not just the page component

⚠️ **Common Mistake:** Using `useNavigation` only for route transitions and forgetting it also covers action submissions. It's the same hook for both!

💡 **Pro Tip:** You can also access `navigation.formData`, `navigation.formMethod`, and `navigation.formAction` to know exactly which form is being submitted — useful if a page has multiple forms.
