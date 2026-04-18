# Installing Postman & Testing REST APIs

## Introduction

So far, we've been testing our REST APIs by simply typing the URL into a browser. That works fine for **GET** requests — but what happens when you need to test a **POST**, **PUT**, **DELETE**, or **PATCH** request? You can't just type those into the browser address bar.

That's where **Postman** comes in — a powerful, developer-friendly tool designed specifically for testing and interacting with REST APIs. In this section, we'll set up Postman, learn how to organize API requests professionally, and follow best practices that real-world developers use every day.

---

## Concept 1: Why Can't We Just Use the Browser?

### 🧠 What's the Problem?

When you type a URL into your browser's address bar and hit Enter, the browser always sends a **GET** request. There's no built-in way to:

- Send a **POST** request (to create data)
- Send a **DELETE** request (to remove data)
- Send a **PUT/PATCH** request (to update data)
- Attach a **request body** (JSON payload)
- Set custom **headers**

### ❓ So What Do We Do?

We either:
1. Build a full UI application (like a React app) to call those APIs, or
2. Use a tool like **Postman** that lets us craft any HTTP request manually

For backend developers, Postman is the go-to choice — it's fast, flexible, and purpose-built for API testing.

---

## Concept 2: Setting Up Postman

### ⚙️ Installation Steps

1. Visit [postman.com](https://www.postman.com)
2. Download the Postman application for your operating system (Windows, macOS, or Linux)
3. Install and launch the application

### 🧪 First Look at Postman

Once you open Postman, you'll see an interface with:
- A **sidebar** for organizing your requests
- A **request builder** area where you define the URL, HTTP method, headers, body, etc.
- A **response viewer** at the bottom that shows the API's response

---

## Concept 3: Organizing Requests with Collections

### 🧠 What is a Collection?

Think of a **collection** as a project folder in Postman. It groups all the REST API requests related to a specific project or course.

### ⚙️ How to Create a Collection

1. Click the **+** (plus) symbol in the sidebar
2. Give your collection a name (e.g., "Spring")
3. Under the collection, create **folders** to organize requests by domain or feature

For example:
```
📁 Spring (Collection)
   📂 Dummy (Folder)
      📄 Path Variable (Request)
      📄 Query Params (Request)
   📂 Users (Folder)
      📄 Create User (Request)
      📄 Get All Users (Request)
```

### 🧪 Creating a New Request

1. Click the three dots on a folder → **Add Request**
2. Give the request a meaningful name (e.g., "Path Variable")
3. Select the HTTP method (GET, POST, DELETE, etc.)
4. Enter the full URL
5. Click **Send**

### 📤 Sharing Collections

Want to share your collection with a teammate?

1. Right-click on the collection → **More** → **Export**
2. Keep the default version and click **Export**
3. Save the JSON file and share it

To **import** someone else's collection:
1. Click **Import** in Postman
2. Drag and drop the collection JSON file

💡 **Pro Tip:** The instructor uploads the collection to the GitHub repo — download and import it to save time!

---

## Concept 4: Understanding API Responses in Postman

### 🧪 Successful Response

When you invoke a valid GET request like:
```
GET localhost:8080/api/dummy/users/123/address/456
```

You'll see:
- **Status:** `200 OK`
- **Body:** The response data (in JSON format)

Even if the response looks like a plain string, behind the scenes, the framework sends everything as **JSON**.

### ⚠️ Error Response

If you call the same path with an unsupported HTTP method (e.g., POST instead of GET):

- **Status:** `405 Method Not Allowed`
- **Body:** A JSON error object with fields like `timestamp`, `status`, `error`, and `path`

This tells you: "Hey, this endpoint exists, but it doesn't support the HTTP method you used."

---

## Concept 5: Avoiding Hardcoded Base URLs

### ❓ What's the Problem?

Imagine you have 100+ REST API requests in your collection, all starting with:
```
http://localhost:8080/api/...
```

Now, what if you change the port number from `8080` to `9090`? Or what if you want to test against a **QA server** or **production server**? You'd have to manually update every single request. That's a nightmare.

### Approach 1: Collection Variables

1. Select the base URL (e.g., `http://localhost:8080`) in a request
2. Right-click → **Set as Variable**
3. Name it `base_url` and set the scope to **Collection**
4. Now your URL looks like: `{{base_url}}/api/dummy/users/123`

To update the base URL later:
- Go to your collection → **Variables** tab → Update the value

⚠️ **Downside:** Your URLs still look a bit cluttered with `{{base_url}}`.

### Approach 2: Pre-request Scripts (Recommended)

This is the cleaner, more professional approach:

1. Go to your collection → **Scripts** tab → **Pre-request**
2. Add this JavaScript:

```javascript
pm.request.url.protocol = "http";
pm.request.url.host = "localhost";
pm.request.url.port = "8080";
```

3. Now in your requests, you only need to type the **API path**:
```
/api/dummy/users/123/address/456
```

Postman automatically prepends `http://localhost:8080` before sending.

### 💡 Why Is This Better?

- **Clean URLs** — no variables cluttering the path
- **Single place to change** — update protocol, host, or port in one script
- **Easy environment switching** — just change `localhost` to your server hostname

---

## Concept 6: Using the Postman Console

Postman has a built-in **Console** that shows the complete details of every request you send — including the fully resolved URL, headers, and response. This is incredibly useful for debugging.

To open it, look for the **Console** option at the bottom of the Postman window.

---

## Concept 7: Postman vs. UI Application for Testing

| Approach | Best For |
|----------|----------|
| **Postman** | Backend developers testing individual APIs quickly |
| **React UI App** | Seeing the end-to-end application flow |

Throughout the course, both approaches will be demonstrated. Backend developers typically rely on Postman, but using the UI gives you the full picture of how the frontend and backend interact.

---

## ✅ Key Takeaways

1. **Browsers only send GET requests** — use Postman for POST, PUT, DELETE, PATCH
2. **Collections** organize your API requests like project folders
3. **Never hardcode base URLs** in individual requests — use variables or pre-request scripts
4. **Pre-request scripts** are the cleanest approach for managing base URLs across environments
5. **Export/import collections** to share API request setups with your team
6. **Postman Console** shows the full request/response details for debugging

## ⚠️ Common Mistakes

- Hardcoding `localhost:8080` in every request — painful to update later
- Forgetting to select the correct HTTP method before sending
- Not checking the Postman console when a request fails unexpectedly

## 💡 Pro Tips

- Download the instructor's exported collection from GitHub to save setup time
- Use **folders** inside collections to group requests by feature or domain
- Always use the **pre-request script** approach for base URL management — it's what professionals do
- Check the **response status code** (200, 405, 404, etc.) — it tells you exactly what went wrong
