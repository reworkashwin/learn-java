# Best Practice: Updating Object State Immutably

## Introduction

We have the game board rendering — now we need to make the buttons work. When a player clicks a square, their symbol should appear on it. But updating array or object state in React comes with an important rule: **always update immutably**. Let's understand what that means and why it matters.

---

## Adding State to the GameBoard

```jsx
import { useState } from 'react';

const [gameBoard, setGameBoard] = useState(initialGameBoard);
```

The `gameBoard` state is a multi-dimensional array — an array of arrays.

---

## The Handler Function

When a button is clicked, we need to know:
- **Which row** — the `rowIndex`
- **Which column** — the `colIndex`

```jsx
function handleSelectSquare(rowIndex, colIndex) {
  setGameBoard((prevGameBoard) => {
    const updatedBoard = [...prevGameBoard.map(innerArray => [...innerArray])];
    updatedBoard[rowIndex][colIndex] = 'X';
    return updatedBoard;
  });
}
```

---

## Why Immutable Updates?

### The Wrong Way

```jsx
// ❌ Mutating the original state directly
prevGameBoard[rowIndex][colIndex] = 'X';
return prevGameBoard;
```

### Why This Is Dangerous

Arrays and objects in JavaScript are **reference values**. When you modify `prevGameBoard` directly:

1. You're changing the **same object in memory** that React is tracking
2. This change happens **immediately**, even before the scheduled state update runs
3. If multiple places schedule updates to the same state, they may see corrupted data
4. React may not detect the change (same reference = React might skip re-rendering)

### The Right Way — Create a Copy First

```jsx
// ✅ Immutable update — copy, then modify the copy
const updatedBoard = [...prevGameBoard.map(innerArray => [...innerArray])];
updatedBoard[rowIndex][colIndex] = 'X';
return updatedBoard;
```

Step by step:
1. `prevGameBoard.map(innerArray => [...innerArray])` — creates new inner arrays (deep copy)
2. `[...]` — wraps everything in a new outer array
3. Now `updatedBoard` is a **completely new** array in memory
4. We safely modify the copy, not the original

---

## Connecting the Handler to Buttons

Since `handleSelectSquare` needs `rowIndex` and `colIndex` as arguments, we can't just pass it directly to `onClick`. Instead, use an **anonymous arrow function**:

```jsx
<button onClick={() => handleSelectSquare(rowIndex, colIndex)}>
  {playerSymbol}
</button>
```

This wrapper function lets us control exactly what arguments `handleSelectSquare` receives.

---

## Using State Instead of Initial Data

Finally, replace the initial data with the state value in the render:

```jsx
{gameBoard.map((row, rowIndex) => (
  // ... render using gameBoard, not initialGameBoard
))}
```

Now clicking buttons places "X" symbols on the board!

---

## The Immutability Rule, Summarized

| Data Type | How to Copy |
|---|---|
| Array | `[...oldArray]` |
| Nested Array | `oldArray.map(inner => [...inner])` |
| Object | `{ ...oldObject }` |
| Nested Object | `{ ...oldObject, nested: { ...oldObject.nested } }` |

---

## ✅ Key Takeaways

- **Never mutate state directly** — always create a copy first, then modify the copy
- Arrays and objects are reference values — modifying them changes the original in memory
- Use spread operators (`...`) to create shallow copies
- For nested structures, you need to copy at **every level** that contains changes
- Use anonymous functions in JSX when event handlers need specific arguments

## ⚠️ Common Mistakes

- Spreading only the outer array but not the inner arrays — inner arrays still reference the same objects
- Forgetting the function form of `setState` when the new state depends on the previous state
- Passing `handleSelectSquare(rowIndex, colIndex)` directly to `onClick` — this calls it immediately!

## 💡 Pro Tip

If immutable updates feel verbose, libraries like **Immer** let you write "mutating" code that's automatically converted to immutable operations behind the scenes. React's official documentation even recommends it for complex state.
