# Class-based vs Functional Components: A Summary

## Introduction

You've now journeyed through the world of class-based components — how to write them, how state and props work, lifecycle methods for side effects, and even context. But here's the million-dollar question: **should you actually use them?**

This note wraps up the class-based components module and gives you a clear decision framework for choosing between class-based and functional components going forward.

---

## The Verdict: Functional Components Win (For Most Cases)

You *can* build your entire application with class-based components. That's absolutely fine, and for years that's exactly what React developers did. But modern React has firmly shifted to **functional components** as the default, and for good reason.

### Why Functional Components Are Preferred

Functional components are **leaner and more flexible**. They give you:

- **Hooks** — a more composable and reusable way to manage state, effects, context, and more
- **Less boilerplate** — no `constructor`, no `this` keyword, no `render()` method
- **Better code organization** — logic can be grouped by concern using custom hooks, rather than scattered across lifecycle methods
- **Easier to read and maintain** — especially for new developers joining a team

The entire React ecosystem has transitioned to functional components. Libraries, tutorials, documentation — everything now defaults to hooks and functions.

---

## The Decision Tree: When to Use What

Here's a simple framework to decide:

### Use Functional Components When:
- You're starting a new project (almost always)
- You want cleaner, more modern code
- You need the flexibility of hooks
- You're following current React best practices

### Use Class-based Components When:
- **You personally prefer them** — there's nothing wrong with that
- **Your team or project already uses them heavily** — consistency matters, and mixing approaches can confuse colleagues
- **You're building Error Boundaries** — this is the one case where class-based components are *required* (more on this in the next note)

---

## Going Forward in This Course

From here on out, the course focuses almost entirely on **functional components**. Class-based components will only appear occasionally for comparison or for specific features like Error Boundaries.

This reflects the real-world reality: the vast majority of new React code is written with functional components and hooks.

---

## ✅ Key Takeaways

- Functional components are the modern standard — lean, flexible, and preferred by the ecosystem
- Class-based components are not deprecated and still work perfectly fine
- Use class-based components if your team uses them or if you personally prefer them
- **Error Boundaries** currently require class-based components — there's no functional equivalent yet
- The React community and tooling have moved to functional components, so that's where the momentum is

## 💡 Pro Tip

If you're joining an existing codebase with class-based components, don't panic. You now know both paradigms. Understanding class-based components makes you a more well-rounded React developer — and you *will* encounter them in legacy codebases.

## ⚠️ Common Mistake

Don't mix class-based and functional components randomly within the same project just because you can. Pick an approach and be consistent. The only legitimate mixing is wrapping functional components with class-based Error Boundaries.
