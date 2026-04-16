# 🧮 Building a Calculator Form — Sending Data from Client to Server

## 🎯 Introduction

We've got our homepage working — it shows "Hello World." But let's be honest, that's not very useful. The whole point of having a backend server is to **do something** — process data, perform calculations, fetch records, handle business logic.

In this section, we're going to build something more practical: a **simple calculator**. Two numbers go in, the result comes out. It's the classic beginner exercise, but don't underestimate it — this example teaches you the **fundamental pattern** of web development:

```
Client sends data → Server processes it → Server returns result
```

Whether you're adding two numbers or processing a million-dollar transaction, the flow is the same. Let's build it step by step.

**What we'll cover**:
- Why we need forms to send data to the server
- Building an HTML form with input fields in JSP
- Styling with CSS in Spring Boot
- Understanding what happens when you click "Submit"
- How form data travels through the URL (query parameters)
- Why we get a 404 and what's needed next (a new controller mapping)

---

## 🤔 Concept 1: Why Do We Need Server-Side Processing?

### 🧠 What's the Big Picture?

Right now, our homepage just displays static text. But real web applications **do things**:

- **E-commerce**: Search products by price, add to cart, process payments
- **Social media**: Fetch posts, upload images, send messages
- **Banking**: Transfer money, check balances, generate statements
- **Our example**: Add two numbers

All of these follow the same pattern:

```
1. Client (browser) sends a REQUEST with some data
2. Server RECEIVES the request
3. Server PROCESSES the data (business logic)
4. Server sends back a RESPONSE
```

### ❓ Why Not Just Use JavaScript?

Great question! Yes, you could add two numbers entirely in the browser using JavaScript:

```javascript
let result = num1 + num2;  // Done! No server needed.
```

But that misses the point. We're learning **server-side processing** — the backbone of any real application. You can't:
- Query a database with JavaScript alone (securely)
- Process payments on the client side
- Handle authentication without a server
- Run complex business logic safely in the browser

**The calculator is just our training wheels.** The pattern we learn here applies to everything you'll build in Spring Boot.

### 💡 Insight: The Client-Server Conversation

Think of it as a conversation:

> **Client**: "Hey server, I have two numbers: 6 and 7. Can you add them?"
> **Server**: "Sure! 6 + 7 = 13. Here's your result."
> **Client**: "Thanks! Let me display that to the user."

Simple, right? Now let's build the "asking" part — the form.

---

## 📝 Concept 2: Creating the Calculator Form

### 🧠 What is an HTML Form?

An HTML form is the standard way for users to **send data** to a server. It provides:
- **Input fields** — where users type data
- **Labels** — that describe what each field expects
- **A submit button** — that triggers sending the data

When you fill out a login page, a registration form, or a search bar — you're using HTML forms.

### ⚙️ Building the Form

Let's transform our boring "Hello World" page into a calculator. We'll modify `index.jsp`:

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Telusko Calculator</title>
</head>
<body>
    <h2>Telusko Calculator</h2>
    
    <form action="add">
        <label>Enter the first number:</label>
        <input type="text" id="num1" name="num1">
        <br><br>
        
        <label>Enter the second number:</label>
        <input type="text" id="num2" name="num2">
        <br><br>
        
        <button type="submit">Submit</button>
    </form>
</body>
</html>
```

### 🔍 Breaking Down Every Part

Let's go through this line by line — every piece has a purpose.

---

#### The Form Tag

```html
<form action="add">
```

**What it does**: Creates a form that, when submitted, sends data to the URL `/add`.

**Key attribute — `action="add"`**:
- This tells the browser: "When the user clicks Submit, send the form data to the `/add` URL"
- The server needs a controller mapped to `/add` to handle this request
- If no controller exists for `/add`... you guessed it — **404 error**

**What about `method`?**

You might notice we haven't specified a method. By default, HTML forms use **GET**. This means the form data gets appended to the URL as **query parameters**:

```
localhost:8080/add?num1=6&num2=7
```

We'll talk more about GET vs POST in future lessons.

---

#### The Input Fields

```html
<label>Enter the first number:</label>
<input type="text" id="num1" name="num1">
```

**Breaking it down**:

| Attribute | Purpose |
|-----------|---------|
| `type="text"` | Creates a text box where users type |
| `id="num1"` | Unique identifier for the element (used by CSS/JavaScript) |
| `name="num1"` | **Critical!** This is the key used when sending data to the server |

**Why is `name` so important?**

When the form is submitted, the browser packages the data as key-value pairs using the `name` attribute:

```
name="num1" with value "6"  →  num1=6
name="num2" with value "7"  →  num2=7
```

These become **query parameters** in the URL:
```
localhost:8080/add?num1=6&num2=7
```

**Without `name`**, the input value won't be sent to the server at all! The `id` is for frontend use; `name` is for server communication.

---

#### The Submit Button

```html
<button type="submit">Submit</button>
```

**What it does**: When clicked, triggers the form submission — packaging all input values and sending them to the URL specified in `action`.

**The complete flow when you click Submit**:

```
1. User types "6" in first field, "7" in second field
2. User clicks "Submit"
3. Browser reads form action: "add"
4. Browser reads input names and values: num1=6, num2=7
5. Browser constructs URL: localhost:8080/add?num1=6&num2=7
6. Browser sends GET request to that URL
7. Server receives the request
```

---

### 🧪 Testing the Form

**Restart your application → Open browser → `localhost:8080`**

You should see:
```
Telusko Calculator
─────────────────────
Enter the first number: [        ]

