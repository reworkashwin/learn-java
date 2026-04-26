# Adding Server-Side Input Validation

## Introduction

Our form has client-side validation — HTML `required` attributes that prevent empty submissions. But here's the harsh truth: **client-side validation is never enough**. Any user with browser DevTools can strip those attributes and submit garbage data straight to your server. In this section, we add proper server-side validation to our Server Action, ensuring bad data never reaches the database.

---

## Concept 1: Why Client-Side Validation Isn't Enough

### 🧠 What is it?

Client-side validation refers to checks that happen in the browser *before* the form data is sent to the server. In HTML, attributes like `required`, `minlength`, `type="email"`, etc., provide built-in browser validation.

### ❓ Why isn't it enough?

Because the client is **untrusted territory**. Anyone can:
- Open DevTools and remove `required` attributes
- Use tools like `curl` or Postman to send requests directly, bypassing the form entirely
- Modify the DOM to change form field types or constraints

If your only defense is client-side validation, a savvy user (or attacker) can submit anything they want.

### 💡 Insight

Think of client-side validation as a "friendly reminder" for honest users. Server-side validation is the actual security guard at the door. You need both, but only the server-side one actually protects your data.

---

## Concept 2: Building a Validation Helper

### 🧠 What is it?

Rather than repeating the same validation logic for every field, we create a small helper function that checks whether a text value is missing or empty.

### ⚙️ How it works

```js
function isInvalidText(text) {
  return !text || text.trim() === "";
}
```

This function returns `true` if:
- The text is `undefined`, `null`, or any other falsy value (`!text`)
- The text exists but is just whitespace after trimming (`text.trim() === ""`)

### 💡 Insight

This is a classic pattern — extract repetitive logic into a named helper. It makes your validation code readable at a glance: `isInvalidText(meal.title)` reads almost like English.

---

## Concept 3: Validating All Fields in the Server Action

### 🧠 What is it?

Inside our Server Action (the function that runs on the server when the form is submitted), we check every field before proceeding with the save operation.

### ⚙️ How it works

```js
export async function shareMeal(formData) {
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    creator: formData.get("creator"),
    creator_email: formData.get("creator_email"),
    image: formData.get("image"),
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    throw new Error("Invalid input");
  }

  await saveMeal(meal);
  redirect("/meals");
}
```

### 🧪 Breaking down each check

| Check | What it catches |
|-------|----------------|
| `isInvalidText(meal.title)` | Missing or empty title |
| `isInvalidText(meal.summary)` | Missing or empty summary |
| `isInvalidText(meal.instructions)` | Missing or empty instructions |
| `isInvalidText(meal.creator)` | Missing or empty creator name |
| `isInvalidText(meal.creator_email)` | Missing or empty email |
| `!meal.creator_email.includes("@")` | Email without @ symbol |
| `!meal.image` | No image uploaded |
| `meal.image.size === 0` | An empty/invalid file |

### 💡 Insight

This is intentionally simple validation. In production, you'd likely use a library like `zod` or `yup` for more robust schema validation. But the principle is the same — check everything on the server before trusting it.

---

## Concept 4: Handling Validation Errors (Current Approach)

### 🧠 What is it?

When validation fails, we throw an error. Next.js catches this and renders the nearest `error.js` boundary.

### ⚙️ How it works

```js
if (/* validation fails */) {
  throw new Error("Invalid input");
}
```

This triggers the error boundary — either the global `error.js` or a route-specific one. For a better experience, you'd create an error page specifically for the share route:

```jsx
// app/meals/share/error.js
"use client";

export default function ShareMealError() {
  return (
    <main>
      <h1>An error occurred!</h1>
      <p>Failed to create meal.</p>
    </main>
  );
}
```

### ⚠️ The problem with this approach

Throwing an error **destroys all user input**. The form is replaced by an error page, and the user has to start over. That's a terrible user experience for something as minor as a missing field.

### 💡 Insight

This works, but it's not ideal. A better approach would be to stay on the form page and display inline error messages — which is exactly what we'll tackle next using the `useFormState` hook (covered in a future section).

---

## Concept 5: Setting Up Route-Specific Error Boundaries

### 🧠 What is it?

Next.js allows you to create `error.js` files at any route level. When an error occurs in that route, this component is shown instead of the global error page.

### ⚙️ How it works

Place an `error.js` file in the route segment folder:

```
app/
  meals/
    share/
      page.js
      error.js  ← catches errors from the share page
  error.js      ← catches errors globally
```

The route-specific error boundary takes precedence over the global one for errors in that route.

### 💡 Insight

This is Next.js's file-based error handling at work. Each route can have its own error UI, giving you fine-grained control over error presentation.

---

## ✅ Key Takeaways

- **Client-side validation is a UX feature, not a security feature** — always validate on the server
- Create helper functions like `isInvalidText()` to keep validation code clean and DRY
- Check for: missing values, empty strings (after trim), invalid formats (like email without `@`), and invalid files (missing or zero-size)
- Throwing errors from Server Actions triggers the nearest `error.js` boundary
- Create route-specific `error.js` files for better error messages
- The throw-error approach works but destroys user input — inline error display is better UX

## ⚠️ Common Mistakes

- Relying solely on HTML `required` attributes for security
- Forgetting to validate the image (checking both existence and size)
- Not trimming text before checking if it's empty — `"   "` would pass a simple `=== ""` check
- Throwing errors for validation failures without considering the user's form data loss

## 💡 Pro Tips

- In production apps, use a validation library like `zod` for type-safe, composable validation schemas
- The `includes("@")` email check is minimal — consider using a regex or a library for proper email validation
- Server-side validation errors are a perfect use case for `useFormState` (or `useActionState` in newer React versions) — it lets you return errors to the form without destroying user input
- Always validate at the boundary between user input and your system — that's where attacks happen
