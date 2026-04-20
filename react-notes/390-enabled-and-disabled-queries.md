# Enabled & Disabled Queries

## Introduction

Sometimes you don't want a query to fire immediately. Maybe you're waiting for user input. Maybe a prerequisite hasn't been met yet. TanStack Query's `enabled` option gives you precise control over **when** a query should run.

---

## The Problem: Unwanted Initial Requests

Consider our search feature. When the page first loads with an empty search field, `useQuery` fires immediately and fetches **all events** — even though the user hasn't searched for anything yet. We might not want that.

We'd prefer:
- **Initially**: Show a message like "Please enter a search term"
- **After searching**: Show results
- **After clearing the input**: Show all events (the user deliberately cleared it)

The distinction is between "never searched" and "searched with empty string."

---

## The `enabled` Option

Add `enabled` to your query configuration to control whether the query runs:

```jsx
useQuery({
  queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
  queryKey: ['events', { search: searchTerm }],
  enabled: searchTerm !== undefined,
});
```

| `enabled` Value | Behavior |
|-----------------|----------|
| `true` (default) | Query runs normally |
| `false` | Query does **not** run — no request is sent |

### The `undefined` Trick

To distinguish between "never searched" and "searched with empty string":

```jsx
const [searchTerm, setSearchTerm] = useState();  // Initially undefined
```

- `undefined` → `enabled: false` → No request, no results
- `''` (empty string, after clearing) → `enabled: true` → Fetches all events
- `'city'` → `enabled: true` → Fetches matching events

```jsx
function handleSubmit(event) {
  event.preventDefault();
  setSearchTerm(searchElement.current.value); // Could be '' or 'some text'
}
```

---

## `isPending` vs `isLoading`

When a query is **disabled**, TanStack Query considers it "pending" — because it's waiting for the query to be enabled before it can produce data.

This means `isPending` is `true` even when the query is just disabled. **You get a loading spinner when you don't want one.**

The solution? Use `isLoading` instead:

```jsx
// ❌ Shows spinner when query is disabled
if (isPending) return <LoadingIndicator />;

// ✅ Only shows spinner during actual data fetching
if (isLoading) return <LoadingIndicator />;
```

| Property | True when... |
|----------|-------------|
| `isPending` | No data yet AND (fetching OR disabled) |
| `isLoading` | No data yet AND actually fetching |

The difference: `isLoading` is **not** true when the query is just disabled. It's only true when a real request is in flight.

---

## Complete Example

```jsx
function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState(); // undefined initially

  const { data, isLoading, isError, error } = useQuery({
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    queryKey: ['events', { search: searchTerm }],
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term.</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = <ErrorBlock message={error.info?.message || 'Failed to fetch events.'} />;
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input ref={searchElement} type="search" />
        <button>Search</button>
      </form>
      {content}
    </section>
  );
}
```

---

## ⚠️ Common Mistakes

- Using `isPending` instead of `isLoading` with disabled queries — shows unwanted loading spinners
- Using `enabled: false` permanently and wondering why no data appears
- Not understanding the difference between `undefined` and `''` in state

## 💡 Pro Tip

The `undefined` vs empty string pattern is powerful. Initialize state with `useState()` (no argument = `undefined`) when you need to distinguish between "not yet interacted" and "deliberately empty."

## ✅ Key Takeaways

- Use `enabled` to conditionally run queries — `false` prevents the request
- Initialize state as `undefined` to distinguish "no input yet" from "empty input"
- Use `isLoading` (not `isPending`) when queries might be disabled — `isLoading` ignores disabled state
- `isPending` = waiting for data (fetching OR disabled); `isLoading` = actively fetching
- This pattern is perfect for search, dependent queries, and conditional data fetching
