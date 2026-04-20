# Migrating Everything to Redux Toolkit

## Introduction

You've got your slice, your store is configured — now it's time to actually **dispatch actions** from your components. This is where Redux Toolkit truly shines. No more hand-crafted action objects, no more string constants, no more typo-induced bugs. The `.actions` property on your slice gives you auto-generated **action creators** that handle everything.

---

## Action Creators from `createSlice`

Every slice has an `.actions` property — an object whose keys match the method names in your `reducers` map:

```js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { counter: 0, showCounter: true },
  reducers: {
    increment(state) { state.counter++; },
    decrement(state) { state.counter--; },
    increase(state, action) { state.counter += action.payload; },
    toggleCounter(state) { state.showCounter = !state.showCounter; }
  }
});

// Auto-generated action creators
counterSlice.actions.increment();    // { type: 'counter/increment' }
counterSlice.actions.decrement();    // { type: 'counter/decrement' }
counterSlice.actions.increase(5);    // { type: 'counter/increase', payload: 5 }
counterSlice.actions.toggleCounter(); // { type: 'counter/toggleCounter' }
```

These aren't the reducer methods themselves — they're **action creator functions**. When you *call* them, they return action objects with an auto-generated `type` property. You never need to know what that type string looks like.

---

## Exporting and Using Actions

In your store file, export the actions:

```js
export const counterActions = counterSlice.actions;
```

In your component:

```js
import { useDispatch } from 'react-redux';
import { counterActions } from '../store/index';

const Counter = () => {
  const dispatch = useDispatch();

  const incrementHandler = () => dispatch(counterActions.increment());
  const decrementHandler = () => dispatch(counterActions.decrement());
  const increaseHandler = () => dispatch(counterActions.increase(5));
  const toggleHandler = () => dispatch(counterActions.toggleCounter());

  // ...
};
```

Notice: you **call** `counterActions.increment()` — you don't just reference it. Calling it creates the action object that `dispatch` needs.

---

## Passing Payload Data

When you need to send extra data with an action, just pass it as an argument:

```js
dispatch(counterActions.increase(10));
```

Whatever you pass becomes `action.payload` in the reducer. This is a fixed convention in Redux Toolkit:

- You pass: `counterActions.increase(10)`
- Redux Toolkit creates: `{ type: 'counter/increase', payload: 10 }`
- Your reducer receives: `action.payload` → `10`

The property name is **always** `payload`. Not `amount`, not `value`, not `data` — always `payload`. So in your reducer, you access the data via `action.payload`:

```js
increase(state, action) {
  state.counter += action.payload;  // not action.amount!
}
```

---

## The Result

After migrating:
- **Shorter code** — no manual action types, no switch statements
- **More concise** — slice bundles everything together
- **Easier to maintain** — actions are co-located with reducers
- **Type-safe names** — auto-generated, no typos possible

---

## ✅ Key Takeaways

- `slice.actions` contains auto-generated action creator methods
- Call the action creator (e.g., `counterActions.increment()`) to get an action object
- Extra data passed to an action creator is stored under `action.payload`
- The `payload` property name is enforced by Redux Toolkit — you can't change it
- Export actions separately from the store so components can import them easily

## ⚠️ Common Mistakes

- Forgetting to **call** the action creator — `dispatch(counterActions.increment)` won't work, you need `dispatch(counterActions.increment())`
- Using `action.amount` or `action.value` in the reducer instead of `action.payload`
- Trying to pass multiple arguments — wrap them in an object instead: `increase({ amount: 5, multiplier: 2 })`

## 💡 Pro Tips

- Action type strings follow the pattern `sliceName/methodName` (e.g., `counter/increment`)
- You can log `counterActions.increment()` to see the exact action object being created
- If you need to pass complex data, pass an object as the payload — it all ends up under `action.payload`
