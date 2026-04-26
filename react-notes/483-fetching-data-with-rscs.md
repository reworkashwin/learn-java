# Fetching Data with React Server Components

## Introduction

One of the most exciting benefits of React Server Components is how they transform **data fetching**. Forget `useEffect` → `fetch` → `setState` chains. With server components, you can fetch data **directly inside the component** using server-side code — even Node.js APIs like the file system! The data is fetched on the server, the HTML is rendered there, and the finished page (complete with data) is sent to the browser. No loading spinners needed for the initial load. Let's see how this works.

---

## Concept 1: Server-Side Data Fetching in Components

### 🧠 What is it?

React Server Components can contain **server-side code** — including Node.js APIs — directly inside the component function. Since the component executes on the server, this code runs in a Node.js environment, not the browser.

### ❓ Why do we need it?

Traditional data fetching in React involves:
1. Rendering the component (empty)
2. Showing a loading state
3. Fetching data in `useEffect`
4. Updating state with the data
5. Re-rendering with the data

This creates a delay between when the page loads and when the data appears. With server components, the data is already included in the initial HTML — no extra round trip needed.

### ⚙️ How it works

1. Mark the component as `async` (server components support this)
2. Write server-side code (file reads, database queries, etc.) directly in the component
3. Use `await` to wait for the data
4. Render the data in JSX

```jsx
import fs from 'node:fs/promises';

export default async function DataFetchingDemo() {
  const fileContent = await fs.readFile('dummy-db.json', 'utf-8');
  const users = JSON.parse(fileContent);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 🧪 Example

- No `"use client"` directive — this is a server component
- The `async` keyword is used on the component function
- Node.js `fs` module reads from a JSON file (simulating a database)
- The finished HTML with user data is sent to the client

### 💡 Insight

In a Vite-based React project, this code would **crash**. You can't use `fs` in the browser, and React doesn't support `async` component functions on the client. But in a server component, it works perfectly because the code runs in Node.js.

---

## Concept 2: Why This Is Better Than `useEffect`

### 🧠 What is it?

A comparison of server-side data fetching vs. the traditional client-side approach.

### ⚙️ How it works

**Traditional approach (client component):**
```jsx
"use client";
import { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Server component approach:**
```jsx
import fs from 'node:fs/promises';

export default async function UserList() {
  const data = await fs.readFile('dummy-db.json', 'utf-8');
  const users = JSON.parse(data);
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

The server component version is:
- **Simpler** — no state management, no effects
- **Faster** — data is included in the initial HTML
- **More secure** — server-side code never reaches the browser

### 💡 Insight

Server components vastly simplify data fetching. Instead of fetching from a separate backend, the **component IS the backend** — the data loading code lives right next to the rendering code.

---

## Concept 3: Using It in Your Page

### 🧠 What is it?

Integrating the data-fetching server component into your Next.js page.

### ⚙️ How it works

In your `page.js`:

```jsx
import DataFetchingDemo from '@/components/DataFetchingDemo';

export default function Home() {
  return <DataFetchingDemo />;
}
```

That's it. The component fetches data on the server, renders the HTML, and sends the finished result to the browser. The user sees the data immediately — no loading state needed for the initial page load.

### 💡 Insight

The `page.js` file in Next.js is itself a server component, so you can even do data fetching directly in `page.js` and pass the data as props to child components.

---

## ✅ Key Takeaways

- Server components can contain **server-side code** (Node.js APIs, database queries, etc.)
- Use `async/await` directly in the component function for data fetching
- Data is fetched on the server and included in the **initial HTML** sent to the client
- No need for `useEffect`, `useState`, or loading states for server-fetched data
- This approach is simpler, faster, and more secure than client-side data fetching

## ⚠️ Common Mistakes

- Trying to use Node.js APIs (like `fs`) in client components — they only work in server components
- Forgetting to add `async` to the component function when using `await`
- Adding `"use client"` to a component that does data fetching with server-side code

## 💡 Pro Tips

- Use a `dummy-db.json` file to simulate a database during development
- Keep data-fetching logic in server components and pass the data down as props to client components when needed
- Remember: the less code you send to the browser, the faster your app loads
