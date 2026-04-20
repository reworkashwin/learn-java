# Lifting State Up [Core Concept]

## Introduction

We need the **active player** information in two different components — the `Player` component (to highlight the active player) and the `GameBoard` component (to place the correct symbol). But these are sibling components — they can't directly share state. This is where one of React's most important patterns comes in: **lifting state up**.

---

## The Problem

- `GameBoard` needs to know the active player's symbol to place it on clicked squares
- `Player` needs to know if it's the active player to add a highlight CSS class
- Neither component can access the other's state — they're separate instances

Where should the state live?

---

## The Principle: Lift State to the Closest Common Ancestor

Find the **closest ancestor component** that has access to all components that need the shared data. In our case:

```
App (← state lives here!)
├── Player (needs activePlayer for highlighting)
├── Player (needs activePlayer for highlighting)
└── GameBoard (needs activePlayer symbol)
```

The `App` component is the parent of both `Player` and `GameBoard`. It can pass data down to both via props.

---

## Implementing Lifted State

### Step 1: Manage State in App

```jsx
function App() {
  const [activePlayer, setActivePlayer] = useState('X');

  function handleSelectSquare() {
    setActivePlayer((curActivePlayer) => 
      curActivePlayer === 'X' ? 'O' : 'X'
    );
  }
  // ...
}
```

### Step 2: Pass a Callback to GameBoard

The `GameBoard` needs to tell `App` when a square is selected:

```jsx
<GameBoard onSelectSquare={handleSelectSquare} />
```

In `GameBoard`, accept and call this prop:

```jsx
function GameBoard({ onSelectSquare }) {
  function handleSelectSquare(rowIndex, colIndex) {
    // ...update board state...
    onSelectSquare(); // Notify parent!
  }
}
```

### Step 3: Pass Active Player Info to Player

```jsx
<ol id="players" className="highlight-player">
  <Player name="Player 1" symbol="X" isActive={activePlayer === 'X'} />
  <Player name="Player 2" symbol="O" isActive={activePlayer === 'O'} />
</ol>
```

### Step 4: Use the Prop in Player

```jsx
function Player({ initialName, symbol, isActive }) {
  return (
    <li className={isActive ? 'active' : undefined}>
      {/* ... */}
    </li>
  );
}
```

### Step 5: Pass Symbol to GameBoard

```jsx
<GameBoard 
  onSelectSquare={handleSelectSquare} 
  activePlayerSymbol={activePlayer} 
/>
```

Use it in `GameBoard` to place the correct symbol:

```jsx
function GameBoard({ onSelectSquare, activePlayerSymbol }) {
  function handleSelectSquare(rowIndex, colIndex) {
    setGameBoard((prevBoard) => {
      const updated = [...prevBoard.map(row => [...row])];
      updated[rowIndex][colIndex] = activePlayerSymbol;
      return updated;
    });
    onSelectSquare();
  }
}
```

---

## The Data Flow

```
User clicks square in GameBoard
  → GameBoard calls onSelectSquare (callback from App)
  → App's handleSelectSquare runs
  → setActivePlayer toggles 'X' ↔ 'O'
  → App re-renders
  → Updated activePlayer passed to Player (highlighting updates)
  → Updated activePlayer passed to GameBoard (next symbol changes)
```

---

## When to Lift State Up

Lift state when:
- **Two sibling components** need the same data
- A **child component** needs to communicate with a **sibling**
- Multiple components need to **stay in sync** with shared data

---

## ✅ Key Takeaways

- **Lift state up** to the closest common ancestor of components that need shared data
- Pass **data down** via props and **actions up** via callback functions
- The parent component becomes the **single source of truth** for shared state
- This is one of the **most common** patterns in React — you'll use it constantly

## ⚠️ Common Mistakes

- Duplicating state in multiple components instead of lifting it up
- Lifting state too high — only go as high as necessary
- Forgetting to pass callback functions as props for child-to-parent communication

## 💡 Pro Tip

If you find yourself passing props through many intermediate components (prop drilling), consider React Context or state management libraries. But for most cases, lifting state up one or two levels is the cleanest solution.
