# Handling Form Submission

## Introduction

We've got buttons. We can cancel. Now it's time for the main event: **submitting the form**. When the user clicks Submit, we want to collect the entered data, prevent the browser's default behavior, and eventually add that data to our list of posts. This section covers how to handle form submission in React, a critical skill for any interactive application.

---

## Concept 1: The `onSubmit` Event

### 🧠 What is it?

The `onSubmit` prop on a `<form>` element listens for the form's **submit event**. This event fires when a submit button inside the form is clicked (or when the user presses Enter in an input).

### ❓ Why do we need it?

We need a single place to handle form submission — collecting data, validating it, and deciding what to do with it. The `onSubmit` handler on the form element is that place.

### ⚙️ How it works

```jsx
function NewPost({ onCancel, onAddPost }) {
  // ...state declarations...

  function submitHandler(event) {
    event.preventDefault(); // Prevent browser default!
    // Handle submission...
  }

  return (
    <form onSubmit={submitHandler}>
      {/* inputs and buttons */}
    </form>
  );
}
```

### 💡 Insight

Using `onSubmit` on the form (rather than `onClick` on the submit button) is the preferred approach. It captures *all* submission triggers — button clicks, Enter key presses, and more.

---

## Concept 2: Preventing Default Browser Behavior

### 🧠 What is it?

When a form is submitted, the browser **by default** generates and sends an HTTP request to the server serving the page. This causes a full page reload — something we absolutely don't want in a React SPA.

### ❓ Why do we need it?

React runs in the browser as a frontend library. There's no server-side code to handle that request. If the browser sends it, the page reloads, and all your React state is lost.

### ⚙️ How it works

```jsx
function submitHandler(event) {
  event.preventDefault(); // ← This line is CRITICAL
  // Now handle the form data with JavaScript
}
```

`event.preventDefault()` tells the browser: "Don't do what you'd normally do — I'll handle this myself."

### 💡 Insight

This is one of the first things you should write in any form submission handler. Forgetting it leads to a page reload, which resets your entire React app. It's the most common beginner mistake with forms.

---

## Concept 3: Moving State Back to NewPost

### 🧠 What is it?

Earlier, we lifted the input state (`enteredBody`, `enteredAuthor`) up to `PostsList`. Now we bring it back down to `NewPost`, because the form component should own its own input state.

### ❓ Why do we need it?

The input values are only needed temporarily — while the form is being filled out. Once submitted, they're packaged into an object and sent upward. There's no reason for the parent to track every keystroke.

### ⚙️ How it works

```jsx
import { useState } from 'react';

function NewPost({ onCancel, onAddPost }) {
  const [enteredBody, setEnteredBody] = useState('');
  const [enteredAuthor, setEnteredAuthor] = useState('');

  function bodyChangeHandler(event) {
    setEnteredBody(event.target.value);
  }

  function authorChangeHandler(event) {
    setEnteredAuthor(event.target.value);
  }

  function submitHandler(event) {
    event.preventDefault();
    const postData = {
      body: enteredBody,
      author: enteredAuthor,
    };
    onAddPost(postData);
    onCancel();
  }

  return (
    <form onSubmit={submitHandler}>
      <textarea onChange={bodyChangeHandler} required />
      <input onChange={authorChangeHandler} required />
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 💡 Insight

State should live where it's needed. Input state is local to the form — lift it up only when other components need to read it in real-time. For form submission, the parent only needs the final data.

---

## Concept 4: Collecting and Submitting Data

### 🧠 What is it?

When the form is submitted, we gather the state values into a single object and pass it to the parent via a callback prop.

### ❓ Why do we need it?

The parent component (`PostsList`) needs the submitted data to add it to the list of posts. The form component packages it up and sends it out through props.

### ⚙️ How it works

```jsx
function submitHandler(event) {
  event.preventDefault();

  const postData = {
    body: enteredBody,
    author: enteredAuthor,
  };

  onAddPost(postData);  // Send data to parent
  onCancel();           // Close the modal
}
```

The flow:
1. User fills in the form
2. State tracks input values on every keystroke
3. User clicks Submit
4. `submitHandler` fires, prevents default, collects data
5. `onAddPost(postData)` sends the data up to the parent
6. `onCancel()` closes the modal

### 💡 Insight

Calling `onCancel()` after `onAddPost(postData)` means the modal closes immediately after submission. The prop `onCancel` receives the `hideModalHandler` function, so calling it executes `setModalIsVisible(false)`.

---

## Concept 5: Browser Validation with `required`

### 🧠 What is it?

The `required` attribute on HTML inputs prevents form submission if the field is empty. The browser shows a built-in validation message.

### ❓ Why do we need it?

It's a quick way to ensure users don't submit empty posts without writing custom validation logic.

### ⚙️ How it works

```jsx
<textarea required />
<input type="text" required />
```

If either field is empty when Submit is clicked, the browser blocks the submission and shows an error tooltip.

### 💡 Insight

Browser validation only works with `type="submit"` buttons and the `onSubmit` event. If you handle clicks on the button directly with `onClick`, browser validation is bypassed.

---

## ✅ Key Takeaways

- Use `onSubmit` on the `<form>` element, not `onClick` on the button
- Always call `event.preventDefault()` to stop the browser from reloading the page
- Keep input state local to the form component — the parent only needs the final submitted data
- Pass submitted data to the parent via callback props
- Use `required` on inputs for quick built-in browser validation

## ⚠️ Common Mistakes

- Forgetting `event.preventDefault()` — the page reloads and all state is lost
- Using `onClick` on the submit button instead of `onSubmit` on the form — misses Enter key submissions
- Keeping input state in the parent when it's only needed during form editing

## 💡 Pro Tips

- Structure your submit handler clearly: prevent default → collect data → send to parent → close form
- The `required` attribute handles basic validation, but for complex rules, add custom validation logic
- Console log your `postData` object during development to verify the data structure before building the next feature
