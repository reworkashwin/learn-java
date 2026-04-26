# Module Introduction: React Server Components, Server Actions & the use() Hook

## Introduction

In the previous section, you got hands-on with Next.js and encountered concepts like React Server Components. But here's the thing — those features aren't *Next.js* features. They're **React features** that just happen to need a specific project setup to work. In this section, we're going to zoom in on these powerful React capabilities that exist *within* React itself but aren't available in every React project. Why? Let's find out.

---

## Concept 1: React Features That Need a Special Setup

### 🧠 What is it?

React has evolved beyond just being a client-side UI library. Some of its newer features — like Server Components, Server Actions, and the `use()` hook for data fetching — require a **server-aware framework** (like Next.js) to function. You can't just use them in a plain `create-react-app` project.

### ❓ Why do we need to understand this?

Because it's easy to confuse "Next.js features" with "React features." Understanding that these capabilities belong to React (not Next.js) helps you:
- Know what's transferable to other frameworks
- Understand *why* certain setups are needed
- Make informed decisions about your project architecture

### 💡 Insight

Think of it this way: React defines the *specifications* for these features, but frameworks like Next.js provide the *infrastructure* to run them. It's like how USB-C is a standard, but you still need a device with a USB-C port to use it.

---

## Concept 2: What This Section Covers

### 🧠 What will we learn?

This section dives into three key areas:

1. **React Server Components & Client Components**
   - What's the difference between them?
   - How do you decide which type to use?
   - How do they work together?

2. **Server Actions**
   - How do they compare to the Form Actions you've already learned?
   - When would you use one over the other?

3. **The `use()` Hook**
   - You've already seen it for accessing Context
   - Now you'll discover it can also **resolve Promises** and handle data fetching
   - But only in certain project setups

### 💡 Insight

The `use()` hook is a React 19 addition that's surprisingly versatile. You've used it for context already, but its ability to unwrap Promises opens up a whole new pattern for data fetching — one that ties directly into Server Components and Suspense.

---

## ✅ Key Takeaways

- Server Components, Server Actions, and the `use()` hook are **React features**, not Next.js features
- They require a framework that supports server-side rendering to work
- This section is a focused deep-dive into these concepts, building on what you saw in the Next.js section
- The Next.js section is recommended (but not required) before this one

## 💡 Pro Tips

- If you skipped the Next.js section, you can still follow along — but going back to it first will give you better context
- Pay attention to *which* features are React-level vs framework-level — this distinction matters as the React ecosystem evolves
