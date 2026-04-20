# Adding a Header Component

## Introduction

Let's start building the Investment Calculator. The first step is simple but important: creating a **Header component**. This is a great warm-up because it covers component creation, image imports, and CSS styling via IDs — all patterns you already know.

---

## Creating the Components Folder

### ⚙️ Project Organization

First, create a `components/` folder inside `src/`. This keeps your component files organized and separate from utility files, assets, and the root `App` component.

```
src/
├── components/
│   └── Header.jsx
├── assets/
│   └── investment-calculator.png
├── util/
│   └── investment.js
├── App.jsx
└── index.css
```

---

## Building the Header Component

### ⚙️ The Component

```jsx
import logo from '../assets/investment-calculator.png';

export default function Header() {
  return (
    <header id="header">
      <img src={logo} alt="Logo showing a money bag" />
      <h1>Investment Calculator</h1>
    </header>
  );
}
```

Let's walk through each piece:

### 🧪 Importing the Image

```jsx
import logo from '../assets/investment-calculator.png';
```

- We import the image as a JavaScript module — the build tool (Vite) handles this
- The `logo` variable will contain the resolved path to the image
- We go up one level (`../`) because `Header.jsx` is in `components/`, and `assets/` is a sibling directory

### 🧪 Using the Image

```jsx
<img src={logo} alt="Logo showing a money bag" />
```

- `src={logo}` — We use curly braces because `logo` is a JavaScript expression (the imported image)
- `alt` — Always include meaningful alt text for accessibility

### 🧪 Styling with an ID

```jsx
<header id="header">
```

The `id="header"` connects this element to CSS styles defined in `index.css`. If you look at the CSS file, you'll find rules targeting `#header` that style the header's layout, spacing, and appearance.

---

## Using the Header in App

### ⚙️ Importing and Rendering

```jsx
import Header from './components/Header.jsx';

function App() {
  return <Header />;
}

export default App;
```

At this stage, the app just shows the header. We'll add more components below it in the coming lessons.

---

## A Note on Static Components

This Header component is **entirely static** — no state, no props, no interactivity. You might wonder: why not just put this HTML in `index.html`?

You absolutely could. But keeping it as a React component:
- Maintains consistency (everything in React)
- Makes it easy to add dynamic features later if needed
- Keeps `index.html` clean and minimal

---

## ✅ Key Takeaways

- Create a `components/` folder to organize your component files
- Import images as modules and use them as dynamic values in `src` attributes
- Use `id` props to connect elements to CSS styles defined in a stylesheet
- Even static, non-interactive UI pieces can be useful as components for organization

## ⚠️ Common Mistakes

- Getting the import path wrong — remember to navigate relative to the current file's location (`../` to go up)
- Forgetting `.jsx` in the import path (some setups require it, some don't)
- Using `className` when you mean `id` — they target different CSS selectors (`#` vs `.`)

## 💡 Pro Tips

- Always check the CSS file for available IDs and class names before adding your own
- Alt text should describe what the image shows, not what it is (e.g., "Logo showing a money bag" vs. just "logo")
- Starting with a simple component like this builds momentum — get something visible on screen first, then iterate
