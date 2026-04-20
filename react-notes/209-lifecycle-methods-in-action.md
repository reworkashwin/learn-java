# Lifecycle Methods in Action

## Introduction

Now that you understand the theory behind lifecycle methods, let's see them in action. We'll transform a functional component that uses `useEffect` into a class-based component using `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. You'll see the practical differences — including the extra code and the `if` checks that lifecycle methods require.

---

## The Scenario: A UserFinder Component

We have a `UserFinder` component that:
- Manages a **search term** state (what the user types).
- Manages a **filtered users** list state.
- Uses `useEffect` to **re-filter** users whenever the search term changes.

Here's the functional version:

```jsx
function UserFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(DUMMY_USERS);

  useEffect(() => {
    setFilteredUsers(
      DUMMY_USERS.filter(u => u.name.includes(searchTerm))
    );
  }, [searchTerm]);

  return (/* JSX */);
}
```

Clean, concise, dependency-driven. Now let's convert it.

---

## Converting to a Class-based Component

### Step 1: Set Up State in the Constructor

```jsx
class UserFinder extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: '',
      filteredUsers: DUMMY_USERS,
    };
  }
}
```

Remember: all state lives in one object. No multiple `useState` calls.

### Step 2: Add the Event Handler

```jsx
searchChangeHandler(event) {
  this.setState({ searchTerm: event.target.value });
}
```

This updates only the `searchTerm` — `filteredUsers` is untouched because `setState` merges.

### Step 3: Replace `useEffect` with `componentDidUpdate`

This is where it gets interesting:

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevState.searchTerm !== this.state.searchTerm) {
    this.setState({
      filteredUsers: DUMMY_USERS.filter(u =>
        u.name.includes(this.state.searchTerm)
      ),
    });
  }
}
```

### Why the `if` Check Is Essential

Without it:
1. `searchTerm` changes → `componentDidUpdate` runs → `setState` called for `filteredUsers`.
2. `filteredUsers` changes → `componentDidUpdate` runs → `setState` called again → infinite loop! 💥

The `if` check ensures we only update `filteredUsers` when `searchTerm` actually changed. When `filteredUsers` changes (from our own `setState`), the method runs again but the `if` condition is `false`, so nothing happens. Loop broken.

Compare this to the functional equivalent:
```jsx
useEffect(() => { ... }, [searchTerm]); // Dependencies handle this automatically
```

Much simpler — the dependency array is doing the same job as our manual `if` check.

---

## Using `componentDidMount` for Initial Data Loading

Imagine the users come from a server instead of a constant. You want to fetch them once when the component first renders:

```jsx
componentDidMount() {
  // Simulating a server fetch
  this.setState({ filteredUsers: DUMMY_USERS });
}
```

In a real app, this is where you'd make your API calls:

```jsx
componentDidMount() {
  fetch('/api/users')
    .then(res => res.json())
    .then(users => this.setState({ filteredUsers: users }));
}
```

`componentDidMount` runs **once** after the first render. It won't run again when the component updates — that's what `componentDidUpdate` is for.

---

## Using `componentWillUnmount` for Cleanup

If a component is rendered conditionally (shows/hides), you can run cleanup code before it's removed:

```jsx
class User extends Component {
  componentWillUnmount() {
    console.log('User component will unmount');
  }

  render() {
    return <li>{this.props.name}</li>;
  }
}
```

If you have three `User` instances and you hide the list, `componentWillUnmount` fires three times — once for each instance. Every instance has its own lifecycle.

---

## Render Method with `this` References

```jsx
render() {
  return (
    <div>
      <input
        type="search"
        onChange={this.searchChangeHandler.bind(this)}
      />
      <ul>
        {this.state.filteredUsers.map(user => (
          <User key={user.id} name={user.name} />
        ))}
      </ul>
    </div>
  );
}
```

Notice:
- `this.searchChangeHandler.bind(this)` — binding the handler.
- `this.state.filteredUsers` — accessing state.

---

## The Full Class-based Component

```jsx
class UserFinder extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: '',
      filteredUsers: [],
    };
  }

  componentDidMount() {
    this.setState({ filteredUsers: DUMMY_USERS });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      this.setState({
        filteredUsers: DUMMY_USERS.filter(u =>
          u.name.includes(this.state.searchTerm)
        ),
      });
    }
  }

  searchChangeHandler(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    return (
      <div>
        <input type="search" onChange={this.searchChangeHandler.bind(this)} />
        <Users users={this.state.filteredUsers} />
      </div>
    );
  }
}
```

---

## ✅ Key Takeaways

- `componentDidMount` → Fetch initial data. Runs once after first render.
- `componentDidUpdate` → React to state/prop changes. **Must include `if` checks** to avoid infinite loops.
- `componentWillUnmount` → Cleanup before removal. Runs for each component instance.
- Compare `prevState`/`prevProps` to current values in `componentDidUpdate` to determine what changed.
- Lifecycle methods run per-instance — three user components = three lifecycle calls.

## ⚠️ Common Mistakes

- **Forgetting the `if` check in `componentDidUpdate`** — Guaranteed infinite loop.
- **Comparing `prevProps` when you mean `prevState`** — Make sure you're comparing the right thing.
- **Calling `setState` in `componentDidMount` unnecessarily** — Only do it when you're loading data or need to derive state after mount.

## 💡 Pro Tip

When converting class components to functional, map each lifecycle method to its hook equivalent:
- `constructor` → Just use `useState` initial values.
- `componentDidMount` → `useEffect(fn, [])`.
- `componentDidUpdate` with `if` check → `useEffect(fn, [specificDep])`.
- `componentWillUnmount` → cleanup function in `useEffect`.
