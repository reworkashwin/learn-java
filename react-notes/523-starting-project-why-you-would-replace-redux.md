# Starting Project & Why You Would Replace Redux

## Introduction

Before we start replacing Redux, let's understand the starting point. We have a simple app that uses traditional Redux for state management — and it works perfectly fine. So why would anyone want to replace it? Let's walk through the project structure and explore the real reasons developers consider ditching Redux.

---

### Concept 1: The Starting Project

#### 🧠 What is it?

The demo project is a simple React app with:
- A **list of fictional products**
- A **favorites section** where you can mark/unmark products as favorites
- Two pages you can navigate between

#### ⚙️ How it works

The app uses **traditional Redux** with:
- A `productReducer` with initial state containing products (each with `id`, `title`, `description`, and `isFavorite`)
- A single action (`TOGGLE_FAV`) that flips the favorite status of a product
- `useSelector` (from `react-redux` v7+) in `Products.js` and `Favorites.js` to read state slices
- `useDispatch` in `ProductItem.js` to dispatch the toggle action

```
store/
  reducers/products.js    → reducer with initial state + TOGGLE_FAV logic
  actions/products.js     → action creator for toggling favorites
containers/
  Products.js             → useSelector to get all products
  Favorites.js            → useSelector to get favorite products
components/
  ProductItem.js          → useDispatch to toggle favorite status
```

#### 💡 Insight

This is a deliberately simple app so we can focus on the *state management approach*, not the app's complexity. In a real-world scenario, this could be part of a much larger e-commerce application.

---

### Concept 2: Why Replace Redux?

#### 🧠 What is it?

The question of whether to replace Redux is a trade-off decision — there's nothing inherently wrong with Redux.

#### ❓ Why do we need it?

There are a few legitimate reasons to consider alternatives:

1. **Stay React-only** — No need to learn or maintain an extra library. Fewer concepts, simpler mental model
2. **Smaller bundle size** — Removing `redux` and `react-redux` means less JavaScript shipped to the browser. Your app loads faster
3. **Curiosity and flexibility** — Understanding how to manage global state without Redux makes you a more versatile developer

#### ⚠️ Common Mistakes

- **Thinking Redux is bad** — It's not. Redux is battle-tested, well-optimized, and great for large apps. Don't replace it just because you can
- **Over-optimizing bundle size** — In large apps, the Redux library size is negligible compared to your own code

#### 💡 Insight

The instructor emphasizes: **"There's nothing wrong with Redux."** The goal here is to explore alternatives, not to bash Redux. Think of it as expanding your toolkit — the more patterns you understand, the better decisions you'll make on real projects.

---

### Concept 3: Two Approaches Ahead

#### 🧠 What is it?

This module will cover **two different approaches** to replacing Redux:

1. **Context API** — Good in some cases, but not ideal for all
2. **Custom Hook Store** — A more powerful, Redux-like alternative built with just React hooks

#### ⚙️ How it works

We'll implement both approaches on the same demo project so you can compare them directly. The instructor will explain when each approach shines and where it falls short.

#### 💡 Insight

Not every tool is right for every job. The Context API works great for **low-frequency updates** (like authentication or theming) but struggles with **high-frequency changes** (like toggling favorites in a product list). The custom hook store approach is closer to what Redux does under the hood.

---

## ✅ Key Takeaways

- The starting project uses traditional Redux with `useSelector` and `useDispatch`
- Redux works perfectly — replacing it is a choice, not a necessity
- Valid reasons to replace: staying React-only, reducing bundle size, exploring alternatives
- Two approaches will be covered: Context API and a custom hook-based store

## 💡 Pro Tips

- Always consider your app's scale before choosing a state management approach — what works for a small app may not scale well
- Understanding Redux internals helps you appreciate what the custom hook store is doing
