# Registering Multiple Form Actions

## Introduction

What if you have **two buttons** in one form, and each should trigger a **different action**? Think upvote and downvote buttons, or "Save as Draft" and "Publish" buttons. You can't just set one `action` prop on the form — you need separate actions for separate buttons.

React handles this elegantly with the `formAction` prop on individual buttons.

---

## The Problem

In our opinions app, each opinion has two buttons: upvote and downvote. They're inside the same `<form>`, but they should do completely different things:

```jsx
<form>
  <button>👍 Upvote</button>
  <button>👎 Downvote</button>
</form>
```

If we set an `action` on the form, both buttons would trigger the same action. That's not what we want.

---

## The Solution: formAction on Buttons

Instead of setting `action` on the `<form>`, set `formAction` on each `<button>`:

```jsx
function Opinion({ id }) {
  function upvoteAction() {
    console.log('UPVOTE');
  }

  function downvoteAction() {
    console.log('DOWNVOTE');
  }

  return (
    <form>
      <button formAction={upvoteAction}>👍</button>
      <button formAction={downvoteAction}>👎</button>
    </form>
  );
}
```

Each button now has its own action function. When the upvote button is clicked, only `upvoteAction` runs. When the downvote button is clicked, only `downvoteAction` runs.

---

## How It Works

The `formAction` prop on a `<button>` **overrides** the `action` prop on the parent `<form>`. This is actually a standard HTML feature that React leverages:

- If a form has `action={someAction}` and a button inside has `formAction={otherAction}`, clicking that button triggers `otherAction`, not `someAction`
- Buttons without `formAction` will still use the form's `action`

In our case, we don't even set an `action` on the form — each button has its own.

---

## No Form Data Needed?

In some cases (like our vote buttons), the form doesn't have any input fields. The buttons are just triggers. Your action function still *receives* `formData`, but you can simply ignore it:

```jsx
function upvoteAction() {
  // formData is available but we don't need it
  // We just want to trigger an upvote
}
```

No inputs, no form data to extract. The action is just a way to trigger functionality through React's form action system.

---

## Why Use Form Actions for Simple Buttons?

You might wonder: why not just use `onClick` handlers? You absolutely could. But using form actions gives you access to the entire form actions ecosystem:

- `useActionState` for pending states
- `useFormStatus` for child components
- `useOptimistic` for optimistic updates
- Automatic integration with React's transition system

For buttons that trigger async operations (like API calls), form actions provide a richer toolkit than plain `onClick`.

---

## ✅ Key Takeaways

- Use the `formAction` prop on **individual buttons** to assign different actions to different buttons in the same form
- `formAction` on a button overrides the `action` on the parent form
- The action function still receives `formData`, but you can ignore it if no inputs exist
- This is a standard HTML feature that React builds upon

## ⚠️ Common Mistakes

- Confusing `action` (on `<form>`) with `formAction` (on `<button>`) — they serve different purposes
- Forgetting that `formAction` is a prop name, not `form-action` or `formaction` (though the HTML attribute is indeed lowercase `formaction`)
- Trying to use `formAction` on elements that aren't `<button>` or `<input type="submit">` — only these elements support it

## 💡 Pro Tip

This pattern is perfect for any "action panel" in your UI — think social media interactions (like/dislike/share), content management (save/publish/delete), or list operations (move up/move down). Each action gets its own form action, and you get all the React form action benefits for free.
