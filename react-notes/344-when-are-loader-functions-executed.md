# When Are loader() Functions Executed?

## Introduction

Understanding **when** a loader runs is critical for understanding the user experience it creates. The timing of loader execution has both advantages and trade-offs that you need to be aware of.

---

## The Timing: Before Navigation Completes

A loader is executed **as soon as you start navigating** to a route — not after the page component renders, but **before** it.

Here's the sequence:

1. User clicks a link to `/events`
2. React Router **immediately** calls the loader for the `/events` route
3. The loader runs (fetches data, processes it, etc.)
4. React Router **waits** for the loader to finish
5. Only then does it render the `EventsPage` component with the data

This is fundamentally different from the `useEffect` approach, where the component renders first (showing a loading state) and the data arrives later.

---

## Seeing It in Action

If the backend has a delay (say 1.5 seconds to respond), here's what happens:

- User clicks "Events"
- **Nothing visible changes** for 1.5 seconds
- Then the Events page appears, fully loaded with data

Compare this to the `useEffect` approach:

- User clicks "Events"
- Events page immediately appears with "Loading..." text
- After 1.5 seconds, the loading text is replaced with actual data

---

## The Trade-off

### Advantage: No Loading State Needed in the Component

The component can **trust** that data exists when it renders. No conditional checks, no loading spinners, no flash of empty content. The component is always rendered with complete data.

### Disadvantage: Perceived Delay

The user sees **nothing happening** during the data fetch. They click a link and... nothing. For a brief moment, it feels like the app is broken. The old page stays visible while the new page's data loads in the background.

This isn't actually slower — the total time is the same. But the **perceived** experience can feel worse because there's no visual feedback.

---

## The Solution Preview

React Router provides tools to address this UX issue:

1. **`useNavigation`** — detect that a transition is in progress and show a loading indicator on the current page (covered in the next lecture)
2. **`defer`** — start rendering the page immediately while data loads in the background (covered later in the section)

Both preserve the benefits of the loader pattern while improving perceived performance.

---

## ✅ Key Takeaways

- Loaders execute **right when navigation starts**, before the target component renders
- React Router **waits** for the loader to complete before rendering the page
- The component is guaranteed to have data when it renders — no loading state needed
- The downside is a perceived delay with no visual feedback during the fetch
- React Router provides solutions (`useNavigation`, `defer`) to address this

## ⚠️ Common Mistakes

- Assuming the component renders first and the loader runs afterward — it's the opposite
- Not providing any loading feedback during slow navigations, making the app feel unresponsive

## 💡 Pro Tip

The fetch-then-render approach used by loaders aligns with how traditional server-rendered websites work — you click a link, there's a brief wait, and then the full page appears. React Router is essentially bringing this pattern to single-page applications while giving you tools to make it feel snappier.
