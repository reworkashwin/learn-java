# The First Practice Project — Your Tasks

## Introduction

Time to get your hands dirty. The first practice project is an **Investment Calculator** — a form-based app where users enter investment parameters and see year-by-year results in a table. This lesson introduces the project, the starting code, and the specific tasks you need to complete.

---

## The Project — Investment Calculator

### 🧠 What is it?

An application where users input:
- **Current savings** — starting amount
- **Yearly contribution** — how much they add each year
- **Expected return** (interest rate) — annual percentage
- **Investment duration** — number of years

After clicking **Calculate**, a results table appears showing year-by-year data: total savings, interest gained, total interest, and invested capital.

---

## The Starting Code

### ⚙️ What's provided

- An `assets` folder with an image
- `index.css` with all the styles
- `App.js` with:
  - Calculation logic (already written — no need to implement the math)
  - All the JSX markup (but with **hardcoded placeholders**, not dynamic data)
  - TODO comments and hints for your tasks
  - No state management, no event handling — that's your job

### 💡 Insight

The calculation code and JSX structure are given to you intentionally — this project is about practicing **React concepts** (components, state, events, conditional rendering), not about writing investment math formulas.

---

## The Tasks

### Task 1: Split Into Components

Take the single `App` component and break it into multiple smaller components. You decide how granular to be, but you should identify at least a few logical building blocks.

### Task 2: Handle Events

- Handle the **form submit** event when Calculate is clicked
- Handle the **click event** on the Reset button
- Add event handlers and connect them — they don't need to do anything yet

### Task 3: Manage State

- Identify what state needs to be managed
- Store user input values as state
- Decide: multiple `useState` calls or one state object? Both are valid
- Make sure input values are captured and available on form submission
- Store calculation results as state for output

### Task 4: Output Results

- Render the results table **conditionally** — only when data is available
- Show fallback text if no calculation has been performed yet
- Output table rows **dynamically** — one row per year

### Bonus: Styling

- Split `index.css` into component-specific CSS Module files
- Optionally, use styled-components or adjust styles to your preferences

---

## ✅ Key Takeaways

- **Try it yourself first** before looking at the solution — that's where the real learning happens
- The starting code gives you JSX structure and calculation logic — focus on React patterns
- Key skills tested: component splitting, event handling, state management, conditional rendering, dynamic list output
- There's no single "right" solution — different approaches are valid

## ⚠️ Common Mistakes

- Jumping straight to the solution without attempting the project — you'll learn much less
- Over-engineering the component split — start simple, refactor later
- Forgetting two-way binding on inputs (setting the `value` prop)

## 💡 Pro Tips

- Start with Task 1 (splitting components) — having clean components makes everything else easier
- For state, think about **where** the state is needed and **which component** should own it
- If you get stuck on one task, skip to the next and come back — sometimes later tasks clarify earlier ones
