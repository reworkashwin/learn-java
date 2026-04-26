# Adding Head Metadata

## Introduction

Your pages have content — but do they have an *identity*? Right now, the browser tab shows a boring URL, there's no description for search engines, and if someone shares your page on Google, it looks... empty. **Head metadata** is the invisible layer that tells browsers and search engines *what your page is about*. And in Next.js, adding it is delightfully simple.

---

## Concept 1: Why Metadata Matters

### 🧠 What is it?

Metadata lives in the `<head>` section of your HTML. It includes things like the page `<title>` (shown in browser tabs and search results) and `<meta>` tags like `description` (shown as the snippet text on Google).

### ❓ Why do we need it?

- **SEO** — Search engines use your title and description to rank and display your page
- **User experience** — A meaningful tab title helps users identify your page among many open tabs
- **Social sharing** — When your link is shared, platforms pull metadata to generate previews

Without metadata, your pages are invisible to search engines and confusing to users.

### 💡 Insight

Think of metadata as your page's résumé. The actual content is your skills and experience, but the résumé is what gets you noticed. No résumé? No interview.

---

## Concept 2: The Next.js Head Component

### 🧠 What is it?

Next.js provides a special `Head` component (from `next/head`) that lets you inject HTML elements into the `<head>` section of your page — right from your JSX code.

### ⚙️ How it works

1. Import `Head` from `next/head`
2. Add `<Head>` anywhere in your returned JSX
3. Inside `<Head>`, place standard HTML head elements like `<title>` and `<meta>`
4. Since you can't have adjacent JSX elements, wrap everything in a `Fragment`

### 🧪 Example

```jsx
import Head from 'next/head';
import { Fragment } from 'react';

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}
```

### 💡 Insight

The `Head` component is like a portal — no matter where you place it in your JSX tree, its contents always end up in the HTML `<head>` section. You get the convenience of colocating metadata with the page it describes.

---

## Concept 3: Static vs Dynamic Metadata

### 🧠 What is it?

Some pages always have the same title and description (static metadata). Others — like a meetup detail page — need **dynamic metadata** that changes based on the data being displayed.

### ❓ Why do we need it?

If every meetup detail page has the same generic title like "Meetup Details," search engines can't distinguish between them. Each page should have a unique title and description for proper SEO.

### ⚙️ How it works

Since `<Head>` lives inside your JSX, you can use **dynamic expressions** with curly braces — just like any other React code:

```jsx
<Head>
  <title>{props.meetupData.title}</title>
  <meta
    name="description"
    content={props.meetupData.description}
  />
</Head>
```

### 🧪 Example — All Three Pages

**Home Page (static):**
```jsx
<title>React Meetups</title>
<meta name="description" content="Browse a huge list of highly active React meetups!" />
```

**New Meetup Page (static):**
```jsx
<title>Add a New Meetup</title>
<meta name="description" content="Add your own meetups. Create amazing networking opportunities." />
```

**Meetup Detail Page (dynamic):**
```jsx
<title>{props.meetupData.title}</title>
<meta name="description" content={props.meetupData.description} />
```

### 💡 Insight

This is the beauty of React + Next.js: since metadata is just JSX, you have the full power of JavaScript expressions at your disposal. Conditional titles, computed descriptions, data-driven OpenGraph tags — it's all just code.

---

## Concept 4: Verifying Metadata

### 🧠 What is it?

After adding metadata, you should verify it's actually rendering correctly in the browser.

### ⚙️ How it works

Three ways to check:

1. **Browser tab** — The title should appear in the tab
2. **View Page Source** — Right-click → View Source → Look for `<title>` and `<meta>` in the `<head>` section
3. **Dev Tools** — Inspect Elements → Expand the `<head>` node → Find your tags there

---

## ✅ Key Takeaways

- Use the `Head` component from `next/head` to add metadata to your pages
- Wrap `Head` and your page content in a `Fragment` to avoid adjacent JSX errors
- Use static titles/descriptions for generic pages and dynamic ones for data-driven pages
- Metadata is critical for SEO, user experience, and social sharing

## ⚠️ Common Mistakes

- Forgetting to import `Fragment` from React when using `Head` alongside other JSX
- Using the same generic title for all pages — kills your SEO
- Not adding a `description` meta tag — search engines need it
- Forgetting that `Head` contents go in `<head>`, not `<body>` — don't put visible content inside it

## 💡 Pro Tips

- For dynamic detail pages, use the item's title as the page title and its description as the meta description — each page becomes uniquely searchable
- You can also add OpenGraph (`og:title`, `og:image`) and Twitter Card meta tags inside `Head` for rich social sharing previews
- The `Head` component merges — if you have a `Head` in `_app.js` and another in a page, the page-level one wins for duplicate tags
