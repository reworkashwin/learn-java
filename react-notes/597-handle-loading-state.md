# Handle Loading State

## Introduction

We've got data fetching working with `useEffect` — great! But here's the thing: when the backend is slow (and in real-world apps, it often is), the user sees an empty screen or a misleading "No posts yet" message before the data arrives. That's a terrible experience. The user has no idea whether there's genuinely no data or the app is just still loading.

The solution? A **loading state**. A simple boolean that tells your UI: "Hey, we're still fetching data — show a spinner or loading text instead of pretending there's nothing."

---

## Concept 1: The Problem with No Loading State

### 🧠 What is it?

Without a loading state, your component renders its "empty" or "no data" UI during the time between the initial render and when the data arrives from the backend.

### ❓ Why is this a problem?

Imagine you visit a social media feed. For 2 seconds, you see "There are no posts." Then suddenly, posts appear. You'd think the app was broken! The user can't distinguish between "no data exists" and "data is still being fetched."

### ⚙️ How to simulate a slow backend

In the demo backend, we can uncomment a delay line that adds a timeout to the GET request handler. This simulates a slow server and makes the problem visible.

### 💡 Insight

Even if your backend is fast in development (running on localhost), production servers can be slow due to network latency, heavy load, or geographic distance. Always design for the possibility of slow responses.

---

## Concept 2: Adding a Loading State with useState

### 🧠 What is it?

A loading state is simply a **boolean state variable** that tracks whether data is currently being fetched.

### ⚙️ How it works

1. Create a new state: `const [isFetching, setIsFetching] = useState(false)`
2. Set it to `true` **before** the fetch starts
3. Set it to `false` **after** the data arrives
4. Use `isFetching` in your JSX to conditionally render a loading indicator

### 🧪 Example

```jsx
import { useState, useEffect } from 'react';

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setIsFetching(true);
      const response = await fetch('http://localhost:8080/posts');
      const resData = await response.json();
      setPosts(resData.posts);
      setIsFetching(false);
    }

    fetchPosts();
  }, []);

  return (
    <>
      {isFetching && <p>Loading posts...</p>}
      {!isFetching && posts.length > 0 && <PostList posts={posts} />}
      {!isFetching && posts.length === 0 && <p>There are no posts yet.</p>}
    </>
  );
}
```

### 💡 Insight

Notice the three-way conditional rendering:
- **Fetching** → show loading indicator
- **Not fetching + has data** → show the data
- **Not fetching + no data** → show "no posts" message

This gives the user accurate feedback at every point in the lifecycle.

---

## Concept 3: Why Three States Matter

### 🧠 What is it?

Your UI essentially has three distinct scenarios to handle, and conflating them creates a poor user experience:

| State | What the user should see |
|---|---|
| Loading | "Loading posts..." or a spinner |
| Data loaded, posts exist | The list of posts |
| Data loaded, no posts | "There are no posts yet." |

### ❓ Why do we need all three?

Without the loading state, scenarios 1 and 3 look identical to the user. That's misleading. The loading indicator acts as a bridge — it tells the user "hang on, we're working on it."

### 💡 Insight

Think of it like a restaurant. If you sit down and the waiter says "we have no food" — that's very different from "your food is being prepared." Same empty table, but completely different messages. Your UI should communicate the same distinction.

---

## Concept 4: Beyond Loading — Error States

### 🧠 What is it?

In addition to loading and empty states, real applications should also handle **error states**. What if the fetch request fails? What if the server returns a 500?

### ⚙️ How it works

You'd add another state variable (e.g., `error`) and check `response.ok` after the fetch. If the response is not OK, set the error state and display an error message.

### 💡 Insight

While we won't implement error handling in this crash course, keep in mind that production apps need at least three states: **loading**, **success**, and **error**. Libraries like TanStack Query handle all of this for you out of the box.

---

## ✅ Key Takeaways

- Always add a **loading state** when fetching data to provide accurate feedback to users
- Use a boolean state variable (`isFetching`) that's set to `true` before fetching and `false` after
- Differentiate between "loading," "has data," and "no data" in your conditional rendering
- The "no data" message should only show when you're **sure** there's no data — not while you're still fetching

## ⚠️ Common Mistakes

- Showing a "no data" message while data is still being fetched — misleads the user
- Forgetting to set the loading state back to `false` after the fetch completes (especially on errors)
- Not handling the error case — if the fetch fails, the loading spinner spins forever

## 💡 Pro Tips

- Consider using a loading **spinner** component instead of plain text for a more polished UX
- For production apps, explore libraries like TanStack Query that manage loading, error, and data states automatically
- You can also track error state alongside loading state for a complete data-fetching pattern
