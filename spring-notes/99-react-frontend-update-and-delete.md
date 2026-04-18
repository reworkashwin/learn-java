# React Frontend — Update and Delete Operations

## Introduction

We've got search working on the React frontend. Now let's complete the picture with **update** and **delete** — the remaining two CRUD operations. The backend is already ready (we built those endpoints earlier). This is all about how the React frontend connects to those existing APIs.

---

## Concept 1: How Update Works

### 🧠 The user flow

1. User sees a list of job posts on the home page
2. Clicks the **Edit** button on a specific job post (e.g., "Python Developer")
3. An edit form appears, pre-filled with the current values — profile, description, experience, tech stack
4. User makes changes (e.g., changes "Python Developer" to "Python Dev", experience from 2 to 1)
5. Clicks **Submit**
6. The updated data appears on the home page

### ⚙️ What happens behind the scenes

When the user clicks Submit, the React code calls a function called `handleSubmit` that:

1. Collects all the form data
2. Sends a **PUT** request to the backend:

```javascript
fetch("http://localhost:8080/jobPost", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
})
```

3. The Spring Boot controller receives this at the `@PutMapping` endpoint
4. The service calls `repo.save(jobPost)` — which fires a `SELECT` to check existence, then an `UPDATE`
5. The database is updated
6. React refreshes the UI to show the changes

### 🧪 The flow

```
User edits form → Submit button
    ↓
PUT http://localhost:8080/jobPost  (with JSON body)
    ↓
Controller → Service → repo.save(jobPost) → UPDATE query
    ↓
Database updated → React refreshes UI
```

### 💡 Insight

The entire `JobPost` object is sent in the request body — not just the changed fields. The backend replaces the entire record. This is how `save()` works when the primary key already exists — it overwrites all fields.

---

## Concept 2: How Delete Works

### 🧠 The user flow

1. User sees the list of job posts
2. Clicks the **Delete** icon on a specific post (e.g., "Angular Developer")
3. The post disappears from the list
4. Even after refreshing the page, it's gone — because it's deleted from the database

### ⚙️ What happens behind the scenes

When the user clicks the delete icon, a function called `handleDelete` fires:

```javascript
fetch(`http://localhost:8080/jobPost/${id}`, {
    method: "DELETE"
})
```

No request body needed — just the ID in the URL. The backend does the rest:

1. Controller receives the `DELETE` request with the post ID
2. Service calls `repo.deleteById(postId)`
3. Hibernate fires a `SELECT` to verify the record exists, then a `DELETE` query
4. The row is removed from PostgreSQL
5. React removes the item from the displayed list

### 🧪 The flow

```
User clicks delete icon
    ↓
DELETE http://localhost:8080/jobPost/3
    ↓
Controller → Service → repo.deleteById(3) → DELETE query
    ↓
Record removed from database → UI updates
```

---

## Concept 3: The React Components

### 📋 Where the code lives

| Feature | React Component | What it does |
|---------|----------------|--------------|
| View all posts | `AllPost` | Displays job posts, has delete buttons and edit links |
| Edit a post | `Edit` | Form pre-filled with current values, submit triggers PUT |
| Delete a post | `AllPost` (inline) | Delete icon triggers DELETE request directly |
| Search | `AllPost` | Text input with `useEffect` triggering search on keystroke |

### 🧠 The edit page structure

The Edit component contains:
- Text fields for profile, description, experience
- A tech stack selection (checkboxes or multi-select)
- A Submit button that calls `handleSubmit`

```jsx
// Simplified structure
<form onSubmit={handleSubmit}>
    <TextField label="Post Profile" value={formData.postProfile} />
    <TextField label="Description" value={formData.postDesc} />
    <TextField label="Experience" value={formData.reqExperience} />
    {/* Tech stack fields */}
    <Button type="submit">Submit</Button>
</form>
```

### 🧠 Delete is simpler — no separate page

Delete doesn't need its own page. It's just a button/icon in the job post list. Click it, and the `handleDelete` function makes the API call immediately.

---

## Concept 4: The Full Stack CRUD Summary

### 📋 Every operation, end to end

| Operation | React Action | HTTP Method | Backend Endpoint | Repo Method |
|-----------|-------------|-------------|-----------------|-------------|
| **Create** | Submit form | POST | `/jobPost` | `save()` |
| **Read All** | Page load | GET | `/jobPosts` | `findAll()` |
| **Read One** | Click on post | GET | `/jobPost/{id}` | `findById()` |
| **Update** | Edit + Submit | PUT | `/jobPost` | `save()` |
| **Delete** | Click delete icon | DELETE | `/jobPost/{id}` | `deleteById()` |
| **Search** | Type in search bar | GET | `/jobPost/keyword/{kw}` | DSL method |

### 💡 Insight

The entire interaction between React and Spring Boot is through **REST APIs**. React doesn't know it's talking to Spring Boot. Spring Boot doesn't know it's serving a React app. They communicate through HTTP requests and JSON responses. This is the power of REST — you could swap React for Angular, or Spring Boot for Node.js, and as long as the API contract stays the same, everything works.

---

## Concept 5: Configuration Reminders

### ⚙️ Ports and URLs

| Component | Default URL |
|-----------|------------|
| React frontend | `http://localhost:3000` |
| Spring Boot backend | `http://localhost:8080` |
| PostgreSQL | `localhost:5432` |

If you change any port, update the corresponding URLs:
- Backend port change → update all `fetch()` URLs in React components
- React port change → update `@CrossOrigin` in the Spring Boot controller
- For cloud deployment → replace `localhost` with actual server addresses

---

## ✅ Key Takeaways

- **Update** sends a PUT request with the full `JobPost` object — `save()` detects the existing ID and fires an UPDATE query
- **Delete** sends a DELETE request with just the ID in the URL — `deleteById()` removes the record
- Delete doesn't need a separate page — it's handled inline with a button click
- The React frontend and Spring Boot backend communicate entirely through **REST APIs** and JSON
- All CRUD operations plus search are now working end-to-end: React UI → Spring Boot → PostgreSQL

## ⚠️ Common Mistakes

- Forgetting to refresh the UI after delete — some implementations require manually calling `fetchAll()` again to update the displayed list
- Sending partial data on update — `save()` replaces the entire record, so missing fields will be overwritten with null/default values
- Browser caching issues — if delete seems to not work, try a hard refresh or test in a different browser

## 💡 Pro Tips

- Add **confirmation dialogs** before delete in production — accidental deletes with no "Are you sure?" prompt lead to data loss
- For update, consider using **PATCH** instead of PUT if you only want to update specific fields rather than replacing the entire object — though for simplicity, PUT with the full object works fine
