# An Alternative To Lifting State Up

## Introduction

In the previous lesson, we created a `players` state in the `App` component to track player names. Now we need to **connect it** to the `Player` component so that when a player saves their name, the `App` gets notified. This is the **callback pattern** — an alternative to lifting state up.

---

## Passing the Callback Down

### ⚙️ Step 1: Pass the Handler as a Prop

In the `App` component, pass `handlePlayerNameChange` to both `Player` components:

```jsx
<Player
  initialName={PLAYERS.X}
  symbol="X"
  isActive={activePlayer === 'X'}
  onChangeName={handlePlayerNameChange}
/>
<Player
  initialName={PLAYERS.O}
  symbol="O"
  isActive={activePlayer === 'O'}
  onChangeName={handlePlayerNameChange}
/>
```

### ⚙️ Step 2: Call It From the Player Component

Inside the `Player` component, destructure the `onChangeName` prop and call it when the user clicks "Save":

```jsx
function handleEditClick() {
  setIsEditing((editing) => !editing);

  if (isEditing) {
    onChangeName(symbol, playerName);
  }
}
```

### ❓ Why Check `isEditing`?

The `handleEditClick` function runs when the button is clicked **regardless** of whether we're starting or finishing editing. We only want to notify the parent when `isEditing` is `true` — meaning the user just clicked "Save" (transitioning from editing → not editing).

> Remember: `setIsEditing` schedules a state update — the `isEditing` variable still holds the **old** value during this function execution. So `isEditing === true` means we're in editing mode and about to leave it.

---

## Using Player Names for the Winner Display

### ⚙️ Updating the Winner Logic

Now that we have the `players` object with real names, we can show names instead of symbols:

```jsx
// Instead of:
winner = firstSquareSymbol; // 'X' or 'O'

// We use:
winner = players[firstSquareSymbol]; // 'Player 1' or 'Max'
```

This uses **bracket notation** to dynamically access a property. Since `firstSquareSymbol` is either `'X'` or `'O'`, and our `players` object has those exact keys, `players[firstSquareSymbol]` gives us the player's name.

---

## Seeing It All Work Together

The complete data flow:

1. User types a name in the `Player` component → `playerName` state updates locally (no re-render in App)
2. User clicks "Save" → `onChangeName(symbol, playerName)` is called
3. `handlePlayerNameChange` in `App` updates the `players` state
4. When a winner is determined, we look up `players[winningSymbol]` to get the name
5. The `GameOver` component receives and displays the winner's name

---

## ✅ Key Takeaways

- The **callback pattern**: parent passes a function down, child calls it when something important happens
- This avoids lifting frequently-changing state while still communicating final results to the parent
- Bracket notation (`obj[variable]`) lets you dynamically access object properties — essential when the key is stored in a variable
- Check timing carefully when combining state updates with callback calls in the same function

## ⚠️ Common Mistakes

- Calling `onChangeName` on every keystroke instead of only on "Save" — defeats the purpose of the pattern
- Forgetting that `setIsEditing` is asynchronous — `isEditing` still holds the old value in the same function call
- Using dot notation (`players.firstSquareSymbol`) instead of bracket notation (`players[firstSquareSymbol]`) — dot notation looks for a literal property named "firstSquareSymbol"

## 💡 Pro Tips

- The callback pattern is everywhere in React: `onChange`, `onSubmit`, `onDelete`, `onSave` — custom events communicated via props
- When you need dynamic property access, always use bracket notation: `obj[key]`
- This pattern keeps each component focused: `Player` handles editing, `App` handles game-level data
