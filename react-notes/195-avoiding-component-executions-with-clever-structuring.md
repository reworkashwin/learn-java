# Avoiding Component Function Executions with Clever Structuring

## Introduction

In the last lesson, we learned about `memo()` — React's built-in function for preventing unnecessary component re-executions. But there's an even more powerful technique that often makes `memo()` unnecessary altogether: **clever component composition**.

The idea is simple: instead of *preventing* re-renders after they happen, **restructure your components so the re-renders don't propagate in the first place**.

---

## The Problem Revisited

Remember our scenario? Every keystroke in an input field caused the entire app to re-render because the input state lived in the `App` component:

```jsx
function App() {
  const [enteredNumber, setEnteredNumber] = useState(0);
  const [chosenCount, setChosenCount] = useState(0);

  // This runs on every keystroke → App re-renders → everything re-renders
  function handleChange(event) {
    setEnteredNumber(+event.target.value);
  }

  return (
    <main>
      <section>
        <input type="number" onChange={handleChange} value={enteredNumber} />
        <button onClick={() => setChosenCount(enteredNumber)}>Set</button>
      </section>
      <Counter initialCount={chosenCount} />
    </main>
  );
}
```

The `enteredNumber` state changes on every keystroke, but the `Counter` component only cares about `chosenCount`, which only changes when the user clicks "Set."

---

## The Solution: Extract a Component

Instead of keeping the input state in `App`, we extract the entire input section into its own component:

```jsx
// ConfigureCounter.jsx
import { useState } from 'react';

export default function ConfigureCounter({ onSet }) {
  const [enteredNumber, setEnteredNumber] = useState(0);

  function handleChange(event) {
    setEnteredNumber(+event.target.value);
  }

  function handleSetClick() {
    onSet(enteredNumber);
  }

  return (
    <section>
      <input type="number" onChange={handleChange} value={enteredNumber} />
      <button onClick={handleSetClick}>Set</button>
    </section>
  );
}
```

And now the `App` component becomes simpler:

```jsx
function App() {
  const [chosenCount, setChosenCount] = useState(0);

  function handleSetCount(newCount) {
    setChosenCount(newCount);
  }

  return (
    <main>
      <ConfigureCounter onSet={handleSetCount} />
      <Counter initialCount={chosenCount} />
    </main>
  );
}
```

### Why This Works

The critical insight: **state changes in a child component do NOT trigger re-renders in the parent**.

When the user types in the input field:
1. `ConfigureCounter`'s state changes → `ConfigureCounter` re-executes ✅
2. `App` does NOT re-execute (child state changes don't propagate up) ✅
3. `Counter` does NOT re-execute (its parent didn't re-render) ✅
4. All of Counter's children stay untouched ✅

One keystroke now only re-executes *one* component instead of the entire tree. No `memo()` needed!

---

## "Moving State Down" — The Pattern

This technique is sometimes called **"moving state down"** or **"colocating state"**. The principle:

> State should live as close as possible to where it's actually used.

If only a small part of your UI cares about a piece of state, that state should live in a component that wraps just that small part — not in a high-level ancestor component.

### Before (state too high):
```
App (manages enteredNumber + chosenCount)
├── Header (re-renders unnecessarily)
├── Input section (needs enteredNumber)
└── Counter (re-renders unnecessarily on every keystroke)
```

### After (state colocated):
```
App (manages only chosenCount)
├── Header
├── ConfigureCounter (manages enteredNumber — re-renders stay contained)
└── Counter (only re-renders when chosenCount changes)
```

---

## When to Use Composition vs. memo()

| Approach | Best When |
|---|---|
| **Component composition** | State can be isolated into a smaller component |
| **memo()** | State must stay in a parent but children don't need it |

Component composition is generally preferred because:
- It **eliminates** the problem rather than working around it
- No runtime comparison cost (unlike `memo()`)
- Leads to smaller, more focused components (better code quality)
- Works regardless of prop types (no issues with objects/functions)

### When memo() Still Makes Sense

Sometimes state legitimately belongs in a parent component that also renders expensive children. In those cases, `memo()` is the right tool. But even then, ask yourself: "Can I restructure this?"

---

## Should You Remove memo() After Restructuring?

In our example, after extracting `ConfigureCounter`, the `Counter` component now only re-renders when `chosenCount` changes — which is exactly when it *should* re-render. So `memo()` on Counter is now mostly useless:

- When `chosenCount` changes → Counter re-renders (memo comparison still runs, but always finds a change)
- When someone types in the input → App doesn't re-render → Counter isn't affected

The memo comparison runs every time `chosenCount` changes, and almost always finds a new value, so you're paying the comparison cost for no benefit. You could remove it.

The only edge case where memo would help is if the user clicks "Set" with the *same number* already selected — memo would catch that and skip the re-render. Whether that's worth the overhead is debatable.

---

## ✅ Key Takeaways

- **Moving state down** into a child component prevents unnecessary parent re-renders
- State changes in a child do NOT propagate up to the parent
- This is often more effective than `memo()` because it eliminates the problem entirely
- Colocate state as close as possible to where it's used
- After restructuring, `memo()` may become unnecessary and can be removed

## ⚠️ Common Mistakes

- Keeping state in a high-level component "just in case" when it only affects a small subtree
- Using `memo()` as a first resort instead of considering component restructuring
- Forgetting to lift the *confirmed* state (like `chosenCount`) back up when needed with callback props

## 💡 Pro Tip

Next time you find yourself reaching for `memo()`, pause and ask: "Can I just move this state into a more appropriate component?" Nine times out of ten, better component design is the real solution. `memo()` is a band-aid; component composition is the cure.
