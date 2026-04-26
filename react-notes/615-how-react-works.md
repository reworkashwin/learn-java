# How React Works

## Introduction

We've seen JSX and know that React uses a declarative approach. But how does it all come together? How does React actually take your component code and turn it into something visible on the screen? Let's connect the dots.

---

### Concept 1: The Desired End State

#### 🧠 What is it?

When you write JSX inside a component, you're defining the **desired target state** of the UI — what you want the user to see. React's job is to take that desired state and make it real on the screen.

#### 🧪 Example

```jsx
function App() {
  return (
    <div>
      <h2>Let's get started!</h2>
      <p>This is also visible</p>
    </div>
  );
}
```

This says: "I want a div containing an h2 and a paragraph." React handles creating the actual DOM elements and inserting them into the page.

---

### Concept 2: Declarative vs. Imperative — A Direct Comparison

#### ⚙️ How it works

**Imperative (Vanilla JavaScript):**
```javascript
const root = document.getElementById('root');
const paragraph = document.createElement('p');
paragraph.textContent = 'This is also visible';
root.appendChild(paragraph);
```

You have to:
1. Select the target element
2. Create a new element
3. Set its content
4. Manually append it to the DOM

**Declarative (React):**
```jsx
return (
  <div>
    <h2>Let's get started!</h2>
    <p>This is also visible</p>
  </div>
);
```

You just describe the end result. React generates all those imperative DOM instructions behind the scenes.

#### 💡 Insight

For a simple paragraph, the imperative approach doesn't seem so bad. But imagine a complex UI with dozens or hundreds of elements that appear, disappear, and update based on user interactions. Writing all those step-by-step DOM instructions would be a nightmare. React's declarative approach scales beautifully.

---

### Concept 3: Components as Custom HTML Elements

#### 🧠 What is it?

Every component you build in React acts like a **custom HTML element**. Just like `<div>`, `<h2>`, or `<p>` are built-in HTML elements, `<App />` and `<ExpenseItem />` are your own custom elements.

#### ⚙️ How it works

In `index.js`:
```jsx
root.render(<App />);
```

This tells React: "Render the App component (our custom HTML element) inside the root div."

React then looks at the `App` function, calls it, gets the returned JSX, and renders that content to the screen.

---

### Concept 4: Live Reloading

#### 🧠 What is it?

When you save a file in your React project, the development server **automatically detects the change** and updates what you see in the browser — no manual refresh needed.

#### ⚙️ How it works

1. You edit `App.js` and add a new paragraph
2. You save the file
3. The `npm start` process detects the change
4. It re-transforms your code and pushes the update to the browser
5. The browser updates instantly

#### 💡 Insight

This rapid feedback loop is invaluable for development. You can make a change, save, and immediately see the result — making it easy to iterate and experiment.

---

## ✅ Key Takeaways

- React takes your JSX (desired end state) and generates the actual DOM instructions
- You describe *what* you want, not *how* to get there — that's the declarative approach
- Components act like custom HTML elements that you compose together
- The imperative approach (vanilla JS) requires step-by-step DOM manipulation — React abstracts this away
- Live reloading gives you instant feedback as you code

---

## 💡 Pro Tips

- Always think in terms of "what should the UI look like right now?" rather than "what steps do I need to take?"
- When React starts to feel like magic, remember: it's just generating the same `createElement` and `appendChild` calls you'd write manually — but doing it smarter and faster
