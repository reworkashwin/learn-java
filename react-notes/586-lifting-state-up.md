# Lifting State Up

## Introduction

Here's a puzzle you'll face constantly in React: the state is managed in Component A, but it's *needed* in Component B. Or the event happens in one component, but the state should live in another. How do you connect them? The answer is a fundamental React pattern called **lifting state up** — moving state to a common ancestor component that has access to both components that need it.

This is one of those patterns that feels confusing at first but becomes second nature once you understand the flow.

---

## Concept 1: The Problem — State and Events in Different Components

### 🧠 What is it?

When the state that needs to be displayed is in one component, but the event that changes that state happens in a *different* component, you have a data flow mismatch.

### ❓ Why do we need it?

In our app, we want the text entered in `NewPost` (where the event occurs) to appear in the `Post` component (where the data is displayed). But these are separate components — they can't directly share variables.

### ⚙️ How it works

Consider this structure:
```
PostsList
├── NewPost      ← event happens here (user types)
└── Post         ← data is needed here (display post)
```

If state is in `NewPost`, the `Post` component can't access it. If state is in `PostsList`, the event in `NewPost` can't update it — at least not without some wiring.

### 💡 Insight

Think of it like two people in different rooms needing to share information. They can't talk directly, but they *can* both communicate with someone in the hallway — the parent component.

---

## Concept 2: Lifting State Up

### 🧠 What is it?

**Lifting state up** means moving state to the nearest common ancestor component that has access to all components that need the state — either to read it or to update it.

### ❓ Why do we need it?

React's data flow is **one-directional** — from parent to child via props. Sibling components can't communicate directly. The only way to share data between siblings is through their common parent.

### ⚙️ How it works

1. **Move** the state (`useState`) to the parent component (`PostsList`)
2. **Pass the state value** down to the component that needs to display it (`Post`) via props
3. **Pass the state updating function** down to the component where the event occurs (`NewPost`) via props

```jsx
// PostsList.jsx
import { useState } from 'react';

function PostsList() {
  const [enteredBody, setEnteredBody] = useState('');
  const [enteredAuthor, setEnteredAuthor] = useState('');

  function bodyChangeHandler(event) {
    setEnteredBody(event.target.value);
  }

  function authorChangeHandler(event) {
    setEnteredAuthor(event.target.value);
  }

  return (
    <>
      <NewPost
        onBodyChange={bodyChangeHandler}
        onAuthorChange={authorChangeHandler}
      />
      <ul>
        <Post author={enteredAuthor} body={enteredBody} />
      </ul>
    </>
  );
}
```

### 💡 Insight

The parent component becomes the "single source of truth." It owns the state, passes the current value down for display, and passes functions down for updates. This keeps everything synchronized.

---

## Concept 3: Passing Functions as Props

### 🧠 What is it?

Just like you can pass strings or numbers as props, you can pass **functions** as props. This is how child components communicate *upward* — by calling a function that was passed down from the parent.

### ❓ Why do we need it?

Data flows down through props, but events happen in child components. By passing a function down, the child can call it to "send" information back up to the parent.

### ⚙️ How it works

**In the parent (PostsList):**
```jsx
<NewPost onBodyChange={bodyChangeHandler} />
```

**In the child (NewPost):**
```jsx
function NewPost({ onBodyChange }) {
  return (
    <textarea onChange={onBodyChange} />
  );
}
```

The `bodyChangeHandler` function is passed to `NewPost` via the `onBodyChange` prop. Inside `NewPost`, it's forwarded to the `onChange` event listener on the textarea. When the user types, the function executes — but it's the parent's function, so it updates the parent's state.

### 🧪 Example

Here's the full data flow:
1. User types in the textarea inside `NewPost`
2. The `onChange` event fires on the textarea
3. This triggers `onBodyChange`, which is actually `bodyChangeHandler` from `PostsList`
4. `bodyChangeHandler` calls `setEnteredBody(event.target.value)`
5. State updates in `PostsList`, the component re-renders
6. The updated `enteredBody` value is passed to `Post` as a prop
7. The post on screen shows the new text

### 💡 Insight

Remember: functions in JavaScript are first-class citizens — they're values just like strings or numbers. You can pass them as props, store them in variables, and call them later. This is what makes the entire "lifting state up" pattern possible.

---

## Concept 4: Multiple State Slices

### 🧠 What is it?

A component can have **multiple independent state values** by calling `useState` multiple times. Each call manages a separate piece of state.

### ❓ Why do we need it?

In our form, we're tracking two things: the body text and the author name. Each needs its own state.

### ⚙️ How it works

```jsx
const [enteredBody, setEnteredBody] = useState('');
const [enteredAuthor, setEnteredAuthor] = useState('');
```

- Updating `enteredBody` does not affect `enteredAuthor` and vice versa
- Both state updates trigger a re-render of the component
- When the component re-renders, **all child components** re-render too (with updated props)

### 💡 Insight

When a parent re-renders, every child component function is also re-executed. This means any props with updated state values are automatically reflected in the child components' JSX. The UI stays in sync without any manual DOM manipulation.

---

## ✅ Key Takeaways

- **Lift state up** to the nearest common ancestor when sibling components need to share state
- Pass the **state value** down to components that *display* it
- Pass the **state updating function** down to components where *events* occur
- Functions are values in JavaScript — they can be passed as props just like strings or numbers
- You can have multiple `useState` calls in a single component for independent state slices
- When state updates in a parent, all child components re-render with the latest values

## ⚠️ Common Mistakes

- Trying to share state between sibling components without lifting it up
- Forgetting that data in React flows **one-way** — parent to child via props
- Adding parentheses when passing functions as props: `onBodyChange={handler}` not `onBodyChange={handler()}`
- Assuming a state update in one component automatically affects another — it doesn't unless they're connected via props

## 💡 Pro Tips

- If you find yourself passing state through many levels of components, consider React Context or a state management library — but start with lifting state up
- Name function props with an `on` prefix (like `onBodyChange`) to signal they expect a function value
- Object destructuring in component parameters (`{ onBodyChange }` instead of `props.onBodyChange`) makes your code cleaner and more readable
