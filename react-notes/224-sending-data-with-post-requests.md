# Sending Data with POST Requests

## Introduction

So far, we've only been **reading** data from the backend with GET requests. But real apps also need to **write** data — saving user selections, submitting forms, creating records. This note covers how to send data to a backend using `fetch` with the PUT method, and introduces important concepts about configuring HTTP requests.

---

## The Use Case

When a user clicks on a place to select it, we want to:
1. Update the local state immediately (so the UI reflects the change)
2. Send the updated selection to the backend (so it persists)

The backend expects a PUT request to `/user-places` with the updated list of selected places.

---

## Building the Update Function

In our `http.js` utility file, we add a new function for sending data:

```jsx
export async function updateUserPlaces(places) {
  const response = await fetch('http://localhost:3000/user-places', {
    method: 'PUT',
    body: JSON.stringify({ places }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to update user data.');
  }

  return resData.message;
}
```

### Breaking Down the Configuration

The `fetch` function's second argument is a **configuration object** with several important properties:

#### `method: 'PUT'`
By default, `fetch` sends a GET request. To change or update data, you need a different HTTP method. Here, `PUT` means "replace this resource with this data." Other common methods:
- `POST` — create new data
- `PATCH` — partially update data
- `DELETE` — remove data

#### `body: JSON.stringify({ places })`
This is the data payload. Two things to note:
- **The data must be serialized** — you can't send raw JavaScript objects over HTTP. `JSON.stringify()` converts the object to a JSON string.
- **The backend expects a specific format** — this API expects `{ places: [...] }`, not just a bare array. Always match the format the backend expects.

#### `headers: { 'Content-Type': 'application/json' }`
HTTP headers are **metadata** about the request. The `Content-Type` header tells the backend: "the body of this request is JSON." Without this, the backend might not know how to parse the incoming data.

---

## Using It in the Component

In `App.jsx`, when the user selects a place:

```jsx
async function handleSelectPlace(selectedPlace) {
  // 1. Update local state first
  setUserPlaces((prevPlaces) => {
    if (prevPlaces.some((place) => place.id === selectedPlace.id)) {
      return prevPlaces;
    }
    return [selectedPlace, ...prevPlaces];
  });

  // 2. Send the update to the backend
  try {
    await updateUserPlaces([selectedPlace, ...userPlaces]);
  } catch (error) {
    // Handle error (covered in detail in the next note)
  }
}
```

### A Subtle But Important Detail

Notice we're NOT using `userPlaces` (the state) to build the array we send to the backend. Why?

```jsx
setUserPlaces(prev => [selectedPlace, ...prev]);  // Schedules a state update

// ⚠️ userPlaces still has the OLD value here!
await updateUserPlaces(userPlaces);  // WRONG — missing the new place
```

State updates are **not immediate**. After calling `setUserPlaces`, the state variable still holds its previous value until the next render. So we manually construct the updated array:

```jsx
await updateUserPlaces([selectedPlace, ...userPlaces]);  // ✅ Correct
```

---

## The Event Handler Can Be Async

Unlike component functions, **event handler functions CAN be async**. React doesn't impose any restrictions on them:

```jsx
async function handleSelectPlace(selectedPlace) {
  // Using await here is perfectly fine
  await updateUserPlaces([selectedPlace, ...userPlaces]);
}
```

This is a different situation from component functions or `useEffect` callbacks, where async has restrictions.

---

## Matching Backend Expectations

A critical lesson from this implementation: the backend dictates the exact format it expects. Sending wrong data structure causes errors:

```jsx
// ❌ Backend expects { places: [...] }, not a bare array
body: JSON.stringify(places)

// ✅ Correct — wrapping in the expected object structure
body: JSON.stringify({ places })
```

Always check your backend's API documentation or code to understand the expected request format.

---

## ✅ Key Takeaways

- Use the `fetch` configuration object to set `method`, `body`, and `headers`
- Always `JSON.stringify()` the body data — you can't send raw objects
- Set `Content-Type: application/json` so the backend knows how to parse the body
- State updates are not immediate — construct the updated data manually when needed
- Event handler functions (unlike component functions) can be `async`
- Always match the exact data format the backend expects

## ⚠️ Common Mistakes

- **Forgetting `JSON.stringify()`** — the body must be a string, not an object
- **Missing the `Content-Type` header** — the backend won't know the body is JSON
- **Using stale state values** — state isn't updated immediately after `setState`
- **Sending the wrong data structure** — always match what the backend expects

## 💡 Pro Tip

The shorthand `{ places }` in JavaScript is equivalent to `{ places: places }`. This ES6 shorthand property syntax is used when the key name matches the variable name. It's small but makes code cleaner.
