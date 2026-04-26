# Don't Store Files Locally on the Filesystem

## Introduction

You fixed the caching issue — new meals now show up after submission. But wait... the **image is missing**. The meal title and description are there, but the photo is gone. What happened?

This is a common gotcha in Next.js production deployments. It comes down to how the `public` folder works in development vs. production — and why storing user-uploaded files on the local filesystem is a recipe for trouble.

---

### Concept 1: The Public Folder in Development vs. Production

#### 🧠 What is it?

The `public` folder in a Next.js project serves static assets (images, fonts, etc.) that are accessible via URL. During **development**, Next.js reads directly from this folder. But during **production builds**, the contents are copied into the `.next` folder — and that's what the production server actually uses.

#### ❓ Why do we need it?

Understanding this distinction is critical. If you're storing user-uploaded images in `public/images/` during runtime, those files exist in the `public` folder but **not** in the `.next` folder. The production server doesn't know they exist.

#### ⚙️ How it works

Here's the timeline of the problem:

1. `npm run build` → Contents of `public/` are copied into `.next/`
2. `npm start` → The production server serves files from `.next/`, not from `public/`
3. A user uploads an image → It's saved to `public/images/`
4. The production server tries to serve the image → It looks in `.next/` → **File not found**

The image was saved to the right place for development, but the production server doesn't care about the `public` folder after the build.

#### 💡 Insight

Think of it this way: `npm run build` takes a snapshot of your `public` folder. Anything added after that snapshot is invisible to the production server. It's like taking a photo of your bookshelf — adding a new book to the shelf doesn't change the photo.

---

### Concept 2: Why Local File Storage Doesn't Work in Production

#### 🧠 What is it?

Storing user-generated files (images, documents, etc.) directly on the server's filesystem is fundamentally incompatible with modern deployment architectures — not just in Next.js, but in most production setups.

#### ❓ Why do we need it?

Beyond the `.next` folder issue, there are several reasons local storage fails in production:

- **Serverless deployments** (like Vercel) don't have persistent filesystems — files disappear between invocations
- **Horizontal scaling** means multiple server instances — a file saved on one instance doesn't exist on another
- **Redeployments** replace the entire application — uploaded files are wiped

#### ⚙️ How it works

The solution recommended by the official Next.js documentation is to use **external file storage services** for any files generated at runtime:

- **AWS S3** — The most common choice for storing and serving files
- **Cloudinary** — Popular for image-specific use cases with built-in transformations
- **Google Cloud Storage** or **Azure Blob Storage** — Cloud-provider alternatives
- **Supabase Storage** — If you're already using Supabase

These services provide:
- Persistent storage that survives redeployments
- CDN distribution for fast global access
- URL-based access to serve files directly to users

#### 🧪 Example

Instead of saving an uploaded image to `public/images/`:

```js
// ❌ Don't do this in production
fs.writeFileSync(`public/images/${filename}`, imageBuffer);
```

You'd upload to an external service:

```js
// ✅ Do this instead
const url = await uploadToS3(imageBuffer, filename);
// Save the URL to your database, not the file locally
```

Then reference the image by its external URL rather than a local path.

#### 💡 Insight

This is a lesson that applies far beyond Next.js. In any modern web application, **user-generated content should be stored externally**. Local filesystem storage is fine for development and prototyping, but never for production.

---

## ✅ Key Takeaways

- The `public` folder is copied into `.next/` at build time — files added later are invisible to the production server
- User-uploaded files stored in `public/` will work in development but **break in production**
- The official Next.js recommendation is to use external file storage services (like AWS S3) for runtime-generated files
- This isn't just a Next.js limitation — it's a fundamental constraint of serverless and scalable architectures
- When deploying, you technically don't even need to deploy the `public` folder — Next.js doesn't use it in production

## ⚠️ Common Mistakes

- **Storing uploads in `public/` and assuming it'll work in production** — it won't
- **Not testing with a production build** — this issue only surfaces with `npm run build` + `npm start`
- **Confusing build-time assets with runtime assets** — static images you include in your project are fine in `public/`; user uploads are not

## 💡 Pro Tips

- For development/prototyping, local storage is perfectly fine — just know it won't survive deployment
- If you're using Vercel for deployment, they have built-in blob storage that integrates nicely with Next.js
- Store the **URL** of the uploaded file in your database, not the file path — this makes switching storage providers easy
- The `.next` folder is the source of truth for the production server — everything the server needs lives there
