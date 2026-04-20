# JSX & React Components

## Introduction

You've got your starting React project up and running — but have you looked at the actual HTML file? If you open `index.html`, you'll notice it's almost empty. There's no image, no title, no visible content in the markup. So where does all of that come from?

The answer: **React is rendering everything onto the screen.** And to understand how, we need to understand two foundational concepts — **JSX** and **React Components**.

---

## What Happens When You Open the Project?

When you look at your project structure, you'll find:

- An `index.html` file — nearly empty
- A `src/` folder with `.jsx` files

The `index.html` file does one critical thing: it loads a JavaScript file — `index.jsx`.

That `index.jsx` file doesn't contain the visible markup either. Instead, it **imports** something from another file: `App.jsx`.

And *that* file — `App.jsx` — finally contains the markup for everything you see on screen.

But wait... if you look closely, you'll notice something unusual: **HTML code sitting inside a JavaScript function**. How is that possible?

---

## What is JSX?

JSX stands for **JavaScript Syntax Extension**. It's a special syntax that lets you write HTML-like markup directly inside JavaScript files.

Think of it this way:

> JSX = JavaScript + HTML superpowers 🦸

Since React is all about **describing and creating user interfaces**, being able to write HTML inside JavaScript is incredibly useful. You describe *what* the UI should look like, and React takes care of rendering it.

### But Browsers Don't Understand JSX

Here's the catch — **browsers cannot read JSX**. So how does it work?

Behind the scenes, a **development server** (like Vite or Webpack) **transforms** your JSX code into regular JavaScript that browsers *can* understand. As a developer, you write the convenient JSX syntax, and the build process handles the rest.

> You write JSX → The build tool transforms it → The browser gets standard JavaScript

---

## What is a React Component?

Now here's the truly important part: what you see in `App.jsx` is a **React Component**.

A React Component is simply a **JavaScript function** that follows two rules:

1. **The function name must start with an uppercase character** (e.g., `App`, `Header`, `Dashboard`)
2. **The function must return a renderable value** — typically JSX code (the HTML markup to display)

```jsx
function App() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  );
}
```

That's it. That's a component.

### Why Uppercase?

React uses the casing to distinguish between **built-in HTML elements** (lowercase: `div`, `h1`, `img`) and **custom components** (uppercase: `App`, `Header`). If you name your component `header` (lowercase), React will think you're trying to use the built-in HTML `<header>` element.

---

## Putting It All Together

Here's the flow:

1. `index.html` loads `index.jsx`
2. `index.jsx` imports the `App` component from `App.jsx`
3. `App.jsx` exports a function that returns JSX
4. React renders the JSX to the screen

---

## ✅ Key Takeaways

- **JSX** is a syntax extension that lets you write HTML inside JavaScript
- Browsers can't read JSX — a build process transforms it first
- A **React Component** is just a JavaScript function that returns JSX
- Component names **must start with an uppercase letter**
- The `.jsx` file extension signals that the file contains JSX syntax

## ⚠️ Common Mistakes

- Naming a component with a lowercase letter (e.g., `function app()`) — React won't treat it as a custom component
- Thinking the HTML in your `index.html` is what gets displayed — React replaces it
- Forgetting that JSX code needs a build process to work in the browser

## 💡 Pro Tips

- Think of components as **custom HTML elements** that you build yourself
- Every React app starts with at least one root component (usually `App`)
- Get comfortable with the idea that "everything is a component" — it's the core mental model of React
