# Connecting React Front End to Spring Boot Back End

## Introduction

We have our Spring Boot REST API returning JSON data, and we have our React front end running separately. Now it's time to **connect them**. In theory, it should be as simple as changing a URL. In practice... there's one small hurdle called **CORS**.

---

## Concept 1: Switching the React App to the Real Back End

### 🧠 What needs to change?

The React app is currently hitting the fake JSON Server at `http://localhost:8000/posts`. Our Spring Boot back end runs at `http://localhost:8080/jobPosts`.

All we need to do is update the URL in the React code:

```jsx
// Before (fake server)
axios.get("http://localhost:8000/posts")

// After (Spring Boot back end)
axios.get("http://localhost:8080/jobPosts")
```

Save the file, and the React app will restart automatically.

### 🧪 Does it work?

Refresh the browser and... **Network Error.**

The React app can't fetch data from our Spring Boot server. But wait — Postman works fine with the same URL. What's going on?

---

## Concept 2: The CORS Problem

### 🧠 What is CORS?

**CORS** stands for **Cross-Origin Resource Sharing**. It's a browser security feature.

Here's the issue: the React app runs on `http://localhost:3000`, and the Spring Boot server runs on `http://localhost:8080`. These are **different origins** (different port numbers = different origins).

By default, browsers **block** requests from one origin to another. This is a security measure to prevent malicious websites from making unauthorized requests to your server.

### ❓ Why did Postman work but the browser didn't?

**Postman is not a browser.** It doesn't enforce CORS rules. It sends the request directly to the server without any cross-origin checks.

Browsers, on the other hand, perform a **preflight check** — before sending the actual request, the browser asks the server: "Hey, do you allow requests from `localhost:3000`?" If the server doesn't explicitly say "yes," the browser blocks the request.

### 🧪 Real-world analogy

Think of it like a security guard at a building. Postman is like a delivery person who walks straight to the door and hands over the package — no questions asked. A browser is like a visitor who first has to check in at the reception desk. If the reception says "we don't know this person," the visitor is turned away — even though the package is perfectly fine.

---

## Concept 3: The Fix — @CrossOrigin

### ⚙️ How to allow cross-origin requests

Spring Boot makes this easy. Add the `@CrossOrigin` annotation to your controller and specify which origin (front-end URL) is allowed:

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class JobRestController {

    @Autowired
    private JobService service;

    @GetMapping("jobPosts")
    public List<JobPost> getAllJobs() {
        return service.getAllJobs();
    }
}
```

This tells Spring: **"Allow requests coming from `http://localhost:3000`."** The browser's CORS check will now pass.

### ⚙️ What happens after the fix?

1. Restart the Spring Boot application
2. Go back to the React app in the browser
3. Refresh the page
4. **Data loads successfully!** 🎉

The React front end is now fetching data directly from the Spring Boot back end — not the fake JSON server.

### 💡 Insight

`@CrossOrigin` can be placed at the **class level** (applies to all methods in the controller) or at the **method level** (applies to a specific endpoint). Placing it on the class is more convenient when all endpoints should allow the same origin.

---

## Concept 4: The Big Picture — What We've Achieved

### 🧠 The complete architecture in action

```
React App (localhost:3000)
    │
    │  GET http://localhost:8080/jobPosts
    ▼
Spring Boot REST API (localhost:8080)
    │
    │  service.getAllJobs()
    ▼
JobService → JobRepo → Returns List<JobPost>
    │
    │  JSON response
    ▼
React App renders the data as job cards
```

Two completely separate applications — different projects, different technologies, different ports — communicating seamlessly through JSON over HTTP. This is the modern web architecture in action.

---

## ✅ Key Takeaways

- Connecting React to Spring Boot is as simple as **changing the URL** in the Axios call
- **CORS** (Cross-Origin Resource Sharing) blocks browser requests between different origins by default
- Postman doesn't enforce CORS — that's why it works while the browser doesn't
- Add `@CrossOrigin(origins = "http://localhost:3000")` to your controller to allow the React app
- The front end and back end are now fully decoupled and communicating via JSON

## ⚠️ Common Mistakes

- Forgetting to add `@CrossOrigin` and wondering why the React app gets network errors
- Putting the wrong URL in the `origins` parameter — it must match the front-end URL exactly, including the port
- Not restarting the Spring Boot server after adding `@CrossOrigin` — the change won't take effect until you restart

## 💡 Pro Tips

- In production, you'd configure CORS more carefully — whitelisting only specific domains, not using wildcards
- If you have multiple controllers, consider configuring CORS globally instead of per-controller
- When debugging connection issues between front end and back end, always check the browser's **developer console** (F12 → Console tab) — CORS errors show up clearly there
