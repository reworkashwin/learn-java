# Fetching Data By Leveraging Next.js & Fullstack Capabilities

## Introduction

In a vanilla React app, loading data from a database involves setting up a separate backend, creating API endpoints, and using `useEffect` + `fetch` on the client. In Next.js, you can skip all of that. Because your components are **Server Components** by default, you can reach out to the database **directly** from your component. No API layer needed. No `useEffect`. No fetch calls. This is one of the most powerful features of Next.js.

---

## The Traditional React Way (That We Don't Need)

In a standard React app, data fetching looks like this:

```jsx
// Traditional approach — NOT needed in Next.js!
useEffect(() => {
  fetch('/api/meals')
    .then(res => res.json())
    .then(data => setMeals(data));
}, []);
```

You'd also need to build that `/api/meals` endpoint on a backend. That's a lot of plumbing.

---

## The Next.js Way: Direct Database Access

Since your page component is a **Server Component** (runs only on the server), you can safely import database logic and call it directly:

### Step 1: Create a Data Access Layer

Create a `lib/meals.js` file to keep database logic organized:

```javascript
import sql from 'better-sqlite3';

const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // simulated delay
  return db.prepare('SELECT * FROM meals').all();
}
```

- `db.prepare()` sets up a SQL statement
- `.all()` executes it and returns **all matching rows** (use `.get()` for a single row)
- The `async` keyword and artificial delay are added to simulate real-world latency (useful for testing loading states later)

### Step 2: Use It Directly in Your Page Component

```jsx
import MealsGrid from '@/components/meals/meals-grid';
import { getMeals } from '@/lib/meals';

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <main>
      <MealsGrid meals={meals} />
    </main>
  );
}
```

### Wait — `async` on a Component Function?

Yes! This is another superpower of Server Components. You **can** make a Server Component function `async` and use `await` inside it. This is not possible with regular React components, but Server Components unlock it because they execute on the server where async operations are natural.

---

## Why This Is Safe

You might worry: "Isn't it dangerous to access a database from a component?" In traditional React, absolutely — because components run in the browser, and you'd be exposing database credentials.

But Server Components **never execute in the browser**. Their code is never shipped to the client. The user never sees your database connection logic, your SQL queries, or your credentials. They only receive the rendered HTML result.

Think of it like a restaurant kitchen: the customer (browser) sees the finished plate (HTML), but never enters the kitchen (server) where the cooking (database queries) happens.

---

## ✅ Key Takeaways

- Server Components can directly access databases — no API layer needed
- Use `async/await` in Server Component functions to handle asynchronous data fetching
- The `.all()` method fetches all rows; `.get()` fetches a single row
- Keep data access logic in a `lib/` folder for clean separation of concerns
- Server Component code is never exposed to the client — it's safe to use secrets and database connections

## ⚠️ Common Mistakes

- Using `useEffect` to fetch data in a Server Component — you don't need it, and it would require converting to a Client Component
- Forgetting that `async` components only work for **Server** Components — you can't make a Client Component async

## 💡 Pro Tip

Organize your database queries in a `lib/` directory with descriptive file names like `meals.js`, `users.js`, etc. This keeps your page components clean and your data logic reusable.
