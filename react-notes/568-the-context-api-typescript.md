# The Context API with TypeScript

## Introduction

Prop drilling — passing functions and data through multiple layers of components — works, but it gets tedious. The Context API solves this by letting you share state across components without threading props through every level. But in TypeScript, setting up context requires a bit more care: you need to define the *shape* of your context object as a type, and ensure that shape is consistent everywhere. This section walks through the full setup of the Context API in a TypeScript React project.

---

## Concept 1: Defining the Context Type

### 🧠 What is it?

Before creating a context, you define a **type alias** that describes the shape of the context object — what data it holds and what functions it provides.

### ❓ Why do we need it?

Without a type, you'd be copy-pasting the same type definition in multiple places (when creating the context and when creating the provider). A type alias gives you a single source of truth.

### ⚙️ How it works

```tsx
import Todo from '../models/todo';

type TodosContextObj = {
  items: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
};
```

This type describes:
- `items` — an array of `Todo` objects (the current list)
- `addTodo` — a function that accepts a string and returns nothing
- `removeTodo` — a function that accepts a string ID and returns nothing

### 💡 Insight

By extracting this into a named type, you avoid copy-pasting type definitions. Change it once, and TypeScript propagates the change everywhere it's used.

---

## Concept 2: Creating the Context with `createContext`

### 🧠 What is it?

Using React's `createContext` with a generic type to create a typed context object with a proper default value.

### ⚙️ How it works

```tsx
import React from 'react';

const TodosContext = React.createContext<TodosContextObj>({
  items: [],
  addTodo: () => {},
  removeTodo: (id: string) => {},
});
```

Key points:
- `createContext` is **generic** — pass your type in angle brackets
- The default value must match the shape of `TodosContextObj`
- The default functions are empty stubs — they're just placeholders for the type checker
- `items` starts as an empty array, which is valid for `Todo[]`

### 💡 Insight

The default value in `createContext` is used when a component tries to consume the context *without* a matching Provider above it. In practice, you always wrap with a Provider, but the default satisfies TypeScript's type requirements.

---

## Concept 3: Building the Context Provider Component

### 🧠 What is it?

A dedicated component that wraps its children and provides the actual context values — including real state management logic.

### ⚙️ How it works

```tsx
const TodosContextProvider: React.FC = (props) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodoHandler = (text: string) => {
    const newTodo = new Todo(text);
    setTodos((prevTodos) => prevTodos.concat(newTodo));
  };

  const removeTodoHandler = (todoId: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
  };

  const contextValue: TodosContextObj = {
    items: todos,
    addTodo: addTodoHandler,
    removeTodo: removeTodoHandler,
  };

  return (
    <TodosContext.Provider value={contextValue}>
      {props.children}
    </TodosContext.Provider>
  );
};

export default TodosContextProvider;
```

Notice:
- All state management logic moves here from `App.tsx`
- `contextValue` is explicitly typed as `TodosContextObj` — TypeScript validates that it matches the shape
- If `addTodoHandler` had the wrong parameter type, TypeScript catches it immediately
- `props.children` renders whatever is wrapped by this provider

### 💡 Insight

By explicitly typing `contextValue` as `TodosContextObj`, you catch mismatches early. Without this annotation, TypeScript infers the type from the object and might not catch subtle differences (like a missing parameter on a function).

---

## Concept 4: Consuming Context with `useContext`

### 🧠 What is it?

Using the `useContext` hook to access the context values in any component wrapped by the provider — no props needed.

### ⚙️ How it works

**In the Todos component:**

```tsx
import { useContext } from 'react';
import { TodosContext } from '../store/todos-context';

const Todos: React.FC = () => {
  const todosCtx = useContext(TodosContext);

  return (
    <ul>
      {todosCtx.items.map((item) => (
        <TodoItem
          key={item.id}
          text={item.text}
          onRemoveTodo={todosCtx.removeTodo.bind(null, item.id)}
        />
      ))}
    </ul>
  );
};
```

**In the NewTodo component:**

```tsx
const NewTodo: React.FC = () => {
  const todosCtx = useContext(TodosContext);

  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const enteredText = todoTextInputRef.current!.value;
    if (enteredText.trim().length === 0) return;
    todosCtx.addTodo(enteredText);
  };

  // ...
};
```

### 🧪 Example

Key changes when switching from props to context:
- Remove custom prop types from `React.FC<>` — components no longer receive custom props
- Remove prop parameters from the component function
- Replace `props.onAddTodo(...)` with `todosCtx.addTodo(...)`
- Replace `props.items` with `todosCtx.items`

TypeScript automatically knows the shape of `todosCtx` because it's linked to the typed context.

### 💡 Insight

If you hover over `todosCtx` in your editor, TypeScript shows you the full `TodosContextObj` type. You get auto-completion for `items`, `addTodo`, and `removeTodo` — all without any prop threading.

---

## Concept 5: Wrapping with the Provider

### 🧠 What is it?

The final step: wrapping your component tree with the context provider so `useContext` works.

### ⚙️ How it works

```tsx
// App.tsx
import TodosContextProvider from './store/todos-context';

function App() {
  return (
    <TodosContextProvider>
      <NewTodo />
      <Todos />
    </TodosContextProvider>
  );
}
```

The `App` component becomes extremely lean — no state management, no handler functions, no prop passing. Everything is handled by the context provider.

---

## Concept 6: Cleaning Up Components

### 🧠 What is it?

After moving to context, components that previously received props for state management no longer need those prop definitions.

### ⚙️ How it works

Before (with props):
```tsx
const Todos: React.FC<{ items: Todo[]; onRemoveTodo: (id: string) => void }> = (props) => { ... }
```

After (with context):
```tsx
const Todos: React.FC = () => { ... }
```

Remove:
- Custom prop type definitions from `React.FC<>`
- Unused imports (like the `Todo` model if it's only needed for prop types)
- The `props` parameter from the component function

---

## ✅ Key Takeaways

- Define a type alias for your context shape — use it in both `createContext` and the provider
- `createContext` is generic — pass your type to get full type safety
- Move state management logic into the context provider component
- Use `useContext` to access context values — TypeScript knows the full type
- Components become cleaner: no prop drilling, no custom prop types

## ⚠️ Common Mistakes

- Forgetting to wrap components with the Provider — `useContext` returns the default value (usually empty/dummy)
- Not matching the context type between `createContext` and the provider's value
- Copy-pasting the type definition instead of using a shared type alias
- Forgetting to remove old prop types after switching to context

## 💡 Pro Tips

- Export both the context (for `useContext`) and the provider component (for wrapping)
- The type alias ensures consistency — if you add a new function to the context, TypeScript tells you everywhere that needs updating
- Context is great for widely-shared state, but for state used by only one or two components, props are still simpler
