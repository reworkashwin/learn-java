# Getting Started with a User Input Component

## Introduction

The Investment Calculator needs user input — four numeric values that drive the calculation. This lesson covers building the `UserInput` component, setting up the input fields, and managing state for all four values. You'll see how to choose between **separate states** and a **single object state**.

---

## Component Design

### 🧠 Why a Separate Component?

Getting user input is a distinct feature of the app, separate from displaying results or showing the header. Following the **single responsibility principle**, we give it its own component.

### ⚙️ The Four Inputs We Need

| Input | Description | Default Value |
|---|---|---|
| Initial Investment | Starting amount | $10,000 |
| Annual Investment | Yearly contribution | $1,200 |
| Expected Return | Annual return rate (%) | 6 |
| Duration | Years to invest | 10 |

---

## Building the Component Structure

### ⚙️ The JSX Layout

```jsx
export default function UserInput() {
  return (
    <section id="user-input">
      <div className="input-group">
        <p>
          <label>Initial Investment</label>
          <input type="number" required />
        </p>
        <p>
          <label>Annual Investment</label>
          <input type="number" required />
        </p>
      </div>
      <div className="input-group">
        <p>
          <label>Expected Return</label>
          <input type="number" required />
        </p>
        <p>
          <label>Duration</label>
          <input type="number" required />
        </p>
      </div>
    </section>
  );
}
```

Key structural choices:

- **`id="user-input"`** — Connects to CSS styles for the section
- **`className="input-group"`** — Groups two inputs per row (CSS makes them side-by-side)
- **`type="number"`** — Shows a numeric input with increment/decrement arrows
- **`required`** — Ensures the field can't be empty (HTML validation)

### ❓ Why Not a `<form>` Element?

We could use a `<form>`, but form handling in React deserves its own deep dive (covered later in the course). For now, a `<section>` with individual inputs and onChange handlers works perfectly.

---

## Managing State: One Object vs. Multiple States

### 🧠 Two Approaches

**Option A: Four separate states**
```jsx
const [initialInvestment, setInitialInvestment] = useState(10000);
const [annualInvestment, setAnnualInvestment] = useState(1200);
const [expectedReturn, setExpectedReturn] = useState(6);
const [duration, setDuration] = useState(10);
```

**Option B: One state object**
```jsx
const [userInput, setUserInput] = useState({
  initialInvestment: 10000,
  annualInvestment: 1200,
  expectedReturn: 6,
  duration: 10,
});
```

Both work. **Option B** is often preferred when the values are related and usually passed around together.

---

## Using the Component in App

### ⚙️ Importing and Rendering

```jsx
import Header from './components/Header.jsx';
import UserInput from './components/UserInput.jsx';

function App() {
  return (
    <>
      <Header />
      <UserInput />
    </>
  );
}
```

Notice the **React Fragment** (`<> ... </>`). Since we now have two sibling elements (`Header` and `UserInput`), we need a single root element. Fragments let us do this without adding an extra DOM node.

---

## ✅ Key Takeaways

- Group related inputs into a dedicated component with clear responsibility
- Choose between multiple states and a single object state based on how related the values are
- Use `type="number"` for numeric inputs and `required` for validation
- CSS IDs and class names from the stylesheet dictate your element structure
- Use React Fragments (`<>...</>`) when you need to return sibling elements

## ⚠️ Common Mistakes

- Forgetting `className` (not `class`) for CSS classes in JSX
- Not wrapping sibling elements in a Fragment or container element
- Using `required` as `required={true}` — just `required` is sufficient (though both work)

## 💡 Pro Tips

- When inputs are always used together (like our four investment parameters), a single object state is cleaner
- The `input-group` CSS class approach is a common UI pattern — group related fields visually using CSS rather than JavaScript
- Setting sensible default values in state saves users from starting with empty fields
