# The Component Lifecycle (Class-based Components)

## Introduction

In functional components, `useEffect` handles side effects elegantly — you specify *what* to watch and React runs your code when dependencies change. In class-based components, there's no `useEffect`. Instead, you have **lifecycle methods** — special methods that React calls at specific points in a component's life. Understanding these is key to working with class-based code.

---

## The Three Essential Lifecycle Methods

Every component goes through a lifecycle: it's created (mounted), it updates, and eventually it's removed (unmounted). React provides methods that let you run code at each of these stages.

### 1. `componentDidMount()`

**When it runs**: Once, right after the component is first rendered to the DOM.

**Use case**: Fetching initial data, setting up subscriptions, initializing third-party libraries.

```jsx
componentDidMount() {
  // Component was just rendered for the first time
  // Perfect place to fetch data from a server
  fetch('/api/users')
    .then(res => res.json())
    .then(data => this.setState({ users: data }));
}
```

**Functional equivalent**:
```jsx
useEffect(() => {
  // Runs once after first render
}, []); // Empty dependency array
```

---

### 2. `componentDidUpdate()`

**When it runs**: After every re-render (but NOT after the first render — that's what `componentDidMount` is for).

**Use case**: Reacting to state or prop changes, updating the DOM in response to changes, fetching new data when inputs change.

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevState.searchTerm !== this.state.searchTerm) {
    // searchTerm changed — filter the users
    this.setState({
      filteredUsers: this.state.allUsers.filter(u => 
        u.name.includes(this.state.searchTerm)
      )
    });
  }
}
```

**Functional equivalent**:
```jsx
useEffect(() => {
  // Runs when searchTerm changes
}, [searchTerm]);
```

### ⚠️ Critical: Always Add an `if` Check!

Without the `if` check, you'll create an **infinite loop**:
1. `componentDidUpdate` runs.
2. You call `setState`, which triggers a re-render.
3. `componentDidUpdate` runs again.
4. You call `setState` again... and so on forever.

The `if` check ensures you only update when the relevant state actually changed. This is one area where `useEffect` is clearly superior — the dependency array handles this automatically.

---

### 3. `componentWillUnmount()`

**When it runs**: Right before the component is removed from the DOM.

**Use case**: Cleanup — removing event listeners, canceling network requests, clearing timers, unsubscribing from subscriptions.

```jsx
componentWillUnmount() {
  // Component is about to be removed
  clearInterval(this.timer);
  this.subscription.unsubscribe();
}
```

**Functional equivalent**:
```jsx
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer); // Cleanup function
}, []);
```

---

## Complete Mapping: Lifecycle Methods → Hooks

| Lifecycle Method | When It Runs | `useEffect` Equivalent |
|---|---|---|
| `componentDidMount()` | After first render | `useEffect(fn, [])` |
| `componentDidUpdate()` | After every re-render | `useEffect(fn, [deps])` |
| `componentWillUnmount()` | Before component removal | `useEffect(() => { return cleanupFn; }, [])` |

---

## The Mental Model Difference

This is the fundamental difference in how you think about side effects:

**Lifecycle methods** → You think about **when** code should run in the component's life.
- *"When the component mounts, fetch data."*
- *"When the component updates, check if I need to do something."*

**`useEffect`** → You think about **what data** the effect depends on.
- *"When `searchTerm` changes, filter the users."*

The hooks-based mental model is generally simpler because you don't have to think about the component's lifecycle stages. You just declare your dependencies and React handles the rest.

---

## ✅ Key Takeaways

- Class-based components use **lifecycle methods** instead of `useEffect`.
- `componentDidMount()` = runs once after initial render (like `useEffect` with `[]`).
- `componentDidUpdate()` = runs after every re-render (like `useEffect` with `[deps]`).
- `componentWillUnmount()` = runs before removal (like the cleanup function in `useEffect`).
- `componentDidUpdate` receives `prevProps` and `prevState` for comparison — always use them to avoid infinite loops.

## 💡 Pro Tip

The lifecycle mental model (thinking about *when*) vs the hooks mental model (thinking about *what*) is the biggest conceptual gap between class-based and functional components. When reading class-based code, try translating each lifecycle method into its `useEffect` equivalent — it'll make the code much clearer.
