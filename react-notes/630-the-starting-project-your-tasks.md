# The Starting Project & Your Tasks

## Introduction

Here's the setup: you have a starting React project with a single `App` component containing all the code. Your job is to take this raw starting point and transform it into a well-structured, component-based application. Let's break down what you're working with and what you need to do.

---

## Concept 1: Understanding the Starting Project

### 🧠 What is it?

The starting project contains:
- A `src/` folder with an `App.js` file that has one large component
- An `assets/images/` folder with an image used in the header
- The `App` component includes a header section and an array of concept data (objects with titles, descriptions, and images)

### ⚙️ How it's structured

```jsx
// App.js (simplified view)
import conceptImage from './assets/images/concept.png';

const concepts = [
  { title: 'Components', description: '...', image: '...' },
  { title: 'Props', description: '...', image: '...' },
  { title: 'State', description: '...', image: '...' },
];

function App() {
  return (
    <div>
      <header>
        <img src={conceptImage} alt="..." />
        <h1>Key React Concepts</h1>
        <p>...</p>
      </header>
      {/* Concepts should be output here */}
    </div>
  );
}
```

The data is there. The concepts array is defined. But nothing is being rendered from it yet.

### 💡 Insight

Notice the image import syntax: `import conceptImage from './assets/images/concept.png'`. This is a React project feature — the build tool handles it, letting you use the imported value as a `src` attribute.

---

## Concept 2: Your Three Tasks

### Task 1: Output the Concept Data

Take the `concepts` array and render each item on the screen. Don't copy-paste the text — use dynamic rendering.

### Task 2: Identify Possible Components

Look at the JSX in `App.js` and ask: what sections could be their own components? The header? Each concept card? The concepts list?

### Task 3: Create and Use Custom Components

Build separate component files, pass data via props, and compose them together in the App component.

### ⚙️ Hints

- You'll need to iterate over the `concepts` array to output each item (think about JavaScript's `.map()` method)
- Each concept could be its own component that receives data via props
- The header section could be extracted into a `Header` component
- Remember to export your components and import them where needed

---

## Concept 3: The Approach

### 💡 How to tackle this

1. **Start by outputting the data** — get something on screen first
2. **Then refactor** — extract pieces into components
3. **Wire up props** — pass the data into your new components
4. **Style it** — add CSS to match the desired look

### ⚠️ Common Mistakes

- Jumping straight to creating components before understanding the data structure
- Forgetting to pass required props to child components
- Not exporting components from their files

---

## ✅ Key Takeaways

- Start with a working monolith, then split into components — that's a valid approach
- The `.map()` method is your friend for rendering arrays of data
- Try solving the tasks yourself before watching the solution
- This exercise reinforces: components, props, composition, and dynamic data output

## 💡 Pro Tips

- Don't overthink the component structure — there's no single "right" answer
- If you get stuck, revisit the previous lectures on props and component creation
- The real value is in the struggle — even if your solution differs from the instructor's, that's fine
