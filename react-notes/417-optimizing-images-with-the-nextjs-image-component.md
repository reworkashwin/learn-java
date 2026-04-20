# Optimizing Images with the Next.js Image Component

## Introduction

We're using a regular `<img>` tag for our logo. It works, but Next.js offers something much better: the built-in `Image` component. It's not just a fancy wrapper — it genuinely optimizes how images are loaded, displayed, and served. Let's understand what it does and why you should always prefer it.

---

## The Problem with Regular `<img>` Tags

A standard `<img>` element:
- Loads the image immediately, even if it's far below the visible area (wasting bandwidth)
- Serves the same image file regardless of screen size or device
- Uses whatever format the original image is in (even if a more efficient format exists)
- Doesn't help with content layout shift (the page jumps around as images load)

For a single logo, this might seem fine. But across an entire site with dozens of images, these add up to a noticeably slower experience.

---

## The Next.js `Image` Component

Import it from `next/image`:

```jsx
import Image from 'next/image';
import logoImg from '@/assets/logo.png';

<Image src={logoImg} alt="A plate with food on it" priority />
```

### What It Does Automatically

**1. Lazy Loading**
Images only load when they're about to enter the viewport. If an image is below the fold, the browser doesn't fetch it until the user scrolls near it.

**2. Responsive srcSet**
It generates multiple sizes of the image and creates a `srcset` attribute. The browser picks the right size based on viewport width and device pixel ratio.

**3. Optimal Format**
It automatically serves images in the **best format** for the user's browser. Chrome gets WebP. Safari gets the most efficient format it supports. No manual conversion needed.

**4. Automatic Dimensions**
When using a locally imported image, Next.js reads the file dimensions automatically. No need to manually set `width` and `height`.

---

## The `src` Prop Difference

When importing images in Next.js:

```jsx
import logoImg from '@/assets/logo.png';
```

The imported value is an **object** containing `src`, `width`, `height`, and other metadata.

| Element | Usage |
|---|---|
| Regular `<img>` | `<img src={logoImg.src} />` — extract the raw path |
| Next.js `<Image>` | `<Image src={logoImg} />` — pass the full object |

The `Image` component needs the whole object because it uses the metadata (dimensions, format info) for optimization.

---

## The `priority` Prop

By default, images are lazy loaded. But for images that are **always visible** when the page loads (like a logo in the header), lazy loading doesn't make sense — it can cause a flash of missing content.

Add the `priority` prop to tell Next.js: "Load this image immediately, with top priority."

```jsx
<Image src={logoImg} alt="Logo" priority />
```

Use this for:
- Header logos
- Hero images (the big banner at the top of a page)
- Any image that's visible in the initial viewport without scrolling

---

## What You See in the Browser

Inspect the rendered HTML with DevTools and you'll notice:

- A `loading="lazy"` attribute (unless `priority` is set)
- Automatically inferred `width` and `height` attributes
- A generated `srcset` with multiple image sizes
- The image served as **WebP** format (in Chrome) instead of the original PNG

All of this happens without any extra configuration.

---

## ✅ Key Takeaways

- Always use the Next.js `Image` component instead of `<img>` for images in your project
- It provides lazy loading, responsive sizing, optimal formats, and automatic dimensions
- Pass the full imported image object as `src`, not just the `.src` property
- Add `priority` to images that are immediately visible when the page loads
- The optimization happens automatically at build/serve time — zero extra work

## ⚠️ Common Mistakes

- Using `logoImg.src` instead of `logoImg` with the `Image` component
- Forgetting to add `priority` to above-the-fold images (causes console warnings)
- Not using the `Image` component at all and sticking with plain `<img>` tags

## 💡 Pro Tip

The `Image` component has many more props for advanced use cases — `fill` for covering a container, `sizes` for responsive breakpoints, `quality` to control compression. Check the Next.js docs once you need more control, but for most cases, just importing and using it is enough.
