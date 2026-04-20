# Final Polishing & Improving Components

## Introduction

The Tic-Tac-Toe game is functionally complete. Now it's time to **clean up the code** — extracting helper functions, reducing clutter in the component, and establishing constants. This lesson is about code quality and maintainability. A working app is good, but a working app with clean code is better.

---

## Extracting Helper Functions

### 🧠 Why Extract?

The `App` component has accumulated a lot of logic:
- Deriving the game board
- Checking for a winner
- Deriving the active player

While all this logic is necessary, having it all inline makes the component hard to read. The solution: **extract logic into helper functions** outside the component.

### ⚙️ Extract: `deriveWinner`

```jsx
function deriveWinner(gameBoard, players) {
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
      winner = players[firstSquareSymbol];
    }
  }

  return winner;
}
```

Usage in the component:

```jsx
const winner = deriveWinner(gameBoard, players);
```

### ⚙️ Extract: `deriveGameBoard`

```jsx
function deriveGameBoard(gameTurns) {
  let gameBoard = [...INITIAL_GAME_BOARD.map((array) => [...array])];

  for (const turn of gameTurns) {
    const { square, player } = turn;
    const { row, col } = square;
    gameBoard[row][col] = player;
  }

  return gameBoard;
}
```

Usage:

```jsx
const gameBoard = deriveGameBoard(gameTurns);
```

---

## Establishing Constants

### ⚙️ Moving Initial Values to Named Constants

```jsx
const PLAYERS = {
  X: 'Player 1',
  O: 'Player 2',
};

const INITIAL_GAME_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];
```

### ❓ Why `UPPER_SNAKE_CASE`?

This naming convention signals that these values are **constants** — they shouldn't be modified. It's a common convention in JavaScript (and many other languages).

### 🧪 Using Constants

The `PLAYERS` constant serves as the initial state **and** the default player names in the JSX:

```jsx
const [players, setPlayers] = useState(PLAYERS);

// In JSX:
<Player initialName={PLAYERS.X} symbol="X" ... />
<Player initialName={PLAYERS.O} symbol="O" ... />
```

Now if you want to change default player names, you change them in **one place**.

---

## The Result: A Clean App Component

After all extractions, the `App` component body is lean and readable:

```jsx
function App() {
  const [players, setPlayers] = useState(PLAYERS);
  const [gameTurns, setGameTurns] = useState([]);

  const activePlayer = deriveActivePlayer(gameTurns);
  const gameBoard = deriveGameBoard(gameTurns);
  const winner = deriveWinner(gameBoard, players);
  const hasDraw = gameTurns.length === 9 && !winner;

  // ... handlers and JSX
}
```

Each line clearly expresses what's happening. No inline computation noise.

---

## ✅ Key Takeaways

- Extract computation logic into **helper functions** outside the component to improve readability
- Use **UPPER_SNAKE_CASE** for constants that never change (like `INITIAL_GAME_BOARD`, `PLAYERS`)
- Define initial values as constants to avoid duplication — change once, applied everywhere
- Helper functions outside components don't get recreated on re-renders (unlike functions inside components)

## ⚠️ Common Mistakes

- Leaving all logic inline in the component — makes it unreadable as the app grows
- Duplicating initial values (e.g., player names hardcoded in the state AND in the JSX)
- Putting helper functions inside the component when they don't need access to component state or props

## 💡 Pro Tips

- A clean component function should be a **high-level overview** of what's happening — the details live in helper functions
- This refactoring doesn't change behavior, but it dramatically improves maintainability
- In larger projects, these helper functions might even live in their own files (e.g., `utils/gameLogic.js`)
- The Tic-Tac-Toe game taught you: components, state, derived state, lifting state, props, conditional rendering, list rendering, immutability, and code organization. That's a lot of React in one project!
