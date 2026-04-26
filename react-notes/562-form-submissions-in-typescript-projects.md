# Form Submissions in TypeScript Projects

## Introduction

Forms are everywhere in web apps, and handling them in React is something you've done many times. But when TypeScript enters the picture, you need to be explicit about the *types* of events your handlers receive. TypeScript doesn't magically know that your `submitHandler` will get a form event — you have to tell it. This section shows you how to properly type form submission handlers in a React + TypeScript project.

---

## Concept 1: Building a Form Component

### 🧠 What is it?

A `NewTodo` component that renders a form with a text input and a submit button, allowing users to add new Todos.

### ⚙️ How it works

```tsx
const NewTodo: React.FC = () => {
  return (
    <form>
      <label htmlFor="text">Todo text</label>
      <input type="text" id="text" />
      <button>Add Todo</button>
    </form>
  );
};

export default NewTodo;
```

Nothing TypeScript-specific here yet — it's standard React JSX. The TypeScript magic comes when we handle the form submission.

---

## Concept 2: Typing the Form Event Handler

### 🧠 What is it?

When you write a function that handles form submission, TypeScript needs to know what type of event object that function will receive.

### ❓ Why do we need it?

Without a type annotation on the event parameter, TypeScript has no idea what `event` is. You won't get auto-completion for `event.preventDefault()`, and you'll get the dreaded "implicitly has type any" error.

### ⚙️ How it works

```tsx
const submitHandler = (event: React.FormEvent) => {
  event.preventDefault();
  // Handle submission...
};
```

Key points:
- `React.FormEvent` is the correct type for form submission events handled through React's `onSubmit`
- It gives you full auto-completion for event methods like `preventDefault()`
- If you were handling a click event with `onClick`, you'd use `React.MouseEvent` instead

### 🧪 Example

What happens if you use the wrong event type?

```tsx
// ❌ Using MouseEvent for a form submission
const submitHandler = (event: React.MouseEvent) => {
  event.preventDefault();
};

// In JSX:
<form onSubmit={submitHandler}>  // TypeScript ERROR!
```

TypeScript catches the mismatch — `onSubmit` expects a function that receives `FormEvent`, not `MouseEvent`. This is another win for type safety.

### 💡 Insight

React provides specific event types for different DOM events:
- `React.FormEvent` — for `onSubmit`
- `React.MouseEvent` — for `onClick`
- `React.ChangeEvent` — for `onChange`
- `React.KeyboardEvent` — for `onKeyDown`, `onKeyUp`

Match the event type to the event listener, and TypeScript will keep you safe.

---

## Concept 3: Connecting the Handler

### 🧠 What is it?

Passing the typed submit handler to the form's `onSubmit` prop.

### ⚙️ How it works

```tsx
<form onSubmit={submitHandler}>
  <label htmlFor="text">Todo text</label>
  <input type="text" id="text" />
  <button>Add Todo</button>
</form>
```

Because `submitHandler` is correctly typed with `React.FormEvent`, TypeScript validates that the function signature matches what `onSubmit` expects. If there's a mismatch, you get an error immediately.

---

## ✅ Key Takeaways

- Always type the event parameter in your event handler functions
- Use `React.FormEvent` for form submission handlers (`onSubmit`)
- Use `React.MouseEvent` for click handlers (`onClick`)
- TypeScript validates that your handler's type matches the event listener's expected type
- `event.preventDefault()` works with full auto-completion once the event is typed

## ⚠️ Common Mistakes

- Leaving the event parameter untyped — TypeScript will flag it as implicit `any`
- Using the wrong event type (e.g., `MouseEvent` for `onSubmit`)
- Forgetting to call `event.preventDefault()` to stop the browser's default form submission

## 💡 Pro Tips

- If you're unsure which event type to use, hover over the JSX event prop (like `onSubmit`) in your editor — it will tell you the expected function signature
- You don't need to import `React` explicitly in modern React setups, but you still reference `React.FormEvent` for the type — it's available from the `@types/react` package
