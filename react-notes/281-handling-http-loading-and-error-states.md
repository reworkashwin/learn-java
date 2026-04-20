# Handling HTTP Loading & Error States

## Introduction

With the custom `useHttp` hook in place, we now put it to work — adding proper loading indicators when meals are being fetched and error messages when something fails. We also build a small reusable Error component, because good error handling deserves good presentation.

---

## Showing a Loading State

When we throttle the network (simulating a slow connection), the page sits blank while meals are loading. Users deserve feedback. Since our hook already provides `isLoading`, the fix is simple:

```jsx
if (isLoading) {
  return <p className="center">Fetching meals...</p>;
}
```

The `center` CSS class positions the text properly on screen. Without it, the loading message gets pushed all the way to the left — a small detail that makes a big difference in perceived polish.

---

## Building an Error Component

Rather than scattering error-related JSX throughout the app, we build a tiny reusable component:

```jsx
export default function Error({ title, message }) {
  return (
    <div className="error">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
```

Simple — just a title and a message. The styling comes from CSS classes defined in `index.css`.

---

## Displaying Errors in the Meals Component

If the request fails (wrong URL, network error, server error), we show the Error component:

```jsx
if (error) {
  return <Error title="Failed to fetch meals" message={error} />;
}
```

To test this, temporarily change the URL to something invalid. The error message appears instead of the meals list. Fix the URL, and everything works again.

### The Rendering Order Matters

```jsx
if (isLoading) return <p className="center">Fetching meals...</p>;
if (error) return <Error title="Failed to fetch meals" message={error} />;

return (
  <ul id="meals">
    {loadedMeals.map(meal => <MealItem key={meal.id} meal={meal} />)}
  </ul>
);
```

These early returns act as **guard clauses**:
1. If loading → show loading text
2. If error → show error message
3. Otherwise → show the actual content

This pattern is clean, readable, and avoids nested conditional logic.

---

## What Comes Next

The Checkout component also needs the `useHttp` hook — but with a twist. It sends a POST request triggered by form submission, not a GET request on component mount. The hook was designed for both scenarios, and the next lesson puts that flexibility to the test.

---

## ✅ Key Takeaways

- Always provides loading feedback during network requests — users should never stare at a blank page
- Build small, reusable Error components rather than scattering error JSX throughout the app
- Use early return guard clauses (`if (isLoading) return ...`) to handle multiple states cleanly
- Test error handling by temporarily breaking the URL — this validates both the hook and the UI

## ⚠️ Common Mistakes

- Forgetting to handle the loading state — leads to "flash of empty content" or errors when trying to render undefined data
- Not testing the error path — you only discover it's broken when production goes down

## 💡 Pro Tips

- Network throttling in DevTools (slow 3G, etc.) is invaluable for testing loading states during development
- The guard clause pattern (`if (x) return <Y/>`) is cleaner than deeply nested ternaries for state-dependent rendering
