# Creating & Using a Custom Component

## Introduction

Now it's time to get hands-on and actually **create** a custom component. We'll start with the header — extracting it from `App.js` into its own file, importing it, and using it as a JSX element. This walks through the complete lifecycle of building a component: create the file, write the function, export it, import it, and render it.

---

## Concept 1: Creating a Component File

### 🧠 What is it?

A React component is just a **JavaScript function** that returns JSX. To create one, you make a new file, define the function, and export it so other files can use it.

### ❓ Why do we need it?

Keeping all your UI in a single file makes it hard to manage. By putting the header into its own file, `App.js` becomes cleaner, and the header logic is isolated and easy to find.

### ⚙️ How it works

1. Create a `components` folder inside `src` (common convention, not required).
2. Inside that, create a subfolder for your component — e.g., `header/`.
3. Add a `Header.js` file in that folder.
4. Define a function named `Header` (uppercase first letter — required for custom components).
5. Export it as the default export.

### 🧪 Example

```jsx
// src/components/header/Header.js
import keyConceptsImage from '../../assets/images/key-concepts.png';

function Header() {
  return (
    <header>
      <img src={keyConceptsImage} alt="Key Concepts" />
      <h1>Key React Concepts</h1>
    </header>
  );
}

export default Header;
```

### 💡 Insight

The folder structure (`components/header/Header.js`) is entirely up to you. Some developers use flat structures, some nest by feature. The key is consistency across your project.

---

## Concept 2: Importing and Using the Component

### 🧠 What is it?

Once a component is defined and exported, you **import** it into the file where you want to use it. Then you render it in JSX just like you would an HTML element — but with an uppercase name.

### ❓ Why do we need it?

React needs to know about your component before it can render it. The import statement wires the component function into the file that uses it. The uppercase naming tells React this is a **custom component**, not a built-in HTML element.

### ⚙️ How it works

1. In `App.js`, add an import statement pointing to the component file.
2. Use the component in your JSX like a self-closing tag (if it takes no children).
3. React will call the component function and render whatever JSX it returns.

### 🧪 Example

```jsx
// App.js
import Header from './components/header/Header';

function App() {
  return (
    <div>
      <Header />
      {/* rest of the app */}
    </div>
  );
}
```

### 💡 Insight

Notice we use `<Header />` as a **self-closing** tag because we're not passing any content between opening and closing tags. If the header doesn't need props (it's not reused elsewhere, so no configuration needed), we simply render it with no attributes.

---

## Concept 3: Fixing Import Paths After Moving Code

### 🧠 What is it?

When you move code (like an image import) from one file to another, the **relative import path** may break because the new file is in a different directory.

### ❓ Why do we need it?

A common gotcha when extracting components: the path that worked in `App.js` won't work in `components/header/Header.js` because the file is now nested deeper. You need to adjust the path to navigate up the correct number of directories.

### ⚙️ How it works

- `./` means "current directory"
- `../` means "go up one level"
- If your component is in `src/components/header/`, you need `../../` to get back to `src/`, and then navigate into `assets/images/`.

### 🧪 Example

```jsx
// Before (in App.js, which is in src/):
import image from './assets/images/key-concepts.png';

// After (in src/components/header/Header.js):
import image from '../../assets/images/key-concepts.png';
```

### 💡 Insight

This is one of the most common errors when refactoring components. If you see an "image not found" or "module not found" error after extracting a component, **check your relative paths first**. Most IDEs will even help auto-update these for you.

---

## ✅ Key Takeaways

- A component is a function that returns JSX — create it, export it, import it, use it
- Component names must start with an **uppercase letter** to distinguish them from built-in HTML elements
- In React projects, you can (and should) **omit the `.js` file extension** in import paths
- When moving code to a new file, always verify that **relative import paths** are still correct

## ⚠️ Common Mistakes

- Forgetting to start the component name with an uppercase letter — React will treat it as a built-in HTML element and it won't work
- Not updating import paths after moving code to a different directory level
- Forgetting to export the component — you'll get an import error

## 💡 Pro Tips

- Use your IDE's auto-import feature to avoid path typos
- If a component doesn't accept props, you can skip the `props` parameter entirely
- Keep related files together (component + its CSS) in the same folder for easy navigation
