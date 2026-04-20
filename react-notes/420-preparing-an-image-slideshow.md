# Preparing an Image Slideshow

## Introduction

The homepage has a blank space where we planned an image slideshow — a carousel of food images that automatically cycles every few seconds. Building this component introduces an important concept: the intersection of standard React hooks (`useState`, `useEffect`) with Next.js's server component model.

---

## The Slideshow Component

### Structure

The component imports several food images from the `assets/` folder, stores them in an array, and cycles through them using state and a timer.

```jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import burgerImg from '@/assets/burger.jpg';
import curryImg from '@/assets/curry.jpg';
// ... more image imports

import classes from './image-slideshow.module.css';

const images = [
  { image: burgerImg, alt: 'A delicious burger' },
  { image: curryImg, alt: 'A curry dish' },
  // ... more entries
];

export default function ImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.slideshow}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image.image}
          alt={image.alt}
          className={index === currentImageIndex ? classes.active : ''}
        />
      ))}
    </div>
  );
}
```

### How It Works

1. **`useState`** tracks which image is currently visible via an index
2. **`useEffect`** sets up a `setInterval` that increments the index every 5 seconds
3. When the index reaches the end, it wraps back to 0
4. The cleanup function (`return () => clearInterval(interval)`) prevents memory leaks when the component unmounts
5. Each image gets an `active` CSS class when it's the current one, which controls visibility via CSS

This is all standard React — nothing Next.js-specific about the logic.

---

## The Server Component Problem

Here's where things get interesting. If you try to use this component as-is in your Next.js project (without that `'use client'` directive at the top), you'll get an error:

> **Error**: You're importing a component that needs `useState`. It only works in a Client Component, but none of its parents are marked with `"use client"`.

### Why?

By default, all components in Next.js are **Server Components**. They render on the server and are sent as HTML to the browser. Server Components **cannot** use:
- `useState`
- `useEffect`
- `useRef`
- Event handlers (`onClick`, `onChange`, etc.)
- Browser-only APIs

These features require JavaScript running in the browser — which doesn't happen with Server Components.

### The Fix: `'use client'`

Adding `'use client'` at the very top of the file marks it as a **Client Component**:

```jsx
'use client';  // ← This line is critical

import { useState, useEffect } from 'react';
// ...
```

This tells Next.js: "This component needs to run in the browser. Send it as JavaScript, not just as pre-rendered HTML."

---

## Using the Slideshow

On the homepage, import and render it inside the slideshow placeholder:

```jsx
import ImageSlideshow from '@/components/images/image-slideshow';

// Inside the JSX:
<div className={classes.slideshow}>
  <ImageSlideshow />
</div>
```

---

## ✅ Key Takeaways

- The slideshow uses standard `useState` and `useEffect` — nothing Next.js-specific
- `setInterval` in `useEffect` with a cleanup function is the standard pattern for recurring side effects
- **Server Components cannot use hooks** like `useState` or `useEffect`
- Add `'use client'` at the top of any component that needs React hooks or browser APIs
- This is a crucial distinction in Next.js: Server Components vs Client Components

## ⚠️ Common Mistakes

- Forgetting `'use client'` when using hooks — causes a cryptic build error
- Not cleaning up `setInterval` in the `useEffect` return function — causes memory leaks
- Placing `'use client'` anywhere other than the very first line of the file

## 💡 Pro Tip

Only add `'use client'` to components that truly need it. Keep as many components as possible as Server Components — they're faster, more SEO-friendly, and reduce the JavaScript sent to the browser. Only "opt in" to client-side rendering when you need interactivity.
