# Working with Effect Dependencies & useCallback

## Introduction

Our timer has a bug — it keeps resetting itself even though it shouldn't. The timeout effect keeps firing over and over, but the interval effect only runs once. What's going on? This lecture exposes one of the trickiest gotchas in React: **function identity and effect dependencies**. Understanding this is essential for writing correct React code.

---

## Diagnosing the Problem

Adding `console.log` statements reveals the issue:

```
SETTING TIMEOUT    (×1)
SETTING INTERVAL   (×1)
// After timer expires:
SETTING TIMEOUT    (×2)
SETTING TIMEOUT    (×3)
// ...keeps incrementing!
```

The interval effect runs once (good). The timeout effect keeps re-executing (bad). Why?

The timeout effect has two dependencies: `timeout` and `onTimeout`.

```js
useEffect(() => {
  const timer = setTimeout(onTimeout, timeout);
  return () => clearTimeout(timer);
}, [timeout, onTimeout]);
```

- `timeout` is `10000` — it never changes. ✅
- `onTimeout` is a function passed as a prop. 🤔

**Here's the key insight**: `onTimeout` is changing on every render, even though it contains the same logic.

---

## Why Functions Change on Every Render

In the Quiz component, the `onTimeout` prop points to a function:

```jsx
<QuestionTimer
  timeout={10000}
  onTimeout={() => handleSelectAnswer(null)}
/>
```

Every time the Quiz component re-renders (which happens when state changes), this arrow function is **recreated**. In JavaScript, functions are objects. Even if two functions contain identical code, they're different objects in memory:

```js
const fn1 = () => console.log('hello');
const fn2 = () => console.log('hello');
fn1 === fn2; // false — different objects!
```

So when React checks the effect dependencies and sees a "new" `onTimeout` function, it runs the effect again, which sets a new timeout. That's why the timer keeps resetting.

---

## The Solution: useCallback

`useCallback` is a React hook that **memoizes** a function — it returns the same function object across re-renders unless its dependencies change.

```jsx
import { useState, useCallback } from 'react';

const handleSelectAnswer = useCallback(function handleSelectAnswer(selectedAnswer) {
  setUserAnswers(prevAnswers => [...prevAnswers, selectedAnswer]);
}, []);

const handleSkipAnswer = useCallback(() => handleSelectAnswer(null), [handleSelectAnswer]);
```

### Breaking This Down

1. **`handleSelectAnswer`** is wrapped with `useCallback`. Its dependency array is empty `[]` because it only uses `setUserAnswers` (state updater functions are stable — React guarantees they never change).

2. **`handleSkipAnswer`** calls `handleSelectAnswer`, so it lists `handleSelectAnswer` as a dependency. Since `handleSelectAnswer` is now stable (thanks to its own `useCallback`), `handleSkipAnswer` is also stable.

3. In the JSX, we pass the stable `handleSkipAnswer`:

```jsx
<QuestionTimer timeout={10000} onTimeout={handleSkipAnswer} />
```

Now when the Quiz re-renders, `handleSkipAnswer` is the **same object in memory**, so the QuestionTimer's effect dependency check says "nothing changed" and the effect doesn't re-run.

---

## When Do You Need useCallback?

Use `useCallback` when:
- A function is passed as a prop to a child component that uses it in a `useEffect` dependency array
- A function is passed to a memoized component (wrapped with `memo()`)
- A function is used as a dependency in your own `useEffect`

Don't use it everywhere — it adds complexity and has its own (small) performance cost.

---

## The Rules of Dependencies

Effect dependencies follow clear rules:

| What to add | Example |
|---|---|
| Props used in the effect | `onTimeout`, `timeout` |
| State values used in the effect | `count`, `isOpen` |
| Values derived from props/state | `activeQuestionIndex` |
| **Don't add** state updater functions | `setCount`, `setState` |
| **Don't add** refs | `myRef` |
| **Don't add** functions defined outside the component | `Math.random` |

---

✅ **Key Takeaway**: Functions in JavaScript are objects. Two functions with identical code are still different objects. When you pass functions as props and they end up in effect dependencies, use `useCallback` to stabilize them.

⚠️ **Common Mistake**: Forgetting that `useCallback` itself needs a dependency array. If your callback uses values from the component scope, list them as dependencies or you'll capture stale values.

💡 **Pro Tip**: If you find yourself needing to wrap many functions with `useCallback`, it might be a sign that your component is doing too much. Consider splitting it into smaller components where the state lives closer to where it's used.
