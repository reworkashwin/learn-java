# Concept Repetition: Splitting Components & Building Reusable Components

## Introduction

You'll notice a pattern emerging in our code — we're **repeating the same markup** for Player 1 and Player 2. In React, repeated markup is a strong signal that you should extract a reusable component. Let's see why and how.

---

## Spotting the Problem: Repeated Markup

After adding an "Edit" button to each player, our `App` component has duplicate blocks:

```jsx
<li>
  <span className="player">
    <span className="player-name">Player 1</span>
    <span className="player-symbol">X</span>
  </span>
  <button>Edit</button>
</li>
<li>
  <span className="player">
    <span className="player-name">Player 2</span>
    <span className="player-symbol">O</span>
  </span>
  <button>Edit</button>
</li>
```

### Why Is This a Problem?

If you need to change the class name from `player` to `player-info`, you have to update it in **two places**. That's annoying and error-prone. The more places you repeat markup, the more bugs you'll create.

---

## The Solution: Extract a Component

Create a `Player.jsx` file inside a `components` folder:

```jsx
export default function Player({ name, symbol }) {
  return (
    <li>
      <span className="player">
        <span className="player-name">{name}</span>
        <span className="player-symbol">{symbol}</span>
      </span>
      <button>Edit</button>
    </li>
  );
}
```

### Key Decisions

- **Props make it configurable** — `name` and `symbol` are the two pieces of data that differ between players
- **Self-closing tag** — since we're not using `children`, we can use `<Player />` syntax
- **Descriptive naming** — `Player` clearly describes what this component represents

---

## Using the Component

Back in `App.jsx`:

```jsx
import Player from './components/Player.jsx';

function App() {
  return (
    <main>
      <div id="game-container">
        <ol id="players">
          <Player name="Player 1" symbol="X" />
          <Player name="Player 2" symbol="O" />
        </ol>
      </div>
    </main>
  );
}
```

Now if we need to change the structure, we only change it in **one place** — the `Player` component.

---

## When to Extract a Component

Ask yourself:
- Am I **repeating** similar markup in multiple places?
- Could this piece of UI be **reused** elsewhere?
- Does this block of markup represent a **distinct concept** (like a player, a card, a form field)?

If yes to any of these, it's time to extract.

---

## ✅ Key Takeaways

- Repeated markup = strong signal to create a component
- Props make components configurable and reusable
- Use self-closing tags (`<Player />`) when you don't need children
- Single source of truth — one component, one place to update

## ⚠️ Common Mistakes

- Waiting too long to extract components, leading to bloated parent components
- Not using props to make components flexible — hard-coding values defeats the purpose
- Forgetting to import the component in the file where you use it

## 💡 Pro Tip

A good rule of thumb: if you copy-paste JSX and only change a few values, that's a component waiting to be born. Extract it, parameterize the differences with props, and your code becomes cleaner and more maintainable.