Enter the second number: [        ]

[Submit]
```

It's not beautiful yet (we'll fix that), but it's functional!

### 💡 Insight: Form Naming Matters

The `name` attributes you choose (`num1`, `num2`) will become the **parameter names** that your Spring Boot controller receives. Choose meaningful names:

```html
<!-- Good -->
<input name="num1">
<input name="num2">

<!-- Also good (more descriptive) -->
<input name="firstNumber">
<input name="secondNumber">

<!-- Bad -->
<input name="x">
<input name="y">
```

Whatever you name them here, your controller must use the **same names** to read the values.

---

## 🎨 Concept 3: Styling with CSS in Spring Boot

### 🧠 Why Add CSS?

Our calculator works, but it looks... plain. A bare HTML form with no styling isn't exactly inviting. A little CSS goes a long way in making the page presentable.

### ❓ Where Do CSS Files Go in Spring Boot?

In Spring Boot, **static resources** (CSS, JavaScript, images) go in:

```
src/main/resources/static/
```

This is different from JSP files which go in `webapp/`. Static resources have their own dedicated location.

```
src/
├── main/
│   ├── java/           ← Java code
│   ├── resources/
│   │   └── static/     ← CSS, JS, images go here
│   │       └── style.css
│   └── webapp/         ← JSP files
│       └── index.jsp
```

### ⚙️ Creating the CSS File

**Step 1**: Navigate to `src/main/resources/static/`

**Step 2**: Create a file called `style.css`

**Step 3**: Add your styling (a coffee/Java-themed design):

```css
body {
    font-family: Arial, sans-serif;
    background-color: #3e2723;
    color: #fff8e1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

h2 {
    color: #ffcc80;
    text-align: center;
}

form {
    background-color: #4e342e;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

label {
    display: block;
    margin-bottom: 5px;
    color: #ffcc80;
}

input[type="text"] {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #795548;
    border-radius: 5px;
    background-color: #5d4037;
    color: #fff8e1;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #ff8f00;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #ff6f00;
}
```

### 🔗 Linking CSS to JSP

To use the CSS file, add a `<link>` tag in the `<head>` section of your JSP:

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Telusko Calculator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Telusko Calculator</h2>
    
    <form action="add">
        <label>Enter the first number:</label>
        <input type="text" id="num1" name="num1">
        <br><br>
        
        <label>Enter the second number:</label>
        <input type="text" id="num2" name="num2">
        <br><br>
        
        <button type="submit">Submit</button>
    </form>
</body>
</html>
```

**How does the browser find `style.css`?**

Spring Boot automatically serves everything in `static/` at the root URL. So `static/style.css` is accessible at `localhost:8080/style.css`. When the browser loads the JSP page and sees the `<link>` tag, it fetches the CSS file from that URL.

### 🧪 The Styled Result

**Restart → Refresh browser**

Now your calculator has a dark coffee-brown theme with warm orange accents. Not production-ready, but much better than raw HTML!

```
    ╔═══════════════════════════════╗
    ║     Telusko Calculator        ║
    ║                               ║
    ║  Enter the first number:      ║
    ║  ┌───────────────────────┐    ║
    ║  │ 6                     │    ║
    ║  └───────────────────────┘    ║
    ║                               ║
    ║  Enter the second number:     ║
    ║  ┌───────────────────────┐    ║
    ║  │ 7                     │    ║
    ║  └───────────────────────┘    ║
    ║                               ║
    ║  ┌───────────────────────┐    ║
    ║  │       Submit          │    ║
    ║  └───────────────────────┘    ║
    ╚═══════════════════════════════╝
```

### 💡 Insight: Static Resources in Spring Boot

Spring Boot serves static files from these locations (in order of priority):

1. `src/main/resources/META-INF/resources/`
2. `src/main/resources/resources/`
3. `src/main/resources/static/` ← **Most commonly used**
4. `src/main/resources/public/`

For CSS, JavaScript, and images, `static/` is the convention almost everyone follows.

---

## 🚀 Concept 4: What Happens When You Click Submit

### 🧠 The Submit Action

Let's say you type `6` in the first field and `7` in the second field, then click **Submit**. Here's exactly what happens:

### ⚙️ Step-by-Step Breakdown

**Step 1: Browser reads the form**

```html
<form action="add">
    <input name="num1" value="6">
    <input name="num2" value="7">
</form>
```

**Step 2: Browser constructs the request URL**

Since the form uses the default GET method, the browser builds a URL with query parameters:

```
localhost:8080/add?num1=6&num2=7
```

**Let's decode this URL**:

```
localhost:8080  →  Your server
/add            →  The endpoint (from form's action="add")
?               →  Start of query parameters
num1=6          →  First parameter (name=value from first input)
&               →  Separator between parameters
num2=7          →  Second parameter (name=value from second input)
```

**Step 3: Browser sends GET request**

```
GET /add?num1=6&num2=7 HTTP/1.1
Host: localhost:8080
```

**Step 4: Server receives the request**

Tomcat receives this. Spring's `DispatcherServlet` looks for a controller method mapped to `/add`.

**Step 5: 404 Error!**

```
Whitelabel Error Page
Status: 404
```

**Why?** We only have `@RequestMapping("/")` in our `HomeController`. There's no mapping for `/add`!

### 🤔 Understanding the Problem

```
Current controller:
@RequestMapping("/")  →  handles homepage requests ✅
@RequestMapping("/add")  →  doesn't exist! ❌
```

**When the browser navigates to `/add?num1=6&num2=7`**, Spring looks for a method mapped to `/add`. It can't find one, so it returns 404.

### 🔍 Reading the URL

The URL tells us everything we need to know about the request:

```
localhost:8080/add?num1=6&num2=7
     │          │      │      │
     │          │      │      └── Second value: 7
     │          │      └── First value: 6
     │          └── Action requested: "add"
     └── Server address
```

**This is how data travels from client to server via GET requests!** The data is right there in the URL, visible to everyone.

### 💡 Insight: Query Parameters Are Key

Those `?num1=6&num2=7` parts are called **query parameters** (or query strings). They're the simplest way to send data from a form to a server:

- **Visible in the URL**: Anyone can see the data (not great for passwords!)
- **Bookmarkable**: You can save/share the URL with data included
- **Limited size**: URLs have length limits (~2000 characters)
- **GET method default**: Forms without `method="POST"` use GET

**For sensitive data** (passwords, personal info), you'd use POST instead of GET. We'll learn that later.

---

## 🎯 Concept 5: What We Need Next — A Controller for "/add"

### 🧠 The Missing Piece

We need a controller method that:

1. **Listens** for requests to `/add`
2. **Reads** the `num1` and `num2` values from the request
3. **Adds** the two numbers
4. **Returns** the result to the user

### 📋 The Roadmap

**What we have**:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index.jsp";  // Shows the calculator form
    }
    
    // @RequestMapping("/add") ← WE NEED THIS!
    // public String add(...) { ... }
}
```

**What we need to figure out**:

1. **How to map `/add`** — we know this! Use `@RequestMapping("/add")`
2. **How to read query parameters** — new concept! How does the controller access `num1=6` and `num2=7`?
3. **How to process data** — simple Java: `int result = num1 + num2`
4. **How to return the result** — show it on a new page? Return as text?

### 🤔 The Key Questions

**Question 1**: The URL contains `num1=6&num2=7`. How does our controller method access these values?

In the servlet world (Document 47), we used:
```java
String num1 = request.getParameter("num1");
```

In Spring Boot, there's a much cleaner way. We'll see that next.

**Question 2**: Should we create a new controller or add a method to `HomeController`?

Both approaches work, but since "add" is related to our calculator homepage, adding a method to `HomeController` makes sense. One controller can have **multiple methods** with **different mappings**.

### 🔄 The Complete Flow We're Building

```
Step 1 (Done ✅):
User visits localhost:8080/ → HomeController.home() → index.jsp → Calculator form

