# Creating & Using a First Custom Component

## Introduction

You're not limited to just one `App` component. In real React apps, you'll build **dozens or even hundreds** of your own components. Let's learn how to create and use your very first custom component.

---

## Why Create Custom Components?

Imagine your `App` component contains a header, a main section, a sidebar, and a footer. As your app grows, that single function becomes massive and hard to manage.

By splitting things into **smaller, focused components**, you:

- Keep each component **lean and readable**
- Make pieces **reusable** across your app
- Follow the fundamental React philosophy of building UIs from small building blocks

---

## Creating a Custom Component

Let's say we want to extract the header section into its own component. Here's how:

### Step 1: Define a New Function

Since React components are just JavaScript functions, create a new function — let's call it `Header`:

```jsx
function Header() {
  return (
    <header>
      <img src="logo.png" alt="Logo" />
      <h1>My React App</h1>
      <p>Fundamental React Concepts</p>
    </header>
  );
}
```

### Step 2: Return JSX

Cut the header-related JSX from your `App` component and paste it into the `Header` function's return statement.

**Important:** When returning multi-line JSX, wrap it in **parentheses**:

```jsx
function Header() {
  return (
    <header>
      {/* ... markup here ... */}
    </header>
  );
}
```

Without the parentheses, JavaScript might misinterpret your code because of how automatic semicolon insertion works.

---

## Using a Custom Component

In standard JavaScript, you'd call a function with `Header()`. But **that's not how React components work**.

Instead, you use your component **like an HTML element** inside JSX:

```jsx
function App() {
  return (
    <div>
      <Header />
      <main>...</main>
    </div>
  );
}
```

You can write it as either:
- `<Header></Header>` — with opening and closing tags
- `<Header />` — self-closing tag (more common when there's no content between tags)

### The Self-Closing Rule

When using self-closing syntax, you **must** include the forward slash:

```jsx
<Header />    ✅ Correct
<Header>      ❌ Error — not valid JSX
```

This rule applies to all elements in JSX — even built-in ones like `<img />`.

---

## The Result

After extracting the `Header` component and using it in `App`, the page looks exactly the same. Nothing visually changed — but the *code* is now better organized.

Your `App` component is leaner, and the header logic lives in its own dedicated component.

---

## ✅ Key Takeaways

- React components are **regular JavaScript functions** that return JSX
- Component names **must start with uppercase** letters
- Use components in JSX **like HTML elements**, not by calling them as functions
- Self-closing tags require a forward slash: `<Component />`
- Extracting code into components keeps your codebase clean and organized

## ⚠️ Common Mistakes

- Calling a component as a function (`Header()`) instead of using it as JSX (`<Header />`)
- Forgetting parentheses around multi-line return statements
- Missing the forward slash in self-closing tags

## 💡 Pro Tips

- Even if a component is used only once, extracting it can still improve readability
- VS Code's "Format Document" feature will automatically add parentheses around multi-line returns
- Think of each component as a **single responsibility unit** — it does one thing and does it well
