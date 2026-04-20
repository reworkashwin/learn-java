# Getting Started with a Custom Image Picker Input Component

## Introduction

The default file input in HTML is ugly and offers no customization. In this lecture, we build a custom `ImagePicker` component that hides the native file input, uses a styled button to trigger the file picker, and prepares the groundwork for showing an image preview. Along the way, we encounter a key lesson: **event handlers require Client Components**.

---

## Building the ImagePicker Component

### Basic Structure

```jsx
'use client';

import { useRef } from 'react';
import classes from './image-picker.module.css';

export default function ImagePicker({ label, name }) {
  const imageInput = useRef();

  function handlePickClick() {
    imageInput.current.click();
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <input
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          ref={imageInput}
        />
        <button
          className={classes.button}
          type="button"
          onClick={handlePickClick}
        >
          Pick an Image
        </button>
      </div>
    </div>
  );
}
```

Let's break down every design decision here.

---

## Hiding the Native Input

The native `<input type="file">` is functional but impossible to style consistently across browsers. The strategy:

1. **Hide the native input** using CSS (`display: none` or similar)
2. **Create a custom button** that looks however you want
3. **Programmatically click** the hidden input when the user clicks the button

The `classes.input` CSS class hides the input. It's still in the DOM — just not visible.

---

## Using Refs to Trigger the Hidden Input

React's `useRef` hook creates a reference to the actual DOM element:

```jsx
const imageInput = useRef();

// Connect ref to the input
<input ref={imageInput} type="file" ... />

// Programmatically click it
function handlePickClick() {
  imageInput.current.click();
}
```

The `.current` property gives you the actual DOM node, and calling `.click()` on it triggers the browser's file picker dialog — exactly as if the user clicked the input directly.

---

## Why `type="button"` Is Critical

```jsx
<button type="button" onClick={handlePickClick}>
```

Without `type="button"`, the button defaults to `type="submit"`, which would **submit the surrounding form** when clicked. That's not what we want — we just want to open the file picker.

---

## Why This Requires `'use client'`

The moment you add an `onClick` handler (or any event handler like `onChange`, `onSubmit`, etc.) to a component, it **must be a Client Component**. Event handlers react to user interactions that happen in the browser — they have no meaning on the server.

Next.js will give you a clear error if you try to use event handlers in a Server Component, reminding you to add the `'use client'` directive.

---

## Making the Component Configurable

The `ImagePicker` accepts `label` and `name` as props:

```jsx
<ImagePicker label="Your Image" name="image" />
```

- `label` controls the visible label text
- `name` is used for the `name`, `id`, and `htmlFor` attributes — connecting the label to the input and making the value extractable from `FormData` later

---

## ✅ Key Takeaways

- Hide the native file input and use a custom styled button to trigger it
- Use `useRef` to get a reference to the hidden input and call `.click()` on it programmatically
- Always set `type="button"` on buttons inside forms that shouldn't submit the form
- Event handlers (`onClick`, `onChange`) require the `'use client'` directive
- Make components configurable with props for reusability

## ⚠️ Common Mistakes

- Forgetting `type="button"` — the form submits when you just wanted to open the file picker
- Not adding `'use client'` when using event handlers
- Not connecting the `ref` to the input element

## 💡 Pro Tip

The "hide the real input, style a fake button" pattern is one of the most common UI patterns in web development. It works for file inputs, checkboxes, radio buttons — any native element whose default styling is limiting.
