# Adding a Shared Header & More State Management

## Introduction

We can close the modal now — great. But how do we open it again? We need a button somewhere to trigger the modal. This means adding a **header component** with a "New Post" button, and managing the modal visibility state at an even higher level so that *both* the header and the posts list can interact with it. This section is all about restructuring state across components and understanding how data and functions flow through the component tree.

---

## Concept 1: Installing Third-Party Packages

### 🧠 What is it?

React projects can use third-party libraries from npm. The `react-icons` library provides a collection of popular icon sets as React components.

### ❓ Why do we need it?

Our header needs icons for the button. Instead of creating SVGs from scratch, we use a library that provides them as ready-to-use React components.

### ⚙️ How it works

```bash
# Stop the dev server first (Ctrl+C)
npm install react-icons

# Then restart the dev server
npm run dev
```

Then in your component:
```jsx
import { MdPostAdd, MdMessage } from 'react-icons/md';
```

### 💡 Insight

Always stop your development server before installing new packages, then restart it. This ensures the new dependencies are properly recognized.

---

## Concept 2: Lifting State Up — Further

### 🧠 What is it?

When state is needed by components at different levels or branches of the component tree, it must be lifted to their **common ancestor**. In our case, the modal visibility state moves from `PostsList` up to `App`.

### ❓ Why do we need it?

The "New Post" button is in `MainHeader`, and the modal is rendered by `PostsList`. Both need access to `modalIsVisible` state. Their common ancestor is the `App` component.

### ⚙️ How it works

```
App                    ← state lives HERE
├── MainHeader         ← button to OPEN modal (needs showModalHandler)
└── main
    └── PostsList      ← modal to CLOSE (needs hideModalHandler + state value)
```

**In `App.jsx`:**
```jsx
import { useState } from 'react';

function App() {
  const [modalIsVisible, setModalIsVisible] = useState(false);

  function showModalHandler() {
    setModalIsVisible(true);
  }

  function hideModalHandler() {
    setModalIsVisible(false);
  }

  return (
    <>
      <MainHeader onCreatePost={showModalHandler} />
      <main>
        <PostsList
          isPosting={modalIsVisible}
          onStopPosting={hideModalHandler}
        />
      </main>
    </>
  );
}
```

### 💡 Insight

The default value is now `false` — the modal starts hidden. The user must click the button to show it. This is the more natural UX flow.

---

## Concept 3: Passing State and Functions Through Multiple Levels

### 🧠 What is it?

Sometimes, a function or value needs to travel through multiple component levels to reach its destination. This is called **prop drilling** — passing props down through intermediate components.

### ❓ Why do we need it?

The `hideModalHandler` is defined in `App`, but it's needed in `Modal` (which is rendered inside `PostsList`). It has to travel: `App` → `PostsList` → `Modal`.

### ⚙️ How it works

**App → PostsList:** Pass `hideModalHandler` as `onStopPosting`
```jsx
<PostsList onStopPosting={hideModalHandler} />
```

**PostsList → Modal:** Forward `onStopPosting` to `Modal`'s `onClose`
```jsx
function PostsList({ isPosting, onStopPosting }) {
  return (
    <>
      {isPosting && (
        <Modal onClose={onStopPosting}>
          <NewPost />
        </Modal>
      )}
    </>
  );
}
```

**MainHeader:** The button receives `onCreatePost` and wires it to `onClick`
```jsx
function MainHeader({ onCreatePost }) {
  return (
    <header>
      <button onClick={onCreatePost}>
        <MdPostAdd /> New Post
      </button>
    </header>
  );
}
```

### 💡 Insight

Each component in the chain doesn't need to "know" what the function does — it just passes it along. The function is defined where the state lives (`App`) and used where the event occurs (`MainHeader` or `Modal`).

---

## Concept 4: Prop Naming Conventions for Functions

### 🧠 What is it?

It's a common convention to name props that receive functions with an `on` prefix — like `onCreatePost`, `onStopPosting`, `onClose`.

### ❓ Why do we need it?

This convention makes it immediately clear that a prop expects a function value, typically one that will be linked to an event listener deeper in the component tree.

### ⚙️ How it works

```jsx
// Convention: "on" prefix for function props
<MainHeader onCreatePost={showModalHandler} />
<PostsList onStopPosting={hideModalHandler} />
<Modal onClose={onStopPosting} />

// Also valid (but less conventional):
<MainHeader createPost={showModalHandler} />
```

### 💡 Insight

This is purely a convention — React doesn't enforce it. But it's widely adopted in the React community and makes your code easier to understand at a glance.

---

## ✅ Key Takeaways

- Lift state to the nearest common ancestor of all components that need it
- Pass state values down as props for display, and functions as props for updates
- Props can travel through multiple component levels (prop drilling)
- Default state to `false` for things that should start hidden
- Use the `on` prefix convention for props that receive event handler functions
- Third-party packages are installed via `npm install` and imported as regular modules

## ⚠️ Common Mistakes

- Keeping state too low in the tree — if multiple components need it, lift it up
- Forgetting to pass handler functions without parentheses: `onCreatePost={showModalHandler}` not `onCreatePost={showModalHandler()}`
- Mismatching prop names between parent and child — double-check that the name you set matches the name you destructure

## 💡 Pro Tips

- When prop drilling becomes excessive (5+ levels deep), consider React Context API as an alternative
- Keep your `App` component lean — if too much state accumulates there, it may be time to use context or state management
- Naming your handler functions consistently (`showModalHandler`, `hideModalHandler`) makes the code self-documenting
