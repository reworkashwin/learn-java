# Grouping Tests Together with Test Suites

## Introduction

As your application grows, you'll go from having a handful of tests to dozens, hundreds, or even thousands. Without organization, your test output becomes a chaotic wall of text. **Test suites** solve this by grouping related tests together under a common label. It's a simple concept, but essential for keeping your test code maintainable.

---

### Concept 1: The `describe()` Function

#### 🧠 What is it?

`describe()` is a globally available function (like `test()`) that creates a **test suite** — a named group of related tests.

#### ❓ Why do we need it?

When you have many tests, grouping them by feature or component makes the test output readable and organized. Instead of a flat list of 200 tests, you see categories with tests nested inside them.

#### ⚙️ How it works

```javascript
describe('Greeting component', () => {
  test('renders Hello World! as a text', () => {
    render(<Greeting />);
    const element = screen.getByText('Hello World!');
    expect(element).toBeInTheDocument();
  });

  test('renders good to see you if button is not clicked', () => {
    render(<Greeting />);
    const element = screen.getByText('good to see you', { exact: false });
    expect(element).toBeInTheDocument();
  });
});
```

- **First argument:** A description string (typically the component or feature name)
- **Second argument:** A function containing all the tests that belong to this group

#### 🧪 Example

Test output without `describe`:
```
✓ renders Hello World! as a text
✓ renders good to see you if button is not clicked
```

Test output with `describe`:
```
Greeting component
  ✓ renders Hello World! as a text
  ✓ renders good to see you if button is not clicked
```

Notice how the tests are now indented under the suite name — much cleaner.

#### 💡 Insight

The combination of `describe` and `test` should read like natural sentences:

> *"Greeting component — renders Hello World! as a text"*  
> *"Greeting component — renders good to see you if button is not clicked"*

This makes your test output serve as living documentation of what your components do.

---

### Concept 2: Organizing Your Suites

#### 🧠 What is it?

As a best practice, create one test suite per component or feature, typically in the corresponding `.test.js` file.

#### ⚙️ How it works

- `Greeting.test.js` → `describe('Greeting component', () => { ... })`
- `LoginForm.test.js` → `describe('LoginForm component', () => { ... })`
- `utils.test.js` → `describe('utility functions', () => { ... })`

You can even nest `describe` blocks for sub-categories:

```javascript
describe('Greeting component', () => {
  describe('when button is not clicked', () => {
    test('renders initial text', () => { ... });
  });

  describe('when button is clicked', () => {
    test('renders changed text', () => { ... });
  });
});
```

#### 💡 Insight

If you don't use `describe` at all, Jest automatically creates an implicit suite for you. But as your app grows, you definitely want to organize tests explicitly. It's a small investment that pays off enormously in readability.

---

## ✅ Key Takeaways

- Use `describe()` to group related tests into **test suites**
- Name your suites after the component or feature they test
- Suites make test output organized and readable — especially important with many tests
- You can nest `describe` blocks for further organization
- `describe` + `test` should read like sentences describing your component's behavior

## ⚠️ Common Mistakes

- Putting unrelated tests in the same `describe` block — keep suites focused
- Not using `describe` at all in larger projects — you'll regret it when you have 100+ tests

## 💡 Pro Tips

- Convention: one `describe` block per `.test.js` file, named after the component
- Use nested `describe` blocks to group tests by scenario (e.g., "when logged in" vs. "when logged out")
- The test runner output is your documentation — make it read well
