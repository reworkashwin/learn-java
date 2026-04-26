# Adding First Pages in Next.js

## Introduction

So you've set up a Next.js project — now what? How do you actually create pages and start building your website? This is where Next.js's **file-based routing** really shines. Instead of configuring routes manually like you would in a traditional React app with React Router, Next.js lets you create pages simply by adding files to a special `pages` folder. In this section, we'll create our very first pages and see how server-side rendering works out of the box.

---

## Concept 1: The `pages` Folder — Your Routing Foundation

### 🧠 What is it?

In Next.js, the `pages` directory is the heart of your routing system. Every file you place inside this folder automatically becomes a route in your application. No configuration files, no route definitions — just files.

### ❓ Why do we need it?

In a standard React app, you'd have to install React Router, define `<Route>` components, map paths to components manually, and manage all of that yourself. Next.js eliminates that boilerplate entirely. Drop a file in `pages`, and it's a route. Simple.

### ⚙️ How it works

- `pages/index.js` → serves at `/` (the root page)
- `pages/news.js` → serves at `/news`
- `pages/about.js` → serves at `/about`

The file name becomes the URL path. The one exception? `index.js` — that's a special name that maps to the root of whatever directory it's in.

Think of it like the classic `index.html` convention in traditional web servers. When a request hits just `/`, the server looks for the index file.

### 🧪 Example

Let's say we want a homepage and a news page. We create two files:

**pages/index.js**
```jsx
function HomePage() {
  return <h1>The Home Page</h1>;
}

export default HomePage;
```

**pages/news.js**
```jsx
function NewsPage() {
  return <h1>The News Page</h1>;
}

export default NewsPage;
```

Now:
- Visit `localhost:3000` → you see "The Home Page"
- Visit `localhost:3000/news` → you see "The News Page"

That's it. No routing setup required.

### 💡 Insight

Notice there's no `import React from 'react'` at the top of these files. Modern Next.js projects support the newer React JSX transform, which means you can skip that import — it's added behind the scenes automatically.

---

## Concept 2: What Goes Inside a Page File?

### 🧠 What is it?

Each page file contains a **standard React component** — a function that returns JSX. The key requirement is that you **must export it as the default export** so Next.js can find and render it.

### ❓ Why do we need it?

Next.js needs to know *which* component to render when a user visits a specific route. The default export is how it discovers your component. You can name the component whatever you want — `HomePage`, `MyAwesomePage`, `Foo` — the name doesn't matter. What matters is the `export default`.

### ⚙️ How it works

1. Create a `.js` file in the `pages` directory
2. Write a React component function
3. Return JSX from it
4. Export it as the default export

```jsx
function MyPage() {
  return <h1>Hello World</h1>;
}

export default MyPage;
```

### 💡 Insight

The component name has zero impact on routing. The **file name** determines the URL path, and the **default export** determines what gets rendered. Keep your component names descriptive for your own readability, but know that Next.js only cares about the file name and the export.

---

## Concept 3: Built-In Server-Side Rendering

### 🧠 What is it?

Server-side rendering (SSR) means that when a user (or a search engine bot) requests a page, the server generates the full HTML content and sends it back — instead of sending an empty HTML skeleton that JavaScript has to fill in later.

### ❓ Why do we need it?

In a standard React app (created with Create React App, for example), the initial HTML is basically an empty `<div id="root"></div>`. The browser downloads JavaScript, React boots up, and *then* the content appears. This causes two problems:
- **Flickering** — users see a blank page briefly before content loads
- **SEO** — search engine crawlers may not see your content because they receive an empty page

### ⚙️ How it works

With Next.js, this just works **out of the box**. No extra configuration needed. When you create a page and visit it, the server pre-renders the full HTML and sends it to the browser.

If you right-click on a Next.js page and select "View Page Source," you'll see the actual content right there in the HTML — not an empty skeleton.

### 🧪 Example

Visit `localhost:3000/news` and view the page source. You'll find:

```html
<h1>The News Page</h1>
```

That content is right there in the HTML response from the server. In a traditional React app, you'd only see an empty `<div>` and a `<script>` tag.

### 💡 Insight

This is one of the biggest selling points of Next.js. You get the interactivity of React *plus* the SEO and performance benefits of server-side rendering — without writing any server code yourself.

---

## ✅ Key Takeaways

- The `pages` folder is the foundation of Next.js routing — each file becomes a route
- `index.js` maps to the root path (`/`); other file names map to their respective paths (e.g., `news.js` → `/news`)
- Page components are standard React components that must be **default exported**
- Server-side rendering works **out of the box** — no setup required
- Pre-rendered pages benefit both SEO and user experience

## ⚠️ Common Mistakes

- **Forgetting to default export** your component — Next.js won't find it and the page will break
- **Adding `.js` to the URL** — you visit `/news`, not `/news.js`
- **Confusing component name with route** — the file name determines the route, not the component name

## 💡 Pro Tips

- Start the dev server with `npm run dev` to see your pages in action
- Always check the page source to verify that server-side rendering is working
- You can safely delete the `api` folder and `Home.module.css` from the starter template when starting fresh
