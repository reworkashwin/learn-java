# When NOT To Lift State Up

## Introduction

You've learned that lifting state up is a key React pattern. But like any pattern, there are times when it's the **wrong** approach. This lesson teaches you when to recognize that lifting state up would cause more harm than good — and what to do instead.

---

## The Scenario

### 🧠 What We Want

When a player wins, we currently show "X won" or "O won." It would be nicer to show the **player's name** — "Player One won" or "Max won" (if the name was edited).

The player names are managed inside the `Player` component using a `playerName` state. So to show names in the `App` component (where we determine the winner), we need those names available there.

### ❓ The Obvious (Wrong) Answer

"Just lift the `playerName` state out of the Player component into the App component!"

**Don't do this.** Here's why.

---

## Why Lifting This State Would Be Bad

### Problem 1: Unnecessary Re-renders

The `playerName` state updates **on every keystroke** as the user types a new name. If this state lived in `App`, then the **entire App component** (including the game board, log, and everything else) would re-render on every single keystroke.

That's massively wasteful. None of those other components care about the player typing their name.

### Problem 2: Component Independence

We use the `Player` component twice — once for each player. Each instance manages its own `playerName` state independently. Lifting that state up would mean the `App` component needs to manage **two** player names, and the logic gets tangled.

### Problem 3: Separation of Concerns

The `Player` component's name-editing feature (typing, toggling edit mode) is an **internal concern**. Other components don't need to know about the editing process — they only need the **final result** when the user clicks "Save."

---

## The Right Approach: A New Separate State

Instead of lifting state up, add a **new state** in `App` that only updates when needed:

```jsx
const [players, setPlayers] = useState({
  X: 'Player 1',
  O: 'Player 2',
});
```

### ❓ Why an Object?

Because player names are tightly coupled to their symbols. An object with `X` and `O` as keys makes lookups easy:

```js
players['X']  // → "Player 1"
players['O']  // → "Max" (if edited)
```

### ⚙️ The Update Function

```jsx
function handlePlayerNameChange(symbol, newName) {
  setPlayers((prevPlayers) => ({
    ...prevPlayers,
    [symbol]: newName,
  }));
}
```

Key details:
- We use the **function form** of state update (because we depend on old state)
- We **spread** the old players object to keep the unchanged player's name
- We use **computed property syntax** (`[symbol]`) to dynamically set the right property

### 🧪 What's `[symbol]` Doing?

This is JavaScript's **computed property name** syntax:

```js
const key = 'X';
const obj = { [key]: 'Player 1' };
// Same as: { X: 'Player 1' }
```

The value inside `[]` is evaluated and used as the property name. So `[symbol]: newName` sets either the `X` or `O` property depending on which player changed their name.

---

## ✅ Key Takeaways

- **Don't lift state up** when doing so would cause excessive re-renders in unrelated components
- If a child's internal state changes frequently (like on every keystroke), keep it in the child
- Instead, create a **separate state** in the parent that updates only when the final value is confirmed
- Use objects with meaningful keys for related data that should be looked up dynamically

## ⚠️ Common Mistakes

- Reflexively lifting every state up — always ask "will this cause unnecessary re-renders?"
- Forgetting to spread old state when only updating one property of an object
- Not using the function form of `setState` when the new state depends on the old state

## 💡 Pro Tips

- The pattern here is: **child owns the editing state**, parent receives the **final result** via a callback
- This is sometimes called the "callback pattern" — the parent passes a function down, the child calls it when something important happens
- Think of it as: frequent, internal changes stay local; important, finalized changes get communicated to the parent
