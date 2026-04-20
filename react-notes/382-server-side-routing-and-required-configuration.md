# Server-side Routing & Required Configuration

## Introduction

This might be the most important lesson in the deployment section. If you miss this, your deployed React app **will break** the moment a user refreshes the page or navigates directly to a URL. Let's understand why and how to fix it.

---

## The Problem: Who Handles the URL?

### Client-side Routing (How It Works Locally)

When you click a link in your React app, **React Router** handles the navigation. It:
1. Intercepts the click
2. Updates the URL in the browser's address bar
3. Renders the matching component

No request is sent to the server. Everything happens in the browser. That's **client-side routing**.

### What Happens on Direct URL Access?

Now imagine a user types `yourdomain.com/blog` directly into their browser, or refreshes while on `/blog`. What happens?

1. The browser sends an HTTP request to the server: **"Give me the page at `/blog`"**
2. The server receives the request and looks for a file or folder matching `/blog`
3. **The server can't find anything** — there's no `blog/` folder, no `blog.html` file
4. The server returns a **404 Not Found** error

The React code that knows how to handle `/blog` never even loads, because the server gave up before serving it.

---

## The Solution: Always Return `index.html`

### The Fix Is Simple (Conceptually)

The server should **always return `index.html`**, no matter what path is requested. Whether the user requests `/`, `/blog`, `/blog/123`, or `/settings` — the response should always be the same `index.html` file.

Why? Because that HTML file loads your JavaScript bundle, which contains React Router, which **then** looks at the URL and renders the right component.

```
Request: /blog
  ↓
Server returns: index.html (always)
  ↓
Browser loads JavaScript bundle
  ↓
React Router reads URL: "/blog"
  ↓
React Router renders: <BlogPage />
```

### How to Configure This

Different hosting providers handle this differently:

**Firebase** — answered "Yes" to the SPA question during `firebase init`. This sets up a rewrite rule in `firebase.json`:
```json
{
  "rewrites": [{ "source": "**", "destination": "/index.html" }]
}
```

**Netlify** — create a `_redirects` file in your `build/` folder:
```
/*    /index.html   200
```

**Nginx** — add a `try_files` directive:
```nginx
location / {
  try_files $uri /index.html;
}
```

**Apache** — use `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Why This Is Easy to Miss

Some hosting providers (like Firebase) ask you about this during setup. Many don't. If your provider doesn't ask, you **must manually configure this redirect rule**.

The tricky part: your app will seem to work fine if you only test by clicking links (client-side navigation). The bug only surfaces on:
- Direct URL entry
- Page refresh
- Bookmarked links
- Shared links

---

## ⚠️ Common Mistakes

- Assuming the server will "just work" with React Router
- Only testing with link clicks and never testing direct URL access
- Not adding redirect rules on providers that don't ask about SPA configuration

## 💡 Pro Tip

After every deployment, test by navigating directly to a sub-route (type the full URL in the browser). If it works with navigation but breaks on direct access or refresh, your server-side routing isn't configured.

## ✅ Key Takeaways

- Client-side routing (React Router) only works **after** JavaScript loads
- On direct URL access, the server handles the request first
- The server must always return `index.html` regardless of the path
- Each hosting provider has its own way to configure this
- Always test direct URL access after deploying
