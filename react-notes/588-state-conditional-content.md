# State & Conditional Content

## Introduction

Having a modal is great, but not being able to close it? Not so much. In this section, we tackle **conditional rendering** — showing or hiding content based on state. The modal should appear when the user wants to create a post and disappear when they click the backdrop. This introduces a fundamental React pattern: using state to control *what* gets rendered on the screen.

---

## Concept 1: State for Visibility

### 🧠 What is it?

Instead of storing text or numbers, you can use state to store a **boolean** (`true`/`false`) that controls whether something is visible or not.

### ❓ Why do we need it?

Our modal should be visible initially (or on button click) and hidden when the backdrop is clicked. That's two states — visible and not visible — and React's `useState` is perfect for managing this toggle.

### ⚙️ How it works

```jsx
const [modalIsVisible, setModalIsVisible] = useState(true);

function hideModalHandler() {
  setModalIsVisible(false);
}
```

- `modalIsVisible` starts as `true` (modal is shown)
- Clicking the backdrop calls `hideModalHandler`
- `setModalIsVisible(false)` updates the state → React re-renders → modal disappears

### 💡 Insight

State doesn't have to represent data. It can represent the **current mode** or **current view** of your UI. "Is the modal open?" is just as valid a state as "What text did the user type?"

---

## Concept 2: Adding Click Listeners to the Backdrop

### 🧠 What is it?

The backdrop (the transparent dark overlay behind the modal) should be clickable. Clicking it should close the modal by updating the visibility state.

### ❓ Why do we need it?

This is standard UX — users expect to close a modal by clicking outside of it. We wire this up using `onClick` and the lifting-state-up pattern.

### ⚙️ How it works

**In `PostsList`** (where the state lives):
```jsx
function hideModalHandler() {
  setModalIsVisible(false);
}

<Modal onClose={hideModalHandler}>
  <NewPost />
</Modal>
```

**In `Modal`** (where the backdrop is):
```jsx
function Modal({ children, onClose }) {
  return (
    <>
      <div className={classes.backdrop} onClick={onClose} />
      <dialog open className={classes.modal}>
        {children}
      </dialog>
    </>
  );
}
```

The `hideModalHandler` function flows from `PostsList` → `Modal` → backdrop's `onClick`.

### 💡 Insight

This is lifting state up in action again. The state lives in `PostsList`, but the event that changes it happens in `Modal`. We bridge the gap with props.

---

## Concept 3: Conditional Rendering with Ternary Expressions

### 🧠 What is it?

A **ternary expression** lets you render one thing if a condition is true, and something else (or nothing) if it's false.

### ❓ Why do we need it?

We need to show the modal when `modalIsVisible` is `true` and show nothing when it's `false`.

### ⚙️ How it works

```jsx
{modalIsVisible ? (
  <Modal onClose={hideModalHandler}>
    <NewPost />
  </Modal>
) : null}
```

- If `modalIsVisible` is `true` → render the Modal
- If `modalIsVisible` is `false` → render `null` (nothing)

Both `null` and `false` render nothing in JSX.

### 💡 Insight

You can use `false` instead of `null` — both tell React "render nothing here." The rest of the JSX (like the post list) is unaffected.

---

## Concept 4: Conditional Rendering with Variables

### 🧠 What is it?

Instead of inline ternary expressions, you can store JSX in a **variable** and conditionally assign it before the return statement.

### ❓ Why do we need it?

For complex conditional rendering, variables make your code more readable than cramming everything into a ternary expression.

### ⚙️ How it works

```jsx
let modalContent;

if (modalIsVisible) {
  modalContent = (
    <Modal onClose={hideModalHandler}>
      <NewPost />
    </Modal>
  );
}

return (
  <>
    {modalContent}
    <ul>{/* posts */}</ul>
  </>
);
```

- If `modalIsVisible` is `true`, `modalContent` holds the JSX
- If `false`, `modalContent` is `undefined`, which renders nothing
- This works because state changes trigger a re-render, re-executing all this code

### 💡 Insight

Yes, you can store JSX in variables! JSX expressions are just JavaScript values — you can assign them, return them, pass them as arguments, or store them in arrays.

---

## Concept 5: Conditional Rendering with `&&`

### 🧠 What is it?

The **logical AND operator** (`&&`) provides the most concise conditional rendering syntax. If the left side is truthy, it renders the right side. If falsy, it renders nothing.

### ❓ Why do we need it?

When you only need to show something or nothing (no "else" case), `&&` is cleaner than a ternary.

### ⚙️ How it works

```jsx
{modalIsVisible && (
  <Modal onClose={hideModalHandler}>
    <NewPost />
  </Modal>
)}
```

Due to JavaScript's short-circuit evaluation:
- `true && <Modal>` → renders `<Modal>`
- `false && <Modal>` → renders `false` (which React ignores)

### 💡 Insight

All three approaches — ternary, variable, and `&&` — are valid. Choose based on readability:
- **`&&`** for simple show/hide
- **Ternary** for show A or B
- **Variable** for complex conditions

---

## ✅ Key Takeaways

- Use boolean state (`true`/`false`) to control UI visibility
- Three approaches for conditional rendering: ternary, variables, and `&&`
- `null`, `undefined`, and `false` all render nothing in JSX
- Wire up backdrop clicks with `onClick` and pass the handler via props
- State updates trigger re-renders, so conditional checks are re-evaluated automatically

## ⚠️ Common Mistakes

- Forgetting to actually use the state value in the JSX — updating state without rendering based on it changes nothing visible
- Using `===` comparison when a simple truthiness check (`&&`) would suffice
- Rendering `0` instead of nothing — `{count && <Component />}` will render `0` if count is `0`, because `0` is falsy but still renderable

## 💡 Pro Tips

- Use `&&` when there's no "else" case — it's the cleanest syntax
- For mutually exclusive content (show A or B, never both), ternary is ideal
- For multiple conditions or complex logic, extract into a variable before the return statement
