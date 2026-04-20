# Rendering Multi-Dimensional Lists

## Introduction

The player editing feature is complete for now. Time to build the **game board** — a 3×3 grid of clickable buttons. This introduces a new challenge: rendering a **multi-dimensional array** (an array of arrays) into a nested list structure.

---

## The Data Structure

A Tic-Tac-Toe board is naturally a 2D grid. We represent it as an array of arrays:

```jsx
const initialGameBoard = [
  [null, null, null],  // Row 0
  [null, null, null],  // Row 1
  [null, null, null],  // Row 2
];
```

- Each outer array element is a **row**
- Each inner value is a **cell** — `null` means empty, `'X'` or `'O'` means occupied
- This constant lives **outside** the component function since it's not state

---

## The GameBoard Component

```jsx
export default function GameBoard() {
  return (
    <ol id="game-board">
      {initialGameBoard.map((row, rowIndex) => (
        <li key={rowIndex}>
          <ol>
            {row.map((playerSymbol, colIndex) => (
              <li key={colIndex}>
                <button>{playerSymbol}</button>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
```

---

## Breaking Down the Nested `.map()`

### Outer `.map()` — Iterates Over Rows

```jsx
initialGameBoard.map((row, rowIndex) => (
  <li key={rowIndex}>...</li>
))
```

Each `row` is an inner array like `[null, null, null]`. We create a `<li>` for each row.

### Inner `.map()` — Iterates Over Cells in Each Row

```jsx
row.map((playerSymbol, colIndex) => (
  <li key={colIndex}>
    <button>{playerSymbol}</button>
  </li>
))
```

Each `playerSymbol` is `null` (initially), `'X'`, or `'O'`. When it's `null`, the button appears empty — React renders nothing for `null` values.

---

## Using Index as Keys

Normally, you should avoid using array indexes as keys because indexes are tied to **position**, not to the **data**. But here it's acceptable because:

- We're **not reordering** rows or columns
- The grid structure is **fixed** — always 3×3
- There's no scenario where rows swap positions

---

## Connecting to the App

```jsx
import GameBoard from './components/GameBoard.jsx';

function App() {
  return (
    <main>
      <div id="game-container">
        <ol id="players">
          <Player name="Player 1" symbol="X" />
          <Player name="Player 2" symbol="O" />
        </ol>
        <GameBoard />
      </div>
    </main>
  );
}
```

After saving, you'll see the 3×3 grid with clickable buttons — they don't do anything yet, but the visual structure is complete.

---

## ✅ Key Takeaways

- Multi-dimensional arrays are rendered with **nested `.map()` calls**
- Each `.map()` level needs its own `key` prop
- Using index as key is acceptable when the list order never changes
- `null` values render as nothing in JSX — perfect for empty board cells
- Constants that don't change can live outside the component function

## ⚠️ Common Mistakes

- Forgetting keys on the inner list items — React needs keys at every level of dynamic lists
- Using index as key when items can be reordered, added, or removed
- Putting the initial data constant inside the component function — it gets recreated on every render

## 💡 Pro Tip

When you see nested `.map()` calls getting complex, consider extracting the inner loop into its own component. A `GameBoardRow` component could make the code cleaner, though for a 3×3 grid, the inline approach is perfectly fine.
