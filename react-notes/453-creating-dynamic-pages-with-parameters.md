# Creating Dynamic Pages with Parameters

## Introduction

So far, our routes have been static — each file maps to one specific URL. But what about pages that need to work for *many* different values? Think of a news detail page that loads different articles based on the URL, or a product page that displays different products. You can't create a separate file for every possible article or product — that's not scalable. This is where **dynamic routes** come in, and they're one of the most powerful features of Next.js's file-based routing system.

---

## Concept 1: The Problem with Static File Names

### 🧠 What is it?

When we create a file like `something-important.js` in the `news` folder, that page only loads for the exact path `/news/something-important`. It's **hardcoded** — one file, one route, one value.

### ❓ Why do we need it?

In the real world, this is almost never what you want. Consider a news website:
- You have hundreds or thousands of articles
- Each article has its own unique identifier (slug or ID)
- You want `/news/nextjs-is-great`, `/news/react-hooks-explained`, `/news/any-article-slug` to all load the same detail page component
- The component then fetches the right data based on which slug is in the URL

Creating a separate `.js` file for every single article? That's obviously not going to work. You need **one page component** that works for **any value** in that URL segment.

### 💡 Insight

This is the same concept as route parameters in React Router (`:id`) or path variables in Express.js (`:param`). Next.js just does it through file naming conventions instead of code configuration.

---

## Concept 2: Dynamic Routes with Square Bracket Syntax

### 🧠 What is it?

Next.js uses a special **square bracket syntax** in file names to create dynamic routes. Instead of naming your file `something-important.js`, you name it `[newsId].js` (or any identifier you choose between the brackets).

### ❓ Why do we need it?

This tells Next.js: "This page should load for *any* value in this URL segment." The square brackets signal that the segment is dynamic — it's a placeholder, not a literal path.

### ⚙️ How it works

1. Rename your file to use square brackets: `[newsId].js`
2. The name inside the brackets (`newsId`) becomes the **parameter name** — you'll use this later to extract the actual value
3. Next.js will now match this page for any value in that path segment

```
pages/
  news/
    index.js       → /news
    [newsId].js    → /news/anything-goes-here
```

So now:
- `/news/something-important` → loads `[newsId].js`
- `/news/nextjs-rocks` → loads `[newsId].js`
- `/news/12345` → loads `[newsId].js`
- `/news/literally-anything` → loads `[newsId].js`

All of these load the **same component**, but with different values for `newsId`.

### 🧪 Example

**pages/news/[newsId].js**
```jsx
function DetailPage() {
  return <h1>The Detail Page</h1>;
}

export default DetailPage;
```

Visit any of these URLs and you'll see "The Detail Page":
- `localhost:3000/news/thiscourseisgreat`
- `localhost:3000/news/something-else`
- `localhost:3000/news/42`

### 💡 Insight

The identifier name between the brackets is **entirely up to you**. You could use `[id]`, `[slug]`, `[newsId]`, `[postIdentifier]` — whatever makes sense for your use case. Choose something descriptive, because you'll reference this name when extracting the value later.

---

## Concept 3: How Dynamic and Static Routes Coexist

### 🧠 What is it?

When you have both `index.js` and `[newsId].js` in the same folder, Next.js knows how to handle them:
- `/news` → matches `index.js` (the exact match)
- `/news/anything` → matches `[newsId].js` (the dynamic catch)

### ❓ Why do we need it?

You almost always need both — a **list page** (index) and a **detail page** (dynamic). The news list at `/news` shows all articles, and clicking one takes you to `/news/some-article-id` which loads the detail component.

### ⚙️ How it works

Next.js uses a priority system:
1. **Exact matches** are checked first — if a file name matches the path segment exactly, it wins
2. **Dynamic segments** are the fallback — `[param].js` catches everything that doesn't match a specific file

So if you had:
```
pages/
  news/
    index.js        → /news (exact)
    featured.js     → /news/featured (exact)
    [newsId].js     → /news/anything-else (dynamic fallback)
```

Visiting `/news/featured` loads `featured.js`, not `[newsId].js`. The exact match takes priority.

### 💡 Insight

This priority system means you can have both "known" routes and dynamic catch-all routes side by side. It's flexible and predictable — exact matches always win over dynamic ones.

---

## ✅ Key Takeaways

- Dynamic routes are created by wrapping the file name in square brackets: `[paramName].js`
- The page loads for **any value** in that URL segment
- The name inside the brackets becomes the parameter identifier for extracting the value later
- Static/exact file names take priority over dynamic routes
- Dynamic routes are essential for data-driven pages (product details, blog posts, user profiles, etc.)

## ⚠️ Common Mistakes

- **Forgetting the square brackets** — `newsId.js` is a static route for `/news/newsId`, not a dynamic route
- **Using spaces or special characters** inside the brackets — stick to camelCase or simple identifiers like `[newsId]` or `[slug]`
- **Creating a static file that conflicts** — if you have both `featured.js` and `[id].js`, remember that `/news/featured` will always load `featured.js`

## 💡 Pro Tips

- Choose meaningful parameter names — `[newsId]` is much clearer than `[id]` when you have multiple dynamic routes in your app
- Dynamic routes are just the first step — in the next section, you'll learn how to actually **extract** the dynamic value and use it in your component
- This pattern works at any nesting level — you can have `[categoryId]/[postId].js` for deeply nested dynamic routes
