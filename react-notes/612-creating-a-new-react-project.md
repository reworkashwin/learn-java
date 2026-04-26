# Creating a New React Project

## Introduction

Before we can write any React code, we need a React project to work in. There are several ways to set one up — locally on your machine or in the browser. Let's walk through the options and get a project ready to go.

---

### Concept 1: Ways to Create a React Project

#### 🧠 What is it?

There are multiple ways to start a new React project:

1. **Locally with Create React App** — Run `npx create-react-app my-app` in your terminal
2. **Browser-based with CodeSandbox** — Type `react.new` in your browser address bar for an instant cloud-based React project
3. **Using a pre-built starter project** — For most course sections, a starting project is provided as a zip file or CodeSandbox link

#### ❓ Why do we need it?

React isn't a single script you drop into an HTML file — it requires a **build process** that transforms your code (JSX, modern JavaScript features) into browser-compatible code. A project setup handles all of this for you.

---

### Concept 2: Setting Up a Local Project

#### ⚙️ How it works

1. **Prerequisites**: You must have **Node.js** installed on your system
2. **Download** the starting project (zip file) attached to the lecture
3. **Unzip** the file
4. **Run `npm install`** inside the unzipped folder to install all dependencies
   - You can ignore any warnings during installation
5. **Run `npm start`** to start the development server
6. Open your browser — the project will be available at `localhost:3000`

#### 🧪 Example

```bash
# Navigate to the unzipped project folder
cd my-react-project

# Install dependencies
npm install

# Start the development server
npm start
```

#### 💡 Insight

The `npm install` step is crucial — it downloads all the third-party packages (like React itself) that the project depends on. Without it, nothing will work. On CodeSandbox, this happens automatically.

---

### Concept 3: The SRC Folder

#### 🧠 What is it?

Once your project is set up, the **`src` folder** (source folder) is where you'll spend the vast majority of your time. This is where all your React code lives — your components, styles, and logic.

#### 💡 Insight

The project has other folders and files too (like `public/` and `package.json`), but `src/` is your workspace. Everything else is mostly configuration.

---

## ✅ Key Takeaways

- React projects require a build process — you can't just drop a script tag into HTML
- Use `npx create-react-app` for new local projects, or `react.new` for a quick browser-based setup
- Always run `npm install` before `npm start` when working with a downloaded project
- Node.js is required for local development
- The `src/` folder is where all your React code lives
