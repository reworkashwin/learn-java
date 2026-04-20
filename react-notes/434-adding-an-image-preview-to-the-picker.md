# Adding an Image Preview to the Picker

## Introduction

A file picker that opens the dialog is great, but users want to **see** what they've selected before submitting. In this lecture, we complete the `ImagePicker` component by adding a live image preview using the `FileReader` API and React state. It's a practical exercise in handling file inputs, reading files in the browser, and updating UI in response.

---

## The Plan

1. Detect when a file is selected (`onChange` on the input)
2. Read the file and convert it to a **data URL** (a base64-encoded string that can be used as an image `src`)
3. Store that URL in state
4. Display the image preview

---

## Step 1: Handle the File Selection

Add an `onChange` handler to the file input and use state to track the picked image:

```jsx
import { useState, useRef } from 'react';

export default function ImagePicker({ label, name }) {
  const [pickedImage, setPickedImage] = useState();
  const imageInput = useRef();

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setPickedImage(fileReader.result);
    };

    fileReader.readAsDataURL(file);
  }

  // ...
}
```

### Why `event.target.files[0]`?

The file input has a `files` property — an array-like object of all selected files. Since we don't use the `multiple` attribute, there's only ever one file at index `0`.

### The Guard Check

```jsx
if (!file) return;
```

It's possible (though rare) for the event to fire without a file being selected (e.g., the user opens the dialog and cancels). This guard prevents errors.

---

## Step 2: Convert the File to a Data URL

The `FileReader` API reads files in the browser. Here's how it works:

```jsx
const fileReader = new FileReader();

fileReader.onload = () => {
  setPickedImage(fileReader.result);
};

fileReader.readAsDataURL(file);
```

The API is a bit unusual:
- **`readAsDataURL(file)`** starts reading the file asynchronously
- It doesn't return a promise or accept a callback as a parameter
- Instead, you assign a function to **`fileReader.onload`** — this function fires when reading is complete
- The result is available at **`fileReader.result`** — a base64-encoded string like `data:image/png;base64,iVBOR...`

This data URL can be used directly as the `src` of an image element.

---

## Step 3: Display the Preview

```jsx
<div className={classes.preview}>
  {!pickedImage ? (
    <p>No image picked yet.</p>
  ) : (
    <Image
      src={pickedImage}
      alt="The image selected by the user"
      fill
    />
  )}
</div>
```

- When no image is selected (`pickedImage` is `undefined`), show placeholder text
- Once an image is picked, render it using Next.js's `<Image>` component with the `fill` prop (since we don't know dimensions in advance)
- Import `Image` from `next/image`

---

## The Complete ImagePicker Component

```jsx
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import classes from './image-picker.module.css';

export default function ImagePicker({ label, name }) {
  const [pickedImage, setPickedImage] = useState();
  const imageInput = useRef();

  function handlePickClick() {
    imageInput.current.click();
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPickedImage(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!pickedImage ? (
            <p>No image picked yet.</p>
          ) : (
            <Image src={pickedImage} alt="The image selected by the user" fill />
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          ref={imageInput}
          onChange={handleImageChange}
        />
        <button className={classes.button} type="button" onClick={handlePickClick}>
          Pick an Image
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ Key Takeaways

- Use the `FileReader` API to read files selected by the user in the browser
- `readAsDataURL()` converts a file to a base64-encoded string usable as an image `src`
- Store the data URL in state to trigger a re-render and show the preview
- The `FileReader` uses an `onload` callback pattern — not promises
- Use `fill` on `<Image>` when you don't know the dimensions of user-uploaded images

## ⚠️ Common Mistakes

- Forgetting the guard check for `!file` — canceling the file dialog can cause issues
- Trying to access `fileReader.result` before `onload` fires — the reading is asynchronous
- Not setting `accept` on the input — users might upload non-image files

## 💡 Pro Tip

The `FileReader` API's callback pattern feels old-fashioned compared to promises. If you prefer, you can wrap it in a promise:

```jsx
function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
```
