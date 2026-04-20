# Fetching More Data & Testing the Mutation

## Introduction

We've got our mutation wired up to create new events. But there's a missing piece — we need the user to **pick an image** for their event. Those images live on the backend, so we need to **fetch** them first and display them as selectable options.

This lecture combines two things: adding another `useQuery` for images, and verifying that our full "create event" flow actually works end to end.

---

## Fetching Selectable Images

### 🧠 The Problem

The images a user can pick from aren't part of the frontend bundle — they're stored on the backend server. The backend exposes a `GET /events/images` route that returns a list of available image filenames.

### ⚙️ How to Fetch Them

This is a straightforward `useQuery` — we're reading data, not changing it:

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchSelectableImages } from '../util/http.js';

function EventForm() {
  const { data, isPending, isError } = useQuery({
    queryFn: fetchSelectableImages,
    queryKey: ['events-images'],
  });

  return (
    <>
      {isPending && <p>Loading selectable images...</p>}
      {isError && (
        <ErrorBlock
          title="Failed to load selectable images"
          message="Please try again later."
        />
      )}
      {data && <ImagePicker images={data} />}
    </>
  );
}
```

### 💡 Why a hardcoded queryKey?

The query key `['events-images']` is static because this request is always the same — there's no search term, no dynamic ID. Every user sees the same set of selectable images.

---

## Testing the Full Mutation Flow

With images now loading and selectable, we can test the complete "create event" mutation:

1. Fill in the event title, description, date, time, and location
2. Select an image from the fetched list
3. Click "Create"

If the mutation succeeds, the request goes through with no errors. But here's the thing — **nothing visually happens** after success. No navigation, no confirmation message. The event *is* created on the backend, but our UI doesn't react to the success yet.

That's intentional — we haven't written any "on success" logic. We'll tackle that in the next lecture.

---

## ✅ Key Takeaways

- You can have **multiple `useQuery` hooks** in the same component (or in child components) — each fetches independently
- Use conditional rendering to handle loading, error, and success states for each query
- `useQuery` fires automatically when the component mounts — perfect for loading options like images
- Always test your mutations end to end — check the Network tab for errors even when the UI seems silent

## ⚠️ Common Mistakes

- Passing an empty array to the image picker before data loads — render conditionally with `{data && <ImagePicker images={data} />}`
- Assuming "no error in the UI" means success — always check the Network tab during development

## 💡 Pro Tip

When your mutation "works" but nothing happens visually, that's your cue to add `onSuccess` handling — navigation, toast notifications, or query invalidation. We'll do exactly that next.
