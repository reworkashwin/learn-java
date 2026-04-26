# Time to Practice: Removing a Todo

## Introduction

Adding Todos is great, but what about removing them? This exercise builds on everything you've learned — function props, type annotations, event handling, and state updates — to implement a "click to remove" feature. The challenge is a prop chain: the click happens in `TodoItem`, but the state lives in `App`. How do you thread that function through multiple layers of components, all while keeping TypeScript happy?

---

## Concept 1: The Click Handler in TodoItem

### 🧠 What is it?

Adding an `onClick` handler to the `TodoItem` component that triggers a function received via props when the user clicks on a Todo.

### ⚙️ How it works

```tsx
const TodoItem: React.FC<{
  text: string;
  onRemoveTodo: () => void;
}> = (props) => {
  return (
    <li className={classes.item} onClick={props.onRemoveTodo}>
      {props.text}
    </li>
  );
};
```

Key decisions:
- `onRemoveTodo` is typed as `() => void` — a function with no parameters and no return value
- We don't need the click event object here, so the function takes no parameters
- The function will be pre-configured using `.bind()` before being passed as a prop

### 💡 Insight

You *could* type `onRemoveTodo` as `(event: React.MouseEvent) => void` since it's bound to `onClick`, but if you're not using the event object, you can simplify the type. TypeScript allows functions with fewer parameters where more are expected.

---

## Concept 2: The Prop Chain Through Todos

### 🧠 What is it?

The `Todos` component sits between `App` (where state lives) and `TodoItem` (where the click happens). It needs to forward the remove function down the chain.

### ⚙️ How it works

Update the `Todos` component to accept and forward `onRemoveTodo`:

```tsx
const Todos: React.FC<{
  items: Todo[];
  onRemoveTodo: (id: string) => void;
}> = (props) => {
  return (
    <ul className={classes.todos}>
      {props.items.map((item) => (
        <TodoItem
          key={item.id}
          text={item.text}
          onRemoveTodo={props.onRemoveTodo.bind(null, item.id)}
        />
      ))}
    </ul>
  );
};
```

Notice the **`.bind(null, item.id)`** pattern:
- `bind` pre-configures a function for future execution
- `null` is the `this` context (we don't need it)
- `item.id` becomes the first argument when the function is eventually called

This means `onRemoveTodo` in `Todos` takes `(id: string) => void`, but after `.bind()`, the version passed to `TodoItem` becomes `() => void` (the ID is already baked in).

### 💡 Insight

The `.bind()` trick avoids having to pass the `id` as a separate prop to `TodoItem` and then pass it back up. It pre-loads the function with the right ID at the point where we know which Todo we're dealing with.

---

## Concept 3: The Remove Handler in App

### 🧠 What is it?

The actual state update logic that filters out the removed Todo from the state array.

### ⚙️ How it works

```tsx
const removeTodoHandler = (todoId: string) => {
  setTodos((prevTodos) => {
    return prevTodos.filter((todo) => todo.id !== todoId);
  });
};
```

Key points:
- `todoId` is typed as `string` — matching the `id` type in the `Todo` model
- Uses the function form of `setTodos` (updating based on previous state)
- `filter` returns a **new array** with all Todos *except* the one matching `todoId`
- The `!==` comparison keeps Todos that don't match — think of it as "keep everything that's NOT the one we're removing"

### 🧪 Example

Then in JSX:

```tsx
<Todos items={todos} onRemoveTodo={removeTodoHandler} />
```

TypeScript validates:
- `removeTodoHandler` matches `(id: string) => void` ✅
- The function is bound with `item.id` (a `string`) ✅
- The bound version becomes `() => void` matching `TodoItem`'s expectation ✅

---

## Concept 4: The Complete Data Flow

### ⚙️ How it works

Here's the full chain:

1. **App** defines `removeTodoHandler(todoId: string) => void`
2. **App** passes it to `Todos` via `onRemoveTodo` prop
3. **Todos** uses `.bind(null, item.id)` to pre-configure the function with each Todo's ID
4. **Todos** passes the bound function to `TodoItem` via `onRemoveTodo` prop
5. **TodoItem** binds it to `onClick`
6. **User clicks** → bound function executes → `removeTodoHandler` runs with the correct ID
7. **State updates** → component re-renders → Todo disappears

TypeScript validates every connection in this chain. If any type doesn't match, you get an error immediately.

---

## ✅ Key Takeaways

- Use `.bind(null, id)` to pre-configure functions with specific arguments before passing them down
- Function types can differ at different levels of the prop chain (e.g., `(id: string) => void` becomes `() => void` after binding)
- Use `filter` to create new arrays when removing items from state
- TypeScript validates the entire prop chain from parent to child

## ⚠️ Common Mistakes

- Forgetting to add `onRemoveTodo` to the component's prop type definition — TypeScript will catch this
- Using `splice` instead of `filter` — `splice` mutates the array, which React won't detect
- Comparing with `===` when you mean `!==` in the filter (or vice versa) — the logic is "keep everything that doesn't match"

## 💡 Pro Tips

- `.bind()` is a JavaScript feature, not React-specific — it's incredibly useful for pre-configuring functions with arguments
- An alternative to `.bind()` is wrapping in an arrow function: `onClick={() => props.onRemoveTodo(item.id)}` — but this creates a new function on every render
- When building prop chains, work from the bottom up: define what the leaf component needs, then work upward to ensure each layer passes the right types
