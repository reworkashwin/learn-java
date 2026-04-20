# Reading & Dispatching From a New Slice

## Introduction

The previous lecture set up the `authSlice`. Now it's time to wire it into the actual components — conditionally rendering UI based on auth state, dispatching `login` and `logout` actions from form submissions and button clicks. This is the practical follow-through that makes multiple slices come alive.

---

## Reading Auth State in the App Component

To decide whether to show the login form or the user profile, read from the auth slice:

```js
import { useSelector } from 'react-redux';

function App() {
  const isAuth = useSelector(state => state.auth.isAuthenticated);

  return (
    <Fragment>
      <Header />
      {!isAuth && <Auth />}
      {isAuth && <UserProfile />}
    </Fragment>
  );
}
```

When `isAuthenticated` is `false`, the `<Auth />` form shows. When `true`, `<UserProfile />` shows. Simple conditional rendering driven by Redux state.

---

## Reading Auth State in the Header

The navigation links and logout button should only appear for authenticated users:

```js
import { useSelector } from 'react-redux';

const Header = () => {
  const isAuth = useSelector(state => state.auth.isAuthenticated);

  return (
    <header>
      {isAuth && (
        <nav>
          <ul>
            <li><a href="/">My Products</a></li>
            <li><a href="/">My Sales</a></li>
            <li><button onClick={logoutHandler}>Logout</button></li>
          </ul>
        </nav>
      )}
    </header>
  );
};
```

---

## Dispatching the Login Action

In the `Auth` component, handle form submission and dispatch `login`:

```js
import { useDispatch } from 'react-redux';
import { authActions } from '../store/index';

const Auth = () => {
  const dispatch = useDispatch();

  const loginHandler = (event) => {
    event.preventDefault();
    dispatch(authActions.login());
  };

  return (
    <form onSubmit={loginHandler}>
      {/* form fields... */}
      <button>Login</button>
    </form>
  );
};
```

Key details:
- `event.preventDefault()` stops the browser from sending an actual HTTP request
- `authActions.login()` creates the action object — remember to **call** it
- No payload needed — login just flips `isAuthenticated` to `true`

---

## Dispatching the Logout Action

In the `Header` component, wire up the logout button:

```js
import { useDispatch } from 'react-redux';
import { authActions } from '../store/index';

const Header = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(state => state.auth.isAuthenticated);

  const logoutHandler = () => {
    dispatch(authActions.logout());
  };

  return (
    <header>
      {isAuth && (
        <nav>
          <button onClick={logoutHandler}>Logout</button>
        </nav>
      )}
    </header>
  );
};
```

Clicking Logout dispatches the action, which sets `isAuthenticated` to `false`, which re-renders the app to show the login form again. The cycle is clean: **dispatch → state change → re-render**.

---

## The Pattern

Every component that interacts with Redux follows the same two-step rhythm:

1. **Read state** → `useSelector(state => state.sliceKey.property)`
2. **Dispatch actions** → `useDispatch()` + `sliceActions.methodName()`

Import what you need, hook into the store, and React re-renders automatically when state changes. That's the entire integration pattern.

---

## ✅ Key Takeaways

- `useSelector` subscribes to Redux — your component re-renders when selected state changes
- `useDispatch` gives you the dispatch function — pair it with exported action creators
- Each component imports only the actions and state it cares about
- Redux + React integration is the same pattern regardless of how many slices you have

## ⚠️ Common Mistakes

- Forgetting `event.preventDefault()` on form submissions — otherwise the page reloads
- Importing actions from the wrong file after splitting slices into separate files
- Not calling the action creator — `dispatch(authActions.login)` won't work

## 💡 Pro Tips

- You can use multiple `useSelector` calls in one component to read from different slices
- `useSelector` does a reference equality check — if the selected value hasn't changed, the component won't re-render
- Keep dispatch handlers close to the UI element that triggers them for readability
