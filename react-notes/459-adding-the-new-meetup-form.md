# Adding the New Meetup Form

## Introduction

Our homepage is rendering a list of meetups — now let's build the page where users can **create** new meetups. In this lesson, we set up the New Meetup page, wire up a pre-built form component, and handle form submission. We also touch on **CSS Modules** (supported by NextJS out of the box) and reinforce how page components and regular components work together.

---

## Concept 1: Creating the New Meetup Page

### 🧠 What is it?

The New Meetup page lives at `pages/new-meetup/index.js`. It's a page component that renders a form allowing users to input meetup details (title, image URL, address, description).

### ❓ Why do we need it?

A meetup app isn't useful if you can only view meetups — you need to be able to **create** them too. This page is the "C" in CRUD (Create, Read, Update, Delete).

### ⚙️ How it works

```jsx
// pages/new-meetup/index.js
import NewMeetupForm from '../../components/meetups/NewMeetupForm';

function NewMeetupPage() {
  function addMeetupHandler(enteredMeetupData) {
    console.log(enteredMeetupData);
  }

  return <NewMeetupForm onAddMeetup={addMeetupHandler} />;
}

export default NewMeetupPage;
```

The page component itself is thin — it delegates the form rendering to `NewMeetupForm` and defines a handler function for what happens when the form is submitted.

### 💡 Insight

> Notice the pattern: the page component handles the *logic* (what to do with the data), while the form component handles the *UI* (rendering inputs and collecting data). This separation makes both components reusable and testable.

---

## Concept 2: How the NewMeetupForm Component Works

### 🧠 What is it?

`NewMeetupForm` is a pre-built React component that:

1. Renders a form with input fields (title, image URL, address, description)
2. Uses **refs** (`useRef`) to extract user input — a built-in React feature, nothing NextJS-specific
3. Calls the `onAddMeetup` prop function with the collected data when the form is submitted
4. Uses **CSS Modules** for scoped styling

### ⚙️ How it works

The component expects a single prop — `onAddMeetup` — which should be a function. When the user clicks "Add Meetup":

1. The form's submit handler fires
2. Refs extract the current values from each input field
3. An object is built with all the meetup data
4. The `onAddMeetup` function (passed from the parent) is called with this object

```
User fills form → Submit → Refs extract values → onAddMeetup(data)
```

### 💡 Insight

> Using refs for form data is one approach in React. The alternative is **controlled components** (using `useState` for each input). Refs are simpler for forms where you only need values on submission, not during typing.

---

## Concept 3: CSS Modules in NextJS

### 🧠 What is it?

CSS Modules are a styling approach where CSS classes are **scoped to a specific component**. NextJS supports them out of the box — no extra configuration needed.

### ❓ Why do we need it?

In large applications, CSS class names can collide. If two components both define `.card`, they'll interfere with each other. CSS Modules solve this by automatically generating unique class names at build time.

### ⚙️ How it works

1. Name your CSS file with the `.module.css` extension (e.g., `NewMeetupForm.module.css`)
2. Import it in your component: `import classes from './NewMeetupForm.module.css'`
3. Use it: `<div className={classes.form}>`

NextJS handles the transformation — each class name becomes something like `NewMeetupForm_form__x7k2j`, ensuring no collisions.

### 💡 Insight

> CSS Modules give you the simplicity of regular CSS with the safety of scoped styles. No need for styled-components or CSS-in-JS libraries unless you prefer them.

---

## Concept 4: Wiring Up the Handler — Props as Communication

### 🧠 What is it?

The `addMeetupHandler` function in the page component receives the form data when the user submits. For now, it just logs the data to the console. Later, it will send the data to a backend API.

### ❓ Why do we need it?

The form component shouldn't know *where* the data goes — that's the page component's job. By passing a handler function as a prop, we keep the form component focused on collecting data and the page component focused on deciding what to do with it.

### ⚙️ How it works

```jsx
// In the page component:
function addMeetupHandler(enteredMeetupData) {
  console.log(enteredMeetupData);
  // Later: send to API, navigate away, etc.
}

return <NewMeetupForm onAddMeetup={addMeetupHandler} />;
```

Important: pass a **pointer** to the function (`addMeetupHandler`), NOT the result of calling it (`addMeetupHandler()`). The form component will call it when it's ready.

### 🧪 Example

After filling in the form and clicking "Add Meetup", the console logs:

```json
{
  "title": "Test",
  "image": "https://upload.wikimedia.org/...",
  "address": "Test Address",
  "description": "This is a test"
}
```

### 💡 Insight

> This "pass a handler down, call it from the child" pattern is React's bread and butter. It's how child components communicate upward to parent components. Master it — you'll use it everywhere.

---

## Concept 5: Current Limitations

### 🧠 What is it?

At this point, the form works but has several limitations:

- The data isn't saved anywhere (just logged to console)
- There's no navigation after submission
- There's no way to navigate between pages (no navigation bar)
- Pages take up the full width with no general layout

### ❓ Why do we need it?

Identifying what's missing helps us understand what to build next. These limitations set the stage for the upcoming lessons on layout wrappers, navigation, API routes, and database integration.

### 💡 Insight

> Building incrementally — get the basics working, then add features one by one — is how professional developers work. Don't try to build everything at once.

---

## ✅ Key Takeaways

- The New Meetup page delegates form rendering to a dedicated `NewMeetupForm` component
- The page component defines the **handler logic**; the form component handles the **UI**
- **CSS Modules** (`.module.css`) provide scoped styling in NextJS with zero configuration
- Pass handler functions as props — pass the reference, not the invocation
- Currently, data is only logged — backend integration comes later

## ⚠️ Common Mistakes

- **Calling the handler function instead of passing a reference** — `onAddMeetup={addMeetupHandler()}` executes immediately and passes the return value, not the function itself
- **Forgetting to export the page component** — The page will render blank
- **Not restarting the dev server** — If you added pages when the server was running with empty files, you may need to restart

## 💡 Pro Tips

- Use `console.log` liberally during development to verify data flows correctly before connecting to a backend
- CSS Modules are the recommended styling approach in NextJS — they're simple, performant, and built-in
- When a form component expects a prop like `onAddMeetup`, always check the component source to understand what data it passes back
