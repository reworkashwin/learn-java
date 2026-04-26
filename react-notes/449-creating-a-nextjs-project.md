# Creating a Next.js Project (Pages Router)

## Introduction

Now that we understand what the Pages Router is and why it matters, let's actually create a Next.js project that uses it. The setup process is almost identical to creating an App Router project — with one critical difference in the configuration. Let's walk through it step by step.

---

## Concept 1: Setting Up the Project

### 🧠 What is it?

Creating a new Next.js project with the Pages Router uses the same `npx create-next-app` command. The key difference is **answering "No"** when asked whether you want to use the App Router.

### ⚙️ How it works

1. Open your terminal and navigate to the folder where you want the project
2. Run the creation command:

```bash
npx create-next-app
```

3. Answer the setup questions:

| Question | Answer |
|----------|--------|
| Project name | `nextjs-essentials-pages-router` (or your choice) |
| TypeScript? | No |
| ESLint? | No |
| Tailwind CSS? | No |
| `src/` directory? | No |
| **App Router?** | **No** ← This is the critical one! |
| Import alias? | No |

### 🧪 Example

```bash
$ npx create-next-app
✔ What is your project named? nextjs-essentials-pages-router
✔ Would you like to use TypeScript? No
✔ Would you like to use ESLint? No
✔ Would you like to use Tailwind CSS? No
✔ Would you like to use `src/` directory? No
✔ Would you like to use App Router? (recommended) No
```

### 💡 Insight

Notice that the prompt says App Router is "recommended" — and it is for new projects. But since we're learning the Pages Router approach specifically, we need to opt out. The tool is the same; it's just the generated folder structure that changes.

---

## Concept 2: Project Structure Overview

### 🧠 What is it?

After creation, the Pages Router project has a noticeably different structure compared to an App Router project. Instead of an `app/` directory, you get a `pages/` directory.

### ⚙️ How it works

The generated project should contain:

```
├── pages/          ← Where your routes live
├── public/         ← Static assets (images, etc.)
├── styles/         ← CSS files
├── package.json    ← Dependencies and scripts
└── (config files)  ← next.config.js, etc.
```

The three key folders:
- **`pages/`** — The most important folder. This is where file-based routing happens.
- **`public/`** — Holds static resources like images
- **`styles/`** — Contains CSS stylesheets

### 💡 Insight

The configuration files you see might vary depending on when you run the command — Next.js updates its templates over time. The core folders (`pages`, `public`, `styles`) are what matter.

---

## Concept 3: Using the Attached Snapshot

### 🧠 What is it?

To ensure everyone has the exact same starting point, a project snapshot is provided as a download. If the default template has changed since the course was recorded, this snapshot guarantees consistency.

### ⚙️ How it works

If you use the attached snapshot instead of creating fresh:

1. Download and extract the snapshot
2. Open it in your editor
3. Run `npm install` to install dependencies

```bash
npm install
```

This step is necessary because the `node_modules/` folder isn't included in the snapshot — it would be too large. The `npm install` command reads `package.json` and downloads everything you need.

### 💡 Insight

This is a standard practice in any Node.js project. The `node_modules/` folder is always excluded from version control and shared snapshots. Running `npm install` recreates it from the dependency definitions in `package.json`.

---

## ✅ Key Takeaways

- Use the same `npx create-next-app` command for Pages Router projects
- The critical step is answering **"No"** to the App Router question
- The resulting project has `pages/`, `public/`, and `styles/` directories
- If using a downloaded snapshot, always run `npm install` first
- The `pages/` folder is where all routing magic happens with the Pages Router

## ⚠️ Common Mistakes

- Accidentally saying "Yes" to the App Router question and ending up with the wrong project structure
- Forgetting to run `npm install` after downloading a project snapshot
- Assuming the generated template will look identical regardless of when you run the command — templates evolve

## 💡 Pro Tips

- Use the provided snapshot for consistency if you're following along with the course
- You can always check which router a project uses by looking for `pages/` (Pages Router) vs. `app/` (App Router)
- The project name doesn't affect functionality — name it whatever makes sense to you
