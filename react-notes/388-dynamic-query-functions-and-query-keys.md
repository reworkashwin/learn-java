# Dynamic Query Functions & Query Keys

## Introduction

So far, we've used `useQuery` with a static query — always fetching the same data. But real apps need **dynamic queries**: search functionality, filtered lists, data that depends on user input. This is where query keys and dynamic query functions really shine.

---

## The Scenario: Building a Search Feature

We have a search bar where users enter a term and see matching events. This means:
1. The HTTP request needs to include the search term
2. Different search terms should produce different cached results
3. The query should re-run when the search term changes

---

## Making the Fetch Function Dynamic

First, update your fetch function to accept a search term:

```js
// util/http.js
export async function fetchEvents({ signal, searchTerm }) {
  let url = 'http://localhost:3000/events';
  
  if (searchTerm) {
    url += '?search=' + searchTerm;
  }

  const response = await fetch(url, { signal });
  
  if (!response.ok) {
    const error = new Error('An error occurred');
    error.info = await response.json();
    throw error;
  }
  
  const { events } = await response.json();
  return events;
}
```

The function now dynamically builds the URL based on whether a search term is provided.

---

## Dynamic Query Keys

Here's the critical part. If you use the same query key for all search queries, TanStack Query will reuse cached results from a different search — showing wrong data.

```jsx
// ❌ BAD — same key for all searches
queryKey: ['events']

// ✅ GOOD — key includes the search term
queryKey: ['events', { search: searchTerm }]
```

When the query key includes the search term:
- Searching "city" caches results under `['events', { search: 'city' }]`
- Searching "tech" caches results under `['events', { search: 'tech' }]`
- Each has its own cache, its own data, and works independently

### Query Key Rules

- Query keys are **arrays** that can contain strings, numbers, objects, or nested arrays
- Two queries with the **same key** share the same cache
- Two queries with **different keys** are completely independent
- Include any variable that affects the request in the key

---

## Using State (Not Refs) for Dynamic Queries

Why use state instead of a ref for the search term? Because **refs don't trigger re-renders**. When a ref value changes, `useQuery` doesn't know about it and won't send a new request.

```jsx
function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    staleTime: 5000,
  });
  
  // render logic...
}
```

The flow:
1. User types a search term and submits
2. `setSearchTerm` updates the state
3. Component re-renders
4. `useQuery` sees a new `queryKey` (because `searchTerm` changed)
5. A new request is sent with the updated search term

---

## Passing Custom Data to Query Functions

Notice how we pass `searchTerm` to `fetchEvents`:

```jsx
queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
```

We wrap `fetchEvents` in an anonymous function so we can:
- Receive the `signal` that TanStack Query provides
- Pass our own `searchTerm` alongside it
- Forward both to `fetchEvents`

---

## ⚠️ Common Mistakes

- Using the same query key for different queries (causes wrong cached data to appear)
- Using refs instead of state for values that should trigger new queries
- Forgetting to include dynamic values in the query key

## 💡 Pro Tip

**Rule of thumb**: If a value affects what data the request returns, it belongs in the query key. The query key should be a "fingerprint" of the exact data you're requesting.

## ✅ Key Takeaways

- Include dynamic values (search terms, IDs, filters) in the query key
- Different query keys = different caches = independent queries
- Use **state** (not refs) for values that should trigger new queries on change
- Wrap `queryFn` in an anonymous function to pass both TanStack Query's `signal` and your own parameters
