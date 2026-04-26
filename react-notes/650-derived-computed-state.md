# Derived / Computed State

## Introduction

Not every value in your component needs its own `useState`. If a value can be **calculated** from existing state, it should be. This lecture introduces the concept of **derived (computed) state** — a cleaner, more elegant alternative to managing redundant state that mirrors other state.

---

## The Problem — Redundant State

### 🧠 What is it?

Imagine you have a year filter (`filteredYear`) in state, and you also want to show a text like "Data for years 2019, 2021, and 2022 is hidden." You *could* manage that text as its own piece of state:

```jsx
const [filteredYear, setFilteredYear] = useState('2020');
const [filterInfoText, setFilterInfoText] = useState('2019, 2021, 2022');
```

Then update `filterInfoText` whenever `filteredYear` changes. But should you?

### ❓ Why is this a problem?

The info text is **entirely determined** by `filteredYear`. It's not independent data — it's just a transformation of existing state. Managing it as separate state means:
- Two pieces of state that must stay in sync
- Extra code to update the derived state whenever the source state changes
- More opportunities for bugs if they get out of sync

---

## The Solution — Derived Values

### ⚙️ How it works

Instead of a second `useState`, just use a **regular variable** inside your component function. Compute its value based on the existing state:

```jsx
const [filteredYear, setFilteredYear] = useState('2020');

let filterInfoText = '2019, 2021, 2022'; // default

if (filteredYear === '2019') {
  filterInfoText = '2020, 2021, 2022';
} else if (filteredYear === '2020') {
  filterInfoText = '2019, 2021, 2022';
} else if (filteredYear === '2021') {
  filterInfoText = '2019, 2020, 2022';
} else {
  filterInfoText = '2019, 2020, 2021';
}
```

### 💡 Insight

> Why does this work? Because **when state changes, the entire component function re-executes**. So every time `filteredYear` changes, this code runs again, and `filterInfoText` gets a fresh, correct value automatically. No extra state management needed.

---

## Before vs. After

**Before — Redundant State (avoid this):**
```jsx
const [filteredYear, setFilteredYear] = useState('2020');
const [filterInfoText, setFilterInfoText] = useState('2019, 2021, 2022');

const filterChangeHandler = (selectedYear) => {
  setFilteredYear(selectedYear);
  if (selectedYear === '2019') setFilterInfoText('2020, 2021, 2022');
  else if (selectedYear === '2020') setFilterInfoText('2019, 2021, 2022');
  // ... more conditions
};
```

**After — Derived Value (preferred):**
```jsx
const [filteredYear, setFilteredYear] = useState('2020');

let filterInfoText = '2019, 2021, 2022';
if (filteredYear === '2019') filterInfoText = '2020, 2021, 2022';
// ... derive directly from filteredYear
```

Less code, fewer states to manage, zero risk of getting out of sync.

---

## The Rule of Thumb

> **If a value can be computed from existing state or props, don't store it as state. Derive it.**

Common examples of derived values:
- Filtered/sorted lists derived from an array in state
- Computed totals or counts from a list
- Display text that depends on a selection
- Boolean flags like `isEmpty` derived from `items.length === 0`

---

## ✅ Key Takeaways

- **Derived state** (or computed state) is a value calculated from existing state — not stored in its own `useState`
- It works because component functions **re-execute** on every state change, recomputing derived values automatically
- Avoid managing **redundant state** that just mirrors or transforms other state
- Use regular variables (with `let` or `const`) for derived values
- This leads to cleaner, simpler, and less error-prone code

## ⚠️ Common Mistakes

- Creating a new `useState` for every piece of data — even when it's derivable from existing state
- Forgetting to update the derived state when the source state changes (which is exactly why you should derive instead)
- Over-engineering with `useEffect` to sync two related states — just derive the value instead

## 💡 Pro Tips

- Before adding a new `useState`, always ask: "Can I compute this from state I already have?"
- Derived values are essentially **free** — they're recalculated on every render but cost nothing in terms of state management complexity
- This concept becomes even more powerful with `useMemo` for expensive computations (which you'll learn later)
