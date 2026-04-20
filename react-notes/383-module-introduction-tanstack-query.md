# Module Introduction — React Query / TanStack Query

## Introduction

We've learned how to send HTTP requests using `useEffect` and `fetch`. It works. But as applications grow, that approach starts showing cracks — lots of boilerplate, no caching, no automatic refetching, no optimistic updates. 

Enter **TanStack Query** (formerly known as React Query) — a powerful third-party library that handles HTTP request management with elegance and minimal code.

---

## What Is TanStack Query?

TanStack Query is a library that helps you:

- **Send HTTP requests** from your React app (GET, POST, PUT, DELETE)
- **Cache responses** so data is available instantly on revisits
- **Automatically refetch** data when it might be stale
- **Manage loading and error states** without manual state management
- **Optimistically update** the UI before the server confirms changes

It doesn't replace `fetch` or `axios` — it **wraps around** whatever you use to actually send requests, and adds a layer of intelligent management on top.

---

## What You'll Learn in This Section

- Why TanStack Query is better than the `useEffect` + `fetch` approach
- How to fetch data with `useQuery`
- How to mutate data (POST, PUT, DELETE) with `useMutation`
- How the **cache** works and how to configure it
- How to **invalidate** cached data when it changes
- **Optimistic updating** — updating the UI before the server responds
- Advanced patterns and configurations

---

## Why Not Just Use `useEffect` and `fetch`?

You absolutely can. But you'll end up:
- Writing the same boilerplate in every data-fetching component
- Managing `isLoading`, `error`, and `data` states manually
- Missing features like caching, background refetching, and request deduplication
- Writing significant code for features that TanStack Query gives you for free

---

## ✅ Key Takeaways

- TanStack Query (formerly React Query) manages HTTP requests in React apps
- It provides caching, automatic refetching, and optimistic updates out of the box
- It works **with** fetch/axios — it doesn't replace them
- It dramatically reduces boilerplate compared to useEffect-based approaches
