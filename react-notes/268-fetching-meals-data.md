# Fetching Meals Data (GET HTTP Request)

## Introduction

Our header is done. Now for the core feature — loading and displaying meals from the backend. This is where things get interesting because we need to combine multiple concepts: **HTTP requests**, **state management**, and the **useEffect hook** to avoid infinite loops.

If you've followed the HTTP requests section earlier in the course, this will feel like a natural progression. If you skipped it — go back and complete it first.

---

## The Goal

Send a GET request to `http://localhost:3000/meals`, receive an array of meal objects, and display them in the UI. Each meal has:
- `id` — unique identifier
- `name` — meal title
- `description` — what it contains
- `price` — cost
- `image` — relative path to the image file

---

## Step 1: Setting Up the Component

```jsx
// src/components/Meals.jsx
import { useState, useEffect } from 'react';

export default function Meals() {
  const [loadedMeals, setLoadedMeals] = useState([]);

  // ... fetching logic coming next

  return (
    <ul id="meals">
      {loadedMeals.map((meal) => (
        <li key={meal.id}>{meal.name}</li>
      ))}
    </ul>
  );
}
```

We start with an **empty array** as the initial state because the data isn't available when the component first renders. The UI will show nothing initially, then update once the data arrives.

---

## Step 2: The Fetching Logic

```jsx
useEffect(() => {
  async function fetchMeals() {
    const response = await fetch('http://localhost:3000/meals');
    const meals = await response.json();
    setLoadedMeals(meals);
  }

  fetchMeals();
}, []);
```

There's a lot packed into this small block. Let's unpack it.

---

## Why useEffect? The Infinite Loop Problem

Why can't we just call `fetch` directly in the component function?

```jsx
// ❌ DON'T DO THIS
function Meals() {
  const [loadedMeals, setLoadedMeals] = useState([]);
  
  fetch('http://localhost:3000/meals')
    .then(res => res.json())
    .then(data => setLoadedMeals(data));  // Updates state → re-render → fetch again → 💥
  
  return <ul>...</ul>;
}
```

Here's the loop:
1. Component renders
2. `fetch` is called
3. Response arrives, `setLoadedMeals` updates state
4. State change triggers a re-render
5. Component renders again → go to step 2
6. **Infinite loop!**

`useEffect` with an empty dependency array (`[]`) ensures the fetch runs **once after the initial render** and never again.

---

## Why a Nested Async Function?

You might wonder why we don't just make the effect function itself async:

```jsx
// ❌ This doesn't work properly
useEffect(async () => {
  const response = await fetch('...');
  // ...
}, []);
```

React expects the effect function to return either **nothing** or a **cleanup function**. An `async` function returns a Promise, which React can't use as a cleanup function. So instead, we define an async function **inside** the effect and immediately call it.

---

## The response.json() Call

`fetch` returns a Response object. To extract the JSON data, we call `.json()` on it. This also returns a Promise (which is why we `await` it twice):

```jsx
const response = await fetch('http://localhost:3000/meals');  // await #1: the network request
const meals = await response.json();                          // await #2: parsing the response body
```

---

## The Empty Dependencies Array

```jsx
useEffect(() => {
  // ...
}, []);  // ← empty array
```

This means: "Run this effect once, after the first render. Never run it again."

We don't need dependencies here because:
- We're not using any props
- We're not using any state inside the effect
- `setLoadedMeals` is guaranteed stable by React (it never changes)

---

## Using the Component

```jsx
// src/App.jsx
import Header from './components/Header';
import Meals from './components/Meals';

function App() {
  return (
    <>
      <Header />
      <Meals />
    </>
  );
}
```

After this, you should see the meal names rendered as a basic list. Not pretty yet — but the data is flowing.

---

## What We're Skipping (For Now)

- **Error handling**: What if the request fails? We'll add this later.
- **Loading state**: What if the request takes a while? Also later.
- **Rich UI**: We're just showing names. A `MealItem` component is coming next.

The goal right now is to prove the data pipeline works: backend → fetch → state → UI.

---

## ✅ Key Takeaways

- Use `useEffect` with an empty `[]` dependency array to fetch data once on mount
- Define an `async` function **inside** the effect, then call it — don't make the effect itself async
- `response.json()` is async too — it returns a Promise that needs to be awaited
- Start with `useState([])` for list data — the UI renders an empty list first, then updates

## ⚠️ Common Mistakes

- Calling `fetch` directly in the component body without `useEffect` → **infinite loop**
- Making the `useEffect` callback async → React can't handle the returned Promise
- Forgetting `response.json()` → you get a Response object instead of actual data
- Adding `setLoadedMeals` to the dependency array → it's stable and unnecessary (though not harmful)

## 💡 Pro Tip

The pattern of `useEffect` + `async function` + `useState` for data fetching is so common that many developers extract it into a **custom hook** like `useFetch` or `useHttp`. If you find yourself repeating this pattern across components, that's a strong signal to create a reusable hook.
