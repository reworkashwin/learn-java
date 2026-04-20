# Revisiting the Rules of Hooks & Why To Build Custom Hooks

## Introduction

Before we build our first custom hook, we need to revisit the **Rules of Hooks** — because it turns out the first rule is a bit more flexible than you might think. And we need to understand **why** custom hooks exist in the first place. What problem do they actually solve?

---

## The Rules of Hooks (Revised)

You've learned two fundamental rules:

1. **Only use hooks inside React component functions**
2. **Don't nest hooks** inside `if` statements, loops, nested functions, or anything like that

But here's the update to rule #1:

> Hooks can be used inside **component functions** OR inside **other custom hooks**.

This small change is what makes the entire custom hooks feature possible. Without it, hooks would be trapped inside components forever.

---

## Why Would You Build Custom Hooks?

Look at these two components in our project:

- **App.jsx** — uses `useEffect` to fetch user places, manages `isFetching` and `error` state
- **AvailablePlaces.jsx** — uses `useEffect` to fetch available places, manages `isFetching` and `error` state

Notice the pattern? The code is **almost identical**:

- Send an HTTP request
- Manage loading state
- Manage error state
- Store the fetched data
- Use `useEffect` to trigger the fetch

The only differences are the URL and some data transformation. The **structure** is exactly the same.

This is a textbook case for code reuse.

---

## Why Not Just Use a Regular Function?

In normal JavaScript, when you have repeated logic, you extract it into a function. So why not do that here?

```js
// This won't work!
function fetchData(fetchFn) {
  const [data, setData] = useState();        // ❌ Can't use hooks here!
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  useEffect(() => { /* ... */ }, []);          // ❌ Also can't use hooks here!

  return { data, isFetching, error };
}
```

This fails because **hooks can only be used in component functions** (or custom hooks). A regular function like `fetchData` could be called from anywhere — inside a utility file, inside a loop, inside a callback. There's no guarantee it runs inside a component.

And that's exactly the problem custom hooks solve.

---

## The Idea Behind Custom Hooks

Custom hooks are **functions that are guaranteed to only be used in valid places** — inside components or other custom hooks. React enforces this guarantee through a naming convention: the function name **must start with `use`**.

Think of it this way:

| Concept | Purpose |
|---------|---------|
| **Components** | Reuse JSX structure + logic |
| **Custom Hooks** | Reuse stateful logic (without JSX) |

Components let you reuse UI. Custom hooks let you reuse **behavior**.

The code we want to share (fetch data, manage loading/error states) doesn't produce JSX — it's pure logic. It can't be a component. But it uses hooks, so it can't be a plain function either. That's the gap custom hooks fill.

---

## ✅ Key Takeaways

- Rule #1 is updated: hooks work in **components** AND **custom hooks**
- Custom hooks exist to **reuse stateful logic** across components
- You can't extract hook-based logic into regular functions because hooks require a component (or custom hook) context
- Custom hooks must start with `use` to be recognized by React's linting rules

## ⚠️ Common Mistakes

- Trying to use `useState` or `useEffect` inside a regular helper function — this will break
- Thinking custom hooks are just for HTTP requests — they can encapsulate any reusable stateful logic (timers, form validation, animations, etc.)

## 💡 Pro Tip

If you find yourself copying and pasting `useState` + `useEffect` code between components, that's a strong signal you should extract it into a custom hook.
