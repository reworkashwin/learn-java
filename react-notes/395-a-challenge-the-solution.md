# A Challenge! The Solution

## Introduction

Let's walk through the complete solution for the event details challenge — fetching event data with `useQuery`, displaying it properly, and wiring up the delete button with `useMutation`.

---

## Part 1: Fetching Event Details

### Setting Up useQuery

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '../util/http.js';
import { useParams } from 'react-router-dom';

function EventDetails() {
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ['events', params.id],
  });
}
```

### Key Decisions Explained

**Why wrap `fetchEvent` in an anonymous function?**
Because `fetchEvent` needs both `signal` (from React Query) and `id` (from our route params). The anonymous function lets us combine both.

**Why include `params.id` in the queryKey?**
Each event has different data. If you use just `['events']` for all event detail queries, React Query would cache and reuse the same data for every event — clearly wrong. The ID makes each query unique.

### Rendering Conditional Content

```jsx
let content;

if (isPending) {
  content = <p>Fetching event data...</p>;
}

if (isError) {
  content = (
    <ErrorBlock
      title="Failed to load event"
      message={error.info?.message || 'Failed to fetch event data, please try again later.'}
    />
  );
}

if (data) {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  content = (
    <>
      <header>
        <h1>{data.title}</h1>
      </header>
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
        <p>{data.location}</p>
        <p><time>{formattedDate} at {data.time}</time></p>
        <p>{data.description}</p>
      </div>
    </>
  );
}
```

---

## Part 2: Making Delete Work

### Setting Up useMutation

```jsx
import { useMutation } from '@tanstack/react-query';
import { deleteEvent, queryClient } from '../util/http.js';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const { mutate } = useMutation({
  mutationFn: deleteEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    navigate('/events');
  },
});

function handleDelete() {
  mutate({ id: params.id });
}
```

### Connecting to UI

```jsx
<button onClick={handleDelete}>Delete</button>
```

When clicked:
1. `mutate` sends the DELETE request
2. On success, all event queries are invalidated (data is stale)
3. User is navigated back to the events list
4. The events list automatically refetches because its queries were invalidated

---

## ✅ Key Takeaways

- Always include dynamic identifiers (like IDs) in your `queryKey` — it ensures separate caching per entity
- Use the content variable pattern for clean conditional rendering (loading → error → data)
- `onSuccess` is the right place for post-mutation side effects (navigation + invalidation)
- `toLocaleDateString()` is a handy browser API for formatting dates without external libraries

## ⚠️ Common Mistakes

- Forgetting to pass `signal` from React Query to your fetch function — this enables automatic request cancellation
- Using the same queryKey for all events — you'll get cached data from the wrong event
- Not invalidating queries after deletion — the deleted event will still appear in lists

## 💡 Pro Tip

Destructuring aliases are your friend when you have name collisions. If you use both `useQuery` and `useMutation` in one component, you'll have two `isPending` values. Use aliasing: `{ isPending: isPendingDeletion }`.
