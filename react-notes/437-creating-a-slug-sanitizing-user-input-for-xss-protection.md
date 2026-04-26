# Creating a Slug & Sanitizing User Input for XSS Protection

## Introduction

When users submit data through a form, you can't just blindly store and display it. Two critical tasks come first: generating a **URL-friendly slug** from the title, and **sanitizing user input** to protect against cross-site scripting (XSS) attacks. This section covers both — why they matter, and how to implement them with the `slugify` and `xss` packages.

---

## Concept 1: Generating a Slug with `slugify`

### 🧠 What is it?

A slug is a URL-friendly version of a string — typically a title. For example, `"My Awesome Meal"` becomes `"my-awesome-meal"`. Slugs are used in URLs to make them human-readable and SEO-friendly.

### ❓ Why do we need it?

In our meals app, each meal needs a unique, clean identifier for its URL. We don't want URLs like `/meals/My%20Awesome%20Meal` — we want `/meals/my-awesome-meal`. Instead of asking users to provide this, we generate it automatically from the title.

### ⚙️ How it works

**Step 1:** Install the `slugify` package

```bash
npm install slugify
```

**Step 2:** Import and use it in your data layer

```js
import slugify from "slugify";

const slug = slugify(meal.title, { lower: true });
```

The `{ lower: true }` option forces all characters to lowercase, ensuring consistent slug formatting.

**Step 3:** Attach the slug to your meal object

```js
meal.slug = slug;
```

### 💡 Insight

Rather than creating separate variables, you can add properties directly to the meal object on the fly. This keeps your code concise and your data object self-contained.

---

## Concept 2: Protecting Against XSS with the `xss` Package

### 🧠 What is it?

Cross-site scripting (XSS) is a security vulnerability where an attacker injects malicious scripts into content that other users will see. If you're storing user-generated content and later rendering it as HTML, you're vulnerable.

### ❓ Why do we need it?

In this app, meal instructions are entered by users and later rendered as raw HTML using `dangerouslySetInnerHTML`. That means if someone submits `<script>alert('hacked!')</script>` as their instructions, that script would execute in every user's browser. That's a serious security hole.

### ⚙️ How it works

**Step 1:** Install the `xss` package

```bash
npm install xss
```

**Step 2:** Import and use it to sanitize user input

```js
import xss from "xss";

meal.instructions = xss(meal.instructions);
```

The `xss()` function strips out or escapes any dangerous HTML tags and attributes (like `<script>`, `onclick`, etc.) while preserving safe content.

### 🧪 Example

```js
import slugify from "slugify";
import xss from "xss";

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  // ... continue with saving
}
```

Before sanitization:
```
Instructions: "Mix well <script>stealCookies()</script> and serve."
```

After sanitization:
```
Instructions: "Mix well &lt;script&gt;stealCookies()&lt;/script&gt; and serve."
```

The malicious script tag is escaped and rendered as harmless text.

### 💡 Insight

This is a golden rule of web development: **never trust user input**. Even if your form looks innocent, anyone can bypass client-side checks using browser DevTools. Always sanitize on the server side before storing *and* before rendering.

---

## Concept 3: Putting It All Together in `saveMeal`

### 🧠 What is it?

The `saveMeal` function in our data layer (`meals.js`) is where we prepare user-submitted data before persisting it. This is the right place to handle slug generation and input sanitization — *before* anything hits the database.

### ⚙️ How it works

```js
import slugify from "slugify";
import xss from "xss";

export async function saveMeal(meal) {
  // Generate a URL-friendly slug from the title
  meal.slug = slugify(meal.title, { lower: true });

  // Sanitize instructions to prevent XSS
  meal.instructions = xss(meal.instructions);

  // Next: handle image storage and database insertion...
}
```

### 💡 Insight

Notice we're mutating the `meal` object directly rather than creating new variables. This is a practical pattern — you're preparing the object for storage, so modifying it in place makes sense. The slug and sanitized instructions become part of the same data structure that eventually gets saved.

---

## ✅ Key Takeaways

- Use `slugify` to generate clean, lowercase, URL-friendly slugs from user-provided titles
- Use the `xss` package to sanitize any user input that will be rendered as HTML
- Always sanitize on the **server side** — client-side validation alone is never enough
- Perform data preparation (slugs, sanitization) in your data layer, before database insertion
- Both packages are lightweight and easy to integrate

## ⚠️ Common Mistakes

- Forgetting to sanitize content that's rendered with `dangerouslySetInnerHTML` — this is the most common XSS vector in React
- Relying only on client-side validation (HTML `required` attributes, form checks) for security
- Not forcing lowercase in slugs, leading to inconsistent URLs

## 💡 Pro Tips

- Install both packages together: `npm install slugify xss`
- The `slugify` package supports many configuration options beyond `lower` — check its docs for handling special characters, custom replacements, etc.
- Consider sanitizing *all* text fields, not just the ones you render as HTML — defense in depth is always a good strategy
