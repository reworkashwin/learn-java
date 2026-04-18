# Job Portal UI — Setting Up the Stage

## Introduction

So far in this course, we've been testing our backend REST APIs exclusively through **Postman**. And while Postman is fantastic for verifying that your APIs return the correct JSON responses, there's something deeply satisfying about seeing your data come to life **visually** in a real user interface.

In this section, we're going to set up a **React-based frontend application** — the Job Portal UI — that will consume our Spring Boot REST APIs and display the data beautifully in a browser. This is exactly how things work in real-world projects: a frontend application talks to a backend API.

> **Note:** If you're not interested in setting up the UI application, that's perfectly fine — you can skip the setup steps. But it's still worth watching to understand how frontend and backend applications communicate. Just make sure you continue testing your REST APIs through Postman.

---

## Why Set Up a Frontend?

Think about it — when was the last time you used a website that just showed you raw JSON? Never, right?

In real-world applications:
- **Backend** → Prepares and serves data (our Spring Boot REST APIs)
- **Frontend** → Consumes that data and presents it visually to users

By setting up a frontend, you'll:
1. See your API data rendered in a real UI
2. Understand how frontend-backend communication works
3. Encounter a very common real-world problem (spoiler: it's called **CORS** 😉)

---

## The UI Application — What's Inside?

The UI application lives inside the GitHub repository under the **`section5`** folder, in a subfolder called **`job-portal-ui`**.

This is a **React** application. React is a popular JavaScript library for building user interfaces. You don't need to know React to follow along — we won't be diving into the UI code. The focus of this course is the **backend**.

> 💡 **Pro Tip:** If you want to become a **Java Full Stack Developer**, complete this backend-focused Spring Boot course first, then pick up a dedicated full-stack course that covers React, Tailwind CSS, and all UI-related concepts in depth.

---

## Setting Up Visual Studio Code

For UI projects, we use **Visual Studio Code (VS Code)** — not IntelliJ IDEA. Why?

- IntelliJ is a **heavy IDE** designed for backend/Java development
- VS Code is **lightweight** and is the go-to IDE for frontend/UI developers

### Steps:
1. Download VS Code from [https://code.visualstudio.com](https://code.visualstudio.com)
2. Install and open it
3. Select **Open Folder** and navigate to the `job-portal-ui` folder under `section5`
4. When prompted, click **"Yes, I trust the authors"**

Your UI project structure will appear in the VS Code sidebar. You don't need to open or modify any source code files.

---

## Installing Node.js — The JavaScript Runtime

Before we can run the React application, we need **Node.js** installed on our system.

### 🧠 What is Node.js?

Node.js allows JavaScript to run **outside the browser** — on your local machine, on servers, anywhere. Before Node.js, JavaScript could only execute inside a web browser.

Since React is built with JavaScript, we need Node.js to:
- Install project dependencies
- Run the development server
- Build the application

### ⚙️ How to Install

1. Go to [https://nodejs.org](https://nodejs.org)
2. Click **Download**
3. Choose the **pre-built installer** for your operating system:
   - **macOS** → Download the macOS installer
   - **Windows** → Select Windows and your architecture
4. Run the installer — it's a straightforward process

### ✅ Verify Installation

Open a terminal and run:

```bash
node -v
```

If you see a version number (e.g., `v20.x.x`), Node.js is installed successfully.

---

## Installing Project Dependencies

Just like our Spring Boot application has a `pom.xml` that lists all its dependencies (libraries), a React application has a file called **`package.json`** that lists all its packages and libraries.

### The Command

Open a terminal in VS Code (**Terminal → New Terminal**) and run:

```bash
npm install
```

### What Happens?

- npm (Node Package Manager) reads `package.json`
- Downloads and installs all the required packages
- Creates a **`node_modules`** folder containing all the installed libraries

Think of it like Maven downloading all your JAR files — same concept, different ecosystem.

| Backend (Spring Boot)  | Frontend (React)          |
|------------------------|---------------------------|
| `pom.xml`              | `package.json`            |
| Maven dependencies     | npm packages              |
| `.m2` repository       | `node_modules` folder     |
| `mvn clean install`    | `npm install`             |

---

## Starting the React Application

Once dependencies are installed, start the development server:

```bash
npm run dev
```

The application will start and provide a local URL (typically something like `http://localhost:5173`). Open this URL in your browser.

### What You'll See

- The **Job Portal UI** loads in the browser
- Scrolling down, there's a **Jobs** section — currently empty because we haven't configured our backend to send job data yet
- Below that, there's a **Companies** section — but wait, even though our backend IS sending company data, it's showing zero companies!

Something is wrong. Let's investigate.

---

## The CORS Error — A Sneak Peek

Open the **browser developer console** (press `F12` in Chrome, then go to the **Console** tab).

You'll see an error message like:

```
Access to XMLHttpRequest at 'http://localhost:8080/api/companies'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### What's Happening?

- Our UI application is running at `http://localhost:5173`
- Our backend REST API is running at `http://localhost:8080`
- From the browser's perspective, these are **two different applications** (different port numbers = different origins)
- When two different origins try to communicate, the browser **blocks** the communication by default

This is called a **CORS (Cross-Origin Resource Sharing)** policy violation. It's not a bug — it's a **security feature** built into every browser.

> We're going to understand CORS in detail and fix this problem in the next lectures.

---

## ✅ Key Takeaways

- The Job Portal UI is a **React application** that consumes our Spring Boot REST APIs
- Use **VS Code** (not IntelliJ) for frontend projects — it's lightweight and purpose-built
- **Node.js** is required to run JavaScript outside the browser
- `npm install` downloads all project dependencies (like Maven for the frontend world)
- `npm run dev` starts the development server
- When frontend and backend run on **different ports**, the browser blocks communication due to **CORS policy**

## ⚠️ Common Mistakes

- **Using IntelliJ for UI projects** — It's too heavy; VS Code is the standard for frontend work
- **Forgetting to run `npm install`** before `npm run dev` — Without installing dependencies, the app won't start
- **Panicking at the CORS error** — It's not a bug in your code; it's a browser security feature that we'll fix

## 💡 Pro Tips

- Always verify Node.js installation with `node -v` before proceeding
- The `node_modules` folder can be safely deleted and rebuilt with `npm install` — never commit it to Git
- Keep the browser developer console (`F12`) open while developing — it reveals errors that the UI won't show you
