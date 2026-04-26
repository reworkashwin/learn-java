# Testing Asynchronous Code

## Introduction

Many React components don't just render static content — they fetch data from APIs, wait for responses, and then update the UI. Testing these asynchronous components introduces a new challenge: **the data isn't there immediately**. When you render a component that fetches data, the initial render is empty. The data appears only after the API responds. So how do you test something that isn't there yet? That's what this section is about.

---

### Concept 1: The Async Component

#### 🧠 What is it?

An async component uses `useEffect` to fetch data from an API when it mounts, stores the data in state, and then renders it.

#### ⚙️ How it works

```javascript
import { useState, useEffect } from 'react';

function Async() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((response) => response.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

The render cycle:
1. **First render:** `posts` is an empty array → no `<li>` elements
2. **`useEffect` fires:** HTTP request sent
3. **Response arrives:** `setPosts(data)` triggers re-render
4. **Second render:** `posts` has data → `<li>` elements appear

---

### Concept 2: Why `getBy` Fails for Async Content

#### 🧠 What is it?

`getBy...` queries look for elements **immediately** — right after the first render. For async components, the data isn't there yet on the first render.

#### ⚙️ How it works

```javascript
// ❌ This FAILS!
test('renders posts if request succeeds', () => {
  render(<Async />);
  const listItems = screen.getAllByRole('listitem');
  expect(listItems).not.toHaveLength(0);
});
```

This fails because `getAllByRole('listitem')` runs immediately after the first render, when the posts array is still empty. No list items exist yet.

#### 💡 Insight

This is a common trap when testing async components. The solution isn't to add `setTimeout` or artificial delays — there's a proper tool for this.

---

### Concept 3: Using `findBy` for Async Queries

#### 🧠 What is it?

`findBy...` queries return a **promise** and will repeatedly check the DOM until the element appears (or a timeout is reached). They're designed specifically for async content.

#### ❓ Why do we need it?

Because `findBy` waits for the element to show up, rather than checking only once. It's the right tool for elements that appear after data fetching completes.

#### ⚙️ How it works

```javascript
test('renders posts if request succeeds', async () => {
  render(<Async />);

  const listItems = await screen.findAllByRole('listitem');
  expect(listItems).not.toHaveLength(0);
});
```

Key changes:
1. **`async`** keyword on the test function
2. **`findAllByRole`** instead of `getAllByRole`
3. **`await`** before the query — because it returns a promise

`findAllByRole` will keep checking the screen for up to **1 second** (default timeout). If the elements appear within that time, the test passes.

#### 🧪 Example

You can customize the timeout with a third argument:

```javascript
// Wait up to 3 seconds for elements to appear
const listItems = await screen.findAllByRole('listitem', {}, { timeout: 3000 });
```

#### 💡 Insight

The three query families map to three scenarios:

| Query | When to use |
|-------|-------------|
| `getBy...` | Element is there **immediately** |
| `queryBy...` | Element might **not be there** (returns null) |
| `findBy...` | Element will appear **asynchronously** |

This is one of the most important distinctions in React Testing Library. Get it right, and async testing becomes straightforward.

---

## ✅ Key Takeaways

- Async components render empty first, then populate after data arrives — `getBy` won't find async content
- Use **`findBy...`** / **`findAllBy...`** for elements that appear after async operations
- Mark your test function as **`async`** and **`await`** the `findBy` query
- Default timeout is 1 second — customize with a third argument if needed
- The `getBy` / `queryBy` / `findBy` distinction is fundamental to React Testing Library

## ⚠️ Common Mistakes

- Using `getBy` for async content — it checks immediately and fails before data arrives
- Forgetting to `await` the `findBy` query — you'll get a promise instead of elements
- Forgetting to mark the test function as `async` — `await` won't work without it

## 💡 Pro Tips

- If a test involving async code works locally but fails in CI, try increasing the timeout
- `findBy` automatically retries — don't add manual `setTimeout` or `waitFor` unless necessary
- This test still has an issue: it sends real HTTP requests — we'll fix that with mocks in the next section
