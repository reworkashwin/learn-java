# Connecting React Frontend — Search Feature with Live Filtering

## Introduction

Everything we've built so far — CRUD operations, search by keyword — has been tested through Postman. That's fine for developers, but real users need a **UI**. In this section, we connect a React frontend to our Spring Boot backend and see the search feature come alive with real-time filtering.

---

## Concept 1: The React Frontend Setup

### 🧠 What we're working with

We have a React application that provides a user-friendly interface for the job portal. It includes:
- A **home page** showing all job posts
- A **search bar** for filtering jobs by keyword
- Options for adding, updating, and deleting job posts

### ⚙️ Getting it running

```bash
npm install     # Install all dependencies
npm start       # Start the React dev server on localhost:3000
```

The React app runs on `http://localhost:3000` and communicates with the Spring Boot backend on `http://localhost:8080`.

### 💡 Insight

If you change your React port or your Spring Boot port, update the URLs accordingly:
- **React port**: Update in the navbar configuration
- **Backend port**: Update in all the API call URLs within the React code

---

## Concept 2: How Live Search Works

### 🧠 The user experience

Type a keyword into the search bar, and results filter **instantly** — just like Google. Every keystroke triggers a new search. Type "Java" and only Java-related jobs appear. Type "API" and all posts mentioning API show up.

### ⚙️ How it works under the hood

The React component uses the `useEffect` hook to listen for changes in the search input. Every time the user types a character:

1. React captures the current text in the search bar (the "query")
2. `useEffect` fires and makes an API call:

```javascript
fetch(`http://localhost:8080/jobPost/keyword/${query}`)
```

3. The Spring Boot backend receives the request at our search endpoint
4. The `findByPostProfileContainingOrPostDescContaining` method searches the database
5. Results are returned as JSON
6. React updates the UI with the matching job posts

### 🧪 The flow visualized

```
User types "spring"
    ↓
React useEffect triggers
    ↓
GET http://localhost:8080/jobPost/keyword/spring
    ↓
Controller → Service → Repository (DSL method)
    ↓
Hibernate: SELECT * FROM job_post WHERE post_profile LIKE '%spring%' OR post_desc LIKE '%spring%'
    ↓
JSON response with matching jobs
    ↓
React renders filtered results
```

This happens on **every keystroke**. Type "s" — search fires. Type "sp" — search fires again. Type "spr" — another search. By the time you've typed "spring", the results are already filtered.

---

## Concept 3: Seeing It in Action

### 🧪 Search for "spring"

Type "spring" in the search bar → only job posts with "Spring" in the profile or description appear. Maybe just one result: "Spring Boot Developer".

### 🧪 Search for "angular"

Type "angular" → filtered to Angular-related jobs only.

### 🧪 Search for "API"

Type "API" → multiple results appear because several job descriptions mention API. This demonstrates the `Or` in our DSL method — it searches both the profile **and** the description.

### 💡 Insight

This is the same endpoint we tested in Postman earlier. The only difference is that React calls it automatically on every keystroke instead of us manually clicking "Send". The backend doesn't know or care who's calling it — Postman, React, a mobile app — it just receives HTTP requests and returns JSON.

---

## Concept 4: The Connection Between Frontend and Backend

### 🧠 Understanding the full stack

```
┌─────────────────────────────────┐
│  React Frontend (port 3000)     │
│  - Search bar with useEffect    │
│  - Calls API on every keystroke │
└──────────────┬──────────────────┘
               │ HTTP GET
               ▼
┌─────────────────────────────────┐
│  Spring Boot Backend (port 8080)│
│  Controller → Service → Repo   │
│  DSL: findByContainingOr...    │
└──────────────┬──────────────────┘
               │ SQL Query
               ▼
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  job_post table                 │
└─────────────────────────────────┘
```

Three layers, three separate concerns:
- **React** handles the UI and user interaction
- **Spring Boot** handles business logic and data access
- **PostgreSQL** stores the data

Each layer talks to the next through a well-defined interface (HTTP for React→Spring, JDBC for Spring→PostgreSQL).

---

## Concept 5: Configuration Points to Remember

### ⚙️ URLs you might need to update

| What | Default | Where to change |
|------|---------|----------------|
| React dev server | `http://localhost:3000` | React project config |
| Spring Boot server | `http://localhost:8080` | `application.properties` (server.port) |
| API base URL in React | `http://localhost:8080` | React API call files / navbar config |

### ⚠️ CORS reminder

Remember from earlier videos — if the React app and Spring Boot run on different ports (3000 and 8080), you need `@CrossOrigin` on your controller. Otherwise, the browser will block the requests due to the same-origin policy.

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class JobPostController {
    // ...
}
```

---

## ✅ Key Takeaways

- The React frontend uses `useEffect` to call the search API on every keystroke — providing real-time filtering like Google
- The same `/jobPost/keyword/{keyword}` endpoint works for both Postman and React — the backend doesn't care who the client is
- The full stack flow: React → HTTP → Spring Boot Controller → Service → Repository (DSL) → PostgreSQL → JSON response → React UI update
- When deploying to the cloud, replace `localhost` URLs with actual server addresses
- Keep port numbers consistent between frontend and backend configurations

## ⚠️ Common Mistakes

- Forgetting to run `npm install` before `npm start` — the React app won't have its dependencies
- Not updating API URLs when changing port numbers — the frontend will call the wrong address and get connection errors
- Missing `@CrossOrigin` annotation — browser blocks cross-origin requests between `localhost:3000` and `localhost:8080`

## 💡 Pro Tips

- For production, consider **debouncing** the search input — firing an API call on every single keystroke is fine for development, but in production with many users, adding a small delay (200-300ms) before making the call reduces unnecessary server load
- Once you deploy to the cloud, replace hardcoded URLs with environment variables so you can switch between development and production URLs easily
