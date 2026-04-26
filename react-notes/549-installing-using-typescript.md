# Installing & Using TypeScript

## Introduction

Now that we know *what* TypeScript is and *why* it's useful, let's get it set up and see it in action. This section walks through installing TypeScript, understanding the compilation process, and running your first TypeScript file. This is foundational — once you understand how the TypeScript compiler works, everything else falls into place.

---

### Concept 1: Installing TypeScript

#### 🧠 What is it?

TypeScript is installed via npm (Node Package Manager), which you already have if you've been working with React.

#### ⚙️ How it works

You can install TypeScript in two ways:

**Project-local install** (recommended for most cases):
```bash
npm install typescript
```

**Global install** (available system-wide):
```bash
npm install -g typescript
```

Before installing, make sure you have a `package.json` in your project:

```bash
npm init -y           # Creates a blank package.json
npm install typescript # Installs TypeScript locally
```

#### 💡 Insight

Installing TypeScript locally into a project is usually preferred because different projects might use different TypeScript versions. A global install means every project shares the same version, which can lead to compatibility issues.

---

### Concept 2: TypeScript Code Doesn't Run in the Browser

#### 🧠 What is it?

Here's a critical point: **browsers don't understand TypeScript**. They only understand JavaScript. So TypeScript code must be **compiled** (converted) to JavaScript before it can run.

#### ❓ Why do we need it?

During compilation, two important things happen:

1. All type annotations are **removed** (JavaScript doesn't know about them)
2. TypeScript **checks your code for errors** and warns you if anything is wrong

> Think of it like a spell checker for a document. The spell checker highlights problems while you write, but the final printed document doesn't include the red underlines — it's just clean text.

#### ⚙️ How it works

The TypeScript compiler is invoked using `npx tsc`:

```bash
# Compile a specific file
npx tsc myfile.ts
```

This produces a `.js` file alongside your `.ts` file. The `.js` file is what actually runs in the browser.

#### 🧪 Example

Given a `basics.ts` file:

```typescript
function add(a: number, b: number) {
  return a + b;
}
const result = add(2, 5);
console.log(result);
```

Running `npx tsc basics.ts` produces `basics.js`:

```javascript
function add(a, b) {
  return a + b;
}
var result = add(2, 5);
console.log(result);
```

Notice: types are gone, and `const` became `var` (by default, TypeScript compiles to older JS for broader browser support — this is configurable).

#### 💡 Insight

Even if your code has errors, TypeScript still produces a `.js` file by default. It warns you, but it doesn't block the output. This is a design choice — but you should always fix those warnings before shipping code.

---

### Concept 3: The Compilation Error Flow

#### 🧠 What is it?

When you compile TypeScript, any type errors are reported in the terminal. This acts as a **second line of defense** — your IDE catches errors in real time, and the compiler catches anything you might have missed.

#### ⚙️ How it works

If you have a type error:

```typescript
function add(a: number, b: number) {
  return a + b;
}
add("2", "5"); // ❌ Type error
```

Running `npx tsc` will output:
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Fix the error, recompile, and the output is clean.

#### 💡 Insight

The compilation step is your safety net. Even if you somehow miss an IDE warning, the compiler will catch it. In production React projects, this compilation happens automatically as part of the build process — you never need to manually run `tsc`.

---

## ✅ Key Takeaways

- Install TypeScript with `npm install typescript` (local) or `npm install -g typescript` (global)
- TypeScript files (`.ts`) must be **compiled** to JavaScript (`.js`) before the browser can run them
- The TypeScript compiler (`tsc`) removes type annotations and checks for errors
- Your IDE shows errors in real-time; the compiler catches anything remaining
- In React projects, compilation happens automatically — no manual `tsc` calls needed

## ⚠️ Common Mistakes

- Trying to load a `.ts` file directly in the browser — it won't work
- Running `npx tsc` without specifying a file or config — it needs to know what to compile
- Ignoring compiler warnings — they exist for a reason

## 💡 Pro Tips

- Use `npx tsc --init` to generate a `tsconfig.json` configuration file for your project
- In React projects (created with Create React App), the TypeScript compiler is already integrated — you don't need to configure it manually
