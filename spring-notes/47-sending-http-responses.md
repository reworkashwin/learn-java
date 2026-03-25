# 📤 Document 47: Sending HTTP Responses and Understanding HTTP Methods

## Introduction: From Console to Browser

In Document 46, we successfully connected our servlet to Tomcat:

✅ **Context created** (application container)
✅ **Servlet registered** (Tomcat knows about HelloServlet)
✅ **URL mapped** (/hello → HelloServlet)
✅ **service() called** ("in service" printed to console!)

**But the browser showed a blank page!** 😞

**The Problem:**

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) {
    System.out.println("in service");  // Console ✅
    // Nothing to browser! ❌
}
```

**"Now let's send the response."**

We're printing to the **console** (server-side), but we need to print to the **browser** (client-side). This is the difference between:

```
System.out.println()  →  Server console
response.getWriter()  →  Client browser
```

In this video, we'll learn:

1. **Using response.getWriter()** to send data to browser
2. **The "paper and pen" analogy** (response = paper, writer = pen)
3. **PrintWriter object** (storing writer in variable)
4. **Sending HTML content** (H2 tags, bold, italic)
5. **Setting content type** (text/html vs plain text)
6. **Understanding MVC separation** (logic vs view)
7. **HTTP methods** (GET, POST, PUT, DELETE)
8. **service() vs doGet()** (proper method selection)
9. **Testing with different HTTP methods**

Let's make our servlet speak to the browser!

---

## Step 1: Understanding the Response Object

**"So what you can do is if you want to send a response from a servlet, this is where you have to make the changes."**

### Where to Make Changes

```java
public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                       HttpServletResponse response) {
        // This is where we make changes! ⬅️
        System.out.println("in service");
    }
}
```

**"Now how do you send a response? If you can see we do have a response object here right. So we can simply use this object and we can send the response."**

### The Response Object

We already have the `response` parameter:

```java
HttpServletResponse response
        ↓
This object represents the HTTP response
        ↓
Whatever we write here → Goes to browser
```

**"See. Anyway, when you run the servlet the client will receive the data from response, but by default is empty. We have to send some data, right."**

**The Flow:**

```
1. Browser sends request
        ↓
2. Tomcat creates empty response object
        ↓
3. Tomcat calls: servlet.service(request, response)
        ↓
4. Your code: Write data to response ← We need to do this!
        ↓
5. Tomcat sends response to browser
```

**Currently:** Response is empty → Blank page
**Goal:** Fill response with content → "Hello World"

---

## Step 2: The "Paper and Pen" Analogy

**"And to do that we have to get the hold on the writer. It's more like a taking a pen. So response object is a paper. Get the pen first."**

### Perfect Analogy! 📝

**Response Object = Blank Paper**
```
HttpServletResponse response
        ↓
Empty paper that goes to browser
```

**Writer = Pen**
```
response.getWriter()
        ↓
The pen to write on the paper
```

**Writing = Filling the Paper**
```
writer.print("Hello World")
        ↓
Using pen to write on paper
```

**Complete Process:**

```
1. Get paper (already have response object) ✅
2. Get pen: response.getWriter()
3. Write on paper: writer.print("Hello World")
4. Send paper to browser (Tomcat does this automatically)
```

**Beautiful analogy that makes HTTP response concrete!**

---

## Step 3: Getting the Writer

**"So I will say get writer."**

### The getWriter() Method

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) {
    response.getWriter().print("Hello World");
}
```

**Breaking It Down:**

```java
response.getWriter()
    ↓          ↓
Response  Get the writer
object    (pen for this paper)
```

**What getWriter() Returns:**

```java
PrintWriter writer = response.getWriter();
//    ↓                     ↓
//  Type              Returns PrintWriter object
```

---

## Step 4: Printing "Hello World"

**"And with this it is a method called print. And whatever you want to print you can print it here. So I will just print hello world."**

