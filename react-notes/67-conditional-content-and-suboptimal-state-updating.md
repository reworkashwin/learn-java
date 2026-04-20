# Conditional Content & A Suboptimal Way Of Updating State

## Introduction

Our edit button works — but only one way. You can start editing, but you can't stop. The button always says "Edit," and once you click it, there's no going back. Let's fix all of that by making the button toggle between edit and save modes.

---

## Dynamic Button Text with a Ternary Expression

The button should say "Save" when editing, and "Edit" when not:

```jsx
<button onClick={handleEditClick}>
  {isEditing ? 'Save' : 'Edit'}
</button>
```

This is a **ternary expression** — a compact way to choose between two values based on a condition. It's perfect for simple either/or situations in JSX.

---

## Pre-populating the Input Field

When the input appears, it should already contain the current player name. Use the `value` prop:

```jsx
if (isEditing) {
  editablePlayerName = <input type="text" required value={name} />;
}
```

The `value` prop **enforces** what's shown in the input — React controls the displayed value entirely.

---

## Toggling the Editing State

Right now, `handleEditClick` always sets `isEditing` to `true`. We need it to **toggle**:

### First Attempt — Ternary

```jsx
function handleEditClick() {
  setIsEditing(isEditing ? false : true);
}
```

This works, but it's unnecessarily verbose.

### Better — The Negation Operator

In JavaScript, `!` inverts a boolean. `!true` becomes `false`, and `!false` becomes `true`:

```jsx
function handleEditClick() {
  setIsEditing(!isEditing);
}
```

Cleaner! But there's still a subtle problem with this approach...

---

## Why This Approach Is Suboptimal

This code **works** for our current use case — but it has a hidden flaw related to how React schedules state updates. The issue? We're updating state based on the previous state value, but we're not using the recommended pattern for doing so.

What happens if you do this:

```jsx
function handleEditClick() {
  setIsEditing(!isEditing);   // Schedule: set to true
  setIsEditing(!isEditing);   // Schedule: ALSO set to true!
}
```

You'd expect the second call to undo the first (true → false). But both calls see the **same old value** of `isEditing` because the state hasn't actually changed yet — it's only been *scheduled* to change.

The correct way to solve this is covered in the next lecture.

---

## ✅ Key Takeaways

- Use ternary expressions for simple conditional rendering in JSX
- The `value` prop on inputs controls what's displayed (React-controlled input)
- `!` (negation) is a clean way to toggle booleans
- Updating state based on previous state with direct references can lead to bugs

## ⚠️ Common Mistakes

- Hard-coding button text instead of making it dynamic
- Forgetting that `value` on an input makes it read-only unless you also handle `onChange`
- Assuming state updates happen instantly — they're scheduled, not immediate

## 💡 Pro Tip

When you detect that your state update depends on the **current value** of that same state, it's a signal to use the **function form** of the state updater. We'll see exactly how in the next lecture.
