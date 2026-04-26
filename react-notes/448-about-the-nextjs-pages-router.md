# About the Next.js Pages Router

## Introduction

So far, we've been working exclusively with the **App Router** — the modern, recommended way to build Next.js applications. But if you browse the official Next.js documentation, you'll notice there's an alternative: the **Pages Router**. Why does it exist? Should you learn it? Let's break it down.

---

## Concept 1: App Router vs. Pages Router

### 🧠 What is it?

Next.js offers **two different routing approaches**:

- **App Router** — The modern approach we've been using. Uses the `app/` directory, Server Components by default, Server Actions, and special files like `page.js` and `layout.js`.
- **Pages Router** — The original approach. Uses the `pages/` directory, a different folder structure, and different features for data fetching and rendering.

Both let you build full-stack React applications. The difference is in **how** you structure your project and which APIs you use.

### ❓ Why do we need it?

Great question — why learn an "older" approach? Several reasons:

1. **Legacy projects**: Many existing Next.js projects were built with the Pages Router. If you join a team or maintain an older codebase, you'll need to understand it.
2. **Stability**: At the time of recording, the Pages Router is in some ways more stable and battle-tested. The App Router is newer and still maturing.
3. **Documentation**: The official Next.js docs let you toggle between App Router and Pages Router versions, showing that both are fully supported.

### ⚙️ How it works

The fundamental idea is the same — you're still building a full-stack React application with Next.js. The differences are:

| Aspect | App Router | Pages Router |
|--------|-----------|--------------|
| Directory | `app/` | `pages/` |
| Components | Server Components (default) | Traditional React Components |
| Data Fetching | Direct in components | `getStaticProps`, `getServerSideProps` |
| Routing | Folder-based with special files | File-based (each file = a route) |
| Status | Modern, recommended | Stable, legacy |

### 💡 Insight

Think of it like this: the App Router is the **future** of Next.js, but the Pages Router is the **proven past**. Neither is "wrong" — they're different tools with different trade-offs. A well-rounded Next.js developer understands both.

---

## Concept 2: Should You Learn the Pages Router?

### 🧠 What is it?

This is a practical decision about where to invest your learning time. The course includes Pages Router content alongside the App Router material.

### ❓ Why do we need it?

- If you're building a **new project** → App Router is the way to go
- If you're **maintaining an existing project** → You might need Pages Router knowledge
- If you want **maximum stability** right now → Pages Router has a longer track record
- If you want to be **well-rounded** → Learning both gives you flexibility

### ⚙️ How it works

The upcoming lectures will re-teach Next.js fundamentals using the Pages Router. You'll see:
- A different folder structure
- Different data-fetching patterns
- Different conventions

But the core idea — building full-stack React apps with file-based routing and server-side rendering — remains the same.

### 💡 Insight

You can **skip** the Pages Router lectures if you're only interested in the modern approach. But if you want a complete understanding of the Next.js ecosystem — especially for job interviews or working on diverse projects — it's worth the extra time.

---

## ✅ Key Takeaways

- Next.js has **two routing approaches**: App Router (modern) and Pages Router (legacy but stable)
- The **App Router** is the recommended approach for new projects
- The **Pages Router** was the only option in the past and is still widely used in existing projects
- Both approaches build full-stack React applications — the difference is in project structure and APIs
- The official docs support both with a toggle between the two versions

## ⚠️ Common Mistakes

- Assuming the Pages Router is "dead" — it's still fully supported and used in production
- Mixing App Router and Pages Router patterns in the same project without understanding the implications
- Skipping Pages Router knowledge entirely and being caught off guard when encountering legacy codebases

## 💡 Pro Tips

- If you're job hunting, knowing both routers makes you more versatile
- The official Next.js documentation lets you switch between router versions — use this when looking up features
- The core React skills transfer directly — it's mostly the Next.js-specific APIs that differ between routers
