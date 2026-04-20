# Avoid Intersecting States!

## Introduction

We're about to add a game log, and this reveals an important anti-pattern: **managing the same information in multiple states**. When two states store overlapping data, you're creating a maintenance nightmare. Let's see why and how to avoid it.

---

## The Scenario

We want a `Log` component that shows a history of turns taken during the game. This means we need an array of turn data — which row/column was clicked, and by which player.

### First Instinct: Add a New State

```jsx
const [gameTurns, setGameTurns] = useState([]);
```

But wait — we already have a `gameBoard` state in the `GameBoard` component that tracks which squares are filled and by whom. That's essentially the **same information** in a different shape!

---

## The Problem with Intersecting States

When two pieces of state store overlapping information:

- You have to **update both** whenever something changes
- They can get **out of sync** if you forget to update one
- It's **harder to reason** about which is the source of truth
- You're using **more memory** than necessary

### Real-World Analogy

Imagine keeping your schedule in both a paper calendar and a phone app, but entering events manually in both. Eventually, one will have an event the other doesn't, and you'll miss a meeting.

---

## The Better Approach: One State to Rule Them All

Instead of having both `gameBoard` state and `gameTurns` state, we should have **one state** from which we can **derive** everything else.

The `gameTurns` array is the better choice because it captures **more information** — specifically, the **order** of moves, which the game board alone doesn't track. And we can always reconstruct a game board from a list of turns, but we can't reconstruct the turn order from a game board.

---

## Restructuring the Code

### Step 1: Remove State from GameBoard

The `GameBoard` component no longer manages its own state. Instead, it receives everything from the parent via props.

### Step 2: Manage `gameTurns` in App

```jsx
function App() {
  const [gameTurns, setGameTurns] = useState([]);
  // ...
}
```

### Step 3: Update Turns When a Square is Selected

Each turn stores:
- **Which square** was clicked (row and column index)
- **Which player** clicked it

```jsx
function handleSelectSquare(rowIndex, colIndex) {
  setGameTurns((prevTurns) => {
    const updatedTurns = [
      { square: { row: rowIndex, col: colIndex }, player: '?' },
      ...prevTurns
    ];
    return updatedTurns;
  });
}
```

The newest turn goes first in the array (prepended), so `gameTurns[0]` is always the latest turn.

---

## The Key Insight

> Manage as **few states** as possible. If you can derive one piece of data from another, don't store both — derive the one you need.

This principle keeps your state tree lean, reduces bugs, and makes your components easier to maintain.

---

## ✅ Key Takeaways

- **Avoid** storing the same information in multiple states
- Choose the state that captures the **most information** (turns vs. board)
- You can always **derive** the game board from a list of turns
- Prepending the newest item keeps the latest turn at index 0 — convenient for lookups

## ⚠️ Common Mistakes

- Creating a new state for every piece of data — ask first: "Can I derive this from existing state?"
- Keeping redundant states "just in case" — this leads to sync issues
- Forgetting to remove the old state when consolidating into a single state

## 💡 Pro Tip

When planning state for a feature, list all the data you need, then ask: "What's the **minimal** state I need to store? What can be **computed** from that?" This thinking process prevents state bloat.