### The print() Method

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) {
    response.getWriter().print("Hello World");
}
```

**"Okay. Our job is done."**

### Handling IOException

**"It's just that it might throw an exception. So I will simply add the exception signature here. Or the exception which is throws Ioexception."**

**Why IOException?**

Writing to response involves I/O (Input/Output):
- Network connection might fail
- Client might disconnect
- Stream might close unexpectedly

**Adding throws:**

```java
import java.io.IOException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                       HttpServletResponse response) 
                       throws IOException {  // Handle exception!
        response.getWriter().print("Hello World");
    }
}
```

**"And that's it. We are sending data back to the client I'm sending hello world."**

---

## Step 5: Understanding What We Did

**"So what we did is response object was anywhere. Anywhere was going to the client. We just writing some content on it."**

### The Concept

**Before:**
```
Response Object (empty)
┌─────────────────────┐
│                     │
│    [Empty Paper]    │
│                     │
└─────────────────────┘
        ↓
  Sent to browser
        ↓
  Blank page displayed
```

**After:**
```
Response Object (with content)
┌─────────────────────┐
│                     │
│   "Hello World"     │
│                     │
└─────────────────────┘
        ↓
  Sent to browser
        ↓
  "Hello World" displayed!
```

**"So it's like anywhere the servlet is going to return a page which is empty. I just took a pen and have written Hello World. Okay, let's see if this works."**

---

## Step 6: Testing - Success!

**"Let's rerun this and go back to your browser run and you got Hello World."**

### Console Output

```
Hello World!
INFO: Starting service [Tomcat]
in service
```

### Browser Display

**URL:** `http://localhost:8080/hello`

**Browser Shows:**
```
Hello World
```

(in plain text, white text on black background)

**"Oh, the good thing is it is running a dark theme. I don't know how, but, uh, we got it's working. Okay."**

😄 Browser's dark mode made the text visible!

### Success! 🎉

✅ **Request sent** to http://localhost:8080/hello
✅ **Servlet called** (service() executed)
✅ **Response generated** (response.getWriter().print(...))
✅ **Browser displays** "Hello World"

**We've completed the full HTTP request-response cycle!**

---

## Step 7: Better Approach - Using PrintWriter Variable

**"Now, if you're not comfortable with this sometime, you want to know what this get writer gives you. So there's another way you can do this."**

### Storing Writer in Variable

**"First say response dot get writer. And this get writer returns you the object of print writer. Right."**

```java
PrintWriter out = response.getWriter();
```

**"So I can simply say print writer. And I will say this is maybe out equal to artist dot get writer."**

### Complete Code

```java
import java.io.IOException;
import java.io.PrintWriter;  // Import PrintWriter!
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                       HttpServletResponse response) 
                       throws IOException {
        
        // Get the writer (pen)
        PrintWriter out = response.getWriter();
        
        // Use the writer to print
        out.println("Hello World");
    }
}
```

**"And every every time you want to print now you can simply say out dot println."**

### Why This is Better

**"Now this looks much better compared to direct directly using response dot get writer out because we are familiar with system dot out dot println, right? So this looks similar."**

**Comparison:**

```java
// Approach 1: Direct (verbose)
response.getWriter().print("Hello World");
response.getWriter().print("Line 2");
response.getWriter().print("Line 3");

// Approach 2: Variable (cleaner)
PrintWriter out = response.getWriter();
out.println("Hello World");
out.println("Line 2");
out.println("Line 3");
```

**Familiar Pattern:**

```java
System.out.println("Console");  // We know this!
    ↓
PrintWriter out = response.getWriter();
out.println("Browser");  // Same pattern!
```

---

## Step 8: Understanding the Difference

**"The difference is system dot out dot println. Prints on the console out dot println. Depends upon from where you got this out object."**

### System.out vs response.getWriter()

**System.out (Standard Output):**

```java
System.out.println("In service");
    ↓
Prints to console (server-side)
    ↓
Developer sees it
    ↓
User never sees it
```

**response.getWriter() (HTTP Response):**

```java
PrintWriter out = response.getWriter();
out.println("Hello World");
    ↓
Writes to HTTP response body
    ↓
Sent over network to browser
    ↓
User sees it!
```

**"We are getting it because from the response this will write in the response object."**

