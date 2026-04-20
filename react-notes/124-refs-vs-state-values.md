# Refs vs State Values

## Introduction

By now you might be thinking: "If refs are so great, why bother with state at all? Can't I just use refs everywhere?" This lecture answers that question with a clear demonstration of what happens when you try to replace state with refs — and explains the fundamental difference between the two.

---

## The Experiment: Replace State with a Ref

What if we removed `useState` entirely and tried to display the player name using only the ref?

```jsx
function Player() {
  const playerName = useRef();

  function handleClick() {
    // No state update — just trying to use the ref directly
  }

  return (
    <section>
      <h2>
        Welcome {playerName.current?.value || 'unknown entity'}
      </h2>
      <input ref={playerName} />
      <button onClick={handleClick}>Set Name</button>
    </section>
  );
}
```

### Problem 1: `undefined` on First Render

On the very first render, `playerName.current` is **`undefined`**. The ref-to-DOM connection hasn't been established yet — that happens *after* the component renders for the first time.

Trying to access `playerName.current.value` will throw:
```
Cannot read property 'value' of undefined
```

You can work around this with optional chaining (`?.`), but there's a bigger issue...

### Problem 2: No Re-Render on Change

Even if we fix the undefined issue, clicking "Set Name" does **nothing**. The name never appears. Why?

Because **changing a ref does not cause a re-render**. When you click the button, the ref's value might change, but React doesn't know and doesn't care. It won't re-execute the component function, so the UI stays frozen.

---

## The Core Difference

This is the single most important distinction in React:

| Characteristic | State (`useState`) | Ref (`useRef`) |
|---------------|-------------------|----------------|
| Persists across re-renders | ✅ | ✅ |
| **Triggers re-render when changed** | **✅ Yes** | **❌ No** |
| Accessed via | State variable directly | `.current` property |
| Use for UI-driving values | ✅ | ❌ |
| Use for behind-the-scenes values | ❌ (wasteful) | ✅ |

> Think of **state** as a loudspeaker — when it changes, everyone hears about it (the component re-renders). Think of a **ref** as a sticky note — you can update it whenever you want, but nobody else is notified.

---

## When to Use Which

### Use **State** When:
- The value directly affects what's displayed on screen
- You need the component to re-render when the value changes
- Users see or interact with the value

### Use **Refs** When:
- You need to read a DOM element's value at a specific moment
- You're storing a behind-the-scenes value (timer IDs, previous values, etc.)
- The value has no direct visual impact on the UI
- You want to avoid unnecessary re-renders

---

## The Right Solution: Both Together

The correct approach for our Player component uses **both** — a ref to read the input, and state to drive the UI:

```jsx
function Player() {
  const playerName = useRef();
  const [enteredPlayerName, setEnteredPlayerName] = useState('');

  function handleClick() {
    setEnteredPlayerName(playerName.current.value);
  }

  return (
    <section>
      <h2>Welcome {enteredPlayerName || 'unknown entity'}</h2>
      <input ref={playerName} />
      <button onClick={handleClick}>Set Name</button>
    </section>
  );
}
```

The ref reads the value. The state tells React to update the screen.

---

## ✅ Key Takeaways

- Changing a ref **never** causes a re-render — that's the fundamental difference from state
- State should be used for values that are **reflected in the UI**
- Refs should be used for values that are **managed behind the scenes**
- Both persist across re-renders, but only state triggers a re-render cycle
- The ref connection to a DOM element isn't available during the first render

## ⚠️ Common Mistakes

- Trying to use refs as a replacement for state to "avoid re-renders" — this just means your UI won't update
- Accessing `ref.current` during the initial render without null checks

## 💡 Pro Tips

- A good mental model: **State = visible data, Refs = invisible data**
- If you're unsure which to use, ask: "Does this value need to show up on screen?" If yes → state. If no → ref.
