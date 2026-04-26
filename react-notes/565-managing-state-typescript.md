# Managing State with TypeScript

## Introduction

State management with `useState` is fundamental React. But in TypeScript, there's a subtle trap: if your initial state is an empty array, TypeScript infers its type as `never[]` — meaning nothing can ever go into it. That's clearly not what you want. This section shows how to use `useState` as a generic function to properly type your state, ensuring TypeScript knows exactly what kind of data your state will hold.

---

## Concept 1: The `never[]` Problem

### 🧠 What is it?

When you call `useState([])` with an empty array, TypeScript infers the state type as `never[]` — an array that can never contain any values.

### ❓ Why do we need it?

TypeScript infers types from initial values. An empty array `[]` gives TypeScript zero information about what types should eventually go in it. So it picks the most restrictive type possible: `never`.

### ⚙️ How it works

```tsx
const [todos, setTodos] = useState([]);
// TypeScript infers: todos is never[]
// You can NEVER add anything to this array!
```

If you try to call `setTodos` with an array of Todos, TypeScript will complain because `Todo` is not `never`.

### 💡 Insight

Think of `never[]` as TypeScript saying: "You gave me an empty array with no hints. I'll assume nothing should ever go in here." It's TypeScript being safe, but it's not what we want.

---

## Concept 2: Using `useState` as a Generic Function

### 🧠 What is it?

`useState` is a **generic function** — you can specify the type of data it will manage using angle brackets.

### ⚙️ How it works

```tsx
import Todo from './models/todo';

const [todos, setTodos] = useState<Todo[]>([]);
```

Breaking it down:
- `<Todo[]>` tells TypeScript: "This state will hold an array of `Todo` objects"
- `[]` is still the initial value — an empty array, which is valid for `Todo[]`
- Now `todos` has type `Todo[]` and `setTodos` expects `Todo[]` updates

### 🧪 Example

```tsx
// Without generic type:
const [todos, setTodos] = useState([]);     // todos: never[] ❌

// With generic type:
const [todos, setTodos] = useState<Todo[]>([]); // todos: Todo[] ✅
```

After adding the generic type, `setTodos` knows it should receive `Todo[]`, and TypeScript validates every state update.

### 💡 Insight

You only need the generic type when TypeScript can't infer the type from the initial value. If your initial value is `useState('hello')`, TypeScript infers `string` just fine. But `useState([])` or `useState(null)` need the generic type to avoid ambiguity.

---

## Concept 3: Updating State with Type Safety

### 🧠 What is it?

Using the function form of `setState` to update state based on the previous state — with full type safety.

### ❓ Why do we need it?

When your new state depends on the old state (like adding an item to an existing array), you should use the function form to avoid stale state issues. TypeScript enforces the correct types throughout.

### ⚙️ How it works

```tsx
const addTodoHandler = (todoText: string) => {
  const newTodo = new Todo(todoText);

  setTodos((prevTodos) => {
    return prevTodos.concat(newTodo);
  });
};
```

Key points:
- `prevTodos` is automatically typed as `Todo[]` by TypeScript
- `concat` returns a **new array** (doesn't mutate the original — important for React!)
- `newTodo` must be a `Todo` instance — TypeScript validates this
- The returned array must also be `Todo[]` — TypeScript validates this too

### 🧪 Example

What if you accidentally try to add a string instead of a Todo?

```tsx
setTodos((prevTodos) => {
  return prevTodos.concat('Learn React'); // ❌ string is not Todo
});
```

TypeScript catches this immediately.

### 💡 Insight

Use `concat()` instead of `push()` when updating state arrays. `push()` mutates the original array (which React won't detect as a change). `concat()` creates a new array, which is what React needs to trigger a re-render.

---

## Concept 4: The Complete State Flow

### 🧠 What is it?

Putting it all together — from state declaration to state update to rendering.

### ⚙️ How it works

```tsx
import { useState } from 'react';
import Todo from './models/todo';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodoHandler = (todoText: string) => {
    const newTodo = new Todo(todoText);
    setTodos((prevTodos) => prevTodos.concat(newTodo));
  };

  return (
    <div>
      <NewTodo onAddTodo={addTodoHandler} />
      <Todos items={todos} />
    </div>
  );
}
```

TypeScript validates the entire chain:
1. `todos` is `Todo[]` ✅
2. `addTodoHandler` creates a `Todo` and adds it correctly ✅
3. `todos` is passed to `Todos` component which expects `Todo[]` ✅

---

## ✅ Key Takeaways

- `useState([])` infers `never[]` — always use the generic form `useState<Type[]>([])`
- The generic type tells TypeScript what data the state will eventually hold
- Use the function form of `setTodos` when updating based on previous state
- Use `concat()` to create new arrays instead of mutating with `push()`
- TypeScript validates state updates, ensuring only correct types are stored

## ⚠️ Common Mistakes

- Forgetting the generic type on `useState` when starting with an empty array or `null`
- Using `push()` instead of `concat()` to update state arrays
- Not using the function form of `setState` when the new state depends on the old state

## 💡 Pro Tips

- Hover over `setTodos` in your editor — TypeScript shows you the exact type signature, confirming it's `React.Dispatch<React.SetStateAction<Todo[]>>`
- If your initial value already tells TypeScript everything (e.g., `useState('hello')`), skip the generic — don't over-annotate
- The `never[]` problem also applies to `useReducer` initial states — same fix with generics
