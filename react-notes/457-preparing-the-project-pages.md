# Preparing the Project Pages

## Introduction

Before we can build features, we need a foundation — and in NextJS, that means setting up our **page files**. In this lesson, we create the three pages our Meetup application needs, and along the way, we revisit file-based routing patterns including the **subfolder approach** and **dynamic folder names**. This is where the routing theory from earlier sections becomes hands-on practice.

---

## Concept 1: Identifying the Pages We Need

### 🧠 What is it?

Every NextJS app is structured around its pages. For our Meetup application, we need exactly three:

1. **Starting Page** (`/`) — Shows a list of all meetups
2. **New Meetup Page** (`/new-meetup`) — Allows users to add a new meetup
3. **Meetup Detail Page** (`/[meetupId]`) — Displays details for a single meetup (dynamic)

### ❓ Why do we need it?

Without pages, there's nothing to render. NextJS needs files in the `pages/` folder to know what routes your app supports. No file = no route.

### ⚙️ How it works

Before creating pages, we need to:

1. Run `npm install` to install all dependencies
2. Run `npm run dev` to start the development server

At this point, visiting localhost shows nothing because the `pages/` folder is empty. Time to fix that.

### 💡 Insight

> Think of the `pages/` folder as your app's table of contents. Each file is a chapter — and without entries, the book is blank.

---

## Concept 2: The Starting Page — index.js

### 🧠 What is it?

The file `pages/index.js` serves as the **home page** of your application. In NextJS, `index.js` is a special filename — it maps to the root path (`/`) of whatever folder it's in.

### ⚙️ How it works

- Place `index.js` directly in the `pages/` folder
- It automatically loads for `your-domain.com/` (the root URL)
- No extra configuration needed — NextJS handles the mapping

```
pages/
  index.js  →  loads at "/"
```

### 💡 Insight

> `index.js` in NextJS works just like `index.html` in traditional web servers — it's the default file served for a directory.

---

## Concept 3: The New Meetup Page — Subfolder Approach

### 🧠 What is it?

For the "Add New Meetup" page, we have two options to create a route at `/new-meetup`:

1. **File approach**: Create `pages/new-meetup.js`
2. **Subfolder approach**: Create `pages/new-meetup/index.js`

Both produce the exact same route. The choice is yours.

### ❓ Why do we need it?

The subfolder approach is useful when you anticipate **nested routes** under that path. Even if you don't need nested routes right now, some developers prefer the consistency of always using folders.

### ⚙️ How it works

```
Option A (file):          Option B (subfolder):
pages/                    pages/
  new-meetup.js             new-meetup/
                              index.js

Both → loads at "/new-meetup"
```

In this project, we go with the **subfolder approach** — but either works since we have no nested routes here.

### 💡 Insight

> If you're unsure which approach to pick, ask yourself: "Will this route ever have child routes?" If yes, go with the subfolder. If no, either works fine.

---

## Concept 4: The Meetup Detail Page — Dynamic Routes with Folders

### 🧠 What is it?

The detail page needs a **dynamic route** because each meetup has a unique ID. We want URLs like `/some-meetup-id` to load the same page component but with different data.

### ❓ Why do we need it?

Hard-coding a page for every single meetup would be impossible — you'd need infinite files. Dynamic routes let a single page file handle any number of meetup IDs.

### ⚙️ How it works

We use square brackets in the filename to create a dynamic segment:

```
pages/
  [meetupId]/
    index.js  →  loads at "/:meetupId"
```

Here's the key insight: **even folder names can be dynamic**. Wrapping the folder name in square brackets (`[meetupId]`) makes it a dynamic path segment, just like a dynamic filename would.

This is equivalent to creating `pages/[meetupId].js`, but using the folder approach gives you the option of adding nested pages under that dynamic segment later.

### 🧪 Example

```
URL: /m1        → [meetupId] = "m1"
URL: /m2        → [meetupId] = "m2"
URL: /abc-123   → [meetupId] = "abc-123"
```

The value inside the brackets is accessible via `useRouter()` inside the component.

### 💡 Insight

> Dynamic folders are a powerful pattern you might not see in beginner tutorials. They let you build deeply nested dynamic routes — like `/users/[userId]/posts/[postId]` — cleanly and intuitively.

---

## Concept 5: The Final Page Structure

### 🧠 What is it?

After creating all three pages, our `pages/` folder looks like this:

```
pages/
  index.js              → "/"          (All Meetups)
  new-meetup/
    index.js             → "/new-meetup" (Add New Meetup)
  [meetupId]/
    index.js             → "/:meetupId"  (Meetup Detail)
```

### ⚙️ How it works

Three files, three routes, zero configuration. That's the beauty of file-based routing — the folder structure *is* the routing configuration.

### 💡 Insight

> Compare this to React Router, where you'd write `<Route path="/" />`, `<Route path="/new-meetup" />`, etc. In NextJS, the filesystem does all the routing work for you.

---

## ✅ Key Takeaways

- `index.js` in any folder maps to the root path of that folder
- You can use either **file-based** (`page-name.js`) or **subfolder-based** (`page-name/index.js`) routing — both work the same
- **Dynamic routes** use square brackets: `[paramName].js` or `[paramName]/index.js`
- **Dynamic folder names** are also supported, enabling nested dynamic routes
- The `pages/` folder structure *is* your routing configuration — no separate config file needed

## ⚠️ Common Mistakes

- **Forgetting to run `npm install`** before starting the dev server — always install dependencies first
- **Using nested folders when you don't need them** — it adds unnecessary complexity
- **Confusing file names with folder names** — `[meetupId].js` and `[meetupId]/index.js` are functionally identical

## 💡 Pro Tips

- Use the subfolder approach when you know (or suspect) a route will have child routes later
- Keep dynamic parameter names descriptive — `[meetupId]` is much clearer than `[id]`
- You can access dynamic route parameters with `useRouter().query.meetupId` inside the component
