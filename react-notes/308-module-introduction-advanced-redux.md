# Module Introduction — Advanced Redux

## Introduction

You've mastered the Redux basics — stores, slices, actions, selectors. But real-world applications throw curveballs: HTTP requests, side effects, asynchronous operations. Where does that code go when reducers *must* be pure and synchronous?

This module dives into the advanced side of Redux:

1. **Handling asynchronous tasks** — sending HTTP requests, fetching data
2. **Where to put your code** — the right architecture for side effects
3. **Redux DevTools** — debugging your state like a professional

These aren't optional nice-to-haves. Any non-trivial React app with Redux will need to deal with async operations, and understanding where that code belongs is crucial to writing clean, maintainable applications.

---

## What's Coming

You'll learn two distinct approaches for handling side effects with Redux:
- **Component-based approach** — using `useEffect` to run async code in components
- **Action creator approach** — writing custom "thunks" that can run async code before dispatching

Both are valid. Both have trade-offs. By the end of this module, you'll understand when to reach for each one.

---

## ✅ Key Takeaway

Redux basics get you started. Advanced Redux — async handling, proper code placement, and DevTools — is what makes you productive in real projects.
