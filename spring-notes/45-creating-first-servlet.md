# ⚙️ Document 45: Creating Your First Servlet and Starting Embedded Tomcat

## Introduction: From Setup to Code

In Document 44, we prepared our development environment:

✅ Created Maven project `servlet-example`
✅ Added Servlet API dependency (javax.servlet-api)
✅ Added Embedded Tomcat dependency (tomcat-embed-core)
✅ Project structure ready

But we haven't written a single line of servlet code yet!

**"So our project is ready. I mean, the structure is ready. Now. Let's create a servlet."**

In this video, we're going to:

1. **Create our first servlet class** (HelloServlet)
2. **Extend HttpServlet** to gain servlet capabilities
3. **Implement service() method** (called on every request)
4. **Understand request and response objects** (HttpServletRequest, HttpServletResponse)
5. **Start embedded Tomcat programmatically** (from main method)
6. **Make Tomcat keep running** (await() method)
7. **Encounter and understand errors** (404 - servlet not mapped)
8. **Realize the need for URL mapping** (next video's topic!)

This is a **trial-and-error learning video**—we'll make mistakes, understand why they happen, and fix them. This is how you truly learn!

Let's write our first servlet!

---

## Step 1: Understanding the Goal

Before we start coding, let's clarify what we're building:

**Goal:** Create a simple servlet that greets the user.

**User Journey:**
```
1. User opens browser
2. User visits: http://localhost:8080/hello
3. Browser sends HTTP request to server
4. Servlet receives request
5. Servlet sends response: "Hello World" (or greeting)
6. Browser displays response
```

**Simple, right?** But there's a lot happening under the hood! Let's build it step by step.

---

## Step 2: Creating a Servlet Class

**"Now if you think about creating something in Java. So let's say if you want to create a feature we create a class. Right."**

### Java's Class-Based Approach

In Java, everything is a class:

```java
// Want to store data? Create a class.
class Student { }

// Want functionality? Create a class.
class Calculator { }

// Want a web endpoint? Create a class (servlet).
class HelloServlet { }
```

**"So here also if you want to create a servlet you have to create a class."**

### Creating the Class in IntelliJ

**"So what I will do is I will just go back to my project. I will right click here and say new. Let me create a simple class here."**

**Steps:**

1. Navigate to `src/main/java/com/telusko/`
2. Right-click → **New → Java Class**
3. **Name:** `HelloServlet`

**"And we'll name this class as Let's Say Hello servlet."**

### Naming Convention

**"Of course you can name anything you want, but having a servlet at the end defines or it tells the developers that hey, this is a servlet, right? So use a proper name."**

**Good Servlet Names:**
```java
HelloServlet       ✅ Clear purpose
StudentServlet     ✅ Works with students
LoginServlet       ✅ Handles login
UserServlet        ✅ User operations
```

**Poor Servlet Names:**
```java
Hello              ❌ Could be anything
MyClass            ❌ Not descriptive
Servlet1           ❌ Meaningless
```

**Best Practice:** End servlet names with "Servlet" for clarity!

### Initial Class Structure

```java
package com.telusko;

public class HelloServlet {
    // Empty class - not a servlet yet!
}
```

**"So we got a hello servlet. The only purpose of this hello servlet is to greet the user."**

---

## Step 3: The Problem - It's Not a Servlet Yet!

**"So whatever you want to do maybe you want to say hello world or something. I just want to show something on the screen. Okay so this is our servlet."**

**"But is it just by writing this as a servlet, will it make a servlet? Of course not."**

### What Makes a Class a Servlet?

**Just naming it "HelloServlet" doesn't make it a servlet!**

```java
// This is NOT a servlet
public class HelloServlet {
    public void sayHello() {
        System.out.println("Hello");
    }
}
```

**Why not?**
- No HTTP request handling
- No HTTP response generation
- No integration with servlet container
- Tomcat doesn't know this exists

**To be a servlet, we need:**
1. ✅ Extend `HttpServlet` class
2. ✅ Override servlet lifecycle methods
3. ✅ Handle `HttpServletRequest` and `HttpServletResponse` objects
4. ✅ Register with Tomcat (mapping)

Let's start with #1!

---

## Step 4: Extending HttpServlet

**"We have to do some extra thing as well. See, one of the way to give the feature of a servlet to this class is by extending a class called SDP servlet."**

(Instructor says "SDP servlet" but means "HttpServlet")

### The HttpServlet Class

**"If you talk about servlet, it has multiple features, right? Accepting the request from the user and responding to the user."**

**HttpServlet provides:**
- HTTP request handling (GET, POST, PUT, DELETE)
- Request parsing (headers, parameters, body)
- Response generation (status codes, headers, body)
- Lifecycle management (init, service, destroy)

**"So basically for request and response we need special objects. And the way you can get that is if you extend a class via HTTP servlet okay."**

### Extending the Class

```java
package com.telusko;

import javax.servlet.http.HttpServlet;

public class HelloServlet extends HttpServlet {
    // Now it's a servlet!
}
```

**What This Gives Us:**

```
HttpServlet (parent class)
    ↓
Provides:
├── service() method (routes to doGet/doPost)
├── doGet() method (handles GET requests)
├── doPost() method (handles POST requests)
├── doPut() method (handles PUT requests)
├── doDelete() method (handles DELETE requests)
├── init() method (initialization)
└── destroy() method (cleanup)
```

**By extending `HttpServlet`, our class inherits all these capabilities!**

---

## Step 5: Understanding Request and Response Objects

**"So basically we need two things the request and the response."**

### The HTTP Communication Flow

```
Browser                          Servlet
   |                                |
   |--- HTTP Request -------------->|
   |                                |
   |       Need object to           |
   |       read this data           |
   |                                |
   |<--- HTTP Response -------------|
   |                                |
           Need object to
           send this data
```

**Two Fundamental Objects:**

**1. HttpServletRequest** - Represents incoming request
**2. HttpServletResponse** - Represents outgoing response

**"And also we need a method which will execute whenever you get a request okay."**

We need a method that:
- Accepts `HttpServletRequest` parameter (to read request)
- Accepts `HttpServletResponse` parameter (to send response)
- Gets called automatically by Tomcat when request arrives

**Enter: The `service()` method!**

---

## Step 6: Creating the service() Method

**"So which method I'm talking about. So basically I have to create a method here. So I will say public void service. The method name is service."**

### Why "service"?

**"Service is one of the important method in servlet which gets executed whenever you send a request. Okay."**

**The service() Method:**
- **Entry point** for servlet request handling
- **Called by Tomcat** when HTTP request arrives
- **Routes to specific methods** (doGet, doPost, etc.)
- **Receives request and response objects** as parameters

### Initial Method Structure

```java
public class HelloServlet extends HttpServlet {
    
    public void service() {
        // This method gets called on every request
    }
}
```

**"And let's open and close. So whenever you want this service to work you have to define a method which is called service here okay."**

---

## Step 7: Adding Request and Response Parameters

**"Now question arises how will you accept the data from the client and how will you respond to the client."**

### Understanding the Need

**"See, in this example, I don't want to send any data from client to server. I just want to send a request. But I want to send the data back to the client."**

Even if we're not reading data from the client, we need:
- **Request object** (to know who's calling, what URL, etc.)
- **Response object** (to send data back)

**"But let's say if you are working on a real life and you want to send some data from the client to the server, you need an object from where you can do that."**

### Adding the Parameters

**"And that's where in the service method, you have to pass two parameters, one for the request and one for the response."**

```java
public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                        HttpServletResponse response) {
        // Now we can read request and write response!
    }
}
```

### Understanding HttpServletRequest

**"And the request response you will get from HTTP servlet request. This is a special interface which has multiple methods to work with, but we don't have to define those methods. The internal implementation will do it for you."**

**HttpServletRequest Interface:**

```java
public interface HttpServletRequest {
    String getParameter(String name);      // Get query param
    String getHeader(String name);         // Get HTTP header
    String getMethod();                    // GET, POST, etc.
    String getRequestURI();                // /hello
    HttpSession getSession();              // User session
    // ... many more methods
}
```

**Tomcat implements this interface!** It creates the object and passes it to our servlet.

**"Okay, so we just have to create the object for this. Or the reference for this which we got is HTTP request and HTTP servlet response."**

### Understanding HttpServletResponse

```java
public interface HttpServletResponse {
    PrintWriter getWriter();               // Write response body
    void setContentType(String type);      // Set content type
    void setStatus(int sc);                // Set status code
    void addHeader(String name, String value); // Add HTTP header
    // ... many more methods
}
```

**"So these two we need."**

### Complete Method Signature

```java
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                        HttpServletResponse response) {
        // request - incoming request data
        // response - outgoing response data
    }
}
```

---

## Step 8: Understanding the Data Flow

**"Now whatever data coming from the client will be stored in request object. And whatever data you want to send back to the client that will be present in the response object. Or you can add that in the response object. Okay."**

### Request Object - Reading Data FROM Client

```java
// URL: http://localhost:8080/hello?name=Naveen&age=30

String name = request.getParameter("name");  // "Naveen"
String age = request.getParameter("age");     // "30"

// Headers
String userAgent = request.getHeader("User-Agent");
String contentType = request.getHeader("Content-Type");

// Method
String method = request.getMethod();  // "GET" or "POST"

// Path
String uri = request.getRequestURI();  // "/hello"
```

### Response Object - Sending Data TO Client

```java
// Set content type
response.setContentType("text/html");

// Write to browser
PrintWriter out = response.getWriter();
out.println("<h1>Hello World</h1>");

// Set status
response.setStatus(200);  // OK

// Add headers
response.addHeader("Custom-Header", "Value");
```

**The pattern:**
- **Read from request** (client → server)
- **Write to response** (server → client)

---

## Step 9: First Implementation - Just Printing to Console

**"So the first thing, instead of accepting request or responding at this point, what I want to do is I just want to check if this method is getting called."**

**Smart debugging approach!** Before complex HTTP code, verify the method executes.

### Adding Console Print

**"So maybe I can say in service, that's it. In service method we can say but let's say in service."**

```java
public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                        HttpServletResponse response) {
        System.out.println("in service");
    }
}
```

**"So if I execute this code I want to print in service. That's my first step okay."**

**Goal:** See "in service" printed when we make HTTP request.

**"Now will this work. That's a real question."**

---

## Step 10: First Attempt - Running from App.java

**"Now question arises how do we run this. If you go back to app dot Java you can just run the main file okay."**

### The App.java File

Maven generated this by default:

```java
package com.telusko;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

**"And let's see what happens if I run this main file."**

### Running It

**Console Output:**

```
Hello World!

Process finished with exit code 0
```

**"It says hello world, but nowhere it says in service Reason."**

### The Problem

**Why didn't "in service" print?**

```
main() runs
    ↓
Prints "Hello World!"
    ↓
Program exits
    ↓
No HTTP server running
    ↓
No requests arrive
    ↓
service() never called!
```

**Key Insight:**

**"If you want to execute a service or if you want to execute a servlet, you have to send a request from your browser like we are building a web application."**

Servlets aren't called from `main()`—they're called by **HTTP requests**!

---

## Step 11: Understanding How to Trigger Servlets

**"So what I will do is I will open my browser and here you have to send a request."**

### HTTP Requests via Browser

When you type a URL in browser:

```
http://localhost:8080/hello
    ↓
Browser sends HTTP GET request
    ↓
Server receives request
    ↓
Server routes to servlet
    ↓
servlet.service() method called
    ↓
Servlet sends response
    ↓
Browser displays response
```

**"Now where do you send a request. So basically you have to send a request to the localhost."**

### Understanding the URL Structure

```
http://localhost:8080/hello
  ↓        ↓         ↓    ↓
Protocol  Host     Port  Path
```

**Breakdown:**

**Protocol:** `http://` (or `https://`)
**Host:** `localhost` (127.0.0.1, your own machine)
**Port:** `8080` (default Tomcat port)
**Path:** `/hello` (the specific servlet/resource)

**"And then you have to mention the port number. And by default if you talk about Tomcat it goes with the port number."**

**Default Ports:**
- **Tomcat:** 8080
- **HTTP:** 80
- **HTTPS:** 443
- **Spring Boot:** 8080 (by default)

**"So we can stick to it."**

---

## Step 12: First Browser Attempt - Connection Failed

**"And when I say enter I want something to display here. And you can say it says cannot reach."**

### The Error

```
This site can't be reached
localhost refused to connect.
ERR_CONNECTION_REFUSED
```

**"That means something is not working. You know what is not working. Nothing is working."**

### The Analysis

**"I mean, the only thing which is working is hello world, this server is not getting called. We need to call this. How do we do that?"**

**The Issue:**

```
Browser → Sends request to localhost:8080
                ↓
        No server listening! ❌
                ↓
        Connection refused
```

**We haven't started Tomcat!**

**"So basically, uh, we do have Tomcat, right? So if you can see we do have Tomcat. We need to run this Tomcat by default is not running. If it is running you will see the message in the console at this point is not running."**

---

## Step 13: Starting Tomcat Programmatically

**"So what I will do is I will run the tomcat. So after printing hello world, let's say I want to run the tomcat. How do I do that."**

### Creating Tomcat Object

**"So first step is to create object of Tomcat."**

```java
package com.telusko;

import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        
        // Create Tomcat instance
        Tomcat tomcat = new Tomcat();
    }
}
```

**"So we'll say Tomcat Tomcat equal to new Tomcat, lot of Tomcat in one line."**

😄 Type name `Tomcat`, variable name `tomcat`, and `new Tomcat()`—three Tomcats in one line!

**"But let's say we got this object."**

### Starting the Server

**"Now how do you start the server to start the server it's very simple. You can simply say Tomcat dot start. Your job is done. This will start the Tomcat."**

```java
public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        tomcat.start();  // Start Tomcat!
    }
}
```

### Handling Exceptions

**"You can see there are some errors. It says it might throw an exception. So I will add it to the signature."**

```java
import org.apache.catalina.LifecycleException;

public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        tomcat.start();
    }
}
```

**"It might throw a life cycle exception. So let's do that. And that's it. This thing will run the Tomcat."**

---

## Step 14: Second Attempt - Tomcat Starts But Stops Immediately

**"Let's see if this works. Let's rerun this."**

### Console Output

```
Hello World!
Dec 19, 2023 10:30:45 AM org.apache.catalina.core.StandardService startInternal
INFO: Starting service [Tomcat]
Dec 19, 2023 10:30:45 AM org.apache.catalina.core.StandardEngine startInternal
INFO: Starting Servlet engine: [Apache Tomcat/8.5.96]
Dec 19, 2023 10:30:45 AM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["http-nio-8080"]

Process finished with exit code 0
```

**"Oh you can see we got some messages here. It says starting service which is the Tomcat service and protocol handler. But at least it says starting the Tomcat."**

### Testing in Browser

**"Let me go back to the browser and refresh."**

```
This site can't be reached
localhost refused to connect.
```

**"Hey nothing is working. I mean, it's still not working. Why?"**

### The Problem - Tomcat Exits Immediately

**"So if you go back here, we are starting our Tomcat and after starting, it's also ending the Tomcat. If you can see process finished, we want Tomcat to wait."**

**What Happened:**

```
1. main() starts
2. Print "Hello World!"
3. Create Tomcat
4. Start Tomcat
5. main() finishes → JVM exits → Tomcat dies! ❌
```

**Tomcat started, but then immediately shut down when `main()` exited!**

**"You know Tomcat is a server. It is. Its job is to keep running and we're not keeping it running."**

---

## Step 15: Making Tomcat Keep Running

**"So how do you keep it running. So it's very simple. You have to say Tomcat dot get server. So basically get the hold on the server and say await which means we are asking Tomcat to wait. Keep running. I will send the request later. Okay."**

### The Solution - await()

```java
public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        tomcat.start();
        
        tomcat.getServer().await();  // Wait indefinitely!
    }
}
```

**What `await()` Does:**

```java
tomcat.getServer().await();
    ↓
Blocks current thread
    ↓
Keeps JVM running
    ↓
Waits for shutdown signal
    ↓
Server stays alive to handle requests!
```

**"So at least this time the server will not stop."**

### Running Again

**Console Output:**

```
Hello World!
Dec 19, 2023 10:35:12 AM org.apache.catalina.startup.Catalina await
INFO: Starting service [Tomcat]
...
INFO: Starting ProtocolHandler ["http-nio-8080"]

(No "Process finished" - still running!)
```

**"And you can see we don't have process exit. That means Tomcat is running now okay let's see."**

---

## Step 16: Third Attempt - 404 Not Found

**"Let's rerun this okay. Now this time we got a different message okay."**

### Browser Shows 404 Error

```
HTTP Status 404 – Not Found

Type: Status Report
Message: The requested resource [/hello] is not available

Apache Tomcat/8.5.96
```

**"We have not got 404. That means the Tomcat is running. The only problem is it is not able to handle the request."**

### Understanding HTTP Status Codes

**What is 404?**

```
HTTP Status Codes:
├── 200 OK              ← Success!
├── 404 Not Found       ← Resource doesn't exist
├── 500 Server Error    ← Server crashed
├── 403 Forbidden       ← Not allowed
└── 301 Redirect        ← Go to different URL
```

**404 means:**
- ✅ Server is running
- ✅ Server received request
- ❌ Server doesn't have the requested resource

**Progress!**

**Before:** "Connection refused" (no server)
**Now:** "404 Not Found" (server running, but resource missing)

---

## Step 17: Understanding the Problem - No Servlet Mapping

**"So we have done with the first step which is we are running a tomcat, but it is not handling the request. But the question arises why?"**

### The Issue

**"It's because Tomcat is good, right? I mean Tomcat is running. It says, hey, I will run your servlets and we do have our servlet here, but then how a Tomcat will know when to call this servlet."**

**The Disconnect:**

```
Browser Request: http://localhost:8080/hello
        ↓
Tomcat receives request for "/hello"
        ↓
Tomcat looks: "Which servlet handles /hello?"
        ↓
Tomcat finds: Nothing! 😟
        ↓
Returns: 404 Not Found
```

**We never told Tomcat about our HelloServlet!**

### The Analogy

**"So if you talk about any website you have multiple pages there. Right."**

Think of a website:

```
www.telusko.com/courses    → Courses page
www.telusko.com/about      → About page
www.telusko.com/contact    → Contact page
```

**Each URL is mapped to specific content!**

**"So when you access a particular page you give a URL, you mention the website name slash something. Right."**

### Our Goal

**"So here also I want to make sure that whenever I run localhost colon 8080 slash. Hello. This time I want to print I want to call that servlet."**

**Desired Mapping:**

```
URL: /hello  →  HelloServlet.service()
```

**"That means we have to do the mapping for this. Hello. With our servlet there should be mapping between the hello URL and your servlet."**

### The Solution (Coming Next)

**"If you can do that our job is done right. So the question is how will you map it. Let's see that in the next video."**

---

## Code Summary: Where We Are Now

### App.java (Main Class)

```java
package com.telusko;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        // Create and start Tomcat
        Tomcat tomcat = new Tomcat();
        tomcat.start();
        
        // Keep Tomcat running
        tomcat.getServer().await();
    }
}
```

**What This Does:**
- ✅ Creates embedded Tomcat instance
- ✅ Starts Tomcat on port 8080
- ✅ Keeps server running indefinitely

### HelloServlet.java (Servlet Class)

```java
package com.telusko;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                        HttpServletResponse response) {
        System.out.println("in service");
    }
}
```

**What This Does:**
- ✅ Extends HttpServlet (becomes a servlet)
- ✅ Implements service() method
- ✅ Accepts request and response objects
- ❌ Not registered with Tomcat yet!

---

## Key Concepts Summary

### 1. What is a Servlet?

**Definition:** A Java class that handles HTTP requests and responses.

**Requirements:**
- Extends `HttpServlet`
- Implements lifecycle methods (`service`, `doGet`, `doPost`)
- Handles `HttpServletRequest` and `HttpServletResponse`
- Registered with servlet container

### 2. HttpServlet Class

**Purpose:** Base class for HTTP servlets.

**Provides:**
- Request handling methods (doGet, doPost, doPut, doDelete)
- service() method (routes requests to specific handler)
- Lifecycle methods (init, destroy)

**Usage:**
```java
public class MyServlet extends HttpServlet {
    // Inherit all servlet capabilities
}
```

### 3. service() Method

**Purpose:** Entry point for servlet request handling.

**Signature:**
```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response)
```

**Called:** By Tomcat when HTTP request arrives.

**Routing:** Usually calls doGet() or doPost() based on HTTP method.

### 4. HttpServletRequest

**Purpose:** Represents incoming HTTP request.

**Common Methods:**
```java
request.getParameter("name")     // Query parameter
request.getHeader("User-Agent")  // HTTP header
request.getMethod()              // GET, POST, etc.
request.getRequestURI()          // /hello
request.getSession()             // User session
```

**Populated by:** Tomcat (container)

### 5. HttpServletResponse

**Purpose:** Represents outgoing HTTP response.

**Common Methods:**
```java
response.getWriter()             // Write response body
response.setContentType("text/html")  // Set content type
response.setStatus(200)          // HTTP status code
response.addHeader("name", "value")   // Add header
```

**Used by:** Servlet (your code)

### 6. Embedded Tomcat

**Purpose:** Run Tomcat inside your Java application.

**Usage:**
```java
Tomcat tomcat = new Tomcat();
tomcat.setPort(8080);
tomcat.start();
tomcat.getServer().await();  // Keep running
```

**Benefits:**
- No external Tomcat installation
- Run directly from IDE
- Self-contained application

### 7. HTTP Status Codes

**Common Codes:**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Server crashed processing request |
| 403 | Forbidden | Access denied |
| 302 | Redirect | Go to different URL |

### 8. URL Structure

```
http://localhost:8080/hello?name=Naveen
  ↓        ↓         ↓    ↓         ↓
Protocol  Host     Port  Path   Query Params
```

- **Protocol:** http or https
- **Host:** localhost, domain.com, IP address
- **Port:** 8080 (default for Tomcat)
- **Path:** /hello (maps to servlet)
- **Query Params:** ?name=Naveen&age=30

---

## The Problem We'll Solve Next

**Current Situation:**

```java
// Tomcat is running ✅
Tomcat tomcat = new Tomcat();
tomcat.start();
tomcat.getServer().await();

// HelloServlet exists ✅
public class HelloServlet extends HttpServlet {
    public void service(...) { ... }
}

// But they're not connected! ❌
// Tomcat doesn't know HelloServlet exists
// HelloServlet doesn't know which URL to handle
```

**What We Need:**

```
URL: /hello  →  HelloServlet
```

**How to achieve this?** Servlet mapping!

**Next video will cover:**
- Adding servlet context
- Registering servlet with Tomcat
- URL pattern mapping
- Testing successful servlet invocation

---

## Common Errors and Solutions

### Error 1: "Cannot resolve symbol 'HttpServlet'"

**Cause:** Servlet API dependency not loaded.

**Solution:**
```xml
<!-- Check pom.xml -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.4</version>
    <scope>provided</scope>
</dependency>
```

### Error 2: "Connection Refused"

**Cause:** Tomcat not started.

**Solution:**
```java
Tomcat tomcat = new Tomcat();
tomcat.start();  // Don't forget this!
```

### Error 3: "Process finished" immediately

**Cause:** Missing `await()` call.

**Solution:**
```java
tomcat.start();
tomcat.getServer().await();  // Keep running!
```

### Error 4: "404 Not Found"

**Cause:** Servlet not registered with Tomcat.

**Solution:** Add servlet context and mapping (next video!)

### Error 5: "Port 8080 already in use"

**Cause:** Another application using port 8080.

**Solution:**
```java
Tomcat tomcat = new Tomcat();
tomcat.setPort(8081);  // Use different port
```

Or stop the other application using 8080.

---

## Best Practices Learned

### 1. Incremental Testing

**Don't write everything at once!**

```
✅ Create servlet → Test
✅ Start Tomcat → Test
✅ Add await() → Test
✅ Add mapping → Test
```

The instructor demonstrated this perfectly by adding `System.out.println("in service")` first to verify the method gets called.

### 2. Understand Errors

**404 is progress!**

```
Connection Refused → Tomcat not running ❌
404 Not Found → Tomcat running, mapping missing ⚠️
200 OK → Everything working ✅
```

Each error tells you what's wrong and what's right.

### 3. Use Descriptive Names

```java
HelloServlet  ✅ Clear what it does
MyServlet     ❌ Vague
Servlet1      ❌ Meaningless
```

### 4. Handle Exceptions Properly

```java
// During learning: Declare throws
public static void main(String[] args) throws LifecycleException {
    // ...
}

// In production: Handle gracefully
try {
    tomcat.start();
} catch (LifecycleException e) {
    logger.error("Failed to start Tomcat", e);
}
```

---

## What's Coming Next

In Document 46, we'll complete our servlet journey:

**Topics:**
1. **Adding servlet context** to Tomcat
2. **Registering HelloServlet** with container
3. **URL pattern mapping** ("/hello" → HelloServlet)
4. **Testing successful request** → "in service" prints!
5. **Sending HTTP response** (actual HTML to browser)
6. **Understanding servlet lifecycle** (init → service → destroy)

**Finally seeing:** "in service" printed when we visit http://localhost:8080/hello!

---

## Conclusion: Foundation Laid, Mapping Needed

We've made tremendous progress:

✅ **Created servlet class** (HelloServlet)
✅ **Extended HttpServlet** (gained servlet capabilities)
✅ **Implemented service()** (request handler)
✅ **Understood request/response objects** (HTTP communication)
✅ **Started embedded Tomcat** programmatically
✅ **Made Tomcat keep running** (await() method)
✅ **Got 404 error** (proof Tomcat is running!)
✅ **Identified the problem** (no servlet mapping)

**The Missing Piece:**

**"That means we have to do the mapping for this. Hello. With our servlet there should be mapping between the hello URL and your servlet. If you can do that our job is done right. So the question is how will you map it. Let's see that in the next video."**

We're **so close** to seeing our servlet work! Just need to connect Tomcat and HelloServlet through URL mapping.

**Next:** Let's complete the circuit and see "Hello World" in the browser! 🚀