### Side-by-Side Comparison

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) 
                   throws IOException {
    
    // Server console (developer sees)
    System.out.println("Processing request...");
    
    // HTTP response (user sees)
    PrintWriter out = response.getWriter();
    out.println("Hello World");
}
```

**Console Output:**
```
Processing request...
```

**Browser Output:**
```
Hello World
```

**Different destinations!**

---

## Step 9: Adding HTML Tags

**"And not just this. You can also mention the tags because we are using a HTML page, right? So we can also mention this is as H2."**

### Writing HTML

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) 
                   throws IOException {
    
    PrintWriter out = response.getWriter();
    out.println("<h2>Hello World</h2>");
}
```

**"Maybe if you want to make it italic or bold, if you want it to bold bold close."**

### Adding Bold Tag

```java
PrintWriter out = response.getWriter();
out.println("<h2><b>Hello World</b></h2>");
```

**HTML Structure:**

```html
<h2>           ← Heading 2 (larger text)
    <b>        ← Bold
        Hello World
    </b>
</h2>
```

---

## Step 10: The HTML Tag Problem

**"Now since we are writing HTML, we can do this stuff. Let's rerun this refresh. Okay, on refreshing you can see we are getting HTML tags. That's weird."**

### What Happened

**Browser Display:**
```
<h2><b>Hello World</b></h2>
```

**Expected:**
```
Hello World  (large, bold text)
```

**"We don't want to show HTML tags, right? We want to show it is its effect, its estimated tag. So it should convert the text the way I want."**

### The Problem

**Browser is treating response as plain text!**

```
Browser receives: <h2><b>Hello World</b></h2>
Browser thinks: "Plain text with < and > characters"
Browser displays: <h2><b>Hello World</b></h2> (literally!)
```

**Why?**

**Default content type:** `text/plain`

```
text/plain → Display everything literally
    ↓
<h2> is displayed as "<h2>" (not interpreted)
```

---

## Step 11: Setting Content Type

**"So the thing is by default is sending data. What you can do is before sending it, you can set the type of data the response object will have."**

### The setContentType() Method

**"So you can say response dot set content type. And you can mention the content type is text slash HTML."**

```java
response.setContentType("text/html");
```

### Complete Code

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) 
                   throws IOException {
    
    // Set content type BEFORE writing!
    response.setContentType("text/html");
    
    PrintWriter out = response.getWriter();
    out.println("<h2><b>Hello World</b></h2>");
}
```

**"Now what it will do is it will understand. Hey, you are also sending HTML, not just a plain text. So it will try to convert your HTML into a design. And that's how it works."**

### How It Works

**With Content Type:**

```
HTTP Response Headers:
Content-Type: text/html  ← Browser sees this!
        ↓
Browser thinks: "This is HTML, parse it!"
        ↓
<h2> → Render as heading
<b> → Render as bold
        ↓
Result: Large, bold "Hello World"
```

---

## Step 12: Testing with Content Type - Success!

**"You can see we got Hello World and it went back to the design which we want because we are specifically mentioning that I will be sending the HTML tags."**

### Browser Display

**Before (text/plain):**
```
<h2><b>Hello World</b></h2>  (literal text)
```

**After (text/html):**
```
Hello World  (large, bold heading)
```

**"So that's how basically you can, uh, get this thing working. So what we are doing is we are returning the content now from the response object with the HTML tags as well."**

### Common Content Types

```java
// HTML page
response.setContentType("text/html");

// Plain text
response.setContentType("text/plain");

// JSON data
response.setContentType("application/json");

// XML data
response.setContentType("application/xml");

// CSS stylesheet
response.setContentType("text/css");

// JavaScript
response.setContentType("application/javascript");
```

---

## Step 13: The Problem with Embedding HTML in Servlets

**"So this is one way of doing it. But we also have a concept of MVC where you keep your logic and view separate."**

### What We're Doing Now

**"What we are doing here is in the same servlet. We are doing three things."**

**1. Accepting Request**
```java
HttpServletRequest request  // Receiving data
```

**2. Processing Data**
```java
// Business logic (we could do calculations, database queries, etc.)
```

**3. Returning Presentation**
```java
out.println("<h2><b>Hello World</b></h2>");  // HTML!
```

**All in one place!** 😰

### The Problem

**"We are accepting request. We are processing the data if you want. Of course you can do that here. We are not doing it and we are also returning the data. And when you return the data, you're not just returning a plain data, you are returning the HTML page."**

**Imagine a Real Page:**

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) 
                   throws IOException {
    
    response.setContentType("text/html");
    PrintWriter out = response.getWriter();
    
    // Hundreds of lines of HTML! 😱
    out.println("<!DOCTYPE html>");
    out.println("<html>");
    out.println("<head>");
    out.println("<title>My Page</title>");
    out.println("<style>");
    out.println("body { font-family: Arial; }");
    out.println("h1 { color: blue; }");
    out.println("</style>");
    out.println("</head>");
    out.println("<body>");
    out.println("<nav>");
    out.println("<ul>");
    out.println("<li>Home</li>");
    out.println("<li>About</li>");
    out.println("</ul>");
    out.println("</nav>");
    // ... 500 more lines!
}
```

