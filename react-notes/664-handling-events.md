# Handling Events

## Introduction

Components are split — now it's time to make them interactive. This lesson covers handling the **form submit**, the **reset button click**, and setting up **input change handlers** in the investment calculator. Along the way, you'll see a slick pattern for creating a single, reusable change handler for multiple inputs.

---

## Handling Form Submission

### ⚙️ How it works

Add an `onSubmit` handler to the `<form>` element:

```jsx
const submitHandler = (event) => {
  event.preventDefault();  // Prevent page reload
  console.log('SUBMIT');
};

return (
  <form onSubmit={submitHandler}>
    {/* inputs... */}
  </form>
);
```

### ❓ Why `preventDefault()`?

The browser's default form behavior is to **reload the page** — which would restart the entire React app. `event.preventDefault()` stops that, letting your JavaScript take over.

### 💡 Insight

Notice: `submitHandler` is passed **without parentheses** to `onSubmit`. You're passing the function reference, not calling it. React calls it for you when the event fires.

---

## Handling the Reset Button

### ⚙️ How it works

The Reset button is **not** of type `submit`, so clicking it won't trigger `onSubmit`. Add a separate `onClick` handler:

```jsx
const resetHandler = () => {
  console.log('RESET');
};

<button type="button" onClick={resetHandler}>Reset</button>
```

The Calculate button has `type="submit"`, so it triggers the form's `onSubmit` — no separate handler needed.

---

## Handling Input Changes — A Generic Approach

### 🧠 What is it?

Instead of writing a separate handler for each input, create **one reusable handler** that accepts an identifier and a value.

### ⚙️ How it works

```jsx
const inputChangeHandler = (input, value) => {
  console.log(input, value);
};
```

Then use an **anonymous arrow function** on each input's `onChange`:

```jsx
<input
  type="number"
  id="current-savings"
  onChange={(event) => inputChangeHandler('current-savings', event.target.value)}
/>
```

### ❓ Why the arrow function wrapper?

If you wrote `onChange={inputChangeHandler}`, React would call it with just the event object — you'd lose the ability to pass the identifier. The arrow function wrapper lets you control **how** the handler is called:

```jsx
// ❌ Can't pass custom arguments
onChange={inputChangeHandler}

// ✅ Full control over arguments
onChange={(event) => inputChangeHandler('current-savings', event.target.value)}
```

### 🧪 Example — All Inputs

```jsx
<input onChange={(e) => inputChangeHandler('current-savings', e.target.value)} />
<input onChange={(e) => inputChangeHandler('yearly-contribution', e.target.value)} />
<input onChange={(e) => inputChangeHandler('expected-return', e.target.value)} />
<input onChange={(e) => inputChangeHandler('duration', e.target.value)} />
```

Each input calls the same function with a **different identifier** and the current value.

---

## Why This Pattern Matters

### 💡 Insight

This generic handler pattern scales beautifully:
- Adding a new input? Just add one more `onChange` with a new identifier
- All input handling logic lives in one function
- Easy to add validation, logging, or transformation in one place

Compare this to having `currentSavingsChangeHandler`, `yearlyContributionChangeHandler`, etc. — that's a lot of repetitive code.

---

## ✅ Key Takeaways

- Use `onSubmit` on the form, not `onClick` on the submit button
- Always call `event.preventDefault()` in form submit handlers to prevent page reloads
- Pass function **references** (no parentheses) to event handler props
- Use **arrow function wrappers** in `onChange` to pass custom arguments
- A single generic change handler reduces code duplication across multiple inputs

## ⚠️ Common Mistakes

- Adding parentheses to the handler: `onSubmit={submitHandler()}` — this calls it immediately during render
- Forgetting `event.preventDefault()` and wondering why the page keeps reloading
- Setting `onClick` on the submit button instead of `onSubmit` on the form
- Using `onChange={inputChangeHandler('current-savings', event.target.value)}` without the arrow wrapper — this executes immediately

## 💡 Pro Tips

- The generic handler pattern works great with dynamic state keys (as you'll see in the next lesson)
- `event.target.value` always returns a **string**, even for number inputs — remember to convert when needed
- Test your handlers with `console.log` before adding real logic — verify the wiring works first
