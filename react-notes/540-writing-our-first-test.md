# Writing Our First Test

## Introduction

You've seen the default test that ships with Create React App. Now it's time to write your own test from scratch. This is where you'll learn the **Three A's** pattern — the standard approach for structuring any test — and see how to use `render`, `screen`, and `expect` to test a custom component.

---

### Concept 1: Creating a Component to Test

#### 🧠 What is it?

Before writing tests, you need something to test. Here, we create a simple `Greeting` component with static output.

#### ⚙️ How it works

```javascript
// components/Greeting.js
function Greeting() {
  return (
    <div>
      <h2>Hello World!</h2>
      <p>It's good to see you.</p>
    </div>
  );
}

export default Greeting;
```

Then use it in `App.js`:

```javascript
import Greeting from './components/Greeting';

function App() {
  return <Greeting />;
}
```

#### 💡 Insight

Always create your test file **next to** the component you're testing. If the component is `Greeting.js`, the test should be `Greeting.test.js` in the same folder. This convention keeps tests close to the code they verify.

---

### Concept 2: The Three A's — Arrange, Act, Assert

#### 🧠 What is it?

The **Three A's** is a pattern for structuring every test you write:
1. **Arrange** — Set up the test (render the component, prepare data)
2. **Act** — Perform the action you want to test (click a button, type input)
3. **Assert** — Check the result (is the expected output on screen?)

#### ❓ Why do we need it?

It gives you a consistent, logical structure for every test. No matter how complex the test, the Three A's keep it organized and readable.

#### ⚙️ How it works

```javascript
test('renders Hello World! as a text', () => {
  // Arrange
  render(<Greeting />);

  // Act
  // ... nothing in this case

  // Assert
  const helloWorldElement = screen.getByText('Hello World!');
  expect(helloWorldElement).toBeInTheDocument();
});
```

- **Arrange:** Render the `Greeting` component
- **Act:** Nothing — we're just testing static output
- **Assert:** Find an element with "Hello World!" and verify it exists

#### 💡 Insight

Not every test needs all three A's. For static components, "Act" might be empty. For components with user interaction, "Act" is where you simulate clicks or input. But always think in terms of these three steps.

---

### Concept 3: Key Imports — `render`, `screen`, and `expect`

#### 🧠 What is it?

These are the three core tools you'll use in virtually every test.

#### ⚙️ How it works

| Tool | Source | Purpose |
|------|--------|---------|
| `render` | `@testing-library/react` | Renders a component into a virtual DOM |
| `screen` | `@testing-library/react` | Gives access to the rendered output for querying |
| `expect` | Global (from Jest) | Creates assertions about expected results |
| `test` | Global (from Jest) | Defines a test |

```javascript
import { render, screen } from '@testing-library/react';
```

`expect` and `test` are globally available — no import needed.

---

### Concept 4: Querying the Screen

#### 🧠 What is it?

`screen` provides methods to find elements in the rendered output. There are three families of query methods, each with different behavior.

#### ⚙️ How it works

| Method Family | Returns | Error if not found? | Returns Promise? |
|---------------|---------|---------------------|------------------|
| `getBy...` | Element | ✅ Yes, throws error | No |
| `queryBy...` | Element or `null` | ❌ No | No |
| `findBy...` | Element | ✅ Yes, throws error | ✅ Yes (async) |

Common query types:
- `getByText('Hello World!')` — find by visible text
- `getByRole('button')` — find by ARIA role
- `getByText('hello', { exact: false })` — case-insensitive, substring match

#### 🧪 Example

```javascript
// Exact match (default)
screen.getByText('Hello World!');

// Case-insensitive with regex
screen.getByText(/hello world/i);

// Substring match
screen.getByText('hello', { exact: false });
```

#### 💡 Insight

Use `getBy...` when you expect the element to be there. Use `queryBy...` when you want to check that something is *not* there (since it returns `null` instead of throwing). Use `findBy...` for elements that appear asynchronously.

---

### Concept 5: Making Assertions with `expect`

#### 🧠 What is it?

`expect()` is how you express *what should be true* about your test result. You pass it a value and chain a **matcher** method.

#### ⚙️ How it works

```javascript
expect(element).toBeInTheDocument();     // Element exists in the DOM
expect(element).not.toBeInTheDocument(); // Element does NOT exist
expect(value).toBe(5);                   // Value equals 5
expect(array).toHaveLength(3);           // Array has 3 items
```

#### 💡 Insight

The `.not` modifier is powerful — it lets you assert the opposite of any matcher. And there are dozens of matchers available in Jest and `@testing-library/jest-dom`. You'll discover more as you write more tests.

---

## ✅ Key Takeaways

- Structure every test with the **Three A's: Arrange, Act, Assert**
- Use `render()` to render components and `screen` to query the output
- `getByText` throws if the element isn't found; `queryByText` returns null — choose based on your assertion
- Use `expect()` with matchers like `.toBeInTheDocument()` to make assertions
- Name your test files `ComponentName.test.js` and place them next to the component

## ⚠️ Common Mistakes

- Forgetting that `getByText` does an **exact match** by default — pass `{ exact: false }` for flexible matching
- Using `getByText` when checking that something is *absent* — use `queryByText` instead (it won't throw)
- Not importing `render` and `screen` from `@testing-library/react`

## 💡 Pro Tips

- Comment `// Arrange`, `// Act`, `// Assert` in your tests while learning — it builds good habits
- Delete the default `App.test.js` if you're not using it — an empty test file causes errors
- Explore all available matchers at the [jest-dom documentation](https://github.com/testing-library/jest-dom)
