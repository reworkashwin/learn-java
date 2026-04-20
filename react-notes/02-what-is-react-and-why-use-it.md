# What is React.js? And Why Would You Use It?

## Introduction

Before writing a single line of React code, it's essential to understand what React actually is and — more importantly — *why* it exists. What problem does it solve? Why not just use plain JavaScript?

---

## What is React?

If you visit the official React website at [react.dev](https://react.dev), you'll see it described as:

> **A library for web and native user interfaces.**

In simpler terms: **React is a JavaScript library for building user interfaces.**

That's it at its core. React helps you build what the user sees and interacts with on a webpage.

---

## Why Would You Use React?

Think about websites like Netflix. When you navigate around Netflix:

- Transitions between pages are **smooth and instant**
- You never see the page fully reload
- It feels almost like using a **mobile app**

This kind of experience — where the UI updates dynamically without reloading the page — is exactly what libraries like React help you build.

### How Does This Work?

JavaScript runs in the background of a webpage. It has the ability to:

1. **Read** the current page content
2. **Manipulate** the page content after it was loaded
3. **Fetch data** from a server in the background
4. **Update the screen** with new data — all without leaving or reloading the page

So when you click on the "Movies" tab on Netflix, JavaScript:

- Fetches movie data behind the scenes
- Updates the visible content on the page
- Creates a smooth, app-like transition

---

## But Wait — Why Not Just Use Vanilla JavaScript?

If JavaScript can do all of this, why do we even need React?

Great question. And the answer is: **you *can* build UIs with just JavaScript, but it's painful.**

Here's why:

- It's **cumbersome** — you end up writing a lot of boilerplate code
- It's **error-prone** — more manual steps mean more chances for bugs
- It **doesn't scale** — as your app grows more complex (like a Netflix-sized app), managing everything with plain JavaScript becomes unrealistic

React provides a **simpler mental model** and an **easier way** to build complex, dynamic user interfaces.

---

## ✅ Key Takeaways

- React is a **JavaScript library** for building user interfaces
- It enables **smooth, app-like experiences** on the web without full page reloads
- JavaScript handles the actual DOM manipulation under the hood — React just makes it **way easier** to manage
- Vanilla JavaScript works for simple cases, but becomes impractical for complex UIs

---

## ⚠️ Common Mistake

Don't confuse React with a full framework. React is a **library** — it focuses specifically on the UI layer. It doesn't handle routing, state management, or API calls out of the box (though there are companion libraries for all of these).

---

## 💡 Pro Tip

Keep this in mind from day one: React's superpower is that it lets you **describe what the UI should look like** and React figures out **how to update it efficiently**. This is the foundation of everything you'll learn going forward.
