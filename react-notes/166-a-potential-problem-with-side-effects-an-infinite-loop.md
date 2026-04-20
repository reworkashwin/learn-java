# A Potential Problem with Side Effects: An Infinite Loop

## Introduction

So you've learned about side effects — code that's not directly related to rendering JSX. You've seen that having side effects in your component function isn't *always* a problem. But now we're about to hit a wall. A very specific, very common trap that every React developer encounters sooner or later: **the infinite loop**.

This is the lecture where you truly understand *why* React introduced the `useEffect` hook. It exists because of this exact problem.

---

## The Setup: Sorted Places by User Location

Imagine you're building a feature where you sort a list of places based on the user's current location. You use `navigator.geolocation.getCurrentPosition()` — a browser API — to get the user's coordinates. Then you sort the available places by distance.

Here's the catch: getting the user's location **takes time**. It's an asynchronous operation. The first render cycle of your component will finish *before* you have the location data.

So what do you do? You reach for `useState`:

```jsx
const [availablePlaces, setAvailablePlaces] = useState([]);
```

You start with an empty array, then update it with the sorted places once the location comes back. Makes sense, right?

---

## The Infinite Loop Problem

Here's where it all falls apart.

You write your geolocation code directly in the component function body. When the location comes back, you call `setAvailablePlaces(sortedPlaces)`. That **state update triggers a re-render**. The component function runs again. And what happens when it runs again?

1. You fetch the user's location **again**
2. You get the sorted places **again**
3. You call `setAvailablePlaces` **again**
4. That triggers **another re-render**
5. Go back to step 1

You're stuck in an infinite loop. The app will crash.

### Why does this happen?

Because **every time the component re-renders**, the side effect code runs again, which triggers another state update, which triggers another re-render. There's no "stop" signal.

Think of it like a dog chasing its own tail — except the dog never gets tired and your browser eventually does.

---

## This Is Why `useEffect` Exists

The `useEffect` hook was designed precisely to break this cycle. It gives you a way to say:

> "Hey React, run this code **after** the component renders, and only re-run it when **specific things change**."

By wrapping your side effect in `useEffect` with the right dependency array, you can prevent the infinite loop while still getting your side effect to run when it needs to.

We'll see exactly how in the next lecture.

---

## ✅ Key Takeaways

- Calling a state-updating function inside a component body that also triggers the side effect creates an **infinite loop**
- The pattern is: side effect → state update → re-render → side effect → state update → forever
- This is the **primary reason** the `useEffect` hook exists
- Not all side effects cause this problem — only those that run on every render AND update state

## ⚠️ Common Mistakes

- Writing async/side effect code directly in the component body without considering re-render cycles
- Assuming "it works once, so it must be fine" — the infinite loop only appears when state is updated

## 💡 Pro Tip

If you're ever debugging a React app that becomes unresponsive or crashes the browser tab, one of the first things to check is whether you have a side effect + state update loop running directly in a component function body.
