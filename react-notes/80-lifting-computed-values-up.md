# Lifting Computed Values Up

## Introduction

We've outsourced the winning combinations data. Now we need to actually **check** if any combination is met — and we need to do it in the right component. This lesson introduces an important variation of "lifting state up": sometimes you don't lift state, you lift **computed values** (or the logic that produces them) to a higher component.

---

## Where Should the Winner Check Live?

### 🧠 Thinking About Component Responsibilities

We want to show a "Game Over" screen when someone wins. This screen will appear in the `App` component's layout (above the game board). So we need the winner information **in the App component**.

Could we check for a winner inside `handleSelectSquare`? Sure — and you might add a `hasWinner` state for that. But that would be **redundant state** again.

### ❓ Why Not Add a `hasWinner` State?

Because we can **derive** whether there's a winner from `gameTurns`. And since the `App` component re-executes after every turn (because `gameTurns` state changes), we can perform the check right in the component body — it will run on every render.

---

## The Problem: GameBoard Lives in the Wrong Place

### 🧠 What's the Issue?

To check winning combinations, we need to look at the game board — which positions have which symbols. But the `gameBoard` is currently being computed **inside** the `GameBoard` component.

We need it in the `App` component.

### ⚙️ The Solution: Move the Computation Up

Cut the game board derivation logic from the `GameBoard` component and paste it into the `App` component:

```jsx
// In App component
const gameBoard = /* ... derivation logic using gameTurns ... */;
```

Then pass the computed board down as a prop:

```jsx
<GameBoard board={gameBoard} onSelectSquare={handleSelectSquare} />
```

The `GameBoard` component becomes simpler — it just receives and renders the board:

```jsx
export default function GameBoard({ board, onSelectSquare }) {
  return (
    <ol id="game-board">
      {board.map((row, rowIndex) => (
        <li key={rowIndex}>
          <ol>
            {row.map((playerSymbol, colIndex) => (
              <li key={colIndex}>
                <button
                  onClick={() => onSelectSquare(rowIndex, colIndex)}
                  disabled={playerSymbol !== null}
                >
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

---

## Why This Pattern Matters

Think about what just happened:

- The `GameBoard` component got **leaner** — it's now purely a display component
- The `App` component now has the `gameBoard` data available for winner-checking logic
- We didn't add any new state — we just moved where the computation happens

> It's like moving the scorekeeping from individual players to a central referee. The players (components) still play their roles, but the referee (App) now has all the information needed to make calls.

---

## ✅ Key Takeaways

- Sometimes you need to **lift computed values up**, not just state
- If a parent component needs a computed value, move the computation to the parent and pass the result down as a prop
- This makes child components **leaner** and **more focused** on rendering
- The computation itself doesn't change — only where it lives

## ⚠️ Common Mistakes

- Adding state (like `hasWinner`) when you can derive the value from existing state
- Keeping computations in child components when the parent needs the result
- Confusing "lifting state up" with "lifting computed values up" — they're related but different concepts

## 💡 Pro Tips

- A good sign that you need to lift a computation: you need the computed result in **both** the parent and the child component
- Leaner child components are easier to test, reuse, and understand
- This is the foundation for the winner-checking logic we'll add next
