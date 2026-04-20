# Frontend Code vs Backend Code

## Introduction

Before writing the async code, there's an important architectural question to answer: **how much work should the frontend do vs. the backend?** The answer depends entirely on your backend's capabilities, and it directly affects where your Redux logic lives.

---

## The Spectrum of Backend Responsibility

### Smart Backend (Does Heavy Lifting)

If your backend API has business logic — validation, data transformation, complex operations — then your frontend can be thin:

```
Frontend: "Add product P1 to the cart"
Backend:  Finds the cart, checks if P1 exists, updates quantity or adds new entry,
          calculates totals, returns the final cart
Frontend: Takes the response and stores it directly in Redux
```

In this case, your Redux reducer is simple — it just receives the finished cart from the backend and replaces the state. The transformation logic lives on the server.

### Dumb Backend (Just Stores Data)

If your backend is a simple data store (like Firebase in our case), it has no logic. It stores whatever you send:

```
Frontend: Finds existing item, updates quantity, recalculates total,
          constructs the complete cart object, sends it to the backend
Backend:  Stores the incoming data as-is
```

Now your **frontend** owns all the business logic. That logic lives in your Redux reducers.

---

## Our Situation

Firebase (as we're using it) is a "dumb backend." It doesn't:
- Check if an item already exists in the cart
- Update quantities
- Calculate totals
- Validate data

It just stores what it receives. This means all the cart management logic — the `addItemToCart` and `removeItemFromCart` reducers — must stay on the frontend.

---

## The Challenge

Since the reducer handles all the data transformation (and it must, because the backend won't), we face a tension:

1. The reducer has the transformation logic — but can't send HTTP requests
2. The HTTP request needs to send the *transformed* data — but the reducer can't do that

So we need to find a way to:
1. Let the reducer do its transformation work
2. **Then** send the result to the backend (from somewhere else)

This is the exact problem the next lectures solve.

---

## Could We Move Logic to the Component?

Technically yes — you could do all the cart updating logic in the component, then dispatch a "replaceCart" action with the finished result. But this has downsides:

- Code duplication across components that modify the cart
- Reducers become trivially simple (just storing data) — not leveraging Redux's strengths
- You must manually ensure immutability outside reducers (Immer doesn't help you in components)

---

## The Principle

| Code Type | Best Location |
|-----------|--------------|
| Synchronous data transformation | **Reducers** (preferred) |
| Async code / side effects | **Components** or **Action Creators** |

Keep your transformation logic in reducers. Find another place for the side effects.

---

## ✅ Key Takeaways

- Your frontend code depends on what your backend does — smarter backend means simpler frontend
- With a "dumb" backend like Firebase, all business logic stays in Redux reducers
- The challenge: reducers handle logic but can't send requests; requests need the logic's output
- Moving logic to components to avoid this problem creates worse code (duplication, no Immer)

## ⚠️ Common Mistakes

- Assuming all backends are "smart" — many REST APIs just store/retrieve data
- Putting data transformation logic in components when reducers are the better home
- Directly mutating Redux state in components — Immer only protects you inside slice reducers

## 💡 Pro Tips

- Real-world apps often have a mix: some endpoints do heavy processing, others just CRUD
- If you build your own API (Node.js, Python, etc.), you can move transformation logic there — but that's a separate skillset
- The "fat reducer, thin component" pattern is generally preferred in Redux architectures
