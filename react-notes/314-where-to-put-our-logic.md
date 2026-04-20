# Where to Put Our Logic

## Introduction

We know reducers can't have side effects. We know the reducer *should* handle data transformation. So where does the async code go? This lecture formalizes the decision framework: **fat reducers vs. fat components vs. fat action creators** — and why one sub-optimal approach (transforming data in the component) should be avoided.

---

## The Sub-Optimal Approach: Logic in the Component

One tempting idea is to move all the cart logic *out* of the reducer and into the component:

1. Read the current cart from Redux with `useSelector`
2. Manually transform it (find existing items, update quantities, etc.)
3. Dispatch a generic "replaceCart" action with the finished result
4. Send the HTTP request

### Why This Is Problematic

**Immutability is your responsibility.** Inside a reducer, Immer protects you. In a component? You're on your own. You must manually copy arrays, clone objects, and never accidentally mutate Redux state:

```js
// ❌ This looks innocent but mutates Redux state!
const cart = useSelector(state => state.cart);
cart.totalQuantity = cart.totalQuantity + 1; // MUTATION!
```

```js
// ✅ Must create new references manually
const newTotalQuantity = cart.totalQuantity + 1;
const updatedItems = [...cart.items]; // copy the array
```

**Code duplication.** Every component that modifies the cart needs the same transformation logic. You could extract it into a helper function, but then you've essentially built a reducer outside of Redux.

**Redux becomes trivial.** If your reducers just receive finished data and store it, you're not really leveraging Redux for what it's good at — managing state transitions.

---

## The Decision Framework

When deciding where to put your code, ask one question:

**Is this code synchronous and side-effect free?**

| Answer | Where It Goes |
|--------|--------------|
| **Yes** — pure data transformation | **Reducers** (strongly preferred) |
| **No** — async code or side effects | **Components** or **Action Creators** (never reducers) |

### The Three Options

1. **Fat Reducers** — Reducers do the heavy transformation logic. Components and action creators handle only side effects. *(Recommended for transformation logic)*

2. **Fat Components** — Components do both transformation and side effects. Reducers just store incoming data. *(Works, but creates duplication and loses Immer protection)*

3. **Fat Action Creators** — Action creators handle transformation *and* side effects, then dispatch simple actions. *(You'll learn this approach — called thunks — soon)*

---

## The Better Approach — Preview

Instead of doing everything in the component, the better pattern is:

1. **Keep transformation logic in reducers** — `addItemToCart`, `removeItemFromCart` stay as they are
2. **Let Redux update state first** — the reducer does its job
3. **Then send the updated state to the backend** — from a component or action creator

This way:
- Reducers stay fat (with transformation logic) and Immer-protected
- Side effects happen separately, *after* the state is already updated
- No code duplication
- No manual immutability management

The key insight is **switching the order**: update Redux first, *then* sync to the backend. Not the other way around.

---

## ✅ Key Takeaways

- Data transformation → reducers (sync, side-effect free)
- Side effects / async → components or action creators (never reducers)
- Don't move transformation logic to components just to avoid the side-effect problem
- The solution is to let the reducer transform first, *then* sync the result to the backend

## ⚠️ Common Mistakes

- Mutating Redux state in components — Immer doesn't protect you outside reducers
- Making reducers trivially simple ("replaceCart") and putting all logic in components
- Thinking "fat reducers" means putting HTTP calls in reducers — transformation logic only

## 💡 Pro Tips

- Think of it as a pipeline: **Reducer transforms → State updates → Side effect syncs**
- If you find yourself writing the same transformation logic in multiple components, it probably belongs in a reducer
- The "replaceCart" pattern is valid for data coming *from* the backend (fetching saved cart), just not as a substitute for proper reducer logic