**"So let's say if you're building a complex design, in this case you have to write thousands of HTML tags and imagine writing everything in the servlet or in this particular service will not look good, even if you can do that."**

### Maintenance Nightmare

**"If someone wants to debug it, it will be a nightmare. First of all, you're writing a HTML tag inside Java code. How? I don't want to do that."**

**Problems:**

**1. No Syntax Highlighting**
```java
out.println("<div class='container'>");  // Just a string!
```

**2. No HTML Validation**
```java
out.println("<div>");
// Forget to close! ❌ No error shown!
```

**3. Mixing Concerns**
```java
// Business logic
int total = calculateTotal();

// HTML presentation
out.println("<h1>Total: " + total + "</h1>");

// More logic
saveToDatabase(total);

// More HTML
out.println("<footer>Copyright 2023</footer>");

// Chaos! 😵
```

**4. Design Changes Require Java Recompilation**
```
Designer: "Change button from blue to red"
Developer: "Need to edit Java, recompile, redeploy!" 😤
```

---

## Step 14: Introduction to MVC

**"So that's why we use something called MVC. We discuss about that in some time, but we have a concept of MVC where you separate this stuff."**

### MVC = Model-View-Controller

**Separation of Concerns:**

```
┌─────────────────────────────────────────┐
│  Controller (Servlet)                   │
│  ├── Accept request                     │
│  ├── Process data                       │
│  └── Choose view                        │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Model (Java Classes)                   │
│  ├── Business logic                     │
│  ├── Data structures                    │
│  └── Database interaction               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  View (JSP/HTML/Thymeleaf)             │
│  ├── Presentation only                  │
│  ├── HTML, CSS, JavaScript              │
│  └── Display data from model            │
└─────────────────────────────────────────┘
```

**Better Approach:**

**Servlet (Controller):**
```java
// Just business logic!
public void doGet(HttpServletRequest request, 
                  HttpServletResponse response) {
    String name = request.getParameter("name");
    String greeting = "Hello, " + name;
    
    request.setAttribute("greeting", greeting);
    request.getRequestDispatcher("hello.jsp").forward(request, response);
}
```

**JSP (View):**
```jsp
<!-- Separate HTML file! -->
<!DOCTYPE html>
<html>
<head>
    <title>Greeting</title>
</head>
<body>
    <h2>${greeting}</h2>
</body>
</html>
```

**Benefits:**
- ✅ Java code focuses on logic
- ✅ HTML focuses on presentation
- ✅ Designer edits HTML directly
- ✅ No Java recompilation for design changes
- ✅ Proper syntax highlighting for each
- ✅ Maintainable and testable

**"But yeah, at least we are able to send data."**

We'll learn MVC properly later, but for now, we understand the limitation!

---

## Step 15: Understanding HTTP Methods

**"But there is one more question. When you send a request this is by default a Get request."**

### HTTP Methods Overview

**"There is something called methods in HTTP. We got get, post, put delete and multiple uh but then this four are famous."**

**The Big Four:**

| Method | Purpose | Example Use Case |
|--------|---------|------------------|
| GET | Retrieve data | View user profile |
| POST | Send/Create data | Submit registration form |
| PUT | Update data | Edit user profile |
| DELETE | Remove data | Delete account |

### GET Method

**"So let's say if you want to get data from a server you use a Get request."**

**Characteristics:**
- Read-only operation
- Data in URL (query parameters)
- Can be bookmarked
- Can be cached
- Visible in browser history

