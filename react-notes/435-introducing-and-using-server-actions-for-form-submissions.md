# Introducing & Using Server Actions for Handling Form Submissions

## Introduction

This is one of the most powerful features in the Next.js + React ecosystem: **Server Actions**. Instead of the traditional pattern of manually collecting form data, sending it to an API endpoint, and processing it on a server, Server Actions let you define a function that runs **on the server** and wire it up directly to a form's `action` prop. No API routes. No `fetch` calls. No `useState` for every input. It's form handling reimagined.

---

## The Traditional React Way

In a vanilla React app, handling form submission typically looks like this:

```jsx
function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  fetch('/api/meals', { method: 'POST', body: formData });
}

<form onSubmit={handleSubmit}>...</form>
```

You manually prevent the default, collect data, and send a request to a backend endpoint. Lots of boilerplate.

---

## What Are Server Actions?

A Server Action is a function with two special characteristics:

1. It contains the `'use server'` directive **inside its body**
2. It's marked as `async`

```jsx
async function shareMeal(formData) {
  'use server';
  // This code ONLY executes on the server
  console.log(formData);
}
```

This function is **guaranteed to execute only on the server**. The code inside it is never shipped to the browser. Just like Server Components run only on the server, Server Actions execute only on the server — but you must explicitly opt in with the `'use server'` directive.

---

## How to Use a Server Action With a Form

Instead of using `onSubmit`, you assign the Server Action to the form's `action` prop:

```jsx
export default function ShareMealPage() {
  async function shareMeal(formData) {
    'use server';

    const meal = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      instructions: formData.get('instructions'),
      image: formData.get('image'),
      creator: formData.get('name'),
      creator_email: formData.get('email'),
    };

    console.log(meal);
  }

  return (
    <form action={shareMeal}>
      {/* ...inputs... */}
      <button type="submit">Share Meal</button>
    </form>
  );
}
```

### What Happens When the Form Is Submitted

1. The user fills in the form and clicks "Share Meal"
2. Next.js **automatically prevents** the default browser submission
3. It collects all form data into a `FormData` object
4. It sends a request to the Next.js server behind the scenes
5. The `shareMeal` function executes **on the server** with the `FormData`
6. The page does **not** reload

---

## Extracting Data from FormData

The `formData` parameter is a standard web API `FormData` object. You extract values using `.get()` with the input's `name` attribute as the key:

```jsx
formData.get('title')     // value from <input name="title" />
formData.get('email')     // value from <input name="email" />
formData.get('image')     // the uploaded File object from <input name="image" />
```

This is why the `name` attribute on each input is so important. It's the identifier used to retrieve each value.

---

## Where Does the Output Go?

Since the Server Action runs on the server, any `console.log()` output appears in your **terminal** (where the dev server is running), not in the browser console. The browser never sees this code.

---

## Server Actions vs API Routes

| Feature | Server Actions | API Routes |
|---|---|---|
| Setup | Define a function with `'use server'` | Create a file in `app/api/` |
| Connection to form | Direct via `action` prop | Manual `fetch` call |
| Data collection | Automatic `FormData` | Manual |
| Client JS needed | No | Yes (for `fetch`) |
| File in browser bundle | No | N/A |

Server Actions are often simpler and more elegant for form handling in Next.js apps.

---

## The `action` Prop — Not What You Think

You might know the `action` attribute on HTML forms as a URL — the path to which the form data is sent. In React + Next.js, the `action` prop can also accept a **function**. This is a React feature (supported by Next.js) that changes the form's behavior entirely: instead of navigating to a URL, it calls your server function.

---

## ✅ Key Takeaways

- Server Actions are async functions with `'use server'` inside their body
- Assign them to a form's `action` prop — no `onSubmit`, no `preventDefault`, no `fetch`
- They execute **only on the server** — code is never shipped to the browser
- Form data is automatically collected into a `FormData` object passed as the first argument
- Use `formData.get('inputName')` to extract values by the input's `name` attribute

## ⚠️ Common Mistakes

- Forgetting to add `'use server'` inside the function body — without it, it's just a regular function
- Forgetting the `async` keyword — Server Actions must be async
- Not setting `name` attributes on form inputs — `formData.get()` returns `null` for missing names
- Looking for console output in the browser — it's logged in the server terminal

## 💡 Pro Tip

Server Actions aren't limited to form submissions. You can call them from event handlers in Client Components too — they're versatile server-side functions. But when paired with the `action` prop on forms, they're at their most elegant and powerful.
