# React Code Is Written in a Declarative Way

## Introduction

We know that React is all about components, and that components are built with HTML, CSS, and JavaScript. But *how* exactly does React let you define those components? The answer lies in a fundamental principle: React uses a **declarative approach**. Understanding this is key to thinking in React and writing effective React code.

---

### Concept 1: Components = HTML + CSS + JavaScript

#### 🧠 What is it?

Every React component is a combination of:
- **HTML** — defines the structure (what elements appear)
- **JavaScript** — defines the logic (what happens when a user interacts)
- **CSS** — defines the styling (how it looks)

That said, while CSS matters, **React's primary focus is on combining HTML and JavaScript**. CSS is more of a companion — React doesn't have a strong opinion about how you style things.

#### 💡 Insight

React allows you to create **custom HTML elements** — your own components — and compose them together to build the full UI.

---

### Concept 2: The Declarative Approach

#### 🧠 What is it?

React uses a **declarative** approach for building components. This means you **define the desired end state** of your UI, and React figures out how to get there.

You don't tell React *step by step* what to do. You just describe *what* you want the result to look like.

#### ❓ Why do we need it?

Compare it to the alternative — the **imperative** approach:

**Imperative (Vanilla JavaScript):**
```javascript
// Step 1: Select the root element
const root = document.getElementById('root');
// Step 2: Create a paragraph element
const paragraph = document.createElement('p');
// Step 3: Set its text
paragraph.textContent = 'This is also visible';
// Step 4: Append it to the DOM
root.appendChild(paragraph);
```

**Declarative (React):**
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

With the imperative approach, you write **step-by-step DOM manipulation instructions**. With the declarative approach, you just **describe the desired result** and React handles the rest.

#### ⚙️ How it works

1. You define the **target state** of your UI in your component
2. You can define **different target states** based on conditions (e.g., loading, error, success)
3. React compares your desired state with what's currently on screen
4. React **generates and runs the actual DOM instructions** to update the page

You never write `createElement`, `appendChild`, or `removeChild` yourself — React does it all behind the scenes.

#### 💡 Insight

Imagine ordering food at a restaurant. The **declarative** approach is telling the waiter "I'd like a margherita pizza." The **imperative** approach is going into the kitchen and saying "First, knead the dough. Then spread the sauce. Then add cheese. Then put it in the oven at 450°F for 12 minutes." You just want the pizza — React is the kitchen that figures out how to make it.

---

### Concept 3: Reactive Components

#### 🧠 What is it?

React components are not just reusable — they're **reactive**. This means when the underlying data changes, the component automatically re-evaluates and updates the UI to reflect the new state.

#### ⚙️ How it works

- You define what the UI should look like for any given state
- When state changes, React re-renders the component
- React efficiently determines what actually changed and updates only those parts of the DOM

#### 💡 Insight

This is where React gets its name — it **reacts** to data changes. You'll see this in action later when you learn about state management.

---

## ✅ Key Takeaways

- React components combine HTML and JavaScript (with CSS as a bonus)
- React uses a **declarative approach** — you define the end state, not the step-by-step instructions
- This is the opposite of the **imperative approach** used in vanilla JavaScript
- React figures out what DOM updates are needed and performs them for you
- Components are **reactive** — they update automatically when data changes

---

## ⚠️ Common Mistakes

- Trying to manually manipulate the DOM in React — let React handle it
- Confusing declarative with "doing nothing" — you still define the UI, you just don't write the update logic
- Thinking React is magic — it's not; it's a well-engineered abstraction over DOM manipulation

---

## 💡 Pro Tips

- When writing React code, always think: "What should this look like?" not "What steps do I need to take?"
- The declarative mindset is a shift if you're coming from vanilla JavaScript — embrace it, and your code will be simpler and less error-prone
