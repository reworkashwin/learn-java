# Adding Static Metadata

## Introduction

Your Next.js app is functionally complete — meals are shared, data is cached and revalidated, and everything works in production. But there's one more essential piece for any real-world application: **metadata**. Page titles, descriptions, and other meta tags are critical for SEO, social media sharing, and basic browser UX (like showing the right title in the tab).

Next.js makes adding metadata incredibly simple with a special `metadata` export. Let's see how it works.

---

### Concept 1: The metadata Export

#### 🧠 What is it?

In Next.js, you can export a constant called `metadata` from any **page** or **layout** file. This is not just any variable — Next.js specifically looks for an export with this exact name and uses it to generate `<title>`, `<meta>`, and other head tags for that page.

#### ❓ Why do we need it?

Metadata serves multiple purposes:
- **SEO**: Search engines use the title and description to index and rank your pages
- **Social sharing**: When someone shares your link on Twitter/X or Facebook, the title and description appear in the preview card
- **Browser UX**: The page title shows up in the browser tab, making it easy for users to identify your page among many open tabs

Without proper metadata, your pages look unprofessional and perform poorly in search results.

#### ⚙️ How it works

Export a `metadata` object from your page or layout file:

```js
export const metadata = {
  title: 'My Page Title',
  description: 'A description of what this page is about.',
};
```

Next.js picks this up automatically and renders it as:

```html
<head>
  <title>My Page Title</title>
  <meta name="description" content="A description of what this page is about." />
</head>
```

No need to manually add `<Head>` components or manipulate the DOM — just export the object and Next.js handles the rest.

#### 💡 Insight

The official Next.js documentation lists all the fields you can set on the `metadata` object — there are many beyond just `title` and `description` (Open Graph tags, Twitter cards, icons, etc.). For most pages, `title` and `description` are the essentials to start with.

---

### Concept 2: Layout-Level Metadata (Default for All Pages)

#### 🧠 What is it?

When you export `metadata` from a **layout** file (like the root `layout.js`), that metadata automatically applies to **all pages** wrapped by that layout. It serves as a fallback — every page gets at least this baseline metadata.

#### ❓ Why do we need it?

You don't want to add metadata to every single page in your app just to have a basic title. By setting it on the root layout, you ensure every page has sensible defaults. Individual pages can then override with more specific metadata when needed.

#### ⚙️ How it works

In your root `layout.js`:

```js
export const metadata = {
  title: 'NextLevel Food',
  description: 'Delicious meals, shared by a food-loving community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Now every page in your app will have "NextLevel Food" as the title and the description set — unless a specific page provides its own metadata.

#### 💡 Insight

Think of layout metadata as a CSS default — it applies everywhere until overridden. This cascading behavior makes it easy to manage metadata across large applications.

---

### Concept 3: Page-Level Metadata (Overriding Defaults)

#### 🧠 What is it?

Any page file can export its own `metadata` constant, which **overrides** the layout-level metadata. The most specific metadata wins — page beats nested layout beats root layout.

#### ❓ Why do we need it?

Different pages have different content. Your meals listing page should have a title like "All Meals," not the generic site title. Each page should accurately describe its own content for SEO and user clarity.

#### ⚙️ How it works

In a specific page file (e.g., `meals/page.js`):

```js
export const metadata = {
  title: 'All Meals',
  description: 'Browse the delicious meals shared by our vibrant community.',
};

export default async function MealsPage() {
  // ...page component
}
```

With this in place:
- Visiting `/meals` shows **"All Meals"** in the browser tab
- The description meta tag contains the meals-specific text
- Other pages without their own metadata still show the root layout's defaults

#### 🧪 Example

You can verify it works by:

1. Navigating to the meals page
2. Checking the browser tab — it should say "All Meals"
3. Viewing the page source (`View Page Source`) and finding the `<meta name="description">` tag with your custom text

#### 💡 Insight

This is **static metadata** — the values are hardcoded at build time. But what about dynamic pages where the title depends on loaded data (like a specific meal's name)? For that, Next.js provides `generateMetadata` — a function-based approach for dynamic metadata. That's a topic for the next lesson.

---

### Concept 4: Metadata Cascading Rules

#### 🧠 What is it?

Next.js follows a cascading priority system for metadata, similar to CSS specificity:

1. **Page metadata** (most specific — wins)
2. **Nested layout metadata**
3. **Root layout metadata** (least specific — fallback)

#### ❓ Why do we need it?

In a large application with many layouts and pages, you need predictable behavior. Knowing that more specific metadata always wins lets you set sensible defaults at the layout level and override only where necessary.

#### ⚙️ How it works

```
root layout.js     → metadata: { title: 'My App' }
  meals/layout.js  → metadata: { title: 'Meals Section' }
    meals/page.js  → metadata: { title: 'All Meals' }
```

- Visiting `/meals` → Title is **"All Meals"** (page wins)
- If `meals/page.js` had no metadata → Title would be **"Meals Section"** (nested layout)
- If neither had metadata → Title would be **"My App"** (root layout)

#### 💡 Insight

This cascading behavior means you can build a sensible metadata hierarchy with minimal effort. Set broad defaults at the top, and only customize where the content demands it.

---

## ✅ Key Takeaways

- Export a `metadata` constant from page or layout files — Next.js uses it to generate `<head>` tags automatically
- Layout metadata acts as a default for all wrapped pages
- Page metadata overrides layout metadata (most specific wins)
- At minimum, set `title` and `description` on every meaningful page
- This approach is for **static metadata** — values known at build time
- For dynamic metadata (data-dependent titles), use `generateMetadata` instead

## ⚠️ Common Mistakes

- **Forgetting to add metadata entirely** — your pages will have no title or description, hurting SEO
- **Only setting metadata on the root layout** — every page gets the same generic title
- **Misspelling the export name** — it must be exactly `metadata`, not `metaData` or `Metadata`
- **Trying to use `metadata` in Client Components** — it only works in Server Components (pages and layouts)

## 💡 Pro Tips

- Check the official Next.js metadata documentation for the full list of supported fields (Open Graph, Twitter, robots, icons, etc.)
- Use your browser's "View Page Source" to verify metadata is rendering correctly
- For production apps, always include Open Graph metadata so your pages look good when shared on social media
- The `metadata` export is statically analyzed — it must be a plain object, not a function (use `generateMetadata` for dynamic values)
