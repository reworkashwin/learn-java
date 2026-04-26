# Adding a Data Model

## Introduction

Up to now, a Todo has just been a string — simple and quick. But in any real app, data is more complex. A Todo might have an ID, text, a creation date, an author, a status... you get the idea. So how do we properly define the *shape* of our data in a TypeScript + React project? By creating a **data model** — a class or type that describes exactly what a Todo (or any entity) looks like. This gives us a single source of truth for our data structure across the entire app.

---

## Concept 1: Creating a Models Folder

### 🧠 What is it?

A `models` folder inside `src` is a convention for storing your data model definitions — classes, types, or interfaces that describe the shape of your data.

### ❓ Why do we need it?

- Keeps data definitions organized and separate from components
- Creates a single source of truth for data shapes
- Makes it easy to import and reuse across the project

### ⚙️ How it works

Create `src/models/todo.ts` (note: `.ts`, not `.tsx` — no JSX here, just pure TypeScript).

### 💡 Insight

The naming is a convention, not a requirement. You could call it `types/`, `interfaces/`, or anything else. The point is separating data definitions from UI components.

---

## Concept 2: Defining a Class as a Data Model

### 🧠 What is it?

A TypeScript class that describes the shape of a Todo object, including its properties and how it's constructed.

### ❓ Why do we need it?

With just strings, we have no structure. A class lets us:
- Define exactly which properties a Todo has (and their types)
- Auto-generate values (like an ID) in the constructor
- Use the class name as both a constructor *and* a type

### ⚙️ How it works

```typescript
// src/models/todo.ts
class Todo {
  id: string;
  text: string;

  constructor(todoText: string) {
    this.text = todoText;
    this.id = new Date().toISOString();
  }
}

export default Todo;
```

Key differences from vanilla JavaScript:
- **Property declarations**: You must declare `id` and `text` with their types *before* the constructor — TypeScript requires this
- **Type annotations**: Both property types and constructor parameter types are explicitly defined
- Without the constructor assigning values, TypeScript will complain that properties have "no initializer"

### 🧪 Example

```typescript
const myTodo = new Todo('Learn React');
// myTodo.id → "2024-01-15T10:30:00.000Z" (auto-generated)
// myTodo.text → "Learn React"
```

### 💡 Insight

You could also use `type` or `interface` instead of a class. The advantage of a class is that it's *instantiable* — you can call `new Todo(...)` to create objects. A `type` or `interface` only describes shape; you'd have to construct objects manually.

---

## Concept 3: Using the Class as a Type

### 🧠 What is it?

In TypeScript, a class name doubles as a type. You can use it in type annotations just like `string` or `number`.

### ❓ Why do we need it?

Once you define a `Todo` class, you want to tell TypeScript: "this array contains Todo objects, not strings." That lets TypeScript enforce the correct structure everywhere.

### ⚙️ How it works

In `App.tsx`:

```tsx
import Todo from './models/todo';

const todos = [
  new Todo('Learn React'),
  new Todo('Learn TypeScript'),
];
// TypeScript infers: todos is Todo[]
```

In the `Todos` component, update the prop type:

```tsx
import Todo from '../models/todo';

const Todos: React.FC<{ items: Todo[] }> = (props) => {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
};
```

Notice:
- `items` is now `Todo[]` instead of `string[]`
- We access `item.id` and `item.text` instead of the raw string
- TypeScript provides auto-completion for all `Todo` properties

### 💡 Insight

When you change a prop type from `string[]` to `Todo[]`, TypeScript will immediately flag every place in your code that passes the wrong type. That's the beauty of this approach — change the model once, and TypeScript tells you everywhere that needs updating.

---

## Concept 4: The Benefit of Type Annotations on Data

### 🧠 What is it?

By making the shape of your data explicit through models, you create a chain of type safety that flows from data creation all the way through to the UI.

### ⚙️ How it works

1. **Define** the model: `Todo` class with `id` and `text`
2. **Create** instances: `new Todo('...')` — TypeScript enforces constructor params
3. **Pass** as props: `items: Todo[]` — TypeScript enforces the correct data type
4. **Use** in JSX: `item.id`, `item.text` — TypeScript provides auto-completion

If you pass incorrect data at any step, you get an error **during development**, not at runtime.

### 💡 Insight

This is the real promise of TypeScript: errors are caught when you write the code, not when your users encounter bugs. The more descriptive your types, the safer your code.

---

## ✅ Key Takeaways

- Create a `models/` folder to store data type definitions
- Use classes to define data models — they serve as both constructors and types
- Declare properties with types inside the class body (TypeScript requirement)
- A class name can be used directly as a type annotation (e.g., `Todo[]`)
- Updating a model propagates type checks throughout your entire codebase

## ⚠️ Common Mistakes

- Forgetting to declare properties above the constructor in a TypeScript class
- Using raw strings or objects when you should be using a typed model
- Not updating prop types when switching from simple types to model types

## 💡 Pro Tips

- Choose between `class`, `type`, and `interface` based on your needs — classes for instantiation, types/interfaces for pure shape definitions
- The auto-generated ID pattern (`new Date().toISOString()`) works for demos but use proper UUID libraries in production
- When you change a model, let TypeScript errors guide you to every file that needs updating
