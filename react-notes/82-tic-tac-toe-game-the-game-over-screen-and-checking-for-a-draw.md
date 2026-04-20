# Tic-Tac-Toe Game: The "Game Over" Screen & Checking for a Draw

## Introduction

Our game can now detect a winner, but the experience isn't great — there's no proper "Game Over" screen, and we haven't handled **draws** at all. This lesson covers building a `GameOver` component and adding draw detection logic. It's a great exercise in conditional rendering and component design.

---

## Building the GameOver Component

### 🧠 What Do We Need?

A component that:
- Shows **who won** (if someone won)
- Shows **"It's a draw"** (if nobody won)
- Has a **Rematch** button to restart the game

### ⚙️ The Component

```jsx
export default function GameOver({ winner, onRestart }) {
  return (
    <div id="game-over">
      <h2>Game Over!</h2>
      {winner && <p>{winner} won!</p>}
      {!winner && <p>It&apos;s a draw!</p>}
      <p>
        <button onClick={onRestart}>Rematch!</button>
      </p>
    </div>
  );
}
```

Key details:
- **`winner` prop** — Could be a name/symbol, or `undefined` if it's a draw
- **`onRestart` prop** — A function passed from the parent to handle restarting
- **Conditional rendering** — We show different messages based on whether `winner` is defined
- **`&apos;`** — HTML entity for apostrophe, used to avoid JSX parsing issues with `'`

---

## Detecting a Draw

### ❓ How Do We Know It's a Draw?

A draw happens when:
1. All 9 squares have been filled (9 turns taken)
2. **AND** there's no winner

### ⚙️ The Logic

```jsx
const hasDraw = gameTurns.length === 9 && !winner;
```

This is beautifully simple:
- `gameTurns.length === 9` — Every square has been played
- `!winner` — Nobody won

Both conditions must be true for a draw.

---

## Showing the GameOver Component Conditionally

### ⚙️ In the App Component

```jsx
{(winner || hasDraw) && (
  <GameOver winner={winner} onRestart={handleRestart} />
)}
```

Important: The parentheses around `(winner || hasDraw)` ensure the `||` is evaluated first before the `&&`.

| Scenario | `winner` | `hasDraw` | Shows GameOver? |
|---|---|---|---|
| Game in progress | `undefined` | `false` | No |
| Player X wins | `'X'` | `false` | Yes — "X won!" |
| Draw | `undefined` | `true` | Yes — "It's a draw!" |

---

## Importing and Using the Component

```jsx
import GameOver from './components/GameOver.jsx';

// In the JSX:
{(winner || hasDraw) && <GameOver winner={winner} />}
```

---

## The Game Still Has a Bug

Notice that after a winner is declared, the player can **still continue clicking squares**. The Rematch button doesn't work yet either. We'll fix these in the upcoming lessons.

---

## ✅ Key Takeaways

- A `GameOver` component cleanly separates the "game over" UI from the main game logic
- Draw detection is straightforward: all turns taken + no winner
- Use `&&` and `||` together for complex conditional rendering — parentheses clarify evaluation order
- Components can handle multiple scenarios (win vs. draw) using conditional rendering internally

## ⚠️ Common Mistakes

- Forgetting parentheses around `(winner || hasDraw)` — without them, operator precedence might surprise you
- Not handling the draw case — easy to forget when focused on winner detection
- Using special characters like `'` directly in JSX — use `&apos;` or escape them

## 💡 Pro Tips

- The `hasDraw` variable is another example of derived state — no `useState` needed
- Designing components to accept both optional and required props (like `winner` being optional) makes them flexible and reusable
- The `id="game-over"` is used for CSS styling — always check your CSS file for available style hooks
