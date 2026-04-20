# Configuring Dynamic Routes & Using Route Parameters

## Introduction

Static routes like `/about` or `/blog` are great, but real applications need routes that adapt. What about a blog with hundreds of posts? You can't create a folder for each one. This is where **dynamic routes** come in — a single route definition that handles any number of possible values.

---

## The Problem with Static Routes

Imagine you want individual pages for blog posts:
- `/blog/post-1`
- `/blog/post-2`
- `/blog/my-summer-trip`

Creating a separate folder for each blog post is absurd:

```
app/blog/
├── post-1/page.js
├── post-2/page.js
├── my-summer-trip/page.js    ← not scalable!
```

Every new blog post would require a new folder. That's not maintainable.

---

## Dynamic Routes with Square Brackets

Next.js solves this with a special folder naming syntax: **square brackets**.

```
app/blog/
├── page.js           ← /blog (the blog listing)
└── [slug]/
    └── page.js       ← /blog/anything-here (individual posts)
```

The folder `[slug]` tells Next.js: "There will be a dynamic segment here. I don't know its value yet, but whatever it is, use this `page.js`."

The name `slug` is your choice — it could be `[id]`, `[postId]`, `[whatever]`. It becomes the key you use to access the actual value.

---

## Accessing the Dynamic Value with `params`

Next.js automatically passes a `params` prop to every page component. This object contains the dynamic segments and their actual values:

```jsx
export default function BlogPostPage({ params }) {
  return (
    <main>
      <h1>Blog Post: {params.slug}</h1>
    </main>
  );
}
```

Now:
- Visit `/blog/post-1` → displays "Blog Post: post-1"
- Visit `/blog/anything-else` → displays "Blog Post: anything-else"
- Visit `/blog/my-vacation-2024` → displays "Blog Post: my-vacation-2024"

The placeholder name in the folder (`[slug]`) becomes the key in `params`. So `[slug]` → `params.slug`, and `[id]` → `params.id`.

---

## How Dynamic Routes Work in Practice

The real power becomes clear when you connect this to a database. The flow would be:

1. User visits `/blog/summer-trip`
2. Next.js activates the `[slug]/page.js` component
3. `params.slug` equals `"summer-trip"`
4. You query your database: "Give me the blog post with slug `summer-trip`"
5. You render the fetched content on the page

---

## Combining Static and Dynamic Routes

You can have both static and dynamic sibling routes:

```
app/blog/
├── page.js           ← /blog
├── [slug]/
│   └── page.js       ← /blog/:slug (dynamic)
```

Static routes always take priority. So if you also had a `share/` folder at the same level, `/blog/share` would use the static folder, not the dynamic one.

---

## The Blog Page with Links

Here's how a blog listing page might link to dynamic post pages:

```jsx
import Link from 'next/link';

export default function BlogPage() {
  return (
    <main>
      <h1>The Blog</h1>
      <p><Link href="/blog/post-1">Post 1</Link></p>
      <p><Link href="/blog/post-2">Post 2</Link></p>
    </main>
  );
}
```

Both links activate the same `[slug]/page.js` file — but with different `params.slug` values.

---

## ✅ Key Takeaways

- Use **square brackets** in folder names to create dynamic routes: `[slug]`, `[id]`, etc.
- The dynamic segment's name becomes a key in the `params` prop
- Next.js sets `params` automatically — you don't pass it yourself
- Dynamic routes handle any number of URL values with a single `page.js`
- Static routes take priority over dynamic ones at the same level

## ⚠️ Common Mistakes

- Forgetting to add `page.js` inside the dynamic folder
- Confusing the folder name placeholder with the actual URL value
- Not destructuring `params` from the component props

## 💡 Pro Tip

You can have **multiple dynamic segments** by nesting dynamic folders: `app/blog/[slug]/comments/[commentId]/page.js` would give you `params.slug` and `params.commentId`. Each level adds another key to the `params` object.
