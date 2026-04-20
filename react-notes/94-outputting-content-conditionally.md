# Outputting Content Conditionally

## Introduction

The investment calculator app works—but it has a critical flaw. Try entering `0` or a negative number for the duration. **Boom.** The app crashes. A robust app should handle invalid input gracefully by showing an error message instead of a broken page. This is where **conditional rendering** comes in—deciding *what* to show based on some condition.

---

## The Problem

When the duration is `0` or negative, the `calculateInvestmentResults` function doesn't return valid data. This causes the `Results` component to crash because it tries to access properties on `undefined` or iterate over an empty/invalid array.

We need to:
1. Detect when the input is invalid
2. Show an error message instead of the results table
3. Let the user fix their input and see the table again

---

## Deriving Validity from State

In the `App` component, right after the state declaration, derive a boolean:

```jsx
const [userInput, setUserInput] = useState({ /* ... */ });

const inputIsValid = userInput.duration >= 1;
```

This checks whether the duration is at least `1`. If the user enters `0` or a negative value, `inputIsValid` becomes `false`.

Why check in `App` and not in `Results`? Because `App` is where we decide *whether* to render `Results` at all.

---

## Conditional Rendering Techniques

### Using the `&&` Operator

```jsx
{inputIsValid && <Results input={userInput} />}
```

If `inputIsValid` is `true`, React renders `<Results />`. If it's `false`, React renders nothing.

### Showing a Fallback Message

```jsx
{!inputIsValid && (
  <p className="center">Please enter a duration greater than zero.</p>
)}
{inputIsValid && <Results input={userInput} />}
```

Now:
- Invalid input → error message appears, table disappears
- Valid input → table appears, error message disappears

### Using a Ternary Expression

You could also use a single ternary:

```jsx
{inputIsValid ? (
  <Results input={userInput} />
) : (
  <p className="center">Please enter a duration greater than zero.</p>
)}
```

Both approaches work. The `&&` approach is cleaner when you have separate, independent conditions.

---

## How It Behaves

1. Page loads with default values (duration = 10) → table is shown
2. User changes duration to `5` → table recalculates dynamically
3. User changes duration to `0` → table disappears, error message appears
4. User changes duration back to `3` → error message disappears, table returns

The entire UI reacts to state changes instantly—no page reloads, no special logic needed. React re-renders the component whenever `userInput` changes, re-evaluates `inputIsValid`, and renders the appropriate content.

---

## ✅ Key Takeaways

- Use **conditional rendering** to show or hide components based on state
- Derive boolean flags from state (`inputIsValid`) to make your JSX clean and readable
- The `&&` operator renders content only when the condition is `true`
- The ternary operator (`? :`) lets you choose between two alternatives

## ⚠️ Common Mistakes

- Not handling edge cases like `0` or negative values—always validate user input
- Letting the app crash instead of showing a helpful error message
- Forgetting that both branches of a conditional render should handle their case cleanly

## 💡 Pro Tips

- Validate at the display boundary (`App`) rather than inside the child component—this prevents passing bad data down
- You can extend validation to check other fields too (e.g., no negative investment amounts)
- CSS classes like `center` keep your error messages styled consistently without inline styles
