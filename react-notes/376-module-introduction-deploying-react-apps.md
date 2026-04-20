# Module Introduction — Deploying React Apps

## Introduction

You've spent this entire course building React applications — writing components, managing state, handling routing, fetching data. But everything so far has lived on **your local machine**. No one else can see it. That changes now.

This section is about **deploying React apps** — taking your application from `localhost` to a real server where users around the world can access it. It's the bridge between development and production.

---

## What This Section Covers

### From Development to Production

Deploying isn't just copying files to a server. There's a process involved:

- **Optimization** — Making your app as lean and fast as possible before shipping
- **Building for Production** — Generating a minified, optimized bundle
- **Uploading to a Server** — Choosing a hosting provider and pushing your code
- **Configuration** — Setting up the server to correctly serve a single-page application

Each of these steps matters, and skipping one can lead to broken deployments or slow user experiences.

### The Routing Gotcha

One particularly important topic we'll cover is **Server-side Routing vs. Client-side Routing**. If you're using React Router (which most real apps do), there's a critical configuration step on the server that, if missed, will cause your app to break when users navigate directly to a URL or refresh the page.

---

## Why This Matters

Building an app nobody can use is like writing a book nobody can read. Deployment is what turns your project into a real product. Understanding this process — especially the pitfalls — is essential for any React developer.

---

## ✅ Key Takeaways

- Development is only half the journey — deployment is what makes your app real
- There are specific steps to follow: test → optimize → build → deploy → configure
- Server-side vs. client-side routing is a common deployment pitfall you must understand
- This section walks through the full process with a real example
