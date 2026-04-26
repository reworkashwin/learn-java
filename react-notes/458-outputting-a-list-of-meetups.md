# Outputting a List of Meetups

## Introduction

We have our page structure ready — now it's time to bring the starting page to life. In this lesson, we build out the **homepage** by rendering a list of meetups using a reusable component. Along the way, we reinforce a critical NextJS concept: the difference between **page components** (in `pages/`) and **regular components** (in `components/`). This is standard React at its core, but placed inside the NextJS page system.

---

## Concept 1: Building the Homepage Component

### 🧠 What is it?

The homepage (`pages/index.js`) is the entry point of our app. It needs to display a list of meetups. We create a `HomePage` component function, export it, and return JSX that renders the meetup data.

### ❓ Why do we need it?

Without a component in `pages/index.js`, visiting `/` shows nothing. The exported component from a page file *is* what NextJS renders for that route.

### ⚙️ How it works

```jsx
// pages/index.js
function HomePage() {
  return (
    // JSX content goes here
  );
}

export default HomePage;
```

The key rule: **always export your page component as the default export**. NextJS looks for the default export to know what to render.

### 💡 Insight

> Every page file in NextJS follows the same pattern: define a component, return JSX, export it as default. Simple, predictable, and consistent.

---

## Concept 2: Page Components vs. Regular Components

### 🧠 What is it?

In NextJS, there's a critical distinction:

- **Page components** live in the `pages/` folder and are automatically loaded as routable pages
- **Regular components** live in other folders (like `components/`) and are used *within* page components but never loaded as pages themselves

### ❓ Why do we need it?

Not everything should be a page. A `MeetupList` component renders a list of items — it's a UI building block, not a standalone route. Keeping it outside `pages/` ensures NextJS doesn't accidentally create a route for it.

### ⚙️ How it works

```
components/           ← Regular React components (NOT pages)
  meetups/
    MeetupList.js
    MeetupItem.js
pages/                ← Page components (routable)
  index.js
```

The folder name `components/` is not reserved — you could call it anything. Only `pages/` has special meaning in NextJS.

### 💡 Insight

> Think of page components as the "shells" and regular components as the "building blocks" you snap into those shells. The page decides *what route renders*, the component decides *what UI appears*.

---

## Concept 3: Using MeetupList with Dummy Data

### 🧠 What is it?

The `MeetupList` component expects a `meetups` prop — an array of meetup objects. Each object needs: `id`, `image`, `title`, and `address`. For now, we supply **dummy data** directly in the page component.

### ⚙️ How it works

1. Import `MeetupList` from the components folder
2. Create an array of dummy meetup objects
3. Pass the array as the `meetups` prop

### 🧪 Example

```jsx
import MeetupList from '../components/meetups/MeetupList';

const DUMMY_MEETUPS = [
  {
    id: 'm1',
    title: 'A First Meetup',
    image: 'https://upload.wikimedia.org/...',
    address: 'Some Address 5, 12345 Some City',
    description: 'This is our first meetup!',
  },
  {
    id: 'm2',
    title: 'A Second Meetup',
    image: 'https://upload.wikimedia.org/...',
    address: 'Some Address 10, 12345 Some City',
    description: 'This is a second meetup!',
  },
];

function HomePage() {
  return <MeetupList meetups={DUMMY_MEETUPS} />;
}

export default HomePage;
```

### 💡 Insight

> Using dummy data is a smart development strategy. It lets you build and verify the UI before worrying about databases or APIs. Get the rendering right first, then swap in real data later.

---

## Concept 4: How MeetupList Works Under the Hood

### 🧠 What is it?

The `MeetupList` component takes the `meetups` array and **maps** each meetup into a `MeetupItem` component. Each item receives the meetup's `id`, `image`, `title`, and `address` as props.

### ⚙️ How it works

```
meetups array → .map() → MeetupItem components → rendered list
```

This is pure React — the `.map()` pattern for rendering lists. Nothing NextJS-specific here.

### 💡 Insight

> This pattern — parent receives data, maps it into child components — is one of the most fundamental React patterns. You'll use it in virtually every project.

---

## Concept 5: Verifying It Works

### 🧠 What is it?

After saving the file and restarting the dev server (it may crash if you had empty pages earlier), visiting `localhost:3000` should display the meetup list with cards for each dummy meetup.

### ⚙️ How it works

- The styling isn't final yet — the items might look too wide or unstyled
- But seeing the list confirms that the page is loading and the component tree is working correctly
- The key verification: data flows from the page component → MeetupList → MeetupItem → rendered HTML

### 💡 Insight

> If your dev server crashes after adding content to previously empty page files, just restart it with `npm run dev`. NextJS sometimes needs a fresh start after structural changes.

---

## ✅ Key Takeaways

- The homepage is built as a component in `pages/index.js` with a default export
- **Page components** (in `pages/`) are routable; **regular components** (in `components/`) are not
- The `components/` folder name is not reserved — only `pages/` has special meaning
- Use dummy data to build and verify UI before connecting to a real backend
- The `.map()` pattern is the standard way to render lists in React

## ⚠️ Common Mistakes

- **Forgetting to export the page component as default** — NextJS won't render anything without it
- **Placing reusable components in the `pages/` folder** — They'll become unintended routes
- **Not restarting the dev server after structural changes** — Crashes can happen if pages were previously empty

## 💡 Pro Tips

- Define dummy data as a **constant outside the component** (using `const` at the top level) to avoid recreating it on every render
- Each meetup object should include all fields the child component expects — check the component's props before building your data
- Later, the dummy data will be replaced with real data fetched from a database — the component structure won't need to change
