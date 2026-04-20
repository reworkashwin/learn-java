# Attaching Payloads to Actions

## Introduction

So far, our actions only carry a `type` — a string identifier. But in real applications, actions often need to carry **extra data** along with them. You might want to increment a counter by 5, or by 10, or by whatever number the user typed. You can't hard-code every possible value in your reducer. That's where **action payloads** come in.

---

## The Problem with Hard-Coded Values

Imagine we want an "Increase by 5" button. We could create a separate action type:

```js
if (action.type === 'increaseBy5') {
  return { counter: state.counter + 5 };
}
```

But what about "Increase by 10"? "Increase by 100"? What if the value comes from user input? We'd need infinite action types. That's clearly not scalable.

---

## The Solution: Dynamic Payloads

Actions are just JavaScript objects. You can add **any extra properties** you want beyond `type`:

```js
dispatch({ type: 'increase', amount: 5 });
```

Here, `amount` is a **payload** — extra data attached to the action. The property name (`amount`) is entirely up to you. You could call it `value`, `payload`, `data`, or anything else.

---

## Using Payloads in the Reducer

In the reducer, access the payload from the `action` object:

```js
const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') {
    return { counter: state.counter + 1 };
  }
  if (action.type === 'increase') {
    return { counter: state.counter + action.amount };
  }
  if (action.type === 'decrement') {
    return { counter: state.counter - 1 };
  }
  return state;
};
```

The key line: `state.counter + action.amount`. The reducer doesn't hard-code any value — it uses whatever `amount` was sent with the action.

---

## Dispatching with Payloads

In your component:

```jsx
const increaseHandler = () => {
  dispatch({ type: 'increase', amount: 5 });
};
```

Now you can easily change the value:

```jsx
dispatch({ type: 'increase', amount: 10 });
dispatch({ type: 'increase', amount: 100 });
dispatch({ type: 'increase', amount: someUserInput });
```

One action type, infinite flexibility.

---

## The Property Name Contract

The property name you use when dispatching must **exactly match** what you read in the reducer:

```js
// Dispatching
dispatch({ type: 'increase', amount: 5 });

// In the reducer
return { counter: state.counter + action.amount }; // ✅

return { counter: state.counter + action.value }; // ❌ undefined!
```

If the names don't match, you'll get `undefined` for the payload — no error, just broken behavior.

---

## ✅ Key Takeaways

- Actions can carry extra data beyond `type` — this is called a **payload**
- Add any property you want to the action object: `{ type: 'increase', amount: 5 }`
- Access payloads in the reducer via `action.propertyName`
- Property names must match between dispatch and reducer
- Payloads make your reducers dynamic and flexible

## ⚠️ Common Mistake

Mismatching property names between the dispatch and the reducer. If you dispatch `{ type: 'increase', amount: 5 }` but read `action.value` in the reducer, you'll get `undefined`. Always double-check the property names match.
