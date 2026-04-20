# Prefer Computed Values & Avoid Unnecessary State Management

## Introduction

We've decided to use a single `gameTurns` state instead of separate states. Now we need to properly update that state and derive the active player from it — without merging two separate states, which would defeat the purpose. This lecture shows how to think the "React way."

---

## Simplifying GameBoard

The `GameBoard` component no longer manages its own state. It just receives a callback:

```jsx
function GameBoard({ onSelectSquare }) {
  // No state here anymore!
  // onSelectSquare is called directly from onClick
}
```

The parent `App` component handles everything through `handleSelectSquare`.

---

## Updating the Turns State

Here's the key function in `App`:

```jsx
function handleSelectSquare(rowIndex, colIndex) {
  setGameTurns((prevTurns) => {
    let currentPlayer = 'X';
    
    if (prevTurns.length > 0 && prevTurns[0].player === 'X') {
      currentPlayer = 'O';
    }

    const updatedTurns = [
      { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
      ...prevTurns,
    ];

    return updatedTurns;
  });
}
```

---

## Deriving the Active Player (Without Merging States)

### The Wrong Way

```jsx
setGameTurns((prevTurns) => {
  // ❌ Using activePlayer from another state inside this updater
  const updatedTurns = [
    { square: { row: rowIndex, col: colIndex }, player: activePlayer },
    ...prevTurns,
  ];
  return updatedTurns;
});
```

Why is this wrong? Because `activePlayer` comes from a **different state** (`useState`). Inside the function form of `setGameTurns`, React guarantees you the latest value of `gameTurns` — but it makes **no guarantee** about `activePlayer`. They could be out of sync.

### The Right Way — Derive from the Same State

```jsx
let currentPlayer = 'X'; // Default: X goes first

if (prevTurns.length > 0 && prevTurns[0].player === 'X') {
  currentPlayer = 'O'; // If last turn was X, current is O
}
```

We derive the current player from the **turns data itself**:
- If there are no previous turns → it's Player X's turn (first player)
- If the most recent turn (index 0) was by Player X → it's now Player O's turn
- Otherwise → it's Player X's turn

No need to reference another state!

---

## The Immutable Update Pattern

Notice how we build the new array:

```jsx
const updatedTurns = [
  { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
  ...prevTurns,  // Spread old turns after the new one
];
```

- New turn is **prepended** (added at the beginning)
- Old turns are **spread** after it
- This creates a **new array** (immutable update)
- The latest turn is always at index 0

---

## The Bigger Principle

> **Derive, don't store.** If you can calculate a value from existing state, compute it on every render instead of storing it separately.

This means:
- Fewer states to manage
- No risk of states getting out of sync
- Simpler, more predictable code

---

## ✅ Key Takeaways

- Don't mix different states inside a state updater function — **derive** values from the state being updated
- The function form of `setState` only guarantees the latest value of **its own** state
- Prepend new items to keep the most recent entry at index 0
- Prefer **computed values** over additional state whenever possible

## ⚠️ Common Mistakes

- Referencing `activePlayer` (or any other state) inside a `setGameTurns` updater — these aren't guaranteed to be in sync
- Creating additional states for values that can be derived from existing state
- Forgetting the guard: always check `prevTurns.length > 0` before accessing `prevTurns[0]`

## 💡 Pro Tip

A useful mental model: think of state as your **database** and computed values as **queries** against that database. You store the raw data (turns) and query it to get what you need (game board, active player, winner, etc.).
