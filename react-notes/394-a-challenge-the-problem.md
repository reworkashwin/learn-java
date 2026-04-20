# A Challenge! The Problem

## Introduction

Time to put everything we've learned into practice. This lecture sets up a hands-on challenge that tests your ability to use both `useQuery` and `useMutation` in a real component.

---

## The Challenge

### Part 1: Fetch and Display Event Details

The **EventDetails** component renders when a user clicks "View Details" on any event. Your job:

1. Use **`useQuery`** with the `fetchEvent` function to load the event data
2. The `fetchEvent` function expects an object with `signal` (from React Query) and `id` (the event's ID)
3. Extract the event ID from the URL using React Router's `useParams`
4. Display the event's title, image, location, date, time, and description
5. Construct the image URL by combining your backend domain with the image filename
6. Handle loading and error states properly

### Part 2: Make the Delete Button Work

1. Use **`useMutation`** with the `deleteEvent` function
2. The `deleteEvent` function expects an object with `id`
3. Trigger the mutation when the Delete button is clicked
4. Handle what happens after deletion (navigation, query invalidation)

---

## Key Functions Available

```js
// Fetches a single event by ID
export async function fetchEvent({ signal, id }) { ... }

// Deletes an event by ID
export async function deleteEvent({ id }) { ... }
```

---

## 💡 Pro Tip

Before looking at the solution, try building this yourself. The patterns are the same as what we've already covered:

- `useQuery` for reading → `queryFn`, `queryKey`, handle `data`, `isPending`, `isError`
- `useMutation` for changing → `mutationFn`, get `mutate`, call it on button click
- `onSuccess` for post-mutation actions → navigate away, invalidate queries

This is where the learning really solidifies — by doing it yourself.
