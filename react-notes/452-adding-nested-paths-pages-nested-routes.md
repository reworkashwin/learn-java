# Adding Nested Paths & Pages (Nested Routes)

## Introduction

We've seen how to create basic pages in Next.js by adding files to the `pages` folder. But what happens when you need **nested routes** — URLs with multiple segments like `/news/something-important`? How do you organize your files for that? This section dives into folder-based routing and how to structure nested paths in Next.js.

---

## Concept 1: The Folder Alternative for Routes

### 🧠 What is it?

In Next.js, you have **two ways** to define a route:
1. A **named file** directly in the `pages` folder (e.g., `pages/news.js` → `/news`)
2. A **folder with an `index.js`** file (e.g., `pages/news/index.js` → `/news`)

Both approaches produce the exact same result. The route `/news` will work identically either way.

### ❓ Why do we need it?

Why would you ever choose the folder approach over a simple file? Because as soon as you need **nested routes**, you *must* use folders. A single file can only represent one path segment. If you need `/news/something`, you need a `news` folder.

### ⚙️ How it works

- `pages/news.js` → `/news` ✅
- `pages/news/index.js` → `/news` ✅ (same result)

Both are valid. But if you also need `/news/something-important`, only the folder approach works:

```
pages/
  news/
    index.js              → /news
    something-important.js → /news/something-important
```

You can't achieve this with just a `news.js` file at the root level.

### 💡 Insight

Think of it like a file system on a web server. Folders represent path segments, and `index.js` inside a folder is the "default" page for that path — just like `index.html` is the default page of a directory on a traditional web server.

---

## Concept 2: Creating Nested Routes with Subfolders

### 🧠 What is it?

Nested routes are URLs with multiple path segments — like `/news/something-important`. In Next.js, you create these by placing files inside subfolders within the `pages` directory.

### ❓ Why do we need it?

Real-world applications almost always have nested routes. Think about it:
- `/products/shoes` — a category page
- `/blog/my-first-post` — a specific blog post
- `/users/settings` — a user's settings page

These all have two or more segments, and you need a way to represent that structure.

### ⚙️ How it works

Folders in the `pages` directory act as **path segments**. So to create `/news/something-important`:

1. Create a `news` folder inside `pages`
2. Add an `index.js` for the `/news` route
3. Add `something-important.js` for the `/news/something-important` route

```
pages/
  news/
    index.js              → /news
    something-important.js → /news/something-important
```

Each file contains a standard React component:

**pages/news/index.js**
```jsx
function NewsPage() {
  return <h1>The News Page</h1>;
}

export default NewsPage;
```

**pages/news/something-important.js**
```jsx
function DetailPage() {
  return <h1>The Detail Page</h1>;
}

export default DetailPage;
```

### 🧪 Example

With this setup:
- `localhost:3000/news` → shows "The News Page"
- `localhost:3000/news/something-important` → shows "The Detail Page"

### 💡 Insight

You can nest as deeply as you want. Need `/news/category/sports`? Create a `category` folder inside `news` with a `sports.js` file (or a `sports` folder with `index.js`). The nesting pattern is infinitely composable.

---

## Concept 3: Named Files vs. Folder + index.js — When to Use Which

### 🧠 What is it?

At every level of nesting, you always have two options:
- **Named file**: `something-important.js` in the `news` folder
- **Folder + index**: `something-important/index.js` inside the `news` folder

### ❓ Why do we need it?

Understanding when to use each approach keeps your project organized and avoids confusion:
- Use a **named file** when that route has no children (no further nesting below it)
- Use a **folder + index.js** when you need to add more nested routes beneath it

### ⚙️ How it works

| Approach | File Structure | Route |
|----------|---------------|-------|
| Named file | `pages/news/sports.js` | `/news/sports` |
| Folder + index | `pages/news/sports/index.js` | `/news/sports` |

Both produce the same route. But if you later need `/news/sports/football`, you must use the folder approach.

### 💡 Insight

A good rule of thumb: if you know a route will eventually have child routes, start with the folder approach from the beginning. It saves you from having to restructure later.

---

## ✅ Key Takeaways

- A named file (`news.js`) and a folder with `index.js` (`news/index.js`) produce the same route
- Folders inside `pages` act as **path segments** in the URL
- To create nested routes (e.g., `/news/something`), you **must** use subfolders
- You can nest folders as deeply as needed for complex URL structures
- Choose the folder approach when you anticipate child routes

## ⚠️ Common Mistakes

- **Having both `news.js` and `news/index.js`** — this creates a conflict. Pick one approach, not both
- **Forgetting that folder names are path segments** — naming a folder `myNewsPage` means the path will be `/myNewsPage`, not `/news`
- **Using the file approach when nesting is needed** — you can't create `/news/details` with just a `news.js` file

## 💡 Pro Tips

- Keep your folder structure flat when possible — deep nesting can make navigation harder
- Use meaningful folder and file names since they directly become your URL paths
- Plan your URL structure before creating files — restructuring later means moving files and potentially breaking links