**Example:**
```
http://localhost:8080/users?id=123
                             ↑
                    Data in URL
```

### POST Method

**"When you want to send data to the server. We use Post request."**

**Characteristics:**
- Creates or sends data
- Data in request body (not URL)
- Cannot be bookmarked
- Not cached
- Secure (data not visible in URL)

**Example:**
```html
<form method="POST" action="/register">
    <input name="username" />
    <input name="password" type="password" />
    <button>Submit</button>
</form>
```

### PUT Method

**"And if you want to update something, we use a put request."**

**Used for:** Full updates to existing resources

**Example:**
```
PUT /users/123
Body: { "name": "New Name", "email": "new@email.com" }
```

### DELETE Method

**"When you want to, uh, delete something from the server, use you send delete request."**

**Used for:** Removing resources

**Example:**
```
DELETE /users/123
(Deletes user with ID 123)
```

---

## Step 16: Browser Limitation

**"How do you accept different type of request? See using browser you can only get the Get request."**

### Browser Behavior

**When you type URL in address bar:**
```
http://localhost:8080/hello
        ↓
Browser sends GET request (always!)
```

**"But what if you want to send data? You are creating a form in which you are submitting some data. In that case you will be using a Post request."**

### Form Example

```html
<!-- GET form (default) -->
<form action="/search">
    <input name="query" />
    <button>Search</button>
</form>
<!-- Submits: GET /search?query=something -->

<!-- POST form -->
<form action="/register" method="POST">
    <input name="username" />
    <input name="password" type="password" />
    <button>Register</button>
</form>
<!-- Submits: POST /register (data in body) -->
```

---

## Step 17: The service() Method Problem

**"We are not mentioning any type of request here. We are saying service."**

### Current Code

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) 
                   throws IOException {
    // This handles ALL HTTP methods!
    // GET, POST, PUT, DELETE, everything!
}
```

**The Issue:**

`service()` is called for **every HTTP method**:

```
GET /hello     → service() called
POST /hello    → service() called
PUT /hello     → service() called
DELETE /hello  → service() called
```

**No differentiation!** We can't handle GET and POST differently.

---

## Step 18: Using doGet() Method

**"So the ideal way is to use. Civic methods like do get now, do get is a method. It's a part of servlet which works with the Get request."**

### The doGet() Method

```java
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void doGet(HttpServletRequest request, 
                      HttpServletResponse response) 
                      throws IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<h2><b>Hello World</b></h2>");
    }
}
```

**Method changed:** `service()` → `doGet()`

**"Now since we're not submitting data, I'll stick to do get and let's rerun this."**

### Testing

**URL:** `http://localhost:8080/hello`

**Browser sends:** GET request

**Result:** `doGet()` method called!

**"Go back here and it works."**

✅ Still works perfectly!

---

## Step 19: Understanding Method Routing

### How HttpServlet Routes Requests

**HttpServlet.service() Internal Logic:**

```java
// Simplified version of what HttpServlet does internally
public void service(HttpServletRequest request, 
                   HttpServletResponse response) {
    
    String method = request.getMethod();
    
    if ("GET".equals(method)) {
        doGet(request, response);
    } else if ("POST".equals(method)) {
        doPost(request, response);
    } else if ("PUT".equals(method)) {
        doPut(request, response);
    } else if ("DELETE".equals(method)) {
        doDelete(request, response);
    }
}
```

**The Routing:**

```
Browser sends GET request
        ↓
Tomcat calls service(request, response)
        ↓
service() checks request.getMethod() → "GET"
        ↓
service() calls doGet(request, response)
        ↓
Your doGet() code executes!
```

**When we override `service()` directly:**
- We bypass this routing mechanism
- We handle ALL methods ourselves
- Less control, less flexibility

**When we override `doGet()`, `doPost()`, etc.:**
- HttpServlet does the routing for us
- We handle specific methods
- Clean separation of concerns

---

## Step 20: Using Multiple HTTP Methods

### Complete Example

