# Getting Started with the "Share Meal" Form

## Introduction

Now that users can browse and view meal details, the next step is letting them **share their own meals**. This means building a form where users can enter a meal's name, summary, instructions, and upload an image. This lecture sets up the form structure and lays the groundwork for the more advanced features coming next — a custom image picker and server-side form handling.

---

## The Share Meal Page

The form lives at `app/meals/share/page.js`. It contains a standard HTML form with:

- **Name** — the creator's name
- **Email** — the creator's email
- **Title** — the meal's title
- **Summary** — a short description (textarea)
- **Instructions** — detailed steps (textarea)
- **Image** — a file upload (custom component, coming soon)

```jsx
export default function ShareMealPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>Share your <span className={classes.highlight}>favorite meal</span></h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        <form className={classes.form}>
          <div className={classes.row}>
            <p>
              <label htmlFor="name">Your name</label>
              <input type="text" id="name" name="name" required />
            </p>
            <p>
              <label htmlFor="email">Your email</label>
              <input type="email" id="email" name="email" required />
            </p>
          </div>
          <p>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" required />
          </p>
          <p>
            <label htmlFor="summary">Short Summary</label>
            <input type="text" id="summary" name="summary" required />
          </p>
          <p>
            <label htmlFor="instructions">Instructions</label>
            <textarea id="instructions" name="instructions" rows="10" required />
          </p>
          {/* ImagePicker will go here */}
          <p className={classes.actions}>
            <button type="submit">Share Meal</button>
          </p>
        </form>
      </main>
    </>
  );
}
```

---

## Key Form Details

### The `name` Attribute Matters

Every input has a `name` attribute (`name="title"`, `name="email"`, etc.). This is critical because when we later use **Server Actions** to handle the form submission, we'll extract values using `formData.get('title')`, `formData.get('email')`, etc. The `name` attribute is the key that maps each input to its value.

### No Submit Handler Yet

At this point, the form doesn't have an `onSubmit` handler or an `action` prop. It's just raw HTML structure. We'll add form handling through **Server Actions** soon.

### Image Picker Placeholder

There's a placeholder where a custom `ImagePicker` component will go. This will be a more sophisticated upload experience with image previews — built in the next lectures.

---

## ✅ Key Takeaways

- The share meal form collects all the data needed to create a new meal record
- The `name` attribute on each input is essential for extracting form data later
- The form is a Server Component by default — no client-side logic needed for the basic structure
- Image uploading and form submission will be handled in upcoming lectures

## 💡 Pro Tip

When building forms in Next.js, resist the urge to immediately add `useState` for every input. With Server Actions (coming soon), you can handle form data without managing state at all — Next.js and the browser's built-in `FormData` API handle the heavy lifting.
