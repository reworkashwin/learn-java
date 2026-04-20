# Repetition: Managing User Input with State (Two-Way Binding)

## Introduction

Before we unlock the power of **refs**, let's take a step back and remember how we've been handling user input so far — with **state and two-way binding**. This lecture deliberately walks through the "old way" so you can feel the pain points, and then appreciate why refs exist.

We'll build a Player component where a user types their name, clicks "Set Name," and the UI updates from "unknown entity" to whatever they typed. Sounds simple, right? You'll be surprised how much code it takes with state alone.

---

## The State-Based Approach

### Setting Up useState for Input Tracking

To capture what the user types, we reach for our trusty `useState` hook:

```jsx
import { useState } from 'react';

function Player() {
  const [enteredPlayerName, setEnteredPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  // ...
}
```

Two pieces of state here:
1. **`enteredPlayerName`** — tracks the current value in the input field, character by character
2. **`submitted`** — tracks whether the "Set Name" button was clicked

### Handling Input Changes (Two-Way Binding)

We wire up the classic two-way binding pattern:

```jsx
function handleChange(event) {
  setEnteredPlayerName(event.target.value);
}

// In JSX:
<input onChange={handleChange} value={enteredPlayerName} />
```

Every single keystroke triggers `handleChange`, which updates state, which re-renders the component, which feeds the new value back into the input through the `value` prop. That's **two-way binding** — state drives the input, and the input drives the state.

### Handling the Button Click

When the user clicks "Set Name":

```jsx
function handleClick() {
  setSubmitted(true);
}

// In JSX:
<button onClick={handleClick}>Set Name</button>
```

And we conditionally display the name:

```jsx
<p>Welcome {submitted ? enteredPlayerName : 'unknown entity'}</p>
```

---

## The Problem: It Works, But...

This approach works perfectly. But notice what happens after the first submission:

- The name updates **with every keystroke** because `enteredPlayerName` is being output directly
- To fix this, you'd need to set `submitted` back to `false` in `handleChange`
- Then you'd probably want a *third* piece of state to remember the previously submitted name
- Suddenly your simple "read an input value" task has snowballed into managing multiple states

### The Real Pain Point

All you wanted was: **"What's in this input field when the button is clicked?"**

But to get that answer, you had to:
- Track every keystroke with `onChange`
- Store the value in state
- Feed it back with `value`
- Add a second state for submission tracking
- Possibly add a third state for display purposes

That's a lot of ceremony for a simple read operation.

---

## Why This Matters

This lecture isn't just review — it's setting the stage. The instructor deliberately shows you the verbose, state-heavy approach so that when refs enter the picture in the next lecture, you'll immediately see how much simpler things can get.

> Think of it this way: useState is like having a security camera that records every single movement. Sometimes you don't need 24/7 surveillance — you just need to check what's there *right now*.

---

## ✅ Key Takeaways

- **Two-way binding** means the input's value is controlled by state, and user changes update that state
- Every keystroke triggers a re-render when using `onChange` + `value` + `useState`
- For simple "read on click" scenarios, this approach creates unnecessary complexity
- Managing multiple interdependent states makes components harder to maintain

## ⚠️ Common Mistakes

- Forgetting the `value` prop on the input — without it, you don't have true two-way binding
- Not resetting the `submitted` flag when the user starts typing again, leading to premature UI updates
- Using `event.target.value` outside of the event handler (stale references)

## 💡 Pro Tips

- If you only need the input value at a specific moment (like a button click), state-based tracking on every keystroke is overkill — refs are the better tool (stay tuned!)
- Two-way binding is still the right choice when you need to **validate**, **transform**, or **react to** input in real-time (e.g., search-as-you-type)
