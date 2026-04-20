# New Project: First Steps Towards Our Tic-Tac-Toe Game

## Introduction

Time to start building the actual game! Before diving into complex logic, we need to lay out the **structural building blocks** of our Tic-Tac-Toe application. Think of this as framing a house before adding the plumbing and electrical.

---

## The Three Building Blocks

Our game has three main areas:

1. **Players area** — displays player names and symbols, with the ability to edit names
2. **Game board** — the 3×3 grid where the action happens
3. **Log** — shows a history of turns taken during the game

---

## Setting Up the Layout

In the `App` component, we set up a basic structure using semantic HTML:

```jsx
function App() {
  return (
    <main>
      <div id="game-container">
        {/* Players area + Game board go here */}
      </div>
      {/* Log goes below, outside the game-container */}
    </main>
  );
}
```

The `id="game-container"` is used for CSS styling — the players and game board sit inside this container, while the log is placed below it.

---

## Building the Players Area

We start with an ordered list (because player order matters semantically) and two list items — one for each player:

```jsx
<ol id="players">
  <li>
    <span className="player-name">Player 1</span>
    <span className="player-symbol">X</span>
  </li>
  <li>
    <span className="player-name">Player 2</span>
    <span className="player-symbol">O</span>
  </li>
</ol>
```

### Why an Ordered List?

It's a small semantic detail — the order matters because Player 1 goes first. It's not critical, but it's good practice to use semantically correct HTML elements.

---

## What's Missing (And What's Next)

This is just static markup for now. We still need to:

- Make player names **editable** with an edit button
- Make the content **dynamic** using props and state
- Add the game board and log components

But this gives us a visible foundation to build on. After saving, you should see both players displayed with their names and symbols.

---

## ✅ Key Takeaways

- Start by identifying the major building blocks of your UI
- Use semantic HTML elements (`<main>`, `<ol>`, `<li>`) for better structure
- IDs and `className` are used to hook into CSS styles
- Build the static structure first, then add interactivity

## 💡 Pro Tip

When starting a new React project, resist the urge to jump straight into state and logic. Lay out the visual structure first with hard-coded data. Once you can see the layout, it's much easier to identify what needs to be dynamic and where state should live.
