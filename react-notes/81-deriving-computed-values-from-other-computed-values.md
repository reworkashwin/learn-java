# Deriving Computed Values From Other Computed Values

## Introduction

We've moved the game board computation into the `App` component. Now it's time to actually **check for a winner** by looping through all winning combinations and comparing them against the current game board. This lesson shows how to chain derived values — computing a winner from a game board that's itself computed from state.

---

## Checking for a Winner

### 🧠 The Logic

For each winning combination, we need to:
1. Look at the three squares that make up that combination
2. Check what symbol (if any) is in each square on the game board
3. If all three squares have the **same non-null symbol**, we have a winner

### ⚙️ Step-by-Step Implementation

```jsx
let winner;

for (const combination of WINNING_COMBINATIONS) {
  const firstSquareSymbol = gameBoard[combination[0].row][combination[0].column];
  const secondSquareSymbol = gameBoard[combination[1].row][combination[1].column];
  const thirdSquareSymbol = gameBoard[combination[2].row][combination[2].column];

  if (
    firstSquareSymbol &&
    firstSquareSymbol === secondSquareSymbol &&
    firstSquareSymbol === thirdSquareSymbol
  ) {
    winner = firstSquareSymbol;
  }
}
```

Let's break down each step:

**1. Extract symbols from the game board:**
Each combination element (like `combination[0]`) has a `row` and `column` property. We use these as indices to look up the symbol in our 2D `gameBoard` array.

**2. The three conditions:**
- `firstSquareSymbol` — Is it truthy? (Not `null`? Has someone actually selected this square?)
- `firstSquareSymbol === secondSquareSymbol` — Does the first match the second?
- `firstSquareSymbol === thirdSquareSymbol` — Does the first match the third?

If all three are true, all three squares have the same player symbol → that player won.

**3. Store the winner:**
We set `winner` to the symbol (`'X'` or `'O'`) of the winning player.

---

## Displaying the Winner

### ⚙️ Conditional Rendering

We use the `&&` operator for conditional rendering:

```jsx
{winner && <p>You won, {winner}!</p>}
```

How this works:
- If `winner` is `undefined` (no winner yet), the expression short-circuits and nothing renders
- If `winner` is `'X'` or `'O'` (truthy), the `<p>` element renders

---

## Why This Is "Derived from Derived"

Here's the chain of derivation:

```
gameTurns (STATE)
  → gameBoard (DERIVED from gameTurns)
    → winner (DERIVED from gameBoard)
```

No extra state needed at any step. Everything flows from a single source of truth.

---

## ✅ Key Takeaways

- You can derive values from **other derived values**, not just directly from state
- Checking winning combinations is just a `for` loop with conditional checks — no special React API needed
- `null` is falsy in JavaScript, so checking `if (firstSquareSymbol)` skips unselected squares
- The `&&` operator is perfect for "show this only if a condition is met" rendering

## ⚠️ Common Mistakes

- Forgetting the `firstSquareSymbol` truthiness check — without it, three `null` squares would match as "all equal"
- Trying to add a `hasWinner` state — this is classic redundant state
- Using `==` instead of `===` — always use strict equality in JavaScript

## 💡 Pro Tips

- Since there are only 8 winning combinations, this loop runs almost instantly — no performance concerns
- You can think of the winning combinations check as a simple pattern-matching algorithm
- The chain `state → derived → derived` is a powerful pattern. In larger apps, you'll see it with selectors in state management libraries like Redux