```java
public class UserServlet extends HttpServlet {
    
    // Handle GET - Retrieve user
    public void doGet(HttpServletRequest request, 
                     HttpServletResponse response) 
                     throws IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        
        String userId = request.getParameter("id");
        out.println("<h2>User ID: " + userId + "</h2>");
        out.println("<p>Fetching user details...</p>");
    }
    
    // Handle POST - Create new user
    public void doPost(HttpServletRequest request, 
                      HttpServletResponse response) 
                      throws IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        
        String username = request.getParameter("username");
        out.println("<h2>Creating user: " + username + "</h2>");
        out.println("<p>User created successfully!</p>");
    }
    
    // Handle DELETE - Remove user
    public void doDelete(HttpServletRequest request, 
                        HttpServletResponse response) 
                        throws IOException {
        
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        
        String userId = request.getParameter("id");
        out.println("<h2>Deleting user: " + userId + "</h2>");
        out.println("<p>User deleted successfully!</p>");
    }
}
```

**Different methods for different operations!**

---

## Step 21: Testing Different Methods

### Testing GET (Browser)

**Easy!** Just type URL:
```
http://localhost:8080/users?id=123
```

→ Calls `doGet()`

### Testing POST (HTML Form)

```html
<!DOCTYPE html>
<html>
<body>
    <form action="http://localhost:8080/users" method="POST">
        <input name="username" placeholder="Username" />
        <button>Create User</button>
    </form>
</body>
</html>
```

→ Calls `doPost()`

### Testing PUT/DELETE (Tools Required)

**Browser can't send PUT/DELETE directly!**

**Tools:**
- **Postman** (API testing tool)
- **cURL** (command-line)
- **JavaScript fetch()** (code)

**cURL Example:**
```bash
# PUT request
curl -X PUT http://localhost:8080/users?id=123

# DELETE request
curl -X DELETE http://localhost:8080/users?id=123
```

---

## Understanding the Complete Flow

### Request-Response Lifecycle

```
1. Browser: http://localhost:8080/hello
        ↓
2. Browser sends HTTP GET request
        ↓
3. Tomcat receives request on port 8080
        ↓
4. Tomcat looks up URL mapping: /hello → "HelloServlet"
        ↓
5. Tomcat finds servlet instance (HelloServlet)
        ↓
6. Tomcat creates request and response objects
        ↓
7. Tomcat calls: servlet.service(request, response)
        ↓
8. service() checks method: "GET"
        ↓
9. service() calls: doGet(request, response)
        ↓
10. Your doGet() code:
    - Sets content type: text/html
    - Gets writer: response.getWriter()
    - Writes: "<h2><b>Hello World</b></h2>"
        ↓
11. doGet() returns
        ↓
12. Tomcat sends HTTP response to browser
        ↓
13. Browser receives response
        ↓
14. Browser parses HTML (because Content-Type: text/html)
        ↓
15. Browser renders: Large, bold "Hello World"
```

**Complete cycle! 🎉**

---

## Code Summary: Final Version

### HelloServlet.java

```java
package com.telusko;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    // Handle GET requests
    public void doGet(HttpServletRequest request, 
                     HttpServletResponse response) 
                     throws IOException {
        
        // Set content type (BEFORE writing)
        response.setContentType("text/html");
        
        // Get the writer (pen for paper)
        PrintWriter out = response.getWriter();
        
        // Write HTML to response
        out.println("<h2><b>Hello World</b></h2>");
    }
}
```

### App.java (No Changes)

```java
package com.telusko;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        
        Context context = tomcat.addContext("", null);
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        context.addServletMapping("/hello", "HelloServlet");
        
        tomcat.start();
        tomcat.getServer().await();
    }
}
```

---

## Key Concepts Deep Dive

### 1. Response Object as Paper

**Perfect Analogy:**

```
HttpServletResponse = Blank paper
PrintWriter = Pen
writer.print() = Writing on paper
Tomcat sends paper = Browser displays content
```

**Why This Matters:**

Everything you "write" to the response goes to the browser:

```java
out.println("Line 1");  // Browser sees: Line 1
out.println("Line 2");  // Browser sees: Line 2
out.println("<b>Bold</b>");  // Browser sees: Bold (if text/html)
```

### 2. Content Type Importance

**Content-Type Header:**

```
HTTP/1.1 200 OK
Content-Type: text/html  ← Critical!
Content-Length: 27

<h2><b>Hello World</b></h2>
```

