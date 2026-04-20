# How To Work With Redux State Correctly

## Introduction

This is arguably one of the **most important** Redux lectures. How you handle state in your reducer determines whether your app works reliably or falls apart with unpredictable bugs. The golden rule is simple but easy to violate: **never mutate the existing state**.

---

## Redux Replaces, It Doesn't Merge

Let's be crystal clear: when you return a new state object from the reducer, Redux takes it and **completely replaces** the old state. It doesn't look at what changed and merge the differences. It's a wholesale swap.

That's why you must include all properties in each return statement — anything missing is gone.

---

## The Cardinal Sin: Mutating State

Here's code that **works but is dangerously wrong**:

```js
// ❌ NEVER DO THIS
if (action.type === 'increment') {
  state.counter++;
  return state;
}
```

Or even this:

```js
// ❌ ALSO WRONG
if (action.type === 'increment') {
  state.counter = state.counter + 1;
  return {
    counter: state.counter,
    showCounter: state.showCounter
  };
}
```

Both examples **mutate the existing state object** before returning. Yes, it might work in a small demo. But it's a ticking time bomb.

---

## Why Mutation Is Dangerous

### Objects Are Reference Values

In JavaScript, objects and arrays are **reference values**. When you write `state.counter++`, you're not creating a new object — you're modifying the *original* object in memory. Even if you return a "new" object afterward, the damage is done — the original state was changed in place.

### The Real-World Consequences

- **State gets out of sync:** Redux's internal change detection can break when you mutate state. It might not recognize that a change happened, so subscribers don't get notified.
- **UI doesn't update:** Components might not re-render because Redux doesn't detect the change.
- **Debugging becomes impossible:** Redux DevTools relies on comparing old and new state objects. If you mutate the old one, both "before" and "after" states look the same.
- **Unpredictable behavior:** Bugs might appear randomly or only under specific conditions, making them incredibly hard to reproduce.

---

## The Correct Way: Always Return New Objects

```js
// ✅ CORRECT — brand new object, no mutation
if (action.type === 'increment') {
  return {
    counter: state.counter + 1,
    showCounter: state.showCounter
  };
}
```

This creates a **completely new object**. The original `state` is never touched. `state.counter` is read (that's fine), but we never assign to it or modify it.

---

## Nested Objects and Arrays

The danger multiplies with nested data. Consider:

```js
// ❌ WRONG — mutates nested array
state.items.push(newItem);
return { ...state };
```

Even though you spread `state` into a new object, the `items` array is still the *same reference*. `push` mutated the original array.

**Correct approach:**

```js
// ✅ CORRECT — creates new array
return {
  ...state,
  items: [...state.items, newItem]
};
```

This creates a new array with all existing items plus the new one. The original `state.items` is untouched.

---

## The Rule of Thumb

> Never modify anything on the `state` object. Always create new objects and arrays. Read from `state`, but never write to it.

```js
state.counter + 1    // ✅ Reading — fine
state.counter++      // ❌ Mutating — never
state.counter = 5    // ❌ Mutating — never

[...state.items]     // ✅ Copying — fine
state.items.push()   // ❌ Mutating — never
```

---

## ✅ Key Takeaways

- **Never mutate** the state you receive in the reducer
- Always return a **brand new object** (and copy nested objects/arrays)
- Mutation can cause silent bugs: missed re-renders, stale UI, broken debugging
- Objects and arrays in JavaScript are reference values — modifying them changes the original
- Read from state, never write to it

## ⚠️ Common Mistake

Thinking "it works, so it's fine." State mutation often works in simple demos but fails in production with complex state trees. Follow immutability rules from the start — don't wait for bugs to force you.

## 💡 Pro Tip

If keeping track of immutability feels tedious (especially with deeply nested state), Redux Toolkit solves this with a library called **Immer** under the hood. It lets you write "mutating" code that actually produces immutable updates behind the scenes. We'll explore this soon.
