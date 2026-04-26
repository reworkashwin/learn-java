# Working with Function Props in TypeScript

## Introduction

You've passed strings, arrays, and objects as props. But what about *functions*? Passing function pointers as props is one of the most common patterns in React — it's how child components communicate back to their parents. In TypeScript, you need to describe the *shape* of that function: what parameters it takes and what it returns. This is where **function types** come in.

---

## Concept 1: The Pattern — Child-to-Parent Communication

### 🧠 What is it?

When a child component needs to send data up to a parent (like a new Todo text from a form), the parent passes a function as a prop. The child calls that function with the data.

### ❓ Why do we need it?

In the Todo app, the `NewTodo` component collects user input, but the Todo list is managed in the `App` component. The child needs a way to say "Hey parent, here's a new Todo!" — and that's done by calling a function prop.

### ⚙️ How it works

In the child (`NewTodo`), after extracting input:

```tsx
props.onAddTodo(enteredText);
```

But TypeScript doesn't know what `onAddTodo` is unless we define it in our props type.

---

## Concept 2: Defining a Function Type in Props

### 🧠 What is it?

A **function type** in TypeScript describes the shape of a function — its parameters and return type — using arrow syntax in a type definition.

### ⚙️ How it works

```tsx
const NewTodo: React.FC<{
  onAddTodo: (text: string) => void;
}> = (props) => {
  // ...
  props.onAddTodo(enteredText);
};
```

Breaking down the function type `(text: string) => void`:
- `(text: string)` — the function takes one parameter named `text` of type `string`
- `=> void` — the function returns nothing

This is **not** creating an arrow function. In a type definition context, this arrow syntax describes the *shape* of a function.

### 🧪 Example

Different function type shapes:

```typescript
// No parameters, no return value
onCancel: () => void

// One string parameter, no return value
onAddTodo: (text: string) => void

// Two parameters, returns a boolean
onValidate: (text: string, maxLength: number) => boolean
```

### 💡 Insight

If you define `onAddTodo` as `() => void` (no parameters) but then try to call it with an argument, TypeScript flags the error immediately. The function type acts as a contract between parent and child.

---

## Concept 3: Implementing the Function in the Parent

### 🧠 What is it?

The parent component defines the concrete function that matches the shape described in the child's props type, then passes it as a prop.

### ⚙️ How it works

In `App.tsx`:

```tsx
const addTodoHandler = (text: string) => {
  // Create new Todo, update state, etc.
};

// In JSX:
<NewTodo onAddTodo={addTodoHandler} />
```

The key requirement: `addTodoHandler` must match the shape `(text: string) => void`:
- It accepts a `string` parameter ✅
- It doesn't return anything ✅

If the shapes don't match, TypeScript gives you an error.

### 🧪 Example

What if the types don't match?

```tsx
// Parent defines handler with wrong parameter type
const addTodoHandler = (count: number) => { ... };

<NewTodo onAddTodo={addTodoHandler} />
// ❌ TypeScript error: number !== string
```

### 💡 Insight

This is the full circle of function props in TypeScript:
1. **Child defines** the expected function shape in its prop types
2. **Parent implements** a concrete function matching that shape
3. **Parent passes** the function as a prop
4. **Child calls** the function with the correct arguments
5. **TypeScript validates** every step of this chain

---

## ✅ Key Takeaways

- Function types use arrow syntax: `(param: type) => returnType`
- `void` means the function doesn't return anything useful
- The function type in props acts as a contract — both sides must match
- TypeScript validates that the parent's function matches the child's expected shape
- This pattern enables child-to-parent communication in a type-safe way

## ⚠️ Common Mistakes

- Forgetting to define the function type in the child's props — leads to implicit `any`
- Mismatching parameter types between the definition and the implementation
- Confusing function type syntax (in types) with arrow function syntax (in code) — they look similar but serve different purposes

## 💡 Pro Tips

- If a function prop is optional, add `?`: `onAddTodo?: (text: string) => void`
- You can name the parameters anything in the type definition — the names are just for documentation
- For complex function types, consider extracting them into a `type` alias to keep prop definitions clean
