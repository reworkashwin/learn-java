# Routing: Multiple Pages in Single-Page Applications

## Introduction

Before we write any code, let's clearly understand what routing is, why it matters, and how it fits into the world of React SPAs.

---

## How the Web Traditionally Works

When you visit a website and type `example.com/welcome`, the browser sends a request to the server, and the server responds with the HTML for the welcome page. Click a link to `example.com/products`? Another request, another HTML file.

```
Browser: "Give me /welcome"  → Server: "Here's welcome.html"
Browser: "Give me /products" → Server: "Here's products.html"
```

This is **traditional multi-page** routing. Different URLs, different content. Simple and intuitive.

### The Downside

Every navigation is a **full round trip** to the server. The browser fetches new HTML, CSS, and JavaScript. The old page is torn down, the new page is built from scratch. This creates:

- **Lag** between pages
- **Loss of state** (any client-side data is gone)
- **Flash of blank content** during loading
- A generally **choppier** user experience

---

## How Single Page Applications Work

With SPAs, you send **one initial HTML request**. That response includes a JavaScript bundle (your React app). From that point on, JavaScript handles everything — updating the UI, fetching data, managing state — all without loading new HTML pages.

The URL never changes. It's always `example.com`.

### The Downside of SPAs

You lose one of the web's biggest advantages: **linkability**. There's no way to:
- Share a direct link to a specific page
- Bookmark a state of the application
- Use the browser's back/forward buttons meaningfully

---

## Client-Side Routing: The Best of Both Worlds

What if we could keep the SPA architecture **and** support different URLs?

That's exactly what client-side routing does:

```
1. User visits example.com/products
2. React code watches the URL
3. React sees "/products" and renders <ProductsPage />
4. No new HTTP request to the server
5. URL changes, content changes, but it's still the same SPA
```

The router is essentially a **URL watcher** built into your React app. It checks the current path and renders the appropriate component — all on the client side.

---

## Traditional vs SPA vs SPA with Routing

| Feature | Traditional | SPA (no routing) | SPA + Client-Side Routing |
|---------|-------------|-------------------|---------------------------|
| New HTML per page | ✅ | ❌ | ❌ |
| URL changes | ✅ | ❌ | ✅ |
| Bookmarkable | ✅ | ❌ | ✅ |
| Fast transitions | ❌ | ✅ | ✅ |
| Preserves state | ❌ | ✅ | ✅ |
| Shareable links | ✅ | ❌ | ✅ |

Client-side routing combines the performance of SPAs with the navigation features of traditional websites.

---

## ✅ Key Takeaways

- Traditional web routing loads new HTML files for each URL — simple but slow
- SPAs avoid round trips but lose URL-based navigation
- Client-side routing adds URL awareness to SPAs without sacrificing performance
- The router watches the URL and renders different React components based on the current path

## 💡 Pro Tips

- Client-side routing is an illusion — the browser still only loaded one HTML file. The "pages" are just different component trees
- The History API in browsers is what makes this possible — it lets JavaScript change the URL without triggering a page reload
