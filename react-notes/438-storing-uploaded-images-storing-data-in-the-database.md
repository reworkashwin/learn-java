# Storing Uploaded Images & Storing Data in the Database

## Introduction

We've generated our slug and sanitized our input — now comes the heavy lifting. We need to take the image a user uploaded, save it to the file system, and then persist all the meal data (including the image path) into our SQLite database. This section walks through the complete flow: extracting the file extension, writing the image using Node.js streams, preparing the SQL statement, and protecting against SQL injection.

---

## Concept 1: Why Store Images on the File System, Not the Database

### 🧠 What is it?

When a user uploads a file (like a meal photo), you have two options: store the file directly in the database, or store it on the file system and save just the *path* in the database.

### ❓ Why do we need it?

Storing files directly in a database is a **bad idea for performance**. Databases are optimized for structured data (text, numbers, relationships) — not binary blobs like images. Reading and writing large files through a database adds unnecessary overhead, slows down queries, and bloats your database size.

### ⚙️ How it works

The strategy:
1. Save the image file to the `public/images/` folder on the server's file system
2. Store only the **path** to that image (e.g., `/images/my-meal.jpg`) in the database
3. Since Next.js serves the `public/` folder at the root level, the image becomes publicly accessible

### 💡 Insight

Think of a database like a filing cabinet — great for documents, terrible for storing actual physical objects. The file system is the shelf; the database just holds a label pointing to where on the shelf to look.

---

## Concept 2: Extracting the File Extension and Generating a Unique Filename

### 🧠 What is it?

When a user uploads an image, we need to save it with a predictable, unique filename. We extract the original file extension (`.jpg`, `.png`, etc.) and combine it with the meal's slug to create a clean filename.

### ⚙️ How it works

```js
const extension = meal.image.name.split(".").pop();
const fileName = `${meal.slug}.${extension}`;
```

- `meal.image` is the file object from the form
- `meal.image.name` gives us the original filename (e.g., `photo.jpg`)
- `.split(".").pop()` extracts just the extension
- We use the slug (not the original filename) to keep things clean and unique

### 💡 Insight

Using the slug as the filename means the image URL is predictable and consistent with the meal's URL. If the meal slug is `pasta-carbonara`, the image will be `pasta-carbonara.jpg`.

---

## Concept 3: Writing the Image Using Node.js Streams

### 🧠 What is it?

Node.js provides the `fs` (file system) module to read and write files. We use `createWriteStream` to write the uploaded image data to a file on disk.

### ❓ Why do we need it?

We need to physically save the image bytes to a file. Streams are efficient for this because they handle data in chunks rather than loading everything into memory at once.

### ⚙️ How it works

```js
import fs from "node:fs";

const stream = fs.createWriteStream(`public/images/${fileName}`);

const bufferedImage = await meal.image.arrayBuffer();

stream.write(Buffer.from(bufferedImage), (error) => {
  if (error) {
    throw new Error("Saving image failed!");
  }
});
```

Let's break this down step by step:

1. **`createWriteStream`** — Creates a writable stream pointing to the target file path
2. **`meal.image.arrayBuffer()`** — Converts the uploaded file object into an ArrayBuffer (this is async, so we `await` it)
3. **`Buffer.from(bufferedImage)`** — Converts the ArrayBuffer into a Node.js Buffer, which is what `stream.write()` expects
4. **The callback** — The second argument to `write()` is a function that fires when writing is complete. If `error` is truthy, something went wrong

### 🧪 Example

The full image-saving flow:

```js
export async function saveMeal(meal) {
  // ... slug and sanitization from before ...

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });

  // Replace the image object with just the path
  meal.image = `/images/${fileName}`;
}
```

### ⚠️ Important Detail

Notice we store `/images/${fileName}` (without `public/`) in the database. That's because Next.js serves everything inside `public/` at the root level automatically. So a file at `public/images/pasta.jpg` is accessed via `/images/pasta.jpg`.

### 💡 Insight

The `async` keyword on `saveMeal` is required because `arrayBuffer()` returns a Promise. Without `await`, you'd be trying to write an unresolved Promise instead of actual image data.

---

## Concept 4: Storing Meal Data in the Database (Safely)

### 🧠 What is it?

With the image saved and the path stored on the meal object, we can now insert the complete meal record into our SQLite database using `better-sqlite3`.

### ❓ Why do we need it?

The meal data (title, summary, instructions, creator info, image path, slug) needs to be persisted so it can be retrieved and displayed later.

### ⚙️ How it works

```js
db.prepare(`
  INSERT INTO meals
    (title, summary, instructions, creator, creator_email, image, slug)
  VALUES (
    @title,
    @summary,
    @instructions,
    @creator,
    @creator_email,
    @image,
    @slug
  )
`).run(meal);
```

**Key points:**

- We use **prepared statements** with `@fieldName` placeholders instead of string interpolation — this protects against **SQL injection attacks**
- The `@title`, `@summary`, etc. syntax is specific to `better-sqlite3` — it automatically extracts values from the object passed to `.run()`
- The `id` field is excluded because it auto-increments
- The **order of fields** in the column list must match the order of placeholders

### ⚠️ Why not just interpolate values directly?

```js
// ❌ NEVER do this — vulnerable to SQL injection
db.prepare(`INSERT INTO meals (title) VALUES ('${meal.title}')`).run();

// ✅ Always use parameterized queries
db.prepare(`INSERT INTO meals (title) VALUES (@title)`).run(meal);
```

### 💡 Insight

Getting commas right in SQL statements is crucial. A missing or extra comma will cause a cryptic error. Double-check your field lists match your value placeholders exactly.

---

## Concept 5: Redirecting After Submission

### 🧠 What is it?

After successfully saving a meal, we want to redirect the user to the meals listing page so they can see their new entry.

### ⚙️ How it works

```js
import { redirect } from "next/navigation";

export async function shareMeal(formData) {
  const meal = { /* ... extract form data ... */ };
  await saveMeal(meal);
  redirect("/meals");
}
```

The `redirect()` function from `next/navigation` performs a server-side redirect to the specified path. It's the standard way to navigate after a Server Action completes.

### 💡 Insight

The redirect happens on the server, so the user's browser receives the new page directly — no client-side navigation delay.

---

## ✅ Key Takeaways

- **Never store files in the database** — use the file system and store only the path
- Use `createWriteStream` from Node.js `fs` module to write uploaded files
- Convert uploaded files to a Buffer: `Buffer.from(await file.arrayBuffer())`
- Store image paths *without* the `public/` prefix since Next.js serves `public/` at root
- **Always use parameterized queries** (`@fieldName` syntax) to prevent SQL injection
- Use `redirect()` from `next/navigation` to navigate after successful form submission

## ⚠️ Common Mistakes

- Storing `public/images/...` in the database instead of just `/images/...` — the `public` prefix will cause broken image URLs
- Forgetting to mark `saveMeal` as `async` when using `await` on `arrayBuffer()`
- Interpolating user values directly into SQL strings — always use prepared statements
- Getting the field order wrong between the column list and value placeholders in SQL

## 💡 Pro Tips

- In production, you'd typically use a cloud storage service (S3, Cloudinary) instead of the local file system for image storage
- The `better-sqlite3` `@fieldName` syntax is a convenient shorthand — it maps object properties to SQL placeholders automatically
- Consider adding error handling around the database insertion as well, not just the file write
