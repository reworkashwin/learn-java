# Submitting Data with Actions

## Introduction

We used **loaders** to fetch data before a route renders. But what about the other direction — **sending data** to the backend? React Router has a feature for that too: **actions**. Actions work hand-in-hand with a special `Form` component that replaces the native `<form>` element. The result? No more manual state management for form inputs, no more `onSubmit` handlers, no more `onChange` listeners. React Router handles everything.

---

## Concept 1: What Are Actions?

### 🧠 What is it?

An **action** is a function assigned to a route that gets executed when a form within that route is submitted. It's the write-side counterpart to loaders (which are the read side).

### ❓ Why do we need actions?

Without actions, submitting a form requires:
- `useState` for every input field
- `onChange` handlers to update state
- An `onSubmit` handler to prevent default behavior and send the request
- Manual navigation after submission

With actions, all of that disappears. React Router collects the form data, calls your action function, and you just process the data and optionally redirect.

### 💡 Insight

Loaders answer "what data does this page need?" Actions answer "what should happen when the user submits data on this page?"

---

## Concept 2: The Form Component (Capital F)

### 🧠 What is it?

React Router provides a `Form` component (with a capital F) that replaces the native HTML `<form>`. It intercepts form submission, prevents the browser default, collects all input data, and triggers the route's action function.

### ⚙️ How it works

```jsx
import { Form } from 'react-router-dom';

function NewPost() {
  return (
    <Form method="post">
      <textarea name="body" />
      <input type="text" name="author" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

Key requirements:
- Use `<Form>` (capital F) instead of `<form>`
- Add `name` attributes to every input — React Router uses these to build the form data object
- Set `method="post"` to indicate this is a data-creation form
- **No `onChange` handlers needed** — React Router reads the values directly from the DOM

### 💡 Insight

The `method="post"` doesn't actually send an HTTP POST request anywhere. It's all client-side. But React Router uses the method semantically — it generates a request object internally and passes it to your action function.

---

## Concept 3: Defining an Action Function

### 🧠 What is it?

An action function is exported from your route component file and assigned to the `action` property in the route definition. React Router calls it when a `Form` inside that route is submitted.

### ⚙️ How it works

```jsx
// routes/NewPost.jsx
import { redirect } from 'react-router-dom';

export async function action({ request }) {
  const formData = await request.formData();
  const postData = Object.fromEntries(formData);

  await fetch('http://localhost:8080/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { 'Content-Type': 'application/json' },
  });

  return redirect('/');
}
```

The action function receives an object with:
- `request` — a Request object containing the form data
- `params` — route parameters (useful for dynamic routes)

### 🧪 Extracting form data step by step

```jsx
// 1. Get the FormData object from the request
const formData = await request.formData();

// 2. Option A: Extract individual fields
const body = formData.get('body');
const author = formData.get('author');

// 2. Option B: Convert to a plain object (easier)
const postData = Object.fromEntries(formData);
// Result: { body: 'Hello', author: 'Max' }
```

### 💡 Insight

`Object.fromEntries(formData)` is a clean one-liner that converts the FormData object into a plain key-value object. The keys come from the `name` attributes on your inputs.

---

## Concept 4: Connecting Actions to Routes

### 🧠 What is it?

Just like loaders, actions are connected to routes via the route definition in your router configuration.

### ⚙️ How it works

```jsx
// main.jsx
import NewPost, { action as newPostAction } from './routes/NewPost';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Posts />,
        loader: postsLoader,
        children: [
          {
            path: '/create-post',
            element: <NewPost />,
            action: newPostAction,
          },
        ],
      },
    ],
  },
]);
```

### 💡 Insight

The action is triggered by the `Form` component inside the route. React Router connects the dots — when a `Form` with `method="post"` is submitted within the `/create-post` route, it calls the `newPostAction` function.

---

## Concept 5: Redirecting After Submission

### 🧠 What is it?

After processing a form submission, you typically want to navigate the user to a different page — back to the posts list, for example. The `redirect` function from `react-router-dom` does this.

### ⚙️ How it works

```jsx
import { redirect } from 'react-router-dom';

export async function action({ request }) {
  // ... process form data and send to backend

  return redirect('/'); // navigate to the home page
}
```

- `redirect('/')` creates a special Response object
- When React Router sees this returned from an action, it navigates to the specified path
- This replaces the need for `useNavigate` inside action functions (you can't use hooks outside components)

### 💡 Insight

`redirect` is the action/loader equivalent of `useNavigate`. Since actions run outside of components, you can't use hooks. `redirect` fills that gap.

---

## Concept 6: The Big Picture — Before vs After

### 🧠 What changed?

**Before actions (manual approach):**
```jsx
function NewPost() {
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');

  function submitHandler(event) {
    event.preventDefault();
    fetch('http://localhost:8080/posts', {
      method: 'POST',
      body: JSON.stringify({ body, author }),
      headers: { 'Content-Type': 'application/json' },
    });
    navigate('/');
  }

  return (
    <form onSubmit={submitHandler}>
      <textarea onChange={(e) => setBody(e.target.value)} />
      <input onChange={(e) => setAuthor(e.target.value)} />
    </form>
  );
}
```

**After actions:**
```jsx
function NewPost() {
  return (
    <Form method="post">
      <textarea name="body" />
      <input name="author" />
      <button>Submit</button>
    </Form>
  );
}
```

No state. No event handlers. No manual fetch. Everything is handled by React Router.

---

## ✅ Key Takeaways

- **Actions** handle form submissions in React Router — the write-side counterpart to loaders
- Use `<Form>` (capital F) from `react-router-dom` instead of `<form>`
- Add `name` attributes to inputs — React Router uses them to build the form data
- Extract data in the action via `request.formData()` and `Object.fromEntries()`
- Use `redirect('/')` to navigate after processing the form
- Components become dramatically simpler — no `useState`, no `onChange`, no `onSubmit`

## ⚠️ Common Mistakes

- Using lowercase `<form>` instead of `<Form>` — the action won't be triggered
- Forgetting `name` attributes on inputs — React Router can't extract the data
- Trying to use `useNavigate` inside an action function — hooks only work in components; use `redirect` instead
- Not `await`-ing `request.formData()` — it returns a Promise

## 💡 Pro Tips

- `Object.fromEntries(formData)` is the cleanest way to convert FormData to a plain object
- Set `method="post"` on `Form` for create operations — it's semantically correct and helps differentiate from other actions
- Actions can also return data (not just redirects) — useful for returning validation errors back to the form
- You can have multiple `Form` components in one route — they all trigger the same action
