# Adding a Custom Component To A Layout

## Introduction

Our Foodies App needs a proper header with a logo and navigation links — something visible on every page. Since layouts wrap all pages, the root layout is the perfect place to include it. But instead of cramming everything into `layout.js`, we'll create a dedicated `MainHeader` component.

---

## Building the MainHeader Component

### File Location

We create a `main-header.js` file. The instructor prefers keeping components **outside** the `app/` folder, in a top-level `components/` directory:

```
components/
└── main-header/
    └── main-header.js
```

Since the filename `main-header` isn't a reserved Next.js name, it's treated as a regular component — no special behavior.

### The Component

```jsx
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/logo.png';

export default function MainHeader() {
  return (
    <header>
      <Link href="/">
        <Image src={logoImg} alt="A plate with food on it" priority />
        NextLevel Food
      </Link>
      <nav>
        <ul>
          <li><Link href="/meals">Browse Meals</Link></li>
          <li><Link href="/community">Foodies Community</Link></li>
        </ul>
      </nav>
    </header>
  );
}
```

### Key Details

**Logo as a clickable link**: Wrapping the logo image and text in a `Link` component that points to `/` takes users back to the homepage when clicked.

**Image import with `.src`**: When importing images in Next.js, you get an object (not a raw path). When using the default `<img>` tag, you'd need `logoImg.src`. But with the Next.js `Image` component, you pass the entire object — it uses the extra metadata (dimensions, format) for optimization.

**The `@` alias**: `@/assets/logo.png` uses the configured path alias to reference the project root, avoiding messy relative paths.

---

## Using It in the Root Layout

```jsx
import MainHeader from '@/components/main-header/main-header';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
```

Because it's in the **root layout**, this header appears on every page automatically. That's the power of layouts — shared UI in one place.

---

## Organizing Component Files

As your project grows, group related files into sub-folders:

```
components/
└── main-header/
    ├── main-header.js
    ├── main-header.module.css
    ├── main-header-background.js
    └── main-header-background.module.css
```

This keeps the `components/` folder manageable. Just remember to update import paths when you move files (most IDEs do this automatically).

---

## ✅ Key Takeaways

- Create dedicated components for shared UI like headers instead of inlining in layouts
- Place shared components in the root layout so they appear on all pages
- Use the `Link` component for all internal navigation, including logo clicks
- Keep components outside `app/` to maintain separation between routing and UI
- Group related component files into sub-folders for organization

## ⚠️ Common Mistakes

- Forgetting to import the component in the layout after creating it
- Using relative paths when the `@` alias would be cleaner
- Putting header code directly in `layout.js` instead of extracting a component (works but gets messy)

## 💡 Pro Tip

When you import an image and use it with the Next.js `Image` component, pass the entire imported object as `src`. The `Image` component extracts width, height, and format data from it for automatic optimization. Only use `.src` when you need a raw URL string.
