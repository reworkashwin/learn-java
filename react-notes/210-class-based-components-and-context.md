# Class-based Components & Context

## Introduction

You've learned how to manage state and handle side effects in class-based components. But what about **Context** — React's built-in mechanism for passing data through the component tree without prop drilling? The good news: Context works with class-based components. The less good news: it's **more limited** than the `useContext` hook.

---

## Providing Context: No Change

The way you **create** and **provide** context doesn't change at all. Whether your components are functional or class-based, you still:

1. Create context with `createContext()`.
2. Wrap your component tree with the `Provider`.
3. Pass a `value` prop to the Provider.

```jsx
// store/users-context.js
import { createContext } from 'react';

const UsersContext = createContext({ users: [] });

export default UsersContext;
```

```jsx
// App.js
import UsersContext from './store/users-context';

function App() {
  return (
    <UsersContext.Provider value={{ users: DUMMY_USERS }}>
      <UserFinder />
    </UsersContext.Provider>
  );
}
```

This part is identical to what you already know. The difference is only in how you **consume** context.

---

## Option 1: Using the Consumer Component

The `Consumer` component works in both functional and class-based components. It's the original way to consume context:

```jsx
render() {
  return (
    <UsersContext.Consumer>
      {(ctx) => (
        <div>
          {ctx.users.map(user => <User key={user.id} name={user.name} />)}
        </div>
      )}
    </UsersContext.Consumer>
  );
}
```

The Consumer uses a **render prop pattern** — it expects a function as its child, which receives the context value. This works, but it's verbose and creates nesting.

---

## Option 2: Using `static contextType` (Class-only)

Class-based components have a dedicated mechanism for consuming context — the `static contextType` property:

```jsx
import UsersContext from '../store/users-context';

class UserFinder extends Component {
  static contextType = UsersContext;

  componentDidMount() {
    // Access context with this.context
    this.setState({ filteredUsers: this.context.users });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      this.setState({
        filteredUsers: this.context.users.filter(u =>
          u.name.includes(this.state.searchTerm)
        ),
      });
    }
  }

  render() {
    return (/* JSX using this.context.users */);
  }
}
```

### How It Works

1. Set `static contextType` to your context object.
2. Access the context value anywhere in the class with `this.context`.
3. Use it in lifecycle methods, event handlers, or `render()`.

---

## The Big Limitation: One Context Only

Here's the catch: **you can only set `contextType` once per class**. If a component needs data from two different contexts, you can't do this:

```jsx
// ❌ Not possible — can only set contextType once
static contextType = UsersContext;
static contextType = ThemeContext; // This overrides the first one!
```

With functional components, you can use `useContext` multiple times:

```jsx
// ✅ Functional components handle this easily
const users = useContext(UsersContext);
const theme = useContext(ThemeContext);
```

### Workarounds for Multiple Contexts

If you absolutely need multiple contexts in a class-based component:

1. **Use the Consumer component** for additional contexts (nest them).
2. **Wrap the class component** in a functional component that reads the extra contexts and passes them as props.
3. **Merge contexts** into a single context if they're closely related.

---

## Comparison: Context Consumption

| Feature | Functional (`useContext`) | Class-based (`contextType`) |
|---------|--------------------------|---------------------------|
| Number of contexts | Unlimited | **One** per component |
| Syntax | `const ctx = useContext(MyCtx)` | `static contextType = MyCtx; this.context` |
| Flexibility | Very flexible | Limited |
| Alternative | — | Consumer component (works in both) |

---

## ✅ Key Takeaways

- **Providing** context works identically — `createContext()` + `<Provider>`.
- Class-based components consume context via `static contextType` and `this.context`.
- **Only one context** can be connected per class via `contextType`.
- For multiple contexts, fall back to the `Consumer` component or restructure your architecture.
- The `useContext` hook in functional components is significantly more flexible.

## ⚠️ Common Mistakes

- **Trying to set `contextType` for multiple contexts** — Only the last one will apply.
- **Forgetting `static` keyword** — `contextType` must be a static property, not an instance property.
- **Accessing `this.context` without setting `contextType`** — It'll be undefined.

## 💡 Pro Tip

When you encounter a class-based component that needs multiple contexts and the code looks convoluted with nested Consumer components, that's a strong signal to consider migrating it to a functional component. Multi-context usage is one of the clearest wins for the hooks-based approach.
