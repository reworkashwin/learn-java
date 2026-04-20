# Redux with Class-based Components

## Introduction

We've been using functional components and hooks (`useSelector`, `useDispatch`) to work with Redux. But what if you're working on a project that uses **class-based components**? Hooks don't work in classes. So how do you connect class-based components to Redux?

The answer: the `connect` function from `react-redux`.

---

## The `connect` Higher-Order Function

`connect` is a **higher-order component** (HOC) — a function that wraps your component and injects Redux capabilities into it.

```js
import { connect } from 'react-redux';
import { Component } from 'react';
```

### Basic Structure

Instead of exporting your component directly, you export it *wrapped* by `connect`:

```js
export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

This looks unusual. Let's break it down:

1. `connect(mapStateToProps, mapDispatchToProps)` — calling `connect` with two arguments returns a **new function**
2. `(Counter)` — we immediately call that returned function with our component

The result is an enhanced version of `Counter` that has Redux state and dispatch wired in through **props**.

---

## `mapStateToProps` — Reading State

This function is the equivalent of `useSelector`. It maps Redux state to component props:

```js
const mapStateToProps = (state) => {
  return {
    counter: state.counter
  };
};
```

- Redux passes the full state to this function
- You return an object where keys become prop names
- `this.props.counter` is now available in the class component

---

## `mapDispatchToProps` — Dispatching Actions

This is the equivalent of `useDispatch`. It maps dispatch calls to component props:

```js
const mapDispatchToProps = (dispatch) => {
  return {
    increment: () => dispatch({ type: 'increment' }),
    decrement: () => dispatch({ type: 'decrement' })
  };
};
```

- Redux passes the `dispatch` function to this function
- You return an object where keys become prop names
- `this.props.increment()` and `this.props.decrement()` dispatch the appropriate actions

---

## The Complete Class-based Component

```jsx
import { Component } from 'react';
import { connect } from 'react-redux';

class Counter extends Component {
  incrementHandler() {
    this.props.increment();
  }

  decrementHandler() {
    this.props.decrement();
  }

  render() {
    return (
      <div>
        <h1>{this.props.counter}</h1>
        <button onClick={this.incrementHandler.bind(this)}>Increment</button>
        <button onClick={this.decrementHandler.bind(this)}>Decrement</button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { counter: state.counter };
};

const mapDispatchToProps = (dispatch) => {
  return {
    increment: () => dispatch({ type: 'increment' }),
    decrement: () => dispatch({ type: 'decrement' })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

Note the `.bind(this)` on the event handlers — that's standard class component behavior to ensure `this` refers to the class instance inside the methods.

---

## Hooks vs Connect: Comparison

| Feature | Hooks (Functional) | Connect (Class-based) |
|---|---|---|
| Read state | `useSelector(state => state.counter)` | `mapStateToProps` → `this.props.counter` |
| Dispatch | `useDispatch()` → `dispatch({...})` | `mapDispatchToProps` → `this.props.increment()` |
| Syntax | Shorter, simpler | More boilerplate |
| Subscriptions | Automatic | Also automatic (via `connect`) |

---

## ✅ Key Takeaways

- Class-based components can't use hooks — use `connect` from `react-redux` instead
- `connect` takes two functions: `mapStateToProps` and `mapDispatchToProps`
- `mapStateToProps` maps Redux state to component props (like `useSelector`)
- `mapDispatchToProps` maps dispatch functions to component props (like `useDispatch`)
- `connect` also auto-manages subscriptions, just like hooks do
- `connect` works on functional components too, but hooks are simpler

## 💡 Pro Tip

If you're maintaining a legacy codebase with class components, `connect` works great. But if you're writing new code, stick with functional components and hooks — it's less boilerplate and the modern standard.
