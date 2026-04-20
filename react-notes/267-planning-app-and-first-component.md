# Planning the App & Adding a First Component

## Introduction

When you face a blank project and a complex challenge, the hardest part is knowing where to start. Do you build the data layer first? The UI? The routing? There's no single right answer, but a practical approach is to **start with the simplest visible component** and build outward.

That gives you an immediate visual win and something to anchor the rest of your work around.

---

## Planning: What Components Do We Need?

Looking at the finished app, we can identify these major pieces:

| Component | Responsibility |
|-----------|---------------|
| **Header** | Logo, title, cart button with item count |
| **Meals** | Fetches and lists all meal items |
| **MealItem** | Displays a single meal (image, name, price, description, add button) |
| **Cart** | Modal showing cart contents with quantity controls |
| **Checkout** | Form for user details + order submission |

We don't need to build all of these at once. Start simple, iterate.

---

## Starting with the Header

The header is perfect as a first component — it's simple, has no complex logic, and gives us something visible on screen immediately.

### Creating the Component

```jsx
// src/components/Header.jsx
import logoImg from '../assets/logo.jpg';

export default function Header() {
  return (
    <header id="main-header">
      <div id="title">
        <img src={logoImg} alt="A restaurant" />
        <h1>ReactFood</h1>
      </div>
      <nav>
        <button>Cart (0)</button>
      </nav>
    </header>
  );
}
```

A few things to note:

### Importing Images
When you import an image file in a Vite/Webpack project, you get back the **optimized path** to that image. This is better than hardcoding a path because the build tool can optimize, hash, and manage the image for you.

### Using IDs for Styling
The starting project includes an `index.css` file with pre-written styles that target specific IDs like `main-header` and `title`. By matching these IDs in our JSX, we get the styling for free.

### Hardcoded Cart Count
The `(0)` next to "Cart" is hardcoded for now. We'll make it dynamic once we build the cart state management.

---

## Using the Header in App

```jsx
// src/App.jsx
import Header from './components/Header';

function App() {
  return <Header />;
}

export default App;
```

That's it. Clear out the default content, render the Header, and you have your first visual result.

---

## The CSS Hint Strategy

The `index.css` file is a goldmine of hints. By reading through the CSS selectors, you can infer the expected HTML structure:

```css
#main-header { ... }        /* → header element with this ID */
#title { ... }               /* → div inside header */
#title img { ... }           /* → image inside title div */
#meals { ... }               /* → meals list (coming next) */
.meal-item { ... }           /* → individual meal card */
.meal-item-actions { ... }   /* → button area in meal card */
```

This reverse-engineering approach works in real projects too — when you inherit CSS, the selectors tell you what HTML the original author expected.

---

## The Iterative Approach

Notice the pattern:
1. Identify the simplest component
2. Build it with hardcoded/placeholder data
3. Verify it renders correctly
4. Move to the next component

Don't try to build everything at once. Don't wire up state management before you have components to display it in. Get something on screen first, then layer in complexity.

---

## ✅ Key Takeaways

- Start with the **simplest component** to get a quick visual win
- Use the CSS file as a guide for component structure and IDs
- Import images as modules — don't hardcode paths
- Use hardcoded values as placeholders; make them dynamic later
- Build incrementally: render → verify → next component

## ⚠️ Common Mistakes

- Trying to build the entire app before rendering anything — you'll get overwhelmed
- Ignoring the provided CSS — it contains structural hints and saves styling time
- Over-engineering the first component with state management it doesn't need yet

## 💡 Pro Tip

When planning a React project, a great approach is to sketch out your component tree on paper (or in your head). Start with the root (`App`) and branch out. Components that share data or need to communicate hint at where state should be managed or where context might be needed. You don't need to get this perfect upfront — you can always refactor.
