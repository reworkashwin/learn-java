# Extracting Dynamic Parameter Values

## Introduction

We know how to create dynamic pages with the square bracket syntax — but a dynamic page isn't very useful if you can't actually *read* the value from the URL. How do you know which news article the user is trying to view? How do you fetch the right data from a database? This section covers how to **extract the concrete value** from the URL inside your component using Next.js's `useRouter` hook.

---

## Concept 1: The `useRouter` Hook

### 🧠 What is it?

`useRouter` is a **custom React hook** provided by Next.js (not built into React itself). It gives you access to the router object, which contains information about the current route — including the dynamic parameter values encoded in the URL.

### ❓ Why do we need it?

You've created `[newsId].js` and it loads for any URL like `/news/some-article`. Great. But inside your component, you need to know *which* article was requested. Was it `some-article`? Was it `42`? Was it `nextjs-is-awesome`? The `useRouter` hook gives you that information.

### ⚙️ How it works

1. Import `useRouter` from `next/router`
2. Call it inside your component to get the `router` object
3. Access `router.query` — this is an object containing all dynamic parameter values
4. The property name on `router.query` matches the identifier you used in the square brackets

```jsx
import { useRouter } from 'next/router';

function DetailPage() {
  const router = useRouter();
  const newsId = router.query.newsId;

  return <h1>Detail Page for: {newsId}</h1>;
}

export default DetailPage;
```

If the file is named `[newsId].js` and the user visits `/news/hello-world`, then `router.query.newsId` will be `"hello-world"`.

### 💡 Insight

The key insight here: the property name on `router.query` **always matches** the identifier between the square brackets in your file name. Named your file `[slug].js`? Use `router.query.slug`. Named it `[id].js`? Use `router.query.id`. It's a direct mapping.

---

## Concept 2: Understanding the Two-Render Cycle

### 🧠 What is it?

When you use `useRouter` and log the query value, you'll notice something unexpected — it logs **twice**. The first time, the value is `undefined`. The second time, it has the actual URL value.

### ❓ Why do we need it?

This behavior can trip you up if you're not expecting it. Understanding *why* it happens prevents bugs — like trying to fetch data with an `undefined` ID on the first render.

### ⚙️ How it works

Here's what happens step by step:

1. **First render**: The component renders immediately. At this point, the router hasn't fully initialized yet, so `router.query.newsId` is `undefined`.
2. **Second render**: The router finishes processing the URL, updates the query data, and the component re-renders with the actual value.

```jsx
const router = useRouter();
console.log(router.query.newsId);
// First log: undefined
// Second log: "something-else" (the actual URL value)
```

This is just how the `useRouter` hook works — it's an asynchronous process.

### 🧪 Example

```jsx
import { useRouter } from 'next/router';

function DetailPage() {
  const router = useRouter();
  console.log(router.query.newsId);

  return <h1>The Detail Page</h1>;
}

export default DetailPage;
```

Visit `/news/this-course-is-great` and check the console:
```
undefined
this-course-is-great
```

### 💡 Insight

This two-render behavior means you should always **guard against undefined** when using the query value. Don't try to fetch data or render something based on `router.query.newsId` without first checking if it exists. A simple `if (!newsId) return <p>Loading...</p>` pattern works well.

---

## Concept 3: Using the Extracted Value in Practice

### 🧠 What is it?

Once you have the dynamic parameter value, you can use it for anything — most commonly for **fetching data** from a backend API or database.

### ❓ Why do we need it?

The whole point of dynamic routes is to display different content based on the URL. The extracted parameter is the key that unlocks that — it tells your component *which* specific piece of content to load.

### ⚙️ How it works

A typical pattern looks like this:

```jsx
import { useRouter } from 'next/router';

function DetailPage() {
  const router = useRouter();
  const newsId = router.query.newsId;

  // In a real app, you'd use this ID to fetch data:
  // fetch(`/api/news/${newsId}`)
  //   .then(res => res.json())
  //   .then(data => setArticle(data));

  return <h1>Showing news article: {newsId}</h1>;
}

export default DetailPage;
```

The `newsId` could be:
- An article slug: `"nextjs-is-great"`
- A database ID: `"42"`
- Any string that identifies a specific resource

### 🧪 Example

Visit different URLs and see how the same component renders different content:
- `/news/react-hooks` → displays "Showing news article: react-hooks"
- `/news/12345` → displays "Showing news article: 12345"

Same component, different data — that's the power of dynamic routes.

### 💡 Insight

The `router` object gives you more than just `query`. It also has methods like `router.push()` for programmatic navigation (navigating via code instead of links). We'll explore that later, but know that `useRouter` is a versatile tool for both reading route data and controlling navigation.

---

## ✅ Key Takeaways

- Import `useRouter` from `next/router` to access route information
- `router.query.paramName` gives you the dynamic segment value, where `paramName` matches your file's bracket identifier
- The component renders twice — first with `undefined`, then with the actual value
- Use the extracted value to fetch data, conditionally render content, or drive any dynamic behavior
- Always guard against `undefined` on the first render

## ⚠️ Common Mistakes

- **Accessing `router.query` before it's ready** — the first render has `undefined` values. Always handle the loading state
- **Mismatching parameter names** — if your file is `[slug].js`, don't try `router.query.id`. The names must match
- **Forgetting to import from `next/router`** — it's not `react-router` or plain `react`. It's `next/router`

## 💡 Pro Tips

- Use destructuring for cleaner code: `const { newsId } = router.query`
- Combine `useRouter` with `useEffect` to fetch data when the parameter changes
- Next.js also offers `getServerSideProps` and `getStaticProps` for server-side data fetching with dynamic params — that's often a better approach than client-side fetching
