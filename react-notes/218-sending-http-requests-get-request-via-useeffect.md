# Sending HTTP Requests (GET Request) via useEffect

## Introduction

Now that we understand *why* `useEffect` is essential for HTTP requests, let's put it all together and actually **fetch data** from our backend and display it in the UI. This is the moment our React app stops living in isolation and starts talking to the outside world.

---

## The Complete Fetching Pattern

Here's the full implementation for fetching places from the backend:

```jsx
import { useState, useEffect } from 'react';

export default function AvailablePlaces() {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/places')
      .then((response) => response.json())
      .then((resData) => {
        setAvailablePlaces(resData.places);
      });
  }, []);

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
    />
  );
}
```

### Breaking Down What Happens

1. **First render**: Component renders with `availablePlaces = []` → shows empty or fallback content
2. **After first render**: `useEffect` fires → sends GET request to `localhost:3000/places`
3. **Response arrives**: JSON is parsed → `setAvailablePlaces` is called with the fetched data
4. **Re-render**: Component renders again, this time with actual place data in the UI
5. **Effect does NOT run again**: Since the dependency array is empty, no infinite loop

### Why the Empty Dependency Array `[]`?

The empty array means: "this effect has no dependencies, so it never needs to re-run." Since nothing inside the effect references any reactive value that could change, this is correct. The request is sent once, and that's all we need.

---

## Handling Images From the Backend

After fetching the place data, you might notice the **images are missing**. That's because the image files are stored on the backend server, not in the React project. The raw data only contains the filename:

```json
{ "id": "p1", "title": "Forest Waterfall", "image": { "src": "forest-waterfall.jpg" } }
```

To display these images, you need to construct URLs pointing to the backend:

```jsx
// In the Places component
<img src={`http://localhost:3000/${place.image.src}`} alt={place.title} />
```

This works because the backend is configured to serve image files from its `/images` directory. The template literal constructs the full URL that the browser can fetch the image from.

---

## The Flow Visualized

```
┌──────────────────────────────────────┐
│ Component renders (empty places)      │
│ useEffect fires after render          │
│                                       │
│ fetch('localhost:3000/places') ────────┼───▶ Backend
│                                       │
│ Response arrives (places array) ◀─────┼──── Backend
│ setAvailablePlaces(data)              │
│                                       │
│ Component re-renders (with data!)     │
│ useEffect does NOT fire again         │
└──────────────────────────────────────┘
```

---

## ✅ Key Takeaways

- Wrap `fetch()` calls in `useEffect` with an empty dependency array for one-time data fetching
- The component renders first with default state, then updates once data arrives
- Images stored on the backend need full URLs constructed with the backend's base URL
- The data flows: empty render → fetch → parse → setState → re-render with data

## 💡 Pro Tip

When working with a local backend during development, you'll often use `localhost:PORT` as the base URL. In production, this would be your actual server URL (like `https://api.myapp.com`). Keep the base URL in a constant or environment variable so it's easy to change later.
