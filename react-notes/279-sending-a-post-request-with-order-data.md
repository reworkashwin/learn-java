# Sending a POST Request with Order Data

## Introduction

We've captured form data and cart items. Now it's time to send them to the backend. This lesson covers configuring a POST request with `fetch`, setting the right headers and body format, and verifying the submission on the server side. It also previews why we'll need better error handling and loading states.

---

## Sending the Request with fetch

Unlike the GET request for meals (which ran in `useEffect` on component load), this POST request fires **on demand** — inside `handleSubmit`, after the user submits the form:

```jsx
fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    order: {
      items: cartCtx.items,
      customer: customerData,
    },
  }),
});
```

### Breaking Down the Configuration

**`method: 'POST'`** — By default, `fetch` sends GET requests. We need POST because we're *sending* data, not requesting it.

**`headers: { 'Content-Type': 'application/json' }`** — Tells the backend "the data I'm sending is in JSON format, so parse it accordingly." Without this, many backends will reject or misinterpret the request body.

**`body: JSON.stringify(...)`** — `fetch` requires the body to be a string. `JSON.stringify` converts our JavaScript object into a JSON string. The backend then parses this string back into a usable object.

---

## The Request Body Structure

The backend expects this shape:

```json
{
  "order": {
    "items": [
      { "id": "m1", "name": "Margherita Pizza", "price": 12.99, "quantity": 2 }
    ],
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "street": "123 Main St",
      "postal-code": "12345",
      "city": "Springfield"
    }
  }
}
```

The `items` come from `cartCtx.items` (our context), and `customer` comes from the FormData extraction.

---

## Verifying the Submission

After submitting, you can verify it worked in two ways:

1. **Network tab** — Open DevTools → Network. You'll see an OPTIONS request (preflight) followed by the actual POST request. A 2xx status code means success.

2. **Backend data file** — Check `backend/data/orders.json`. Each successfully processed order appears here with an auto-generated `id`, the items array, and customer details.

---

## What's Missing (And Why It Matters)

At this point, the request *works*, but the user experience is lacking:

- **No loading indicator** — the user clicks "Submit Order" and nothing visually happens
- **No error handling** — if the request fails, there's no feedback
- **No success confirmation** — even when it succeeds, the form just sits there
- **Meals loading** — the initial meal fetch also lacks loading and error states

These UX gaps are exactly why the next lessons build a **custom HTTP hook** — to centralize request state management across the entire app.

---

## ✅ Key Takeaways

- POST requests require explicit configuration: `method`, `headers`, and `body`
- Always set `Content-Type: application/json` when sending JSON data
- `JSON.stringify` converts JavaScript objects to JSON strings for the request body
- The request can be verified via the browser's Network tab or by checking server-side data
- Fire-and-forget POST requests work technically but provide a poor user experience

## ⚠️ Common Mistakes

- Forgetting `Content-Type: application/json` — the backend won't parse the body correctly
- Sending a JavaScript object directly as the body without `JSON.stringify` — fetch sends `[object Object]` as a string
- Not checking whether field names in the request match what the backend expects

## 💡 Pro Tips

- POST requests are always preceded by an OPTIONS preflight request due to CORS — this is normal browser behavior, not double submission
- Always verify your API calls in the Network tab during development — it's the fastest way to catch data shape mismatches
