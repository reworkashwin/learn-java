# Data Fetching for Static Pages

## Introduction

We've seen the problem: `useEffect` data fetching doesn't make it into the pre-rendered HTML. So how do we get data into our pages **before** they're rendered? Enter `getStaticProps` — one of Next.js's most powerful features. This special function lets you fetch data at build time, pass it to your component as props, and ensure the pre-rendered HTML includes all the content search engines (and users) need to see.

---

## Concept 1: Two Forms of Pre-Rendering

### 🧠 What is it?

Next.js provides two strategies for pre-rendering pages with data:

1. **Static Generation (SSG)** — Pages are pre-rendered at **build time**
2. **Server-Side Rendering (SSR)** — Pages are pre-rendered **on every request**

### ❓ Why do we need two options?

Different pages have different needs. A blog post that rarely changes? Static Generation is perfect. A user dashboard with real-time data? Server-Side Rendering might be better. Having both options gives you the flexibility to choose the right approach for each page.

### 💡 Insight

**Static Generation is the recommended default.** Most pages don't change with every request, and pre-building them at deploy time is faster and more efficient. Reach for Server-Side Rendering only when you truly need per-request freshness.

---

## Concept 2: `getStaticProps` — The Core of Static Generation

### 🧠 What is it?

`getStaticProps` is a special function you export from a **page component file** (not regular components — only files inside the `pages/` folder). Next.js calls this function during the build process, **before** rendering the component.

### ❓ Why do we need it?

It solves the pre-rendering problem: instead of fetching data on the client after render, you fetch it on the server before render. The data becomes part of the initial HTML.

### ⚙️ How it works

1. Export an `async` function called `getStaticProps` from your page file
2. Inside it, fetch your data (from an API, database, file system — anything)
3. Return an object with a `props` key containing the data
4. Your component receives this data via `props`
5. Next.js renders the component with that data and generates static HTML

### 🧪 Example

```jsx
// pages/index.js
import MeetupList from '../components/meetups/MeetupList';

const DUMMY_MEETUPS = [
  { id: 'm1', title: 'A First Meetup', image: '...', address: '...' },
  { id: 'm2', title: 'A Second Meetup', image: '...', address: '...' },
];

function HomePage(props) {
  return <MeetupList meetups={props.meetups} />;
}

export async function getStaticProps() {
  // Fetch data from an API, database, file system, etc.
  return {
    props: {
      meetups: DUMMY_MEETUPS,
    },
  };
}

export default HomePage;
```

### 💡 Insight

Notice how clean the component becomes — no `useState`, no `useEffect`, no loading states. The component just receives `props.meetups` and renders. All the data fetching complexity is handled outside the component lifecycle.

---

## Concept 3: What Makes `getStaticProps` Special

### 🧠 What is it?

`getStaticProps` isn't just another function — it has unique characteristics that make it incredibly powerful.

### ⚙️ How it works

| Feature | Detail |
|---------|--------|
| **When it runs** | During the build process (not on client, not per-request) |
| **Can be async** | ✅ Yes — Next.js waits for the Promise to resolve |
| **Access to server-side code** | ✅ Can use `fs`, database connections, secrets |
| **Code reaches the client?** | ❌ Never — code in `getStaticProps` is stripped from the client bundle |
| **Where it works** | Only in page component files (inside `pages/`) |

### ❓ Why is it safe to use server-side code?

Because `getStaticProps` runs **only during the build process**. The code inside it never ships to the browser. This means you can:
- Read files from the file system with `fs.readFileSync`
- Connect directly to a database
- Use API keys and secrets without exposing them

### 🧪 Example

```jsx
export async function getStaticProps() {
  // This code ONLY runs on the server during build
  // It will NEVER reach the client's browser
  const res = await fetch('https://api.example.com/meetups');
  const data = await res.json();

  return {
    props: {
      meetups: data,
    },
  };
}
```

### 💡 Insight

Think of `getStaticProps` as a backstage pass. It runs behind the curtain, gathers everything the component needs, and hands it over through the `props` door. The audience (the browser) never sees what happened backstage.

---

## Concept 4: The Result — Pre-Rendered HTML with Data

### 🧠 What is it?

After using `getStaticProps`, the pre-rendered HTML now contains all the data — no empty lists, no missing content.

### ⚙️ How it works

**Before (with `useEffect`):**
```html
<ul>
  <!-- Empty! Data loads on client -->
</ul>
```

**After (with `getStaticProps`):**
```html
<ul>
  <li>
    <img src="..." alt="A First Meetup" />
    <h3>A First Meetup</h3>
    ...
  </li>
  <li>
    <img src="..." alt="A Second Meetup" />
    <h3>A Second Meetup</h3>
    ...
  </li>
</ul>
```

### 💡 Insight

This is the **entire reason** Next.js exists for many developers. You get the React developer experience with SEO-friendly, fully pre-rendered pages. And `getStaticProps` is the function that makes it all possible.

---

## ✅ Key Takeaways

- `getStaticProps` is a special function exported from page component files that runs at **build time**
- It fetches data before the component renders, passing it through `props`
- The function is `async` — Next.js waits for all data to be ready before generating HTML
- Code inside `getStaticProps` **never reaches the client** — safe for secrets, DB connections, file system access
- The result is fully pre-rendered HTML that includes all fetched data — perfect for SEO
- Only works in files inside the `pages/` folder — not in regular component files

## ⚠️ Common Mistakes

- **Trying to use `getStaticProps` in non-page components** — It only works in files within the `pages/` directory
- **Returning the wrong structure** — You must return `{ props: { ... } }`. Forgetting the `props` wrapper will break things
- **Still using `useEffect` for data that should be pre-rendered** — If the data needs to be in the initial HTML, use `getStaticProps` instead

## 💡 Pro Tips

- You can still use `useEffect` alongside `getStaticProps` — for example, to fetch additional data client-side that doesn't need SEO
- `getStaticProps` receives a `context` parameter that gives you access to route params — useful for dynamic pages