**Browser Behavior:**

```
text/html → Parse as HTML → Render tags
text/plain → Display literally → Show <h2> as text
application/json → Parse as JSON → For JavaScript
```

**Always set before writing!**

```java
response.setContentType("text/html");  // ✅ First!
PrintWriter out = response.getWriter();  // Then get writer
out.println("<h2>Title</h2>");  // Then write
```

### 3. PrintWriter vs System.out

**Confusion Point:**

```java
System.out.println("Hello");  // Console
    vs
out.println("Hello");  // Browser
```

**They look similar but go to different places!**

```java
public void doGet(HttpServletRequest request, 
                 HttpServletResponse response) 
                 throws IOException {
    
    // Server log (invisible to user)
    System.out.println("Request received at: " + new Date());
    
    // Browser display (visible to user)
    PrintWriter out = response.getWriter();
    out.println("<h1>Welcome!</h1>");
}
```

### 4. HTTP Methods Map to Java Methods

**Clean Separation:**

| HTTP Method | Java Method | Purpose |
|-------------|-------------|---------|
| GET | doGet() | Retrieve/Read |
| POST | doPost() | Create/Send |
| PUT | doPut() | Update |
| DELETE | doDelete() | Remove |
| HEAD | doHead() | Headers only |
| OPTIONS | doOptions() | Supported methods |

**RESTful Design:**

```java
// GET /users/123 → Fetch user 123
public void doGet(...) { }

// POST /users → Create new user
public void doPost(...) { }

// PUT /users/123 → Update user 123
public void doPut(...) { }

// DELETE /users/123 → Delete user 123
public void doDelete(...) { }
```

### 5. MVC Pattern Preview

**Current Approach (Not MVC):**

```java
// Servlet does EVERYTHING
public void doGet(...) {
    // 1. Get data (Controller)
    String name = request.getParameter("name");
    
    // 2. Process data (Model)
    String greeting = "Hello, " + name.toUpperCase();
    
    // 3. Display HTML (View)
    out.println("<html>");
    out.println("<body>");
    out.println("<h1>" + greeting + "</h1>");
    out.println("</body>");
    out.println("</html>");
}
```

**MVC Approach (Better):**

```java
// Servlet = Controller only
public void doGet(...) {
    String name = request.getParameter("name");
    String greeting = greetingService.generateGreeting(name);  // Model
    request.setAttribute("greeting", greeting);
    request.getRequestDispatcher("greeting.jsp").forward(...);  // View
}
```

**Separation:**
- **Controller (Servlet):** Traffic cop
- **Model (Java class):** Business logic
- **View (JSP):** Presentation

---

## Common Errors and Solutions

### Error 1: Blank Page (Content Not Set)

**Problem:**
```java
public void doGet(...) throws IOException {
    // Forgot to write anything!
}
```

**Solution:**
```java
PrintWriter out = response.getWriter();
out.println("Content");  // Write something!
```

### Error 2: HTML Tags Displayed Literally

**Problem:**
```java
out.println("<h1>Title</h1>");
// Browser shows: <h1>Title</h1> (literally)
```

**Cause:** Content type not set!

**Solution:**
```java
response.setContentType("text/html");  // Set first!
out.println("<h1>Title</h1>");  // Now renders properly
```

### Error 3: IOException Not Handled

**Problem:**
```java
public void doGet(...) {  // ❌ No throws!
    response.getWriter().println("Hello");
}
```

**Error:** `Unhandled exception: java.io.IOException`

**Solution:**
```java
public void doGet(...) throws IOException {  // ✅ Add throws!
    response.getWriter().println("Hello");
}
```

### Error 4: Wrong Method Called

**Problem:** Typing URL (GET) but only doPost() implemented.

```java
public void doPost(...) {
    // Only handles POST
}
```

**Browser:** 405 Method Not Allowed

**Solution:** Implement doGet():
```java
public void doGet(...) {
    // Handle GET requests
}
```

### Error 5: service() Overridden Incorrectly

**Problem:**
```java
public void service(...) {
    // Handles all methods
}

public void doGet(...) {
    // Never called! service() bypasses routing!
}
```

**Solution:** Remove service(), use doGet(), doPost(), etc.

