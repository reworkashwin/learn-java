# Sending HTTP Requests to Our API Routes

## Introduction

You've built an API route in Next.js — great! But an API that nobody talks to is like a phone that never rings. Now it's time to **connect your frontend to your backend** by sending HTTP requests from your React components to those API routes. The beautiful part? Since the API lives on the same server, there's no CORS headache, no external URLs — just clean, internal communication.

---

## Concept 1: Sending Requests to Internal API Routes

### 🧠 What is it?

When you create an API route in Next.js (e.g., `/api/new-meetup`), you can send HTTP requests to it from your frontend components — exactly the same way you'd send requests to any external API. You use `fetch()` or a library like Axios.

### ❓ Why do we need it?

Your form collects data on the client side, but it needs to reach the server to be stored in a database. The API route is your server-side handler — the bridge between the browser and your database. Without sending a request to it, your data just sits in the browser and vanishes when the page closes.

### ⚙️ How it works

1. In your page component (e.g., the "New Meetup" page), you define a handler function that receives the form data
2. Inside that handler, you use `fetch()` to send a **POST** request to your API route
3. The URL is just an **absolute path** like `/api/new-meetup` — no domain needed since it's the same server
4. You configure the request with `method`, `body` (JSON-stringified), and `headers`
5. Next.js triggers your API route handler automatically when a request hits that path

### 🧪 Example

```jsx
// pages/new-meetup/index.js
import { useRouter } from 'next/router';

function NewMeetupPage() {
  const router = useRouter();

  async function addMeetupHandler(enteredMeetupData) {
    const response = await fetch('/api/new-meetup', {
      method: 'POST',
      body: JSON.stringify(enteredMeetupData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data);

    router.push('/'); // Navigate back to the home page
  }

  return <NewMeetupForm onAddMeetup={addMeetupHandler} />;
}
```

### 💡 Insight

Since the API route lives on the **same server**, you don't need a full URL like `https://example.com/api/...`. A simple absolute path `/api/new-meetup` does the trick. The file name in your `pages/api/` folder determines the path — `new-meetup.js` maps to `/api/new-meetup`.

---

## Concept 2: Configuring the Fetch Request

### 🧠 What is it?

The `fetch()` function's second argument is a configuration object that lets you set the HTTP method, body, and headers — all the details your API route needs to properly handle the incoming request.

### ❓ Why do we need it?

By default, `fetch()` sends a **GET** request. But when you're submitting form data, you need a **POST** request with a JSON body. Without proper configuration, your API route won't receive the data correctly.

### ⚙️ How it works

- **`method: 'POST'`** — Tells the server this is a data submission, not a data fetch
- **`body: JSON.stringify(data)`** — Converts your JavaScript object to a JSON string for transmission
- **`headers: { 'Content-Type': 'application/json' }`** — Informs the server that the body is JSON-formatted

### 💡 Insight

The `enteredMeetupData` object from the form already has the right shape (`title`, `image`, `address`, `description`), so you can pass it directly to `JSON.stringify()` without restructuring it. Clean data flow from form → handler → API!

---

## Concept 3: Navigating After Submission

### 🧠 What is it?

After successfully submitting data to the API, you typically want to redirect the user — perhaps back to the home page — rather than leaving them staring at the form.

### ❓ Why do we need it?

It's a basic UX pattern: submit → confirm → redirect. Without it, users might accidentally re-submit or feel lost wondering "did it work?"

### ⚙️ How it works

1. Import `useRouter` from `next/router`
2. Get the router object: `const router = useRouter()`
3. After a successful response, call `router.push('/')` to navigate programmatically

You can also use `router.replace('/')` if you want to **prevent the user from going back** to the form with the browser's back button.

### 🧪 Example

```jsx
const router = useRouter();

// After successful submission:
router.push('/');      // User can go back with back button
// OR
router.replace('/');   // Replaces history — can't go back
```

### 💡 Insight

Everything after the API call — loading spinners, success messages, navigation — is **standard client-side React**. There's nothing Next.js-specific about it. The only Next.js-specific part was the API route itself.

---

## ✅ Key Takeaways

- Send requests to API routes using `fetch()` with an **absolute path** (e.g., `/api/new-meetup`)
- Always set `method: 'POST'`, stringify the body, and include the `Content-Type` header
- Use `useRouter` from `next/router` for programmatic navigation after submission
- The API route file name determines the URL path (without the `.js` extension)

## ⚠️ Common Mistakes

- Forgetting to set `method: 'POST'` — `fetch()` defaults to GET
- Not stringifying the body with `JSON.stringify()` — the server won't parse raw objects
- Using the wrong path — make sure it matches your file name in `pages/api/`
- Forgetting to make the handler function `async` when using `await`

## 💡 Pro Tips

- Check your MongoDB IP whitelist and credentials before testing — connection failures are the #1 source of confusion
- Open your browser dev tools to see the API response and verify everything works
- You can add loading states and error handling around the fetch call — it's just standard React patterns
