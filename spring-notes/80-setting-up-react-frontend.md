# Setting Up the React Front End

## Introduction

We've covered what REST is and the HTTP methods that power it. Now it's time to start building — but before we write the back end, let's understand the **front end** we'll be connecting to.

In a real-world application, the front end and back end are separate projects. We have a **React application** ready that will serve as our front end. In this section, we'll set it up, understand its structure, and see it in action — even before our Spring Boot REST API is ready.

> **Note:** This is not a React course. We're just getting a quick glimpse of how the front end works so you understand the full picture. The focus remains on Spring Boot.

---

## Concept 1: The Setup — Running the React Project

### 🧠 What do you need?

The React front-end project is provided in the course resources. You can either `git clone` it or download the ZIP file. Once you have it, open it in **VS Code**.

But before the React app can work, it needs a **back end** to fetch data from. Since our Spring Boot REST API isn't ready yet, we'll use a **fake back end** — a tool called **JSON Server**.

### ⚙️ Step-by-Step Setup

#### Step 1: Install JSON Server (one-time setup)

JSON Server is a npm package that creates a fake REST API from a JSON file. Install it globally:

```bash
npm install -g json-server
```

#### Step 2: Prepare the fake data

The project comes with a file called `db.json` that contains some dummy job post data. Something like:

```json
{
  "posts": [
    {
      "id": 1,
      "profile": "Java Developer",
      "description": "Build backend services",
      "experience": 3,
      "techs": ["Java", "Spring Boot", "REST"]
    },
    {
      "id": 2,
      "profile": "React Developer",
      "description": "Build frontend apps",
      "experience": 2,
      "techs": ["React", "JavaScript", "CSS"]
    }
  ]
}
```

This is the data our fake server will serve.

#### Step 3: Start the JSON Server

Open a terminal and run:

```bash
json-server --watch db.json --port 8000
```

Why port 8000? Because the React app will run on port 3000 by default, and we don't want a conflict. You can use any available port.

Once it starts, you'll see something like:

```
Resources
  http://localhost:8000/posts
```

Notice the URL pattern — `localhost:8000/posts`. That's REST in action! No `/getAllPosts` or `/showPosts`. Just the resource name: **posts**.

#### Step 4: Install React dependencies

Open another terminal and install the required packages:

```bash
npm install
```

This reads `package.json` and downloads all dependencies into the `node_modules` folder.

#### Step 5: Start the React app

```bash
npm start
```

The React app launches in your browser, and you should see the job posts rendered on the page — data coming from the fake JSON server.

### ⚠️ Common Mistake

If you see an error saying "server not available" when the React app loads, it means the JSON Server isn't running. Always start the JSON Server **before** starting the React app.

---

## Concept 2: Understanding package.json — The Maven of JavaScript

### 🧠 What is it?

If you come from the Java world, you're familiar with Maven's `pom.xml` — it lists all the dependencies your project needs. In the JavaScript/React world, `package.json` does the same job.

### 🧪 Key dependencies in this project

| Dependency       | Purpose                                                  |
|------------------|----------------------------------------------------------|
| `react`          | The core React library for building components           |
| `react-dom`      | Allows React to manipulate the HTML DOM                  |
| `react-router-dom` | Handles navigation — what happens when you click links |
| `axios`          | Makes HTTP requests to the back end (like `fetch`)       |
| `json-server`    | The fake back end we're using temporarily                |

### 💡 Insight

Think of `npm install` as the equivalent of Maven downloading dependencies. When you share a React project, you don't include `node_modules` (just like you don't include `.m2` in Java). The recipient runs `npm install`, and all packages are downloaded based on `package.json`.

---

## Concept 3: How React Works — A Quick Glimpse

### 🧠 The Single Page Application (SPA)

React is a **library** for building **component-based** UIs. The entire application runs on a **single HTML page**.

Here's how the pieces fit together:

#### The HTML file — `public/index.html`

This is the actual page displayed in the browser. But if you open it, you'll find... almost nothing:

```html
<div id="root"></div>
```

That's it. An empty `div`. So where does all the content come from?

#### The entry point — `src/index.js`

This file grabs the empty `root` div and fills it with React content:

```jsx
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

It finds the `div` with id `root`, and renders the `<App />` component inside it. `<App />` looks like an HTML tag but with a capital letter — this is **JSX**, a syntax that lets you write HTML-like code inside JavaScript.

#### The App component — `src/App.js`

The `App` component is the top-level container. It renders other components — in our case, it renders `<AllPost />`, which displays all the job posts.

#### The AllPost component — The actual data rendering

This is where the magic happens:

```jsx
// Hitting the fake back end
axios.get("http://localhost:8000/posts")
  .then(response => {
    // Got the data, now render it
  });
```

It uses **Axios** (an HTTP client library) to send a GET request to `http://localhost:8000/posts`. The response contains JSON data, and for each post, it renders a card with:
- Profile name
- Description
- Experience
- Tech stack (rendered as individual tags using a nested loop)

### ⚙️ The component hierarchy

```
index.html
  └── index.js (grabs the root div)
        └── <App /> (top-level component)
              └── <AllPost /> (fetches data and renders job cards)
                    └── Individual post cards (one per job)
```

### 💡 Insight

This is the beauty of component-based design. Each job card on the page is the **same component**, just rendered with different data — like creating one class and making multiple objects from it. If you have 2 jobs in your JSON, you see 2 cards. Add 10 more, and 10 more cards appear automatically.

---

## Concept 4: What Will Change When Our Spring Boot API is Ready?

### 🧠 The one thing we'll update

Right now, the React app hits:

```
http://localhost:8000/posts
```

This is the fake JSON Server. Once we build our Spring Boot REST API, the only thing we'll change in the React code is **the URL**:

```
http://localhost:8080/jobs
```

That's the power of decoupling front end and back end. The React app doesn't care *who* is serving the data — it just needs a URL that returns JSON.

### 💡 Insight

This is exactly why REST APIs are so powerful. You can swap out the entire back end — from a fake JSON server to a full Spring Boot application with a real database — and the front end doesn't need to change its logic at all. Just update the URL.

---

## Concept 5: What If You Don't Want to Use React?

### 🧠 The alternative: Postman

Not everyone wants to set up a React project. Maybe you're focused purely on back-end development, or maybe you want to test your API without building any UI at all.

That's perfectly fine. Instead of React, you can use **Postman** — a REST client that lets you:
- Send GET, POST, PUT, DELETE requests
- View the JSON response
- Test your API endpoints directly

You don't need a front end to verify that your REST API works. Postman acts as your client, and we'll explore how to use it in the next video.

---

## ✅ Key Takeaways

- The React front end is a **separate project** that talks to the back end via HTTP requests
- **JSON Server** provides a fake REST API for testing before the real back end is ready
- `package.json` is the JavaScript equivalent of Maven's `pom.xml` — it lists all dependencies
- React is component-based: build a component once, reuse it for each data item
- When our Spring Boot API is ready, we'll simply **change the URL** in the React code
- If you don't want to use React, **Postman** is the alternative for testing REST APIs

## ⚠️ Common Mistakes

- Forgetting to run `npm install` before starting the project — dependencies won't be there
- Not starting the JSON Server before the React app — you'll get connection errors
- Running both the JSON Server and React on the same port — use different ports (e.g., 8000 and 3000)

## 💡 Pro Tips

- Always start your servers in order: back end first (JSON Server or Spring Boot), then front end
- Keep two terminals open — one for the back end, one for the front end
- Don't stress about learning React right now — focus on the Spring Boot side and just use the provided React project as-is