---

## Best Practices

### 1. Always Set Content Type

```java
// ✅ Good
response.setContentType("text/html");
PrintWriter out = response.getWriter();

// ❌ Bad
PrintWriter out = response.getWriter();
// (Content type defaults to text/plain)
```

### 2. Use Specific HTTP Methods

```java
// ✅ Good - Specific methods
public void doGet(...) { }
public void doPost(...) { }

// ❌ Bad - Generic service()
public void service(...) { }
```

### 3. Store PrintWriter in Variable

```java
// ✅ Good - Reusable variable
PrintWriter out = response.getWriter();
out.println("Line 1");
out.println("Line 2");

// ❌ Bad - Repetitive
response.getWriter().println("Line 1");
response.getWriter().println("Line 2");
```

### 4. Don't Embed Complex HTML

```java
// ❌ Bad - HTML in servlet
out.println("<html><head><style>...");  // 500 lines!

// ✅ Good - Use JSP/template
request.getRequestDispatcher("view.jsp").forward(...);
```

### 5. Use Logging, Not System.out

```java
// ❌ Bad - System.out in production
System.out.println("Request received");

// ✅ Good - Proper logging
logger.info("Request received for user: " + userId);
```

---

## What We Accomplished

**"So now I hope you got the idea how this servlet works. And we are basically able to run a servlet and get the output on the page."**

### Complete Achievement! 🏆

✅ **Send response to browser** (response.getWriter())
✅ **Use PrintWriter** (familiar pattern like System.out)
✅ **Understand paper/pen analogy** (response = paper, writer = pen)
✅ **Send HTML content** (h2, bold tags)
✅ **Set content type** (text/html for proper rendering)
✅ **Understand MVC need** (separation of logic and view)
✅ **Learn HTTP methods** (GET, POST, PUT, DELETE)
✅ **Use doGet() method** (proper method routing)
✅ **Complete request-response cycle** (browser → servlet → browser)

### The Journey

```
Document 44: Project setup ✅
Document 45: Servlet creation ✅
Document 46: URL mapping ✅
Document 47: HTTP response ✅ ← Today!
```

**We can now:**
- Start Tomcat programmatically
- Register servlets
- Map URLs to servlets
- Handle HTTP requests
- Send HTML responses
- Display content in browser

**Full-stack web application working!** (Basic, but complete!)

---

## What's Next

### Upcoming Topics

**1. JSP (JavaServer Pages)**
- Separate HTML from servlet
- Template-based rendering
- Better for complex UIs

**2. Servlet Filters**
- Pre-processing requests
- Authentication, logging
- Response modification

**3. Session Management**
- Track users across requests
- Shopping carts, login state
- HttpSession object

**4. Form Handling**
- POST requests
- Form data processing
- Validation

**5. Spring MVC**
- Modern framework approach
- @Controller, @RequestMapping
- Automatic configuration

**6. Spring Boot**
- Auto-configuration magic
- Embedded Tomcat automatic
- Minimal code, maximum power

**The Foundation is Set!**

You now understand what happens behind the scenes in Spring MVC and Spring Boot. When you see `@RestController`, you'll know it's creating servlets, mapping URLs, and handling HTTP requests/responses—just like we did manually!

---

## Conclusion: From Blank Page to Dynamic HTML

We've completed the HTTP response journey:

**Before:**
```
Browser: http://localhost:8080/hello
Result: Blank page (no response content)
```

**After:**
```
Browser: http://localhost:8080/hello
Result: "Hello World" (large, bold, properly rendered)
```

**The Magic:**

```java
response.setContentType("text/html");  // Tell browser it's HTML
PrintWriter out = response.getWriter();  // Get the pen
out.println("<h2><b>Hello World</b></h2>");  // Write content
```

**Three simple lines that bridge server and browser!**

**Key Insight:** The response object is your blank paper, the writer is your pen, and whatever you write gets sent to the browser. Set the content type so the browser knows how to interpret what you wrote!

**We've mastered:** Pure servlets, embedded Tomcat, HTTP request-response cycle, and URL mapping. Now we're ready to appreciate the abstractions that Spring MVC and Spring Boot provide!

Congratulations on building your first functional web servlet! 🎉🚀
