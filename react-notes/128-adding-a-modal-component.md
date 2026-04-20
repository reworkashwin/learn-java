# Adding a Modal Component

## Introduction

When the timer expires (or the player stops it), we want to show a **result modal** — a dialog that appears on top of everything else. This lecture introduces the `ResultModal` component using the native HTML `<dialog>` element and reveals an important limitation: you need to call `showModal()` programmatically (via refs!) to get the built-in backdrop dimming effect.

---

## The Native `<dialog>` Element

HTML5 provides a built-in `<dialog>` element that comes with overlay behavior out of the box. No need for third-party modal libraries:

```jsx
export default function ResultModal({ result, targetTime }) {
  return (
    <dialog className="result-modal">
      <h2>You {result}</h2>
      <p>The target time was <strong>{targetTime} seconds</strong>.</p>
      <form method="dialog">
        <button>Close</button>
      </form>
    </dialog>
  );
}
```

### Key Features of `<dialog>`

- **Invisible by default** — it's hidden until opened
- **`method="dialog"`** on a form — any submit button inside will automatically close the dialog (no JavaScript needed!)
- **Built-in backdrop** — a dimmed background that appears behind the dialog... but only when opened the "right" way

---

## The `open` Attribute vs `showModal()`

There are two ways to make a `<dialog>` visible:

### 1. The `open` attribute (simple but limited)
```jsx
<dialog open>...</dialog>
```
- Shows the dialog ✅
- **No backdrop dimming** ❌
- No proper focus trapping ❌

### 2. The `showModal()` method (the right way)
```jsx
dialogElement.showModal();
```
- Shows the dialog ✅
- **Backdrop dimming included** ✅
- Proper focus trapping and accessibility ✅
- Requires a **reference to the DOM element** — perfect use case for refs!

---

## The Challenge: Cross-Component Ref Access

Here's the issue: the `<dialog>` lives inside `ResultModal`, but the decision to open it is made in `TimerChallenge`. We need to:

1. Create a ref in `TimerChallenge`
2. Somehow connect it to the `<dialog>` inside `ResultModal`
3. Call `showModal()` on it from `TimerChallenge`

```jsx
// In TimerChallenge:
const dialog = useRef();

// When timer expires:
dialog.current.showModal();

// In JSX:
<ResultModal ref={dialog} targetTime={targetTime} result="lost" />
```

But wait — how does the ref get from `TimerChallenge` down to the actual `<dialog>` element? That's **ref forwarding**, which we'll tackle in the next lecture.

---

## Rendering the Modal Conditionally vs. Always

Since `<dialog>` is invisible by default, we can keep it in the DOM at all times:

```jsx
// Always rendered (invisible until showModal is called):
<ResultModal ref={dialog} targetTime={targetTime} result="lost" />
```

This is different from conditional rendering with `{timerExpired && <ResultModal />}`. Having it always present lets us call `showModal()` on it any time we want.

---

## ✅ Key Takeaways

- The native `<dialog>` element provides modal behavior without third-party libraries
- `<form method="dialog">` inside a dialog auto-closes it on form submission — no JS required
- Using the `open` attribute shows the dialog but **without** the backdrop dimming effect
- Calling `showModal()` programmatically gives you the full modal experience (backdrop + focus trap)
- Calling `showModal()` requires a DOM reference → this is a natural use case for refs

## ⚠️ Common Mistakes

- Using `open` prop instead of `showModal()` and wondering why there's no backdrop
- Conditionally rendering the modal — if it's not in the DOM, you can't call `showModal()` on it

## 💡 Pro Tips

- The `<dialog>` element's backdrop can be styled with the CSS pseudo-element `::backdrop`
- `showModal()` is a standard Web API — check MDN for full documentation on `<dialog>`
- Accessibility is better with `showModal()` because it manages focus trapping automatically
