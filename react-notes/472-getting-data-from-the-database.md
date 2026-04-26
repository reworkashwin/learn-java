# Getting Data from the Database

## Introduction

We've been *storing* meetups in MongoDB — but we're still displaying dummy data on the frontend! That's like filling a fridge with food and then eating cardboard. Now it's time to **fetch real data from MongoDB** inside `getStaticProps` and display it on our pages. And here's the twist — we don't even need an API route for this. We can talk to the database **directly** from `getStaticProps`.

---

## Concept 1: Why Not Use an API Route for Fetching?

### 🧠 What is it?

You *could* create an API route (like `/api/meetups`) to fetch all meetups, then call that from `getStaticProps` using `fetch()`. But Next.js gives you a smarter option — skip the middleman and query the database directly inside `getStaticProps`.

### ❓ Why do we need it?

Sending a request from your own server to your own API is **redundant**. The code in `getStaticProps` already runs on the server (or at build time), never in the browser. So why make an extra HTTP roundtrip to yourself?

### ⚙️ How it works

- `getStaticProps` and `getServerSideProps` only run **on the server** or **during build time**
- Code inside them is **never exposed to the client**
- So you can safely import server-side packages (like `mongodb`) and use them directly
- Next.js is smart enough to **exclude server-only imports** from the client-side bundle

### 💡 Insight

This is one of Next.js's most elegant features. If you import a package and only use it inside `getStaticProps`, Next.js **tree-shakes it out of the client bundle**. Your bundle stays small and your credentials stay safe. It's like having two separate codebases in one file.

---

## Concept 2: Fetching All Meetups in getStaticProps

### 🧠 What is it?

Instead of using dummy data, we connect to MongoDB directly inside `getStaticProps`, fetch all meetup documents, and pass them as props to our page component.

### ⚙️ How it works

1. Import `MongoClient` from `mongodb`
2. Connect to your MongoDB cluster inside `getStaticProps`
3. Access the database and collection
4. Use `.find().toArray()` to get all documents as a JavaScript array
5. Transform the data (especially the `_id` field) before returning it as props
6. Close the connection when done

### 🧪 Example

```javascript
import { MongoClient } from 'mongodb';

export async function getStaticProps() {
  const client = await MongoClient.connect('mongodb+srv://...');
  const db = client.db();
  const meetupsCollection = db.collection('meetups');

  const meetups = await meetupsCollection.find().toArray();

  client.close();

  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    revalidate: 1,
  };
}
```

### 💡 Insight

Notice we map `_id` to `id` and call `.toString()`. MongoDB's `_id` is an `ObjectId` — a complex object that can't be serialized directly into JSON. Converting it to a string fixes the serialization error and matches what our frontend components expect.

---

## Concept 3: The ObjectId Serialization Problem

### 🧠 What is it?

MongoDB automatically generates an `_id` field for every document. This isn't a simple string — it's a special `ObjectId` object. When Next.js tries to serialize props to send them to the client, it chokes on this complex object.

### ❓ Why do we need to handle it?

If you return raw MongoDB documents as props, you'll get a serialization error. Next.js needs all prop values to be plain, serializable JavaScript (strings, numbers, arrays of simple objects).

### ⚙️ How it works

- Use `.map()` to transform each meetup document
- Convert `_id` to a string with `meetup._id.toString()`
- Rename `_id` to `id` to match your frontend component expectations
- Only include the fields your component actually needs

### ⚠️ Common Mistake

Returning the raw MongoDB document directly as props — this will always fail with a serialization error because of the `ObjectId` type.

---

## Concept 4: Removing Dummy Data

### 🧠 What is it?

Once you're fetching real data from MongoDB, you can delete the hardcoded dummy data array from your page component. The page now renders entirely from the database.

### ⚙️ How it works

Simply remove the dummy array. Your `getStaticProps` provides the real data as props, and your component renders it just the same — but now with actual database-backed content.

### 💡 Insight

This is the power of `getStaticProps` — your page is **pre-rendered with real data** from the database. And since it's `getStaticProps` (not `getServerSideProps`), this happens during the build process and when revalidation kicks in — not on every single request. Best of both worlds: static performance with dynamic data.

---

## ✅ Key Takeaways

- Don't create API routes just to fetch data for your own pages — query the database directly in `getStaticProps`
- Server-only imports (like `mongodb`) are automatically excluded from the client bundle
- Always convert MongoDB's `ObjectId` to a string with `.toString()` before returning it as props
- Use `.find().toArray()` to get all documents as an array
- Close the database connection after you're done fetching

## ⚠️ Common Mistakes

- Sending a request to your own API route from `getStaticProps` — unnecessary roundtrip
- Forgetting `.toArray()` after `.find()` — you'll get a cursor, not an array
- Returning raw `_id` without `.toString()` — serialization error
- Not closing the database connection — resource leak

## 💡 Pro Tips

- You can import both client-side and server-side code in the same file — Next.js separates them into independent bundles automatically
- Consider refactoring the MongoDB connection code into a helper function to avoid duplication across pages
- The `revalidate` option ensures your static page stays fresh with new data from the database
