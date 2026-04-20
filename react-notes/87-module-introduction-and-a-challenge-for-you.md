# Module Introduction & A Challenge For You!

## Introduction

Welcome to a brand new section — **React Essentials: Practice Project**. This is where you put everything you've learned into action by building an **Investment Calculator** from scratch. No new concepts here — just pure practice with components, state, conditional rendering, and list output.

---

## The Project: Investment Calculator

### 🧠 What Are We Building?

A web application where users can:
1. Enter investment parameters (initial investment, annual contribution, expected return rate, duration)
2. See a table of calculated results showing the future value of their investment year by year

It's a practical, real-world tool that exercises all the core React patterns you've learned.

---

## What's Provided in the Starting Project

### 📁 Project Structure

The starting project gives you several helpful files:

**1. `index.css`** — Pre-written CSS styles
- You don't need to write any CSS
- The CSS contains hints about component structure (look for IDs and class names like `user-input`, `input-group`, etc.)

**2. `util/investment.js`** — Calculation logic
- `calculateInvestmentResults(params)` — Takes investment parameters and returns yearly results
- `formatter` — A utility object for formatting numbers as currency

These are provided so you can **focus on React concepts** instead of math and formatting logic.

**3. `assets/`** — Contains an image (logo) you can use

---

## The Challenge

### 🎯 Your Task

Build the complete Investment Calculator using the React concepts you've learned:

- **Components** — Split the UI into logical, reusable parts
- **State** — Manage user input and use it to compute results
- **Two-way binding** — Connect input fields to state
- **List rendering** — Display results in a table
- **Conditional content** — Show results only when valid data is available

### ❓ Possible Component Structure

Based on the CSS hints:
- `Header` — Logo and title
- `UserInput` — Input fields for investment parameters
- `Results` — Table showing calculated investment data

### 💡 How to Approach It

1. Start with the structure — create your components
2. Add the header with the logo
3. Build the input fields and connect them with state
4. Use the provided `calculateInvestmentResults` function to compute data
5. Display results in a table

---

## Don't Get Discouraged

This is meant to be challenging. If you get stuck:
- That's **normal** — it's part of learning
- Review previous lessons for specific patterns
- The following lectures walk through a complete solution

And remember: there's **no single correct solution**. Multiple approaches work.

---

## ✅ Key Takeaways

- Practice is where real learning happens — reading about React isn't the same as building with it
- Use the provided CSS and utilities so you can focus on React concepts
- There's no single correct answer — different component structures and state management approaches can all work
- Struggling is part of the process — don't skip ahead without trying first

## 💡 Pro Tips

- Before writing code, sketch out your component tree on paper
- Look at the CSS file for hints about what IDs and class names to use
- Start simple — get something on screen, then add interactivity
- The `calculateInvestmentResults` function and `formatter` object are your friends — import and use them instead of reinventing the wheel
