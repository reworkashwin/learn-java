# How NOT To Send HTTP Requests (And Why It's Wrong)

## Introduction

You know you need to fetch data from a backend. You know about the `fetch` function. So you just... write it directly in your component function, right? **Wrong.** This is one of the most common mistakes beginners make, and it creates an **infinite loop** that will hammer your server with requests. Let's understand why, and set up the correct approach.

---

## The `fetch` Function: A Quick Primer

JavaScript provides a built-in `fetch` function for sending HTTP requests. Despite its name, it can both **fetch** and **send** data.

### Basic Usage

```jsx
fetch('http://localhost:3000/places')
```

This sends a **GET request** to the specified URL and returns a **Promise** — a wrapper around a value that isn't available yet but will be eventually.

### Working with the Response

```jsx
fetch('http://localhost:3000/places')
  .then(response => response.json())   // Parse the JSON body
  .then(resData => {
    // resData.places contains our array of places
    setAvailablePlaces(resData.places);
  });
```

- **`.then()`** chains a callback that runs when the Promise resolves
- **`response.json()`** extracts and parses JSON data from the response (also returns a Promise)
- The second `.then()` gives us the actual data we can use

### What About async/await?

You might want to write:

```jsx
const response = await fetch('http://localhost:3000/places');
const resData = await response.json();
```

This is cleaner, but `await` requires the enclosing function to be marked `async`. And **React does not allow component functions to be `async`**. So we can't use this syntax directly in the component function (but we will use it elsewhere soon).

---

## The Infinite Loop Problem

Here's the naive approach that creates disaster:

```jsx
function AvailablePlaces() {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  // ❌ DANGER: This creates an infinite loop!
  fetch('http://localhost:3000/places')
    .then(response => response.json())
    .then(resData => {
      setAvailablePlaces(resData.places); // Updates state
    });

  return <Places places={availablePlaces} />;
}
```

### Why It Loops Forever

Follow the execution:

1. Component function executes → `fetch()` sends a request
2. Response arrives → `setAvailablePlaces()` updates state
3. State update causes component to **re-render** → function executes again
4. `fetch()` sends **another** request
5. Response arrives → state updates again
6. Another re-render → another fetch → another update → **forever**

```
render → fetch → setState → render → fetch → setState → render → ...
```

Your browser starts firing hundreds of requests per second. Your server gets overwhelmed. Your app becomes unresponsive. This is not theoretical — this is exactly what happens.

---

## The Solution: useEffect

If this problem sounds familiar, it's because we covered this exact pattern in the **side effects** module. Code that interacts with external systems (like sending HTTP requests) is a **side effect**, and side effects need to be managed carefully.

The answer is `useEffect`:

```jsx
import { useState, useEffect } from 'react';

function AvailablePlaces() {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/places')
      .then(response => response.json())
      .then(resData => {
        setAvailablePlaces(resData.places);
      });
  }, []); // Empty dependency array = run once after first render

  return <Places places={availablePlaces} />;
}
```

### Why This Fixes It

- The effect function runs **after** the component renders
- The empty dependency array `[]` means the effect runs **only once** — after the initial render
- Even though `setAvailablePlaces` triggers a re-render, the effect won't run again because its dependencies haven't changed
- No infinite loop!

---

## ✅ Key Takeaways

- `fetch()` is a built-in browser function for sending HTTP requests
- It returns a Promise — use `.then()` to handle the response
- **Never call `fetch()` directly in a component function** — it creates an infinite loop
- The loop happens because: fetch → setState → re-render → fetch → setState → ...
- Wrap HTTP requests in `useEffect` with appropriate dependencies
- An empty dependency array `[]` ensures the request is sent only once

## ⚠️ Common Mistake

Forgetting the dependency array in `useEffect`:

```jsx
// ❌ No dependency array = runs after EVERY render = still an infinite loop!
useEffect(() => {
  fetch(url).then(...).then(data => setState(data));
});
```

Always include the dependency array. An empty array `[]` means "run once." Omitting it entirely means "run after every render."

## 💡 Pro Tip

The `fetch` function's name is misleading — it's not just for fetching data. You can use it for POST, PUT, DELETE, and any other HTTP method. We'll see this later when sending data to the backend.
