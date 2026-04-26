# Running a First Test

## Introduction

Theory is great, but let's get our hands dirty. In this section, you'll see how an actual test file looks, how to run it, and what happens when a test passes — and when it fails. By the end, you'll understand the full cycle of writing, running, and interpreting test results.

---

### Concept 1: The Default Test File

#### 🧠 What is it?

When you create a new React project with Create React App, it includes an `App.test.js` file with a sample test already written. This file tests the default `App` component.

#### ⚙️ How it works

Here's what the default test looks like:

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

Let's break this down:

1. **`render(<App />)`** — Renders the `App` component into a virtual DOM
2. **`screen.getByText(/learn react/i)`** — Searches the rendered output for an element containing "learn react" (case-insensitive, using a regex)
3. **`expect(linkElement).toBeInTheDocument()`** — Asserts that the element was actually found

#### 💡 Insight

The naming convention is important: your test file should match your component file but with `.test.js` appended. So `App.js` gets `App.test.js`, `Greeting.js` gets `Greeting.test.js`. This helps Jest automatically discover your tests.

---

### Concept 2: The `test()` Function

#### 🧠 What is it?

The `test()` function is the fundamental building block of every test. It's globally available — no import needed.

#### ⚙️ How it works

```javascript
test('description of what this test checks', () => {
  // Your testing code goes here
});
```

- **First argument:** A string description — this shows up in your test output and helps you identify which test passed or failed
- **Second argument:** An anonymous function containing the actual test logic

#### 💡 Insight

Write your test descriptions as clear, readable sentences: *"renders Hello World as a text"*, *"shows error message when API fails"*. When you have 100+ tests, these descriptions are your roadmap.

---

### Concept 3: Running Tests with `npm test`

#### 🧠 What is it?

Just like `npm start` starts your development server, `npm test` starts the test runner.

#### ⚙️ How it works

1. Open your terminal
2. Run `npm test`
3. Press `a` to run all tests
4. Jest finds all `.test.js` files and executes the tests inside them
5. You see the results: green checkmarks ✅ for passes, red crosses ❌ for failures

The test runner **watches your files** by default. When you save a change, it automatically re-runs the affected tests. No need to restart it.

#### 🧪 Example

```
PASS  src/App.test.js
  ✓ renders learn react link (30 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

#### 💡 Insight

This watch mode is incredibly productive — you write code, save, and instantly see if your tests still pass. It's a tight feedback loop that catches issues in real time.

---

### Concept 4: What Happens When a Test Fails

#### 🧠 What is it?

When a test fails, Jest gives you detailed information about *what* went wrong, *where* it went wrong, and *why*.

#### ⚙️ How it works

If you change the text in `App.js` from "Learn React" to "Learn More", the test that looks for "learn react" will fail:

```
FAIL  src/App.test.js
  ✗ renders learn react link

    Unable to find an element with the text: /learn react/i
    
    <body>
      <div>
        <a href="https://reactjs.org">Learn More</a>
      </div>
    </body>
```

You see:
- ❌ Which test failed and its description
- The actual rendered content where it tried to find the text
- The specific line in your test code that caused the failure

#### 💡 Insight

This is the beauty of testing — it tells you **exactly** what broke. As a developer, you then decide: should you fix the code, or should you update the test? In this case, if you intentionally changed "Learn React" to "Learn More", you'd update the test to match.

---

## ✅ Key Takeaways

- Test files follow the naming convention `ComponentName.test.js`
- The `test()` function takes a description string and a function with your test logic
- Run tests with `npm test` — it watches for changes and re-runs automatically
- Passing tests show green checkmarks; failing tests show red crosses with detailed error info
- When a test fails, you decide: fix the code or update the test

## ⚠️ Common Mistakes

- Forgetting to press `a` to run all tests when the runner starts
- Panicking when a test fails — read the error message carefully, it tells you exactly what's wrong
- Not having at least one test in a test file — Jest will error on empty test files

## 💡 Pro Tips

- Use `Ctrl+C` to stop the test runner when you don't need it
- The test runner only re-runs tests related to changed files by default — press `a` to run everything
- Keep the test runner open in a separate terminal while you code for instant feedback
