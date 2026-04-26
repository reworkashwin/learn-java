# Working with Components & TypeScript

## Introduction

Now that we have a React + TypeScript project up and running, it's time to write actual React components with TypeScript. The great news? **Most of the code looks exactly the same.** You still write functional components, return JSX, use hooks — all the React fundamentals you already know. TypeScript just adds a layer of type safety on top. Let's see it in action by building a simple Todo app.

---

### Concept 1: Cleaning Up the Default Project

#### 🧠 What is it?

The default Create React App template comes with boilerplate files you don't need. Before writing our own components, let's clean house.

#### ⚙️ How it works

Files to **delete**:
- `App.test.tsx` — test file we don't need right now
- `logo.svg` — the React logo
- `reportWebVitals.ts` — performance monitoring
- `setupTests.ts` — test configuration

Files to **keep**:
- `react-app-env.d.ts` — TypeScript environment declarations (important!)
- `index.tsx` — entry point
- `App.tsx` — main component

Then clean up the remaining files:
- Remove the logo import and boilerplate JSX from `App.tsx`
- Remove the web vitals import from `index.tsx`
- Clean up `App.css` and `index.css`

#### 💡 Insight

The `react-app-env.d.ts` file is easy to accidentally delete, but it's important — it contains TypeScript declarations that your project needs.

---

### Concept 2: React Components Are the Same

#### 🧠 What is it?

Here's the most important takeaway: **React components in TypeScript are written the same way as in JavaScript**. A functional component is still a function that returns JSX.

#### ⚙️ How it works

```tsx
// components/Todos.tsx
function Todos() {
  return (
    <ol>
      <li>Learn React</li>
      <li>Learn TypeScript</li>
    </ol>
  );
}

export default Todos;
```

That's it. No special TypeScript syntax needed for a basic component. The JSX, the function structure, the export — all identical to what you've been writing.

#### 🧪 Example

```tsx
// App.tsx
import Todos from './components/Todos';

function App() {
  return <Todos />;
}

export default App;
```

#### 💡 Insight

TypeScript's **type inference** is doing heavy lifting behind the scenes. It knows `Todos` returns JSX, it knows `App` returns JSX — without you writing a single type annotation. The code just works.

---

### Concept 3: File Extensions — .tsx vs .ts

#### 🧠 What is it?

In a TypeScript React project, you use two file extensions:

- **`.tsx`** — for files that contain JSX (most component files)
- **`.ts`** — for files with pure TypeScript (utility functions, types, constants)

#### ❓ Why do we need it?

The `.tsx` extension tells the TypeScript compiler that angle brackets (`< >`) in the file should be treated as JSX elements, not as generic type syntax. Without it, `<div>` would confuse the compiler.

#### 💡 Insight

Simple rule: if the file has any JSX in it, use `.tsx`. If it's pure logic with no JSX, use `.ts`.

---

### Concept 4: The Road Ahead — Props and Types

#### 🧠 What is it?

Right now our `Todos` component has hard-coded content. That's fine for a demo, but real components receive data through **props**. And this is where TypeScript really starts to shine — because we can define the exact shape of props a component expects.

#### ❓ Why do we need it?

With TypeScript, when you pass props to a component, TypeScript checks:
- Are you passing all required props?
- Are the prop values the correct types?
- Are you passing any props that don't exist on the component?

This catches bugs that would otherwise only show up at runtime.

#### 💡 Insight

This is where the TypeScript fundamentals we learned — object types, type aliases, generics — all come together. React props are essentially typed objects, and component definitions are essentially functions with typed parameters. Everything we've covered builds toward this.

---

### Concept 5: What the Dev Server Does Behind the Scenes

#### 🧠 What is it?

When you run `npm start`, the dev server now performs an extra step compared to plain JavaScript projects: it **compiles TypeScript to JavaScript** before bundling and serving.

#### ⚙️ How it works

The pipeline:
1. **TypeScript compilation** — `.tsx` files → JavaScript
2. **Bundling** — all JavaScript files combined
3. **Optimization** — minification and other optimizations
4. **Serving** — dev server hosts the result

This also applies to `npm run build` for production builds.

#### 💡 Insight

You never interact with the compiled JavaScript directly. You write TypeScript, and the tooling handles the rest. If there's a type error, the dev server will show it in the browser and terminal.

---

## ✅ Key Takeaways

- React components in TypeScript are written **exactly the same** as in JavaScript
- Use `.tsx` for files with JSX, `.ts` for files without
- Type inference handles most basic components — no explicit annotations needed
- The dev server automatically compiles TypeScript to JavaScript
- The real power of TypeScript emerges when components receive **props** — typed props catch bugs at write time

## ⚠️ Common Mistakes

- Deleting `react-app-env.d.ts` — keep this file, it's needed for TypeScript support
- Using `.ts` extension for component files with JSX — use `.tsx`
- Over-annotating simple components — let type inference do its job for basic cases

## 💡 Pro Tips

- Start with a simple component (no props) to verify your setup works, then gradually add types
- The pattern for typing props will feel natural once you connect it to the type aliases and object types you've already learned
- Import paths don't need file extensions — `import Todos from './components/Todos'` works fine
