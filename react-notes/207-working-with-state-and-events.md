# Working with State & Events in Class-based Components

## Introduction

Building a stateless class-based component is straightforward. But the real reason class-based components existed was for **state management**. Before hooks, this was the only way to have stateful components. The approach is fundamentally different from `useState` — let's break it down step by step.

---

## Defining State in the Constructor

In class-based components, state is initialized in the `constructor()` method by setting `this.state` to an **object**:

```jsx
class Users extends Component {
  constructor() {
    super(); // Must call super() first!
    this.state = {
      showUsers: true,
    };
  }

  render() {
    // ...
  }
}
```

### Critical Rule: State Is Always an Object

With `useState`, your state can be anything — a boolean, a string, a number, an array, or an object. With class-based components, **state is always an object**. Period.

If you have multiple state values, they all go in this one object:

```jsx
this.state = {
  showUsers: true,
  searchTerm: '',
  filteredUsers: [],
  isLoading: false,
};
```

There's no equivalent to calling `useState` multiple times. Everything lives in one `this.state` object.

---

## Updating State with `this.setState()`

You never modify `this.state` directly. Instead, you call `this.setState()` — a method inherited from `Component`:

```jsx
this.setState({ showUsers: false });
```

### Key Difference: setState Merges, Not Replaces

This is a major difference from `useState`:

- **`useState` setter** — **Replaces** the entire state value.
- **`this.setState()`** — **Merges** the update with the existing state.

```jsx
// State: { showUsers: true, searchTerm: '', isLoading: false }

this.setState({ showUsers: false });

// New state: { showUsers: false, searchTerm: '', isLoading: false }
// searchTerm and isLoading are preserved!
```

You only pass the properties you want to change. Everything else remains untouched. This is convenient when you have many state properties.

---

## Using the Function Form for Dependent Updates

Just like `useState`, if your new state depends on the previous state, use the **function form**:

```jsx
this.setState((currentState) => {
  return { showUsers: !currentState.showUsers };
});
```

The function receives the current state and must return an object (which will be merged with the existing state). This ensures you're always working with the latest state value, even with scheduled updates.

---

## Handling Events with Class Methods

In functional components, you define handler functions directly in the component:

```jsx
// Functional
function Users() {
  const toggleHandler = () => { /* ... */ };
  return <button onClick={toggleHandler}>Toggle</button>;
}
```

In class-based components, handlers are **methods** on the class:

```jsx
class Users extends Component {
  toggleUsersHandler() {
    this.setState(curState => ({ showUsers: !curState.showUsers }));
  }

  render() {
    return <button onClick={this.toggleUsersHandler.bind(this)}>Toggle</button>;
  }
}
```

### The `this` Binding Problem

Notice the `.bind(this)` in the onClick? This is necessary because of how JavaScript's `this` keyword works with classes. When a method is called as an event handler, `this` doesn't automatically refer to the class instance — it can be `undefined` or the event target.

`.bind(this)` in the render method ensures that `this` inside `toggleUsersHandler` refers to the class instance, giving you access to `this.state` and `this.setState()`.

This is a JavaScript quirk, not a React one — and it's one of the reasons functional components feel simpler.

---

## Reading State in the Render Method

Access state values with `this.state.propertyName`:

```jsx
render() {
  const usersList = this.state.showUsers ? (
    <ul>
      {this.state.filteredUsers.map(user => (
        <User key={user.id} name={user.name} />
      ))}
    </ul>
  ) : null;

  return (
    <div>
      <button onClick={this.toggleUsersHandler.bind(this)}>
        {this.state.showUsers ? 'Hide' : 'Show'} Users
      </button>
      {usersList}
    </div>
  );
}
```

---

## Comparison: Functional vs Class-based State

| Feature | Functional (`useState`) | Class-based (`this.state`) |
|---------|-------------------------|---------------------------|
| State type | Anything (string, number, object, etc.) | Always an object |
| Multiple state values | Multiple `useState` calls | One `this.state` object |
| Updating | Replaces the state value | Merges with existing state |
| Reading | Direct variable access | `this.state.property` |
| Event handlers | Regular functions | Class methods with `.bind(this)` |

---

## ✅ Key Takeaways

- State in class components is **always an object**, initialized in the constructor with `this.state = {}`.
- Update state with `this.setState()`, which **merges** the update with existing state.
- Use the function form `this.setState(prevState => ...)` when the new state depends on the old state.
- Event handlers are class methods that need `.bind(this)` to work correctly.
- Always call `super()` in the constructor before accessing `this`.

## ⚠️ Common Mistakes

- **Modifying `this.state` directly** — Never do `this.state.showUsers = false`. Always use `this.setState()`.
- **Forgetting `.bind(this)`** — Without it, `this` is undefined in your handler methods.
- **Thinking `setState` replaces state** — It merges, unlike `useState` setters which replace.

## 💡 Pro Tip

The `.bind(this)` pattern is repetitive and error-prone. An alternative is to define handlers as arrow function class properties: `toggleUsersHandler = () => { ... }`. Arrow functions automatically bind `this` to the class instance. While not shown in older tutorials, it's cleaner and widely used.
