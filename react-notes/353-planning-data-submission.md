# Planning Data Submission

## Introduction

We've spent a lot of time loading data with React Router loaders. Now it's time to flip the coin: **sending data to the backend**. When a user fills out a form to create or edit an event, we need to submit that data. How does React Router help here?

---

## The Traditional Approach (Without React Router)

Without React Router, you'd handle form submissions manually:

1. Create a submit handler function
2. Call `event.preventDefault()` to stop the browser's default form submission
3. Extract form data using refs, state, or `FormData`
4. Send an HTTP request manually with `fetch()`
5. Manage loading/error state with `useState`
6. Navigate away programmatically using `useNavigate()` after success

```jsx
function NewEventPage() {
  const navigate = useNavigate();

  function submitHandler(event) {
    event.preventDefault();
    // Extract data...
    // Send request...
    // Handle loading/errors...
    // Navigate away...
  }

  return <form onSubmit={submitHandler}>...</form>;
}
```

That's a lot of boilerplate — especially the state management for loading and errors.

---

## The React Router Approach: Actions

Just as loaders handle **loading** data, **actions** handle **sending** data. They're the counterpart to loaders in the React Router data model:

| Feature | Purpose | Triggered By |
|---------|---------|-------------|
| `loader` | Fetch/load data | Route navigation |
| `action` | Submit/send data | Form submission |

Actions let you:
- Outsource submission logic from your component
- Automatically extract form data
- Handle redirects after success
- Integrate with error elements for error handling

---

## Displaying the Form

Before we dive into actions, let's set up the form. For a "New Event" page:

```jsx
import EventForm from "../components/EventForm";

function NewEventPage() {
  return <EventForm />;
}

export default NewEventPage;
```

The form renders without pre-filled data (since we're creating a new event, not editing).

---

## What's Next

In the next section, we'll implement the actual `action` function — learning how to:
- Use React Router's `<Form>` component
- Automatically capture form data
- Send it to the backend
- Redirect after successful submission

---

## ✅ Key Takeaways

- React Router provides **actions** as the data-sending counterpart to loaders
- Actions eliminate manual state management for form submissions (no `useState` for loading/error)
- The traditional approach (manual handlers + state + navigate) works but creates boilerplate
- Actions keep submission logic **separate** from component rendering logic

💡 **Pro Tip:** If you find yourself reaching for `useState` to track submission state, or `useNavigate` to redirect after a form submit — stop and consider whether an action would be cleaner.
