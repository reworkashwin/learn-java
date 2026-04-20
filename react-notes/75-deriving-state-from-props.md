# Deriving State From Props

## Introduction

We've been talking about **deriving values** instead of managing extra state. Now let's put this into practice by deriving the entire game board from the `gameTurns` state. This is a powerful pattern called **derived state** (or **computed values**), and it's central to writing clean React code.

---

## The Concept: Derived State

Instead of storing the game board as its own state, we **compute** it from the turns array every time the component renders:

```
gameTurns (state) → derive → gameBoard (computed)
```

The game board is just a different **view** of the same underlying data.

---

## Passing Turns to GameBoard

In the `App` component, pass the turns data:

```jsx
<GameBoard turns={gameTurns} onSelectSquare={handleSelectSquare} />
```

---

## Deriving the Game Board

Inside the `GameBoard` component:

```jsx
function GameBoard({ turns, onSelectSquare }) {
  let gameBoard = initialGameBoard;

  for (const turn of turns) {
    const { square, player } = turn;
    const { row, col } = square;
    gameBoard[row][col] = player;
  }

  return (
    <ol id="game-board">
      {gameBoard.map((row, rowIndex) => (
        <li key={rowIndex}>
          <ol>
            {row.map((playerSymbol, colIndex) => (
              <li key={colIndex}>
                <button onClick={() => onSelectSquare(rowIndex, colIndex)}>
                  {playerSymbol}
                </button>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
```

### How the Derivation Works

1. Start with the `initialGameBoard` (all `null` values)
2. Loop through every turn in the `turns` array
3. For each turn, place the player's symbol at the correct row and column
4. The resulting `gameBoard` reflects the current state of the game

If `turns` is empty, the loop doesn't execute, and we get the empty initial board. Simple and elegant.

---

## Destructuring Nested Objects

The code uses **nested destructuring** to cleanly extract data:

```jsx
const { square, player } = turn;    // Get square object and player string
const { row, col } = square;         // Get row and col from square
```

This is equivalent to:
```jsx
const row = turn.square.row;
const col = turn.square.col;
const player = turn.player;
```

But much more concise.

---

## Fixing the onClick Handler

Previously, `onSelectSquare` was connected via an anonymous function. We need to pass `rowIndex` and `colIndex` as arguments:

```jsx
<button onClick={() => onSelectSquare(rowIndex, colIndex)}>
  {playerSymbol}
</button>
```

Without this, the `handleSelectSquare` function in `App` wouldn't know which square was clicked, and we'd get an error when trying to update the turns array.

---

## No State Needed in GameBoard

The `GameBoard` component no longer uses `useState` at all. It's a **pure computation**:

```
Props in (turns) → Compute game board → JSX out
```

This is the ideal in React: components that derive everything they need from their inputs. The state lives in the `App` component, and `GameBoard` just transforms that data into UI.

---

## The Pattern, Summarized

```
State (gameTurns in App)
  ├── Derived: gameBoard (computed in GameBoard)
  ├── Derived: activePlayer (computed in App)
  └── Derived: log entries (to be computed in Log)
```

One state, multiple derived values. Clean, predictable, and impossible to get out of sync.

---

## ✅ Key Takeaways

- **Derived state** = computing values from props or state instead of storing them separately
- The game board is reconstructed from the turns array on every render
- Components without their own state are simpler and easier to test
- Use `for...of` loops to transform data inside component functions
- Nested destructuring makes accessing deeply nested properties cleaner

## ⚠️ Common Mistakes

- Forgetting to pass `rowIndex` and `colIndex` through the anonymous function in `onClick`
- Trying to manage state in `GameBoard` when it can be derived from props
- Not understanding why the "cannot set properties of undefined" error occurs — it's because the handler didn't receive the expected arguments

## 💡 Pro Tip

When you remove state from a child component and derive everything from props, that child becomes easier to test and reason about. If something looks wrong in the UI, you know the problem is either in the data being passed (the parent's state) or in the derivation logic — never in some hidden internal state.
