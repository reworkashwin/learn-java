# Sharing State Across Components

## Introduction

You've learned how to lift state up to a common parent component. Now it's time to see it in action — passing that shared state down to **sibling components** through props, so multiple parts of the UI can react to the same data.

In this lesson, we connect the `Log` component to the `gameTurns` state managed in the `App` component. This is a perfect example of the **single source of truth** pattern at work.

---

## Passing State Down via Props

### 🧠 What's the Goal?

We want the `Log` component to display a history of every move made in the game — which player selected which square. But the `Log` component doesn't own this data. The `gameTurns` state lives in the `App` component.

So how do we get it there? **Props.**

### ⚙️ Setting Up the Log Component

Inside the `Log` component, we accept a `turns` prop:

```jsx
export default function Log({ turns }) {
  return (
    <ol>
      {turns.map((turn) => (
        <li key={`${turn.square.row}${turn.square.col}`}>
          {turn.player} selected {turn.square.row},{turn.square.col}
        </li>
      ))}
    </ol>
  );
}
```

Let's break this down:

1. **`turns` prop** — An array of turn objects, each containing `player` (the symbol) and `square` (with `row` and `col`)
2. **`.map()`** — We transform each turn into a `<li>` element
3. **Template literals for keys** — We combine row and column to create a unique key (e.g., `"01"`, `"12"`), since each square can only be selected once

### 🧪 Why Template Literals for Keys?

```js
`${turn.square.row}${turn.square.col}`
```

This uses JavaScript's **template literal syntax** (backticks, not single quotes). The `${}` syntax lets you inject dynamic values into a string. This gives us a unique identifier for each log entry because no two turns can occupy the same square.

---

## Connecting the Log to App State

### ⚙️ Passing the Prop

In the `App` component, we simply pass the `gameTurns` state as the `turns` prop:

```jsx
<Log turns={gameTurns} />
```

That's it. Now every time `gameTurns` updates (when a player clicks a square), the `App` component re-renders, the new `gameTurns` array flows down into `Log`, and the log display updates automatically.

---

## The Power of a Single State

Here's the beautiful part — we have **one piece of state** (`gameTurns`) driving **two different parts of the UI**:

1. **The game board** — Derives which symbols go where
2. **The log** — Shows the history of moves

Neither the `GameBoard` nor the `Log` manages its own state for this data. They both receive it from the parent and render accordingly.

> Think of it like a scoreboard at a stadium. There's one source of truth (the official score), and multiple screens around the stadium display it. You don't have each screen keeping its own score — that would be chaos.

---

## ✅ Key Takeaways

- State managed in a parent component can be **shared with multiple children** via props
- Using `.map()` to render dynamic lists is a core React pattern — always include a unique `key`
- Template literals (`` `${value}` ``) are standard JavaScript for building dynamic strings
- **Single source of truth** — One state drives multiple UI elements, keeping everything in sync

## ⚠️ Common Mistakes

- Forgetting to add a `key` prop when rendering a list — React needs this to efficiently update the DOM
- Using single quotes instead of backticks for template literals — `'${x}'` won't work, you need `` `${x}` ``
- Creating duplicate state in child components instead of receiving data through props

## 💡 Pro Tips

- If two components need the same data, lift the state to their nearest common parent and pass it down
- A good key for list items should be **stable**, **unique**, and **predictable** — row+col combinations work perfectly here
- Keep components "dumb" when possible — let them receive data and render it, without managing their own copy of shared state
