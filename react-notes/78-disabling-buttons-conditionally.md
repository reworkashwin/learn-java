# Disabling Buttons Conditionally

## Introduction

In our Tic-Tac-Toe game, there's a problem — you can click the same square multiple times. That breaks the game logic and floods the log with duplicate entries. Let's fix this by **conditionally disabling buttons** that have already been selected.

---

## The Problem

Right now, nothing prevents a player from clicking an already-occupied square. The log keeps growing with duplicate entries, and the game doesn't work as expected.

### ❓ How Do We Prevent Re-Clicks?

We need to **disable the button** once a player has selected it. HTML's `<button>` element supports a `disabled` attribute, and React supports it as a prop.

---

## The Solution: Conditional `disabled` Prop

### ⚙️ How It Works

In the `GameBoard` component, each button has a `playerSymbol` value — it's either `'X'`, `'O'`, or `null`. We use this to determine if the button should be disabled:

```jsx
<button
  onClick={() => onSelectSquare(rowIndex, colIndex)}
  disabled={playerSymbol !== null}
>
  {playerSymbol}
</button>
```

Let's walk through the logic:

| `playerSymbol` value | `playerSymbol !== null` | Button state |
|---|---|---|
| `null` | `false` | **Enabled** (clickable) |
| `'X'` | `true` | **Disabled** (not clickable) |
| `'O'` | `true` | **Disabled** (not clickable) |

### 🧠 Why Does This Work?

- If `playerSymbol` is `null`, the square hasn't been selected yet → the button stays enabled
- If `playerSymbol` is `'X'` or `'O'`, someone already picked it → the button is disabled

The expression `playerSymbol !== null` evaluates to a boolean (`true` or `false`), which is exactly what the `disabled` prop expects.

---

## The Result

After this change:

- Clicking an empty square still works normally — the symbol appears, the log updates, the active player switches
- Clicking an already-occupied square **does nothing** — the button is grayed out and unresponsive
- The log no longer gets duplicate entries

---

## ✅ Key Takeaways

- The `disabled` prop on `<button>` accepts a boolean — `true` disables it, `false` keeps it enabled
- You can derive the disabled state from existing data (like `playerSymbol`) instead of managing separate state
- Conditional props are a fundamental React pattern for dynamic UI behavior

## ⚠️ Common Mistakes

- Adding `disabled` without a value (just `<button disabled>`) — this permanently disables the button
- Creating extra state to track which buttons are disabled when you can derive it from existing data
- Forgetting that `null` is falsy in JavaScript — it's treated as `false` in boolean contexts

## 💡 Pro Tips

- This is another example of **derived values** — we're not storing "is this button disabled?" anywhere. We compute it on-the-fly from data we already have
- The `disabled` attribute also provides a visual cue to users (browsers typically gray out disabled buttons), improving UX without extra CSS work
