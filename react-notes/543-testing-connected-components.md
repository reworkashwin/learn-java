# Testing Connected Components

## Introduction

Real React apps aren't made of isolated components — they're built from **trees of components** that render each other. A `Greeting` component might render an `Output` component, which renders a `<p>` tag. So when you write tests, an important question arises: do your tests still work when components are nested? The answer — and the insight behind it — is the subject of this section.

---

### Concept 1: Components Using Other Components

#### 🧠 What is it?

In real applications, components frequently render other components. A parent might use a child component as a wrapper or for reusable UI patterns — like a `Card` component or an `Output` component that just wraps content in a styled `<p>` tag.

#### ⚙️ How it works

```javascript
// Output.js
function Output(props) {
  return <p>{props.children}</p>;
}
export default Output;
```

```javascript
// Greeting.js
import Output from './Output';

function Greeting() {
  return (
    <div>
      <h2>Hello World!</h2>
      <Output>It's good to see you.</Output>
    </div>
  );
}
```

Instead of using `<p>` directly, `Greeting` now renders `<Output>` — which internally renders the `<p>`.

---

### Concept 2: `render()` Renders the Full Component Tree

#### 🧠 What is it?

When you call `render(<Greeting />)` in your test, React Testing Library doesn't just render the `Greeting` component — it renders the **entire component tree** that `Greeting` produces, including all child components.

#### ❓ Why does this matter?

It means your existing tests **continue to work** without any changes, even after you refactor `Greeting` to use `Output`. The tests don't care about the internal structure — they care about what's on screen.

#### ⚙️ How it works

```javascript
test('renders Hello World! as a text', () => {
  render(<Greeting />);
  const element = screen.getByText('Hello World!');
  expect(element).toBeInTheDocument();
});
```

This test still passes, even though "It's good to see you." is now rendered by `Output`, not directly by `Greeting`. The rendered DOM is the same — only the component hierarchy changed.

#### 💡 Insight

This is one of the big wins of React Testing Library's approach. Because tests query the **rendered output** (what users see) rather than the component internals, refactoring your component structure doesn't break your tests. That's exactly what you want.

---

### Concept 3: Unit Test vs. Integration Test — The Blurry Line

#### 🧠 What is it?

Technically, when you test `Greeting` and it renders `Output`, you're testing **two components together**. That makes it an integration test, not a pure unit test.

#### ❓ Why does this matter?

In practice, for simple wrapper components that don't have their own logic, this distinction doesn't really matter. You don't need to split your tests. But if the child component has its own state and complex behavior, you might want to test it separately.

#### ⚙️ How it works

- **Wrapper components** (like `Output`) → Test them as part of the parent. No separate tests needed.
- **Complex child components** (with their own state/logic) → Test them independently in their own `.test.js` file, AND test the integration in the parent's test file.

#### 💡 Insight

Don't obsess over the "unit vs. integration" label. Focus on this question: **Am I testing meaningful behavior?** If yes, the test is valuable regardless of how many components are involved.

---

## ✅ Key Takeaways

- `render()` renders the **full component tree**, including all child components
- Tests that query rendered output survive refactoring — they don't care about internal structure
- When a parent renders a simple wrapper child, your tests don't need to change
- The line between unit and integration tests is blurry in React — and that's fine
- Only create separate tests for child components if they have their own complex logic

## ⚠️ Common Mistakes

- Thinking you need to rewrite tests every time you extract a sub-component — you usually don't
- Creating separate test files for every tiny wrapper component — it's overkill
- Mocking child components unnecessarily — let `render` handle the full tree

## 💡 Pro Tips

- React Testing Library's philosophy: test what the user sees, not the component hierarchy
- If refactoring breaks your tests (but the UI is the same), your tests are testing implementation details — fix the tests
- Reserve separate test files for components with their own state, effects, or complex behavior
