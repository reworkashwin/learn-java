# Creating a Next.js Project

## Introduction

Let's get our hands dirty. Before we can learn how Next.js works, we need a project to work in. Setting up a Next.js project is slightly different from a standard React project — it comes with its own scaffolding tool and requires specific configuration choices.

---

## Creating the Project

### ⚙️ The Command

```bash
npx create-next-app@latest your-project-name
```

This is similar to how `create-react-app` or `npm create vite` works — it scaffolds a complete project with the right structure and dependencies.

### Configuration Questions

During setup, you'll be asked:
- **TypeScript?** — Optional (we'll skip it for this course)
- **ESLint?** — Yes, for code quality
- **Tailwind CSS?** — Optional (we'll skip to keep styling minimal)
- **App Router?** — **Yes** — this is the modern Next.js routing approach
- **Import alias?** — No (not needed for now)

### After Creation

```bash
cd your-project-name
npm install    # Ensure all dependencies are installed
npm run dev    # Start the development server
```

Visit the URL shown in the terminal (usually `http://localhost:3000`) to see your app.

---

## Project Structure

The most important folder is **`app/`** — this is where your pages, layouts, and components live in a modern Next.js project.

```
your-project-name/
├── app/              ← Your pages and layouts go here
│   ├── page.js       ← The home page
│   ├── layout.js     ← The root layout (wraps all pages)
│   └── globals.css
├── public/           ← Static assets (images, etc.)
├── package.json
└── next.config.js
```

### Reserved Filenames

Next.js uses **reserved filenames** in the `app/` directory:
- **`page.js`** — Defines a route/page
- **`layout.js`** — Defines a layout that wraps pages
- More reserved names will be introduced throughout the section

---

## ✅ Key Takeaways

- Use `npx create-next-app` to scaffold a Next.js project
- The **`app/`** folder is the heart of your project — routes, pages, and layouts live here
- Always confirm the **App Router** when prompted — it's the modern approach
- `npm run dev` starts the development server with hot reloading

## ⚠️ Common Mistakes

- Skipping the App Router option — the older Pages Router has different patterns
- Not running `npm install` after cloning or creating the project

## 💡 Pro Tip

If you're following along with a course or tutorial, make sure your `app/` and `public/` folders match the instructor's starting snapshot exactly. Small differences in file structure can lead to confusing routing issues later.
