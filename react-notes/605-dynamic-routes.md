# Dynamic Routes

## Introduction

So far, all our routes have had **fixed paths** — `/`, `/create-post`. But what if you want to view the details of a specific post? Each post has a unique ID, and you can't pre-define a route for every possible ID. This is where **dynamic routes** come in. They use placeholders in the path that match any value, allowing you to create routes like `/posts/abc123` where `abc123` is the post's ID.

---

## Concept 1: What Are Dynamic Routes?

### 🧠 What is it?

A dynamic route is a route definition that includes a **placeholder segment** in its path, denoted by a colon (`:`). This placeholder matches any value in the URL, making the route flexible.

### ❓ Why do we need them?

Think about a blog, an e-commerce site, or a social media app. You can't create a separate route for every product, every user, every post. You need one route definition that handles all of them — `/posts/1`, `/posts/2`, `/posts/abc123` — using a single pattern.

### ⚙️ How it works

```jsx
{ path: '/:id', element: <PostDetails /> }
```

- `:id` is a **dynamic segment** — it matches any value
- `/abc123` matches ✅ → `id = 'abc123'`
- `/42` matches ✅ → `id = '42'`
- The name after the colon (`:id`) is your choice — use whatever makes sense

### 💡 Insight

Dynamic segments work just like variables. The colon says "this part of the URL is a placeholder," and React Router captures whatever value appears there so you can use it later.

---

## Concept 2: Accessing Dynamic Parameters in Loaders

### 🧠 What is it?

When a dynamic route's loader is called, React Router passes an object containing a `params` property. This `params` object holds the actual values that matched the dynamic segments.

### ⚙️ How it works

```jsx
// Route definition
{ path: '/:id', element: <PostDetails />, loader: postDetailsLoader }

// Loader function
export async function loader({ params }) {
  const postId = params.id; // 'id' matches the ':id' in the path

  const response = await fetch(`http://localhost:8080/posts/${postId}`);
  const resData = await response.json();
  return resData.post;
}
```

The key in `params` matches the name you used after the colon in the path:
- Path: `/:id` → `params.id`
- Path: `/:postId` → `params.postId`
- Path: `/:slug` → `params.slug`

### 💡 Insight

The `params` object is also available in **action** functions — same destructuring pattern: `{ request, params }`. This means both data loading and data submission can use dynamic path values.

---

## Concept 3: Setting Up the PostDetails Route

### 🧠 What is it?

To view a specific post's details, we need:
1. A dynamic route definition
2. A `PostDetails` component
3. A loader to fetch the specific post
4. A link from each post to its detail page

### ⚙️ How it works

**Route configuration:**
```jsx
{
  path: '/',
  element: <Posts />,
  loader: postsLoader,
  children: [
    { path: '/create-post', element: <NewPost />, action: newPostAction },
    { path: '/:id', element: <PostDetails />, loader: postDetailsLoader },
  ],
}
```

**PostDetails component:**
```jsx
import { useLoaderData } from 'react-router-dom';
import Modal from '../components/Modal';

function PostDetails() {
  const post = useLoaderData();

  if (!post) {
    return <Modal><p>Could not find this post.</p></Modal>;
  }

  return (
    <Modal>
      <h2>{post.author}</h2>
      <p>{post.body}</p>
    </Modal>
  );
}
```

**Loader:**
```jsx
export async function loader({ params }) {
  const response = await fetch(`http://localhost:8080/posts/${params.id}`);
  const resData = await response.json();
  return resData.post;
}
```

### 💡 Insight

The `PostDetails` route is nested inside `Posts` (as a child), so it renders as a modal overlay on top of the posts list — the same pattern we used for `NewPost`.

---

## Concept 4: Linking to Dynamic Routes

### 🧠 What is it?

Each post in the list needs a clickable link that navigates to its detail page. The `Link` component's `to` prop can accept dynamic values.

### ⚙️ How it works

```jsx
import { Link } from 'react-router-dom';

function Post({ id, author, body }) {
  return (
    <Link to={id}>
      <h2>{author}</h2>
      <p>{body}</p>
    </Link>
  );
}
```

Since `to={id}` is a relative path, it appends the post's ID to the current route path. If the current path is `/`, clicking a post with ID `abc123` navigates to `/abc123`.

### 🧪 Example

```jsx
// In PostsList
function PostsList() {
  const posts = useLoaderData();

  return (
    <ul>
      {posts.map((post) => (
        <Post key={post.id} id={post.id} author={post.author} body={post.body} />
      ))}
    </ul>
  );
}
```

### 💡 Insight

Using `post.id` as the `key` prop is better than using `post.body` — IDs are guaranteed to be unique, while body text might not be.

---

## Concept 5: The Full Dynamic Route Flow

### 🧠 What is it?

Here's the complete flow when a user clicks a post:

1. User clicks `<Link to="abc123">` on a post
2. React Router updates the URL to `/abc123`
3. The `/:id` route matches with `params.id = 'abc123'`
4. The `postDetailsLoader` runs, fetching `http://localhost:8080/posts/abc123`
5. The backend returns the post data
6. `PostDetails` renders with the data from `useLoaderData()`
7. The post appears in a modal overlay on top of the posts list

Clicking the backdrop closes the modal (using `useNavigate('..')`) and returns to the posts list.

---

## ✅ Key Takeaways

- Use `:paramName` in route paths to create **dynamic segments** that match any value
- Access dynamic values in loaders/actions via `params.paramName`
- The param name in `params` matches the name after `:` in the route path
- Use `Link` with dynamic `to` values to navigate to specific items
- Dynamic routes are essential for detail pages, user profiles, product pages, etc.

## ⚠️ Common Mistakes

- Mismatching the param name — using `:id` in the path but `params.postId` in the loader
- Forgetting to pass the `id` prop to child components for building the link
- Not handling the case where the fetched data is `null`/`undefined` (post not found)

## 💡 Pro Tips

- You can have multiple dynamic segments: `/:category/:id`
- Dynamic routes can be nested to create complex hierarchies
- Use relative paths in `Link` to avoid hardcoding the full URL structure
- Always handle the "not found" case in your component — the ID in the URL might not exist in the database