Step 2 (Next 🔜):
User fills form, clicks Submit → localhost:8080/add?num1=6&num2=7
→ HomeController.add() → Processes addition → Returns result page
```

---

## 📊 Understanding the Request Journey

### The Full Picture So Far

```
╔══════════════════════════════════════════════════════════╗
║                    REQUEST FLOW                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  1. User visits localhost:8080/                           ║
║     ↓                                                    ║
║  2. DispatcherServlet routes to HomeController            ║
║     ↓                                                    ║
║  3. @RequestMapping("/") → home() called                 ║
║     ↓                                                    ║
║  4. Returns "index.jsp" → Calculator form displayed      ║
║     ↓                                                    ║
║  5. User types 6 and 7, clicks Submit                    ║
║     ↓                                                    ║
║  6. Browser sends: GET /add?num1=6&num2=7                ║
║     ↓                                                    ║
║  7. DispatcherServlet looks for /add mapping              ║
║     ↓                                                    ║
║  8. ❌ No mapping found → 404 Error                      ║
║                                                          ║
║  NEXT: Create @RequestMapping("/add") to handle step 8   ║
╚══════════════════════════════════════════════════════════╝
```

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **Server-side processing pattern**
   - Client sends data → Server processes → Server responds
   - This pattern applies to everything: calculators, e-commerce, banking
   - JavaScript can do simple things client-side, but real apps need servers

2. **HTML Forms**
   - `<form action="add">` — defines where data is sent
   - `<input name="num1">` — the `name` attribute is what the server reads
   - `<button type="submit">` — triggers form submission
   - Default method is GET (data appears in URL)

3. **Query Parameters**
   - Form data sent via GET appears in the URL: `?num1=6&num2=7`
   - Key-value pairs separated by `&`
   - The `name` attribute of inputs becomes the key
   - Visible, bookmarkable, but not secure for sensitive data

4. **Static Resources (CSS) in Spring Boot**
   - CSS, JS, images go in `src/main/resources/static/`
   - Spring Boot auto-serves them at the root URL
   - Link in JSP with `<link rel="stylesheet" href="style.css">`

5. **The 404 on form submit**
   - Form sends to `/add` but no controller handles `/add`
   - Need `@RequestMapping("/add")` on a new method
   - Same pattern as Document 51 — every URL needs a mapping

### ⚠️ Common Mistakes

1. **❌ Forgetting the `name` attribute on inputs**
   ```html
   <!-- BAD - data won't be sent -->
   <input type="text" id="num1">
   
   <!-- GOOD - name is what the server reads -->
   <input type="text" id="num1" name="num1">
   ```

2. **❌ Putting CSS in the wrong folder**
   ```
   BAD:  src/main/webapp/style.css
   BAD:  src/main/java/style.css
   GOOD: src/main/resources/static/style.css
   ```

3. **❌ Mismatching form action and controller mapping**
   ```html
   <form action="add">  ← sends to /add
   ```
   ```java
   @RequestMapping("/addition")  ← mapped to /addition ❌
   @RequestMapping("/add")       ← must match! ✅
   ```

4. **❌ Confusing `id` with `name`**
   - `id` — used by CSS and JavaScript (frontend only)
   - `name` — used by HTTP to send data to server (critical!)

### 💡 Pro Tips

1. **Always check the URL bar** after a form submit. It tells you exactly what request was sent and what data was included. This is your best debugging tool for GET requests.

2. **GET vs POST preview**: GET puts data in the URL (visible, bookmarkable). POST puts data in the request body (hidden, more secure). We'll cover POST when handling sensitive data.

3. **Name your inputs meaningfully**: The `name` attribute becomes the parameter name in your controller. `num1` is fine for a calculator, but use descriptive names like `firstName`, `emailAddress` in real applications.

4. **Static resources don't need controller mapping**: Unlike JSP files, CSS/JS/images in `static/` are served directly by Spring Boot without any controller. That's by design — they're public resources.

---

## 🎬 What's Next

We've built the frontend part of our calculator — the form that collects two numbers. But clicking Submit gives us a 404 because we haven't created the backend handler yet.

In the next lesson, we'll:
- Create a `@RequestMapping("/add")` method
- Learn how to **read query parameters** in Spring Boot (the `@RequestParam` annotation)
- Perform the addition on the server
- Return the result to the user

The client is talking — it's time to teach the server how to listen!
