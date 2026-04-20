# Using Client Components Efficiently

## Introduction

Now that you understand the difference between Server and Client Components, the next question is: **how do you use Client Components wisely?** The goal is to keep the `'use client'` boundary as **small and as low in the component tree** as possible, so the majority of your app remains server-rendered. This lecture walks through a practical example of refactoring a component to achieve exactly that.

---

## The Problem: Turning a Large Component into a Client Component

Imagine you have a `MainHeader` component with navigation links. You want to highlight the currently active link — a common UI pattern. To determine which page is active, you need the current URL path, and Next.js provides the `usePathname` hook from `next/navigation` for exactly that.

```jsx
import { usePathname } from 'next/navigation';

export default function MainHeader() {
  const path = usePathname();

  return (
    <header>
      <nav>
        <Link href="/meals" className={path.startsWith('/meals') ? classes.active : undefined}>
          Browse Meals
        </Link>
        <Link href="/community" className={path === '/community' ? classes.active : undefined}>
          Foodies Community
        </Link>
      </nav>
      {/* ...lots of other header markup... */}
    </header>
  );
}
```

The catch? `usePathname` only works in **Client Components**. So you'd need to add `'use client'` to the entire `MainHeader` file. But this header contains a lot of markup (logo, images, text) that **doesn't need** to be a client component. Converting the whole thing is wasteful.

---

## The Solution: Extract a Tiny Client Component

Instead of making the entire header a client component, **extract only the piece that needs client-side features** into its own small component.

### Step 1: Create a NavLink Component

Create a new file `nav-link.js`:

```jsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import classes from './nav-link.module.css';

export default function NavLink({ href, children }) {
  const path = usePathname();

  return (
    <Link
      href={href}
      className={`${classes.link} ${path.startsWith(href) ? classes.active : ''}`}
    >
      {children}
    </Link>
  );
}
```

Only this tiny component needs `'use client'`. It's the smallest possible unit that requires the pathname hook.

### Step 2: Use NavLink in the Server Component Header

```jsx
// No 'use client' needed here!
import NavLink from './nav-link';

export default function MainHeader() {
  return (
    <header>
      <nav>
        <NavLink href="/meals">Browse Meals</NavLink>
        <NavLink href="/community">Foodies Community</NavLink>
      </nav>
      {/* ...all this markup stays server-rendered... */}
    </header>
  );
}
```

Now the `MainHeader` remains a **Server Component**. Only the `NavLink` pieces render on the client.

---

## The Principle: Push `'use client'` Down the Tree

Think of your component tree like a building. The `'use client'` directive is like turning on a heater — everything in that room (and rooms below it) gets heated. You want to put the heater in the **smallest room possible**, not in the lobby where it affects the entire building.

In practice:
- **Don't** add `'use client'` to large layout or page components
- **Do** create small, focused client components for interactive pieces
- **Do** use those client components inside server components freely

---

## You Can Nest Client Components Inside Server Components

This is a pattern you'll use constantly:

```jsx
// ServerComponent.jsx (no 'use client')
import ClientWidget from './ClientWidget';

export default function ServerComponent() {
  return (
    <div>
      <h1>This renders on the server</h1>
      <ClientWidget />  {/* This renders on the client */}
    </div>
  );
}
```

The server component renders on the server. The client component hydrates and becomes interactive in the browser. They coexist seamlessly.

---

## ✅ Key Takeaways

- Add `'use client'` as **far down the component tree** as possible
- Extract interactive parts (hooks, event handlers) into their own small components
- Keep the majority of your markup and layout in Server Components
- Client Components can be freely used inside Server Components

## ⚠️ Common Mistakes

- Making an entire page or layout a Client Component just because one small part needs interactivity
- Forgetting to move the associated CSS classes when extracting a component into a new file

## 💡 Pro Tip

When you find yourself about to add `'use client'` to a big component, stop and ask: "Can I extract just the interactive piece into its own component?" Almost always, the answer is yes.
