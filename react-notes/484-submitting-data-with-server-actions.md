# Submitting Data with Server Actions

## Introduction

You've seen how server components can **fetch** data on the server. But what about **submitting** data? That's where **Server Actions** come in. Server Actions are form action functions that execute on the server, not in the browser. They're built on top of the form actions feature you learned earlier in the course — but with a crucial twist: the `"use server"` directive. Let's explore how they work, where you can define them, and the rules around using them.

---

## Concept 1: What Are Server Actions?

### 🧠 What is it?

A **Server Action** is an `async` function decorated with the `"use server"` directive that runs on the **server side** when triggered — typically as a form action. It's like a regular form action, but the execution happens on the server, not in the browser.

### ❓ Why do we need it?

- **Security** — sensitive operations (database writes, file operations) happen on the server
- **Simplicity** — no need to set up separate API endpoints for form submissions
- **Direct server access** — write to databases, file systems, etc. without an API layer

### ⚙️ How it works

1. Define an `async` function
2. Add `"use server"` inside the function body
3. Use it as the `action` prop on a `<form>`

```jsx
export default async function ServerActionsDemo() {
  async function saveUserAction(formData) {
    "use server";
    
    const name = formData.get('name');
    const email = formData.get('email');
    // Save to database, file system, etc.
    console.log('Saving user:', name, email);
  }

  return (
    <form action={saveUserAction}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit">Save User</button>
    </form>
  );
}
```

### 🧪 Example

When you submit the form:
- The `console.log` appears in the **terminal** (server log), not in the browser console
- The function executes on the server, with full access to server resources
- Form data is automatically sent to the server action

### 💡 Insight

Server Actions bridge the gap between frontend forms and backend logic. It's like having an API endpoint embedded right in your component — no separate route handlers needed.

---

## Concept 2: Server Actions in Client Components

### 🧠 What is it?

You **cannot define** a server action inside a client component file, but you **can use** one by importing it from a separate file.

### ❓ Why do we need it?

The `"use client"` and `"use server"` directives contradict each other — one says "run on the client," the other says "run on the server." You can't have both in the same file.

### ⚙️ How it works

**Step 1:** Create a separate file for server actions with `"use server"` at the **top of the file**:

```jsx
// actions/users.js
"use server";

import fs from 'node:fs/promises';

export async function saveUserAction(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  
  const data = await fs.readFile('dummy-db.json', 'utf-8');
  const users = JSON.parse(data);
  users.push({ name, email });
  await fs.writeFile('dummy-db.json', JSON.stringify(users, null, 2));
}
```

**Step 2:** Import and use it in a client component:

```jsx
// components/ServerActionsDemo.js
"use client";

import { saveUserAction } from '@/actions/users';

export default function ServerActionsDemo() {
  return (
    <form action={saveUserAction}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit">Save User</button>
    </form>
  );
}
```

### 🧪 Example

Notice the key differences:
- In a **server component file**: `"use server"` goes inside the function
- In a **separate actions file**: `"use server"` goes at the top of the file (marks all exports as server actions)
- The client component **imports** the action — it doesn't define it

### 💡 Insight

Putting `"use server"` at the top of a file tells React: "Everything exported from this file is a server action." This is the clean way to organize server actions for use across components.

---

## Concept 3: Key Rules for Server Actions

### 🧠 What is it?

A summary of the rules and constraints around server actions.

### ⚙️ How it works

| Rule | Detail |
|---|---|
| Must be `async` | Server action functions must use the `async` keyword |
| `"use server"` required | Either inside the function or at the top of the file |
| Can't define in client component files | `"use client"` and `"use server"` can't coexist in the same file |
| Can import into client components | Importing a server action from another file is allowed |
| Form actions are universal | Regular form actions work everywhere; server actions need special setup |
| Require special project setup | Only available in frameworks like Next.js |

### 💡 Insight

The build process is smart enough to handle imports across the server/client boundary. When you import a server action into a client component, the bundler keeps the action on the server and creates a network bridge so the client can trigger it remotely.

---

## ✅ Key Takeaways

- **Server Actions** are `async` form action functions with the `"use server"` directive
- They execute on the **server**, not in the browser
- In server components, define them inline with `"use server"` inside the function
- In client components, define them in a **separate file** with `"use server"` at the top, then import
- You **cannot** define server actions in a `"use client"` file
- Server actions can access server resources (databases, file systems, etc.)

## ⚠️ Common Mistakes

- Trying to add `"use server"` inside a function in a `"use client"` file — this causes an error
- Forgetting the `async` keyword on server action functions
- Confusing form actions (works everywhere) with server actions (needs special setup)
- Adding `async` to a client component function (not allowed — remove it after converting)

## 💡 Pro Tips

- Create an `actions/` folder to organize your server actions by domain (users, posts, etc.)
- Remember that `"use server"` at the top of a file marks **all exports** as server actions
- Server actions are perfect for mutations — creating, updating, deleting data
- You can validate and sanitize form data inside server actions for added security
