# Updating State Based on Previous State

## Introduction

When the form is submitted, we need to add the new post to our list of posts. Simple, right? Just update the array. But here's the catch: if your new state **depends on the previous state**, there's a specific way you *must* do it in React. Get it wrong, and you'll run into subtle bugs with stale state. This section covers the correct pattern for state updates that depend on previous values.

---

## Concept 1: Managing a List with State

### 🧠 What is it?

Instead of hard-coded post data, we manage posts as a **state array**. Starting empty, it grows as users submit new posts through the form.

### ❓ Why do we need it?

Our app needs to dynamically add posts. An array in state lets us add, remove, or modify posts and have React automatically re-render the UI.

### ⚙️ How it works

```jsx
import { useState } from 'react';

function PostsList({ isPosting, onStopPosting }) {
  const [posts, setPosts] = useState([]);

  function addPostHandler(postData) {
    setPosts((existingPosts) => [postData, ...existingPosts]);
  }

  return (
    <>
      {isPosting && (
        <Modal onClose={onStopPosting}>
          <NewPost onAddPost={addPostHandler} onCancel={onStopPosting} />
        </Modal>
      )}
      {/* render posts... */}
    </>
  );
}
```

### 💡 Insight

`useState([])` initializes with an empty array — no posts at first. The array grows each time `addPostHandler` is called.

---

## Concept 2: The Wrong Way — Direct State Reference

### 🧠 What is it?

A common first instinct is to reference the current state variable directly when creating the new state. While this might work in simple cases, it can lead to bugs.

### ❓ Why do we need it?

Understanding why the direct approach is flawed helps you appreciate the correct pattern.

### ⚙️ How it works

```jsx
// ⚠️ Works, but NOT recommended
function addPostHandler(postData) {
  setPosts([postData, ...posts]); // directly referencing 'posts'
}
```

This spreads the current `posts` array and adds the new `postData` at the beginning. It seems fine, but...

### 💡 Insight

React doesn't execute state updates immediately — it **schedules** them. If you have multiple state updates in quick succession, `posts` might be stale (pointing to an older snapshot). The next approach solves this.

---

## Concept 3: The Right Way — Function Form of State Updates

### 🧠 What is it?

When your new state depends on the previous state, pass a **function** to the state updater instead of a value. React guarantees this function receives the **latest** state snapshot.

### ❓ Why do we need it?

React batches and schedules state updates for performance. If you reference the state variable directly, you might be working with an outdated value. The function form guarantees correctness.

### ⚙️ How it works

```jsx
// ✅ Correct approach
function addPostHandler(postData) {
  setPosts((existingPosts) => [postData, ...existingPosts]);
}
```

Here's what happens:
1. You call `setPosts` with a function
2. React calls that function, passing the **latest** state as `existingPosts`
3. You return the new state: a new array with `postData` first, then all existing posts
4. React stores this as the new state and re-renders

### 🧪 Example

```jsx
// If posts = [{body: "Hello"}] and we add {body: "World"}:
setPosts((existingPosts) => [
  { body: "World" },           // new post first
  ...existingPosts             // spread existing: [{body: "Hello"}]
]);
// Result: [{body: "World"}, {body: "Hello"}]
```

### 💡 Insight

The spread operator (`...existingPosts`) creates a **new array** with all previous items. This is important because React uses reference equality to detect changes. Mutating the existing array wouldn't trigger a re-render.

---

## Concept 4: The Golden Rule

### 🧠 What is it?

**If your new state depends on the old state, use the function form.** This applies to arrays, objects, numbers, booleans — any state type.

### ❓ Why do we need it?

This rule prevents an entire class of bugs related to stale state. It's especially critical when multiple state updates might happen in rapid succession (e.g., multiple clicks, rapid form submissions).

### ⚙️ How it works

```jsx
// ✅ Array: adding an item
setPosts((prev) => [newPost, ...prev]);

// ✅ Number: incrementing
setCount((prev) => prev + 1);

// ✅ Boolean: toggling
setIsOpen((prev) => !prev);

// ✅ Object: updating a field
setUser((prev) => ({ ...prev, name: 'New Name' }));
```

All these follow the same pattern: pass a function, receive the previous state, return the new state.

### 💡 Insight

Think of it as a contract with React: "I don't know what the current state is at this exact moment, but *you* do. Give me the latest value, and I'll tell you what the new value should be."

---

## Concept 5: Wiring Up the Submit Flow

### 🧠 What is it?

The complete flow from form submission to list update involves passing the `addPostHandler` function down to `NewPost` via props.

### ❓ Why do we need it?

The form is in `NewPost`, but the posts state is in `PostsList`. We bridge the gap with the `onAddPost` prop.

### ⚙️ How it works

**PostsList → NewPost:**
```jsx
<NewPost onAddPost={addPostHandler} onCancel={onStopPosting} />
```

**NewPost → submitHandler:**
```jsx
function submitHandler(event) {
  event.preventDefault();
  const postData = { body: enteredBody, author: enteredAuthor };
  onAddPost(postData);  // calls addPostHandler in PostsList
  onCancel();           // closes the modal
}
```

The data flows: `NewPost` → `PostsList.addPostHandler` → `setPosts` → React re-renders → new post appears on screen.

### 💡 Insight

Notice how `onAddPost` and `onCancel` are called sequentially. Both trigger state updates, but React batches them intelligently — you'll only see one re-render, not two.

---

## ✅ Key Takeaways

- When new state depends on previous state, **always** use the function form: `setState((prev) => newValue)`
- React schedules state updates — it doesn't execute them immediately
- The function form guarantees you get the latest state snapshot
- Use the spread operator to create new arrays/objects (never mutate state directly)
- This rule applies to all state types: arrays, objects, numbers, booleans

## ⚠️ Common Mistakes

- Using `setPosts([newPost, ...posts])` instead of `setPosts((prev) => [newPost, ...prev])` — works sometimes, fails with rapid updates
- Mutating the existing array (`posts.push(newPost)`) instead of creating a new one — React won't detect the change
- Forgetting that state updates are scheduled, not immediate

## 💡 Pro Tips

- Make the function form your default habit — even when the simpler form would technically work, the function form is always safe
- Use descriptive parameter names in the updater function: `existingPosts`, `prevCount`, `currentUser`
- Remember: new arrays/objects are needed because React compares by reference, not by value
