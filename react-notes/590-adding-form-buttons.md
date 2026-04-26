# Adding Form Buttons

## Introduction

Our form looks functional, but it's missing something essential: buttons! Specifically, a **Submit** button to add a new post and a **Cancel** button to close the modal without submitting. This section covers how to add buttons to a form, control which button triggers form submission, and wire up the cancel action using the patterns we've already learned.

---

## Concept 1: Buttons Inside Forms

### 🧠 What is it?

By default, any `<button>` inside a `<form>` element acts as a **submit button**. When clicked, it triggers the form's `submit` event, which causes the browser to generate and send an HTTP request.

### ❓ Why do we need it?

We need two buttons with different behaviors:
- **Submit** — should submit the form
- **Cancel** — should close the modal *without* submitting

If both buttons submit the form by default, we need a way to differentiate them.

### ⚙️ How it works

Use the `type` attribute to control button behavior:

```jsx
<p className={classes.actions}>
  <button type="button">Cancel</button>
  <button type="submit">Submit</button>
</p>
```

- `type="submit"` — submits the form (this is the default, so it's optional)
- `type="button"` — a regular button that does NOT submit the form

### 💡 Insight

The `type="button"` distinction is often overlooked. Without it, clicking Cancel would also trigger form submission — a subtle bug that can be hard to track down.

---

## Concept 2: Wiring Up the Cancel Button

### 🧠 What is it?

The Cancel button should close the modal. We already have the `hideModalHandler` function flowing through our component tree — we just need to connect it to this button.

### ❓ Why do we need it?

Users need a clear way to dismiss the form. The backdrop click works, but a dedicated Cancel button is better UX.

### ⚙️ How it works

**In `NewPost`** — accept an `onCancel` prop and wire it to the button:
```jsx
function NewPost({ onBodyChange, onAuthorChange, onCancel }) {
  return (
    <form>
      {/* inputs... */}
      <p className={classes.actions}>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Submit</button>
      </p>
    </form>
  );
}
```

**In `PostsList`** — pass the `onStopPosting` function as `onCancel`:
```jsx
<NewPost
  onBodyChange={bodyChangeHandler}
  onAuthorChange={authorChangeHandler}
  onCancel={onStopPosting}
/>
```

### 🧪 Example

The flow: `Cancel clicked` → `onCancel` (in `NewPost`) → `onStopPosting` (from `PostsList`) → `hideModalHandler` (from `App`) → `setModalIsVisible(false)` → modal closes.

### 💡 Insight

We're reusing the same `onStopPosting` function for both the backdrop click and the Cancel button. That's the beauty of passing functions as props — one handler, multiple trigger points.

---

## Concept 3: Object Destructuring for Multiple Props

### 🧠 What is it?

When a component receives many props, object destructuring in the function parameter keeps the code clean and avoids repetitive `props.` references.

### ❓ Why do we need it?

Our `NewPost` component now receives `onBodyChange`, `onAuthorChange`, and `onCancel`. Destructuring makes this manageable.

### ⚙️ How it works

**Before (with `props`):**
```jsx
function NewPost(props) {
  return (
    <form>
      <textarea onChange={props.onBodyChange} />
      <input onChange={props.onAuthorChange} />
      <button onClick={props.onCancel}>Cancel</button>
    </form>
  );
}
```

**After (with destructuring):**
```jsx
function NewPost({ onBodyChange, onAuthorChange, onCancel }) {
  return (
    <form>
      <textarea onChange={onBodyChange} />
      <input onChange={onAuthorChange} />
      <button onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

### 💡 Insight

Destructuring also serves as documentation — by looking at the function signature, you immediately know what props this component expects.

---

## ✅ Key Takeaways

- Buttons inside `<form>` elements default to `type="submit"` — they trigger form submission
- Use `type="button"` to prevent a button from submitting the form
- Wire cancel behavior by passing the modal-closing function through props
- Object destructuring in component parameters keeps code clean and self-documenting

## ⚠️ Common Mistakes

- Forgetting `type="button"` on the Cancel button — it will accidentally submit the form
- Creating duplicate handler functions when you can reuse existing ones via props
- Not distinguishing between `type="submit"` (triggers form submit event) and `type="button"` (does nothing special)

## 💡 Pro Tips

- Always explicitly set `type` on form buttons to be clear about intent
- Style action buttons in a wrapper element (like a `<p>` or `<div>` with an `actions` class) for consistent layout
- The CSS `classes.actions` pattern keeps button styling modular and reusable
