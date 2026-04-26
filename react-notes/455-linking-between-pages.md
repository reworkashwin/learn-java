# Linking Between Pages

## Introduction

We can create pages and dynamic routes — but how do users actually *navigate* between them? Sure, they could type URLs manually, but that's not how real websites work. We need clickable links. And here's the critical question: should you use a regular HTML `<a>` tag, or does Next.js offer something better? Spoiler — it absolutely does, and understanding *why* is key to building performant Next.js applications that give users the best of both worlds.

---

## Concept 1: Navigation with Regular Anchor Tags

### 🧠 What is it?

The most intuitive way to create a link is with a standard HTML anchor (`<a>`) tag. You set the `href` attribute, wrap your text, and clicking it navigates to the target URL.

### ❓ Why do we need it?

Well, you don't — at least not for internal navigation. But understanding *why* anchor tags are problematic in Next.js helps you appreciate the proper solution.

### ⚙️ How it works

```jsx
function NewsPage() {
  return (
    <ul>
      <li>
        <a href="/news/nextjs-is-a-great-framework">
          NextJS Is A Great Framework
        </a>
      </li>
    </ul>
  );
}
```

This works. Click the link, and you're taken to the detail page. But watch the browser's refresh icon carefully — it briefly turns into an **X** (stop/loading icon) and then back to the refresh icon. That means the browser is **sending a brand new HTTP request** to the server and loading an entirely new HTML page.

### 🧪 Example

When you click an `<a>` tag link:
1. Browser sends a request to the server
2. Server returns a new HTML page
3. Browser loads the new page from scratch
4. All React state, Redux state, Context state — **gone**

It's like closing one app and opening another. You lose everything.

### 💡 Insight

This completely defeats the purpose of using React. The whole point of a single-page application (SPA) is that you *never* reload the page — you just swap out what's on the screen using JavaScript. With `<a>` tags, you're back to traditional multi-page navigation.

---

## Concept 2: The `Link` Component from `next/link`

### 🧠 What is it?

Next.js provides a special `Link` component (imported from `next/link`) that renders an anchor tag under the hood but **intercepts the click** to prevent the default browser navigation. Instead of loading a new page, it uses client-side JavaScript to swap the content — keeping you inside the single-page application.

### ❓ Why do we need it?

Because you want **both**:
- **Server-side rendered pages** when a user first visits your site (great for SEO and initial load)
- **Client-side navigation** once the user is already on your site (fast, no page reloads, state preserved)

The `Link` component gives you exactly that combination.

### ⚙️ How it works

1. Import `Link` from `next/link`
2. Replace `<a>` tags with `<Link>` components
3. Use the `href` prop to specify the destination

```jsx
import Link from 'next/link';

function NewsPage() {
  return (
    <ul>
      <li>
        <Link href="/news/nextjs-is-a-great-framework">
          NextJS Is A Great Framework
        </Link>
      </li>
    </ul>
  );
}
```

Now when you click the link:
- The refresh icon **never changes** — no new HTTP request is sent
- The URL updates in the address bar
- The content on the screen changes instantly
- All application state is preserved

### 🧪 Example

```jsx
import { Fragment } from 'react';
import Link from 'next/link';

function NewsPage() {
  return (
    <Fragment>
      <h1>The News Page</h1>
      <ul>
        <li>
          <Link href="/news/nextjs-is-a-great-framework">
            NextJS Is A Great Framework
          </Link>
        </li>
        <li>
          <Link href="/news/something-else">
            Something Else
          </Link>
        </li>
      </ul>
    </Fragment>
  );
}

export default NewsPage;
```

Clicking either link navigates instantly with no page reload. React re-renders the new page component on the client side.

### 💡 Insight

Behind the scenes, `Link` renders a real `<a>` tag in the HTML — so search engines and screen readers still see a proper link. But it attaches a click handler that calls `event.preventDefault()` and uses the Next.js router to navigate programmatically instead. It's a beautiful abstraction.

---

## Concept 3: The Best of Both Worlds

### 🧠 What is it?

Next.js with the `Link` component gives you a **hybrid approach**: server-side rendering for initial page loads and search engines, plus client-side navigation for users already on your site.

### ❓ Why do we need it?

Consider these two scenarios:

**Scenario 1**: A user types `yoursite.com/news/some-article` directly into the browser or a search engine bot crawls that URL.
→ The server pre-renders the full HTML page and sends it back. Content is visible immediately. SEO works perfectly.

**Scenario 2**: A user is already on your `/news` page and clicks a link to an article.
→ No server request is made. React swaps the content on the client side. Navigation is instant. State is preserved.

### ⚙️ How it works

The flow is:

1. **First visit** → Server renders the full HTML page (SSR)
2. **React hydrates** → The page becomes interactive, React takes over
3. **User clicks a `Link`** → Client-side navigation, no page reload
4. **User clicks another `Link`** → Still client-side, still no reload
5. **User shares the URL or bookmarks it** → Anyone visiting that URL directly gets the server-rendered version

You get fast, interactive client-side navigation **and** SEO-friendly server-rendered pages.

### 🧪 Example

Try this yourself:
1. Navigate to `/news` using the address bar → View page source → the full HTML content is there (server-rendered)
2. Click a link to `/news/some-article` → Notice no page reload
3. Copy that URL, open a new tab, paste it → View page source → the full HTML for that page is also server-rendered

Both scenarios work perfectly. That's the hybrid magic of Next.js.

### 💡 Insight

This is arguably the **single most important concept** in Next.js. Traditional React apps sacrifice SEO for interactivity. Traditional server-rendered apps sacrifice interactivity for SEO. Next.js gives you both — and the `Link` component is the key that holds it together.

---

## ✅ Key Takeaways

- Regular `<a>` tags trigger full page reloads — you lose SPA behavior and all application state
- The `Link` component from `next/link` enables **client-side navigation** without page reloads
- `Link` still renders a real `<a>` tag in the HTML for SEO and accessibility
- Use `Link` for **all internal navigation** in your Next.js app
- You get the best of both worlds: SSR for initial loads/SEO + SPA for in-app navigation

## ⚠️ Common Mistakes

- **Using `<a>` tags for internal links** — this breaks the SPA experience and causes full page reloads
- **Forgetting to import `Link`** — it's `import Link from 'next/link'`, not from `react-router-dom`
- **Using `Link` for external URLs** — for links to other websites, regular `<a>` tags are fine and appropriate

## 💡 Pro Tips

- For **external links** (linking to other websites), use a regular `<a>` tag — `Link` is only for internal navigation
- The `Link` component also supports **prefetching** — it can preload the target page's code in the background when the link is visible, making navigation even faster
- You can dynamically construct `href` values: `href={`/news/${article.slug}`}` — perfect for rendering lists of links from data
