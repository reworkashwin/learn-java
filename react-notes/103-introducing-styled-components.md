# Introducing "Styled Components" (Third-party Package)

## Introduction

So far, every styling approach we've looked at keeps CSS in separate files. **Styled Components** takes a radically different approach: you write your CSS *inside your JavaScript files*, attached to components that are created specifically for styling. It's one of the most popular CSS-in-JS libraries in the React ecosystem.

---

## What Are Styled Components?

Styled Components is a third-party package that lets you create React components with styles baked into them. Instead of applying CSS classes to elements, you create *new components* that inherently carry their styles.

The core idea: **your styles live in the same file as your component logic, but outside the JSX.**

---

## Installation

```bash
npm install styled-components
```

After installing, restart your development server.

---

## Creating Your First Styled Component

### The Syntax

```jsx
import styled from 'styled-components';

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;
```

Let's break this down:

1. **`styled`** — An object imported from the package, with properties for every HTML element (`styled.div`, `styled.p`, `styled.h1`, `styled.button`, etc.)

2. **`styled.div`** — Creates a component that renders a `<div>` under the hood

3. **The backticks** — These are **tagged template literals**, a JavaScript feature (not React-specific). The backticks define a template string that gets passed to the `styled.div` function

4. **CSS inside the backticks** — Write standard CSS syntax. No camelCase needed, no quotes around values—just regular CSS

### Tagged Template Literals

If you haven't seen this syntax before, don't worry. It's a vanilla JavaScript feature:

```js
// A tagged template is like calling a function with a template literal
styled.div`...css...`
// is conceptually similar to
styled.div(`...css...`)
```

The key difference is that tagged templates can process the string in special ways—which is exactly what Styled Components does to extract your CSS.

---

## Using a Styled Component

The result is a regular React component that you can use like any other:

```jsx
// Instead of:
<div className="controls">
  {/* children */}
</div>

// You write:
<ControlContainer>
  {/* children */}
</ControlContainer>
```

The styled component:
- Renders the underlying HTML element (a `<div>` in this case)
- Applies the CSS styles you defined
- Supports the `children` prop (so you can wrap other elements)
- **Forwards all other props** to the underlying element

---

## How It Works Under the Hood

When you use a styled component, the package:
1. Generates a unique CSS class name (like `sc-bczRLJ`)
2. Creates a CSS rule with that class containing your styles
3. Injects that rule into the `<head>` of the document
4. Applies the generated class to the rendered element

If you inspect the DOM, you'll see:

```html
<div class="sc-bczRLJ gKaMLp">
  <!-- children -->
</div>
```

And in the `<head>`:

```html
<style>
  .gKaMLp {
    display: flex;
    flex-direction: column;
    /* ... */
  }
</style>
```

This is similar to how CSS Modules work—but managed entirely by JavaScript at runtime.

---

## Where to Define Styled Components

You can define them in the same file as the component that uses them:

```jsx
// AuthInputs.jsx
import styled from 'styled-components';

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export default function AuthInputs() {
  return (
    <ControlContainer>
      {/* form fields */}
    </ControlContainer>
  );
}
```

If you reuse a styled component across multiple files, move it to its own file and export it.

---

## ✅ Key Takeaways

- Styled Components creates React components with CSS built into them
- Use `styled.element` + backticks (tagged template literals) to define styles
- Write standard CSS syntax inside the backticks—no camelCase conversion needed
- Under the hood, unique class names are generated and injected into the page
- You can mix Styled Components with other styling approaches in the same project

## ⚠️ Common Mistakes

- Using single quotes instead of backticks—tagged templates require **backticks** (`` ` ``)
- Forgetting to import `styled` from `styled-components`
- Not restarting the dev server after installing the package

## 💡 Pro Tips

- Define styled components **outside** your component function (at the top of the file)—they don't need access to state or props (props are handled differently, as you'll learn)
- Name styled components with capital letters since they are React components: `ControlContainer`, not `controlContainer`
- Styled Components automatically handles vendor prefixing for cross-browser compatibility
