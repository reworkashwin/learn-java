# Adding Custom Components & CSS Modules

## Introduction

We've got our pages and routing set up, but now it's time to build out an actual detail page and make it look good. In this section, we'll create a reusable `MeetupDetail` component, learn the pattern of keeping page components lean by outsourcing JSX into standalone components, and explore **CSS Modules** — a built-in Next.js feature for scoping styles to individual components so they never clash.

---

## Concept 1: Building the MeetupDetail Component

### 🧠 What is it?

A standalone React component that's responsible for displaying the details of a single meetup — its image, title, address, and description.

### ❓ Why do we need it?

A best practice in Next.js projects is to keep **page component files lean**. Page files (inside the `pages/` folder) should focus on data fetching and routing logic, while the actual UI and styling live in dedicated components inside the `components/` folder.

### ⚙️ How it works

1. Create a `MeetupDetail` component in `components/meetups/`
2. Accept `image`, `title`, `address`, and `description` via props
3. Render the content using standard JSX
4. In the page component, import and use `MeetupDetail`, passing the data as props

### 🧪 Example

**`components/meetups/MeetupDetail.js`**
```jsx
function MeetupDetail(props) {
  return (
    <section>
      <img src={props.image} alt={props.title} />
      <h1>{props.title}</h1>
      <address>{props.address}</address>
      <p>{props.description}</p>
    </section>
  );
}

export default MeetupDetail;
```

**`pages/[meetupId]/index.js`**
```jsx
import MeetupDetail from '../../components/meetups/MeetupDetail';

function MeetupDetails() {
  return (
    <MeetupDetail
      image="https://example.com/image.jpg"
      title="A First Meetup"
      address="Some Street 5, Some City"
      description="This is a first meetup!"
    />
  );
}

export default MeetupDetails;
```

### 💡 Insight

This separation of concerns pays off when you start fetching real data — the page component handles `getStaticProps` or `getServerSideProps` for data, and the detail component just receives props and renders. Clean and testable.

---

## Concept 2: CSS Modules in Next.js

### 🧠 What is it?

CSS Modules is a feature that lets you **scope CSS class styles to a specific React component**. It prevents style clashes between components by automatically generating unique class names behind the scenes.

### ❓ Why do we need it?

Ever had a `.button` class in one component override the `.button` class in another? That's the classic CSS global scope problem. CSS Modules solve this by transforming your class names into unique identifiers — so your styles stay local to the component they belong to.

### ⚙️ How it works

1. **Name your CSS file** with the `.module.css` suffix — e.g., `MeetupDetail.module.css`
2. **Import it** using a special syntax: `import classes from './MeetupDetail.module.css'`
3. **Use the classes** via the imported object: `className={classes.detail}`

Under the hood, Next.js transforms `classes.detail` into something like `MeetupDetail_detail__x7k3q` — guaranteed to be unique.

### 🧪 Example

**`MeetupDetail.module.css`**
```css
.detail {
  text-align: center;
}

.detail img {
  width: 100%;
}
```

**`MeetupDetail.js`**
```jsx
import classes from './MeetupDetail.module.css';

function MeetupDetail(props) {
  return (
    <section className={classes.detail}>
      <img src={props.image} alt={props.title} />
      <h1>{props.title}</h1>
      <address>{props.address}</address>
      <p>{props.description}</p>
    </section>
  );
}

export default MeetupDetail;
```

### 💡 Insight

The `classes` object maps each CSS class name to its transformed, unique version. So `classes.detail` might resolve to `MeetupDetail_detail__x7k3q` at runtime. This is all handled automatically — you just write normal CSS and reference it through the object.

---

## Concept 3: Why Keep Page Components Lean?

### 🧠 What is it?

A design pattern where page component files contain minimal JSX and instead delegate rendering to imported components.

### ❓ Why do we need it?

- **Readability** — Page files stay focused on routing and data fetching
- **Reusability** — UI components can be used in multiple pages
- **Styling** — It's more natural to pair `.js` and `.module.css` files in the `components/` folder rather than cluttering the `pages/` folder
- **Separation of concerns** — Data logic in pages, presentation logic in components

### ⚙️ How it works

```
pages/
  [meetupId]/
    index.js          ← fetches data, passes props
components/
  meetups/
    MeetupDetail.js        ← renders UI
    MeetupDetail.module.css ← scoped styles
```

### ⚠️ Common Mistakes

- **Forgetting the `.module.css` suffix** — If you just name it `.css`, the styles will be global, not scoped. The `.module.css` extension is what activates the CSS Modules feature.
- **Using CSS Modules with element selectors** — CSS Modules scope by class name. If you write `img { ... }` without nesting it inside a class selector, it might not be scoped as expected.

---

## ✅ Key Takeaways

- Keep page components lean — outsource JSX and styling to dedicated components in the `components/` folder
- CSS Modules are activated by naming files with `.module.css`
- Import CSS Modules with `import classes from './File.module.css'` and use `className={classes.yourClass}`
- CSS Modules automatically generate unique class names, preventing style conflicts across components
- This pattern pairs nicely with Next.js's data-fetching features — pages fetch data, components render it

## 💡 Pro Tips

- You can use CSS Modules in page component files too — it's supported. But keeping styles with their components in the `components/` folder leads to a cleaner project structure
- CSS Modules only scope **class selectors**. Element selectors like `h1 { ... }` will still be global. Always wrap your styles in a class
