# Outsourcing Data Into A Separate File

## Introduction

Before we can check if a player has won the game, we need to define all possible **winning combinations** in Tic-Tac-Toe. Since this is static data (it never changes), it makes sense to store it in a separate file. This lesson covers the practice of **separating data from component logic** — a clean code pattern you'll use constantly in real projects.

---

## Defining Winning Combinations

### 🧠 What Are Winning Combinations?

In a 3×3 Tic-Tac-Toe board, a player wins by filling three squares in a row — horizontally, vertically, or diagonally. There are exactly **8** possible winning combinations.

Each combination is defined by three squares, and each square is identified by its **row** and **column** index (zero-based):

```
Board positions:
[0,0] [0,1] [0,2]
[1,0] [1,1] [1,2]
[2,0] [2,1] [2,2]
```

### ⚙️ How to Represent Them

Each winning combination is an array of three objects, where each object has a `row` and `column` property:

```js
// First row (horizontal)
[
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 0, column: 2 },
]
```

This says: "If the squares at positions (0,0), (0,1), and (0,2) all have the same symbol, that's a win."

---

## Creating a Separate Data File

### ❓ Why a Separate File?

This data:
- Is **static** — it never changes at runtime
- Is **not component-specific** — it's game logic, not UI logic
- Would **clutter** the component file — 8 combinations × 3 positions each = a lot of lines

### ⚙️ The File Structure

Create a file called `winning-combinations.js`:

```js
export const WINNING_COMBINATIONS = [
  // Row wins
  [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }],
  [{ row: 1, column: 0 }, { row: 1, column: 1 }, { row: 1, column: 2 }],
  [{ row: 2, column: 0 }, { row: 2, column: 1 }, { row: 2, column: 2 }],
  // Column wins
  [{ row: 0, column: 0 }, { row: 1, column: 0 }, { row: 2, column: 0 }],
  [{ row: 0, column: 1 }, { row: 1, column: 1 }, { row: 2, column: 1 }],
  [{ row: 0, column: 2 }, { row: 1, column: 2 }, { row: 2, column: 2 }],
  // Diagonal wins
  [{ row: 0, column: 0 }, { row: 1, column: 1 }, { row: 2, column: 2 }],
  [{ row: 0, column: 2 }, { row: 1, column: 1 }, { row: 2, column: 0 }],
];
```

### 🧪 Using It in the App

Back in the `App` component, simply import it:

```jsx
import { WINNING_COMBINATIONS } from './winning-combinations.js';
```

Now you have access to all winning combinations without cluttering your component code.

---

## ✅ Key Takeaways

- **Static data** (constants, configurations, lookup tables) belongs in separate files
- Use `export` to make data available for import in other files
- Naming convention: Use `UPPER_SNAKE_CASE` for constants that never change (e.g., `WINNING_COMBINATIONS`)
- Keep component files focused on **UI logic** — move data and utility functions elsewhere

## ⚠️ Common Mistakes

- Hardcoding large data structures inside component functions — this makes components harder to read and maintain
- Forgetting the `export` keyword — without it, the data can't be imported elsewhere
- Using zero-based indexing inconsistently — JavaScript arrays start at index 0, so the first row is row 0

## 💡 Pro Tips

- This pattern of separating data into its own file scales beautifully — think API endpoints, configuration objects, route definitions, theme constants
- In larger projects, you might have a `data/` or `constants/` folder for all such files
- Since the data is exported as a named export, you **must** use curly braces when importing: `{ WINNING_COMBINATIONS }`
