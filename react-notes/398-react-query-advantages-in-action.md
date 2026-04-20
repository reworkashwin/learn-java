# React Query Advantages In Action

## Introduction

We've been building features, but this lecture showcases one of React Query's most powerful advantages — **automatic caching and data reuse** across components. When you navigate between pages that query the same data, React Query doesn't re-fetch unnecessarily. It reuses cached data instantly, producing a silky-smooth user experience.

---

## The Edit Event Feature

### Setting Up the Query

The `EditEvent` component needs to pre-populate a form with the current event data. This requires fetching the event details — the same data we already fetched on the details page:

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '../util/http.js';
import { useParams } from 'react-router-dom';

function EditEvent() {
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    queryKey: ['events', params.id],
  });

  // ... conditional content rendering
}
```

Pass the fetched `data` to the form component:

```jsx
{data && <EventForm inputData={data} />}
```

### Handling Loading and Error States

Same pattern as before — use a `content` variable:

```jsx
let content;

if (isPending) {
  content = (
    <div className="center">
      <LoadingIndicator />
    </div>
  );
}

if (isError) {
  content = (
    <>
      <ErrorBlock
        title="Failed to load event"
        message={error.info?.message || 'Please check your inputs and try again later.'}
      />
      <div className="form-actions">
        <Link to="../" className="button">Okay</Link>
      </div>
    </>
  );
}

if (data) {
  content = <EventForm inputData={data} />;
}
```

---

## The Caching Magic

### 🧠 Why Does the Edit Page Load Instantly?

Here's where it gets interesting. If you navigate to the event details page first, then click "Edit":

- The **details page** fetches the event with query key `['events', 'abc123']`
- The **edit page** uses the *exact same query key*: `['events', 'abc123']`

React Query recognizes the match and **serves the cached data immediately**. No loading spinner, no network request. The form appears pre-populated in an instant.

But if you reload the edit page directly (bypassing the details page), you'll see the loading spinner because there's no cached data yet.

### Why This Matters

Without React Query, you'd need to:
- Lift state up to a parent
- Use context
- Or make a redundant fetch

With React Query, data sharing between components is **automatic** — as long as they use the same query key.

---

## ✅ Key Takeaways

- Components with the same `queryKey` **share cached data** automatically
- This creates instant navigation experiences without extra state management
- React Query still refetches behind the scenes to ensure freshness
- The `inputData` prop pattern is great for pre-populating forms with fetched data

## ⚠️ Common Mistakes

- Using different query keys for the same data in different components — you lose caching benefits
- Assuming cached data means "no request ever" — React Query still refetches in the background (unless you configure `staleTime`)

## 💡 Pro Tip

Design your query keys like a data hierarchy: `['events']` for all events, `['events', id]` for a specific event. This makes invalidation intuitive and caching automatic across components that operate on the same data.
