# 🗺️ Document 46: Servlet URL Mapping and Registration with Tomcat

## Introduction: The Missing Connection

In Document 45, we hit a roadblock:

✅ **Tomcat running** (embedded server started successfully)
✅ **HelloServlet created** (extends HttpServlet, implements service())
❌ **404 Not Found** (Tomcat doesn't know about our servlet!)

**The Problem:**

```
Browser: http://localhost:8080/hello
    ↓
Tomcat: "Which servlet handles /hello?"
    ↓
Tomcat: "I don't know any servlet!" 😞
    ↓
Result: 404 Not Found
```

**"Now let's see, how do you set the mapping?"**

We need to **connect** the URL path (`/hello`) with our servlet class (`HelloServlet`). This connection is called **servlet mapping**.

In this video, we'll:

1. **Understand different mapping approaches** (web.xml, annotations, programmatic)
2. **Learn why embedded Tomcat needs programmatic mapping**
3. **Create Tomcat context** (application container)
4. **Register servlet with Tomcat** (make Tomcat aware of HelloServlet)
5. **Map URL to servlet** ("/hello" → HelloServlet)
6. **Test successfully** (see "in service" printed!)
7. **Understand the blank screen issue** (not sending response yet)
8. **Configure custom port numbers** (8081 instead of 8080)

Let's complete the circuit and make our servlet work!

---

## Understanding Servlet Mapping Approaches

**"The thing is, if you talk about servlet and if you are using a external Tomcat, say in this application we are using a embedded Tomcat. If you are using an external Tomcat, you can do more configuration."**

There are **three ways** to map servlets to URLs:

### 1. XML Configuration (Traditional Way)

**"Example. In the earlier days, if you want to do the configuration, we used to use XML. So the file name is web dot XML."**

**File:** `web.xml` (deployment descriptor)

**Location:** `src/main/webapp/WEB-INF/web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app>
    <!-- Step 1: Declare servlet -->
    <servlet>
        <servlet-name>HelloServlet</servlet-name>
        <servlet-class>com.telusko.HelloServlet</servlet-class>
    </servlet>
    
    <!-- Step 2: Map URL to servlet -->
    <servlet-mapping>
        <servlet-name>HelloServlet</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>
</web-app>
```

**"In this you do the mapping, you specify the URL and you specify the servlet. So you say hey Tomcat. Whenever someone requests for this URL, execute this servlet and you can mention multiple servlets there."**

**How It Works:**

```
1. Tomcat starts
2. Reads web.xml
3. Finds servlet declarations
4. Registers servlets
5. Sets up URL mappings
```

**"That was one approach."**

**Pros:**
- Centralized configuration (all mappings in one file)
- No code changes needed (edit XML only)
- Supported by all servlet containers

**Cons:**
- Verbose XML syntax
- Separate from servlet code (harder to maintain)
- Requires webapp structure

### 2. Annotation Way (Modern Java)

**"But then we wanted to move to the annotation way. In the annotation way, what you do is you on top of your servlet we use at Web Servlet. This is the annotation which we use."**

```java
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/hello")  // URL mapping via annotation!
public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                       HttpServletResponse response) {
        System.out.println("in service");
    }
}
```

**"And in the bracket you mention for which request you want to work with. So you want to work with hello request."**

**How It Works:**

```
@WebServlet("/hello")
    ↓
Annotation processor scans classes
    ↓
Finds @WebServlet annotations
    ↓
Registers servlets automatically
    ↓
URL mapping: /hello → HelloServlet
```

**"So what it means is whenever someone requests for hello, you have to call this particular servlet. This is how basically we used to do in the annotation way."**

**Pros:**
- Simple and concise (one line!)
- Co-located with servlet (mapping near code)
- Type-safe (compilation errors if wrong)

**Cons:**
- Requires Servlet 3.0+ (older containers don't support)
- Requires external Tomcat with annotation scanning
- Doesn't work with embedded Tomcat by default

### 3. Programmatic Way (Embedded Tomcat)

**"But it works when you are using external Tomcat. When you're using embedded Tomcat we have to do the conversion by ourself here."**

**With Embedded Tomcat:**

```java
// Create context
Context context = tomcat.addContext("", null);

// Register servlet
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());

// Map URL to servlet
context.addServletMapping("/hello", "HelloServlet");
```

**Why This Approach?**

When you control Tomcat programmatically (embedded), you need to:
- Create context manually
- Register servlets manually  
- Set up mappings manually

**No automatic scanning happens!** You're in full control.

---

## Why So Much Work for Embedded Tomcat?

**"Now if you're thinking, hey, we are doing so much of work just to map here. And then of course there will be multiple lines of code here just for the mapping. But you have to understand this."**

### The Learning Path

**"We are moving towards Spring Boot. Now this all these things will be much easier in Spring Boot. Okay."**

**Learning Progression:**

```
1. Manual Servlet + Embedded Tomcat (now)
   ├── Understand every step
   ├── See what happens behind scenes
   └── Appreciate abstraction layers

2. Spring MVC (later)
   ├── @Controller annotation
   ├── @RequestMapping annotation
   └── Spring handles servlet creation

3. Spring Boot (final)
   ├── Auto-configuration
   ├── Embedded Tomcat configured automatically
   └── Just write @RestController!
```

**"So all these things which are which we are doing here will be done by Spring Boot. Okay, I know you're waiting for it, but let's get the hard part done so that we can focus on the easy part."**

### The Pedagogical Reason

**"And when I talk about the easy part, you will know what is happening behind the scenes. Right?"**

**The Strategy:**

```
Learn manually first → Appreciate automation later
        ↓                           ↓
Painful setup              Spring Boot magic!
Explicit code              Auto-configuration
Full control               "It just works!"
```

**When you see Spring Boot later:**

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

**You'll think:** "Wow, Spring Boot is handling all that servlet registration, context creation, and mapping for me! That's amazing!"

**If you started with Spring Boot**, you'd think: "Whatever, it's just an annotation." 🤷

**Understanding the foundation makes you appreciate the abstraction!**

---

## Step 1: Understanding Context

**"Now to do the mapping we need to get the hold on the context object."**

### What is Context?

**Context** = A container for your web application within Tomcat.

**Think of it like this:**

```
Tomcat (Server)
    ↓
Context (Your Application)
    ├── Servlet 1
    ├── Servlet 2
    ├── Filters
    ├── Listeners
    └── Resources
```

**One Tomcat can host multiple contexts (applications):**

```
Tomcat
├── Context: /app1  (Servlet A, Servlet B)
├── Context: /app2  (Servlet C, Servlet D)
└── Context: /app3  (Servlet E, Servlet F)
```

**For Our Project:**

```
Tomcat
└── Context: ""  (default/root context)
    └── HelloServlet (mapped to /hello)
```

**Context holds:**
- Servlets registered in this application
- URL mappings for those servlets
- Filters, listeners, and other components
- Application-wide configuration

---

## Step 2: Creating the Context

**"And to do that I will simply create object of context here. So I will say context which belongs to this package. Make sure that you are using the same package."**

### The Code

```java
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        
        // Create context
        Context context = tomcat.addContext("", null);
        
        tomcat.start();
        tomcat.getServer().await();
    }
}
```

**Breaking Down the Line:**

```java
Context context = tomcat.addContext("", null);
           ↓            ↓            ↓     ↓
        Type       Variable    Method  Parameters
```

### Understanding addContext() Parameters

**"We have to pass two parameters. The first one is the application name or the context for the application."**

**Method Signature:**
```java
public Context addContext(String contextPath, String docBase)
```

**Parameter 1: contextPath** (Application Path)

**"Now since we are working with the same application, I want to go for default app default, which is by double quotes."**

```java
tomcat.addContext("/myapp", null);  // URL: http://localhost:8080/myapp/hello
tomcat.addContext("", null);        // URL: http://localhost:8080/hello (root)
```

**Examples:**

```
contextPath: "/blog"
Result: http://localhost:8080/blog/hello

contextPath: "/api"
Result: http://localhost:8080/api/hello

contextPath: "" (empty string)
Result: http://localhost:8080/hello  ← We want this!
```

**Empty string `""` = Root context** (no prefix in URL)

**Parameter 2: docBase** (Document Base Directory)

**"And then you have to mention your directory. Now we don't want to create a new directory structure. So I will say null here."**

**What is docBase?**
- Directory where static files live (HTML, CSS, images)
- Similar to `webapps/myapp` folder in external Tomcat
- For pure servlet apps (no static files), use `null`

**"Uh so we are keeping it empty for the default. And we don't want to create a new directory structure. So we'll keep it null."**

**Our Usage:**
```java
Context context = tomcat.addContext("", null);
//                                   ↓    ↓
//                            Root context, no static files
```

---

## Step 3: Registering the Servlet with Tomcat

**"What next. Now once we got the hold on the context object, now I can use a method called add servlet which is a static method belongs to Tomcat class."**

### The Static Method

```java
Tomcat.addServlet(context, servletName, servlet)
```

**Note:** It's a **static method** on the `Tomcat` class (not instance method)!

```java
Tomcat.addServlet(...)  ✅ Static method
tomcat.addServlet(...)  ❌ Would be instance method (doesn't exist)
```

### Understanding the Three Parameters

**"Now in this method you specify the name for the servlet. So the first parameter is the name for the servlet will say hello servlet. And then you mention which class. In fact you have to pass the object here."**

**"So the class is hello servlet. So maybe it's kind of creating a new object. But you have to also pass one more parameter here which is your context."**

**"So the first parameter is context. The next is a servlet name and the next one is the uh object for the servlet."**

**Method Signature:**
```java
public static Wrapper addServlet(Context context, 
                                  String servletName, 
                                  Servlet servlet)
```

**Parameter 1: Context** (Where to register)

```java
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, ...);  // Register in this context
```

The context we created earlier!

**Parameter 2: servletName** (Logical Name)

```java
Tomcat.addServlet(context, "HelloServlet", ...);
```

This is a **logical name** you choose:
- Used for internal reference
- Used in URL mapping (next step)
- Can be anything, but should be descriptive

**"The name of a servlet is Hello servlet. Now don't get confused with the name of a servlet with the actual servlet. The actual servlet is Hello servlet. The name is something which you can set anything you want."**

**Example:**
```java
// Name: "HelloServlet" (logical identifier)
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
//                              ↑                      ↑
//                        Logical name         Actual class
```

**"Example I can say h1 here."**

```java
Tomcat.addServlet(context, "h1", new HelloServlet());
//                          ↑           ↑
//                      Any name    Actual servlet class
```

**Parameter 3: Servlet Object** (Actual Servlet Instance)

**"So which object we are working with we are working with hello servlet. We have to create the object for that."**

```java
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
//                                         ↑
//                                    Create instance
```

**Why `new HelloServlet()`?**
- We need an actual instance to handle requests
- Tomcat will call methods on this object
- Could also use: `HelloServlet.class` (in some APIs)

### Complete Registration Code

```java
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        
        // Step 1: Create context
        Context context = tomcat.addContext("", null);
        
        // Step 2: Register servlet
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        
        tomcat.start();
        tomcat.getServer().await();
    }
}
```

**"So three parameters the context the name of a servlet and then the object."**

---

## Step 4: URL Pattern Mapping

**"Now once you have added a servlet now let's do the actual mapping."**

### The Mapping Method

**"So the way you can do the mapping is with help of context. So it's a context dot add servlet mapping."**

```java
context.addServletMapping(urlPattern, servletName);
```

**This is an instance method** on the `Context` object (not static like addServlet).

### Understanding the Parameters

**"So the earlier method mapping is deprecated. Now we have to use the decoded method in which you have to pass two parameters. The first one is the URL. The URL is hello. And the next one is the name of a servlet."**

**Method Signature:**
```java
public void addServletMapping(String urlPattern, String servletName)
```

**Parameter 1: urlPattern** (URL Path)

```java
context.addServletMapping("/hello", "HelloServlet");
//                         ↑
//                    URL pattern
```

**URL Patterns:**

```java
"/hello"        → http://localhost:8080/hello (exact match)
"/hello/*"      → http://localhost:8080/hello/anything (wildcard)
"*.jsp"         → http://localhost:8080/file.jsp (extension match)
"/"             → http://localhost:8080/ (default servlet)
```

**For our example:** `/hello` means exact match only!

**Parameter 2: servletName** (Matches Registration Name)

```java
// Step 2: Register with name "HelloServlet"
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
//                          ↑
//                    This name...

// Step 3: Use same name in mapping
context.addServletMapping("/hello", "HelloServlet");
//                                   ↑
//                              ...matches here!
```

**Critical:** The servlet name must match what you used in `addServlet()`!

### The Name Confusion Clarified

**"The name of a servlet is Hello servlet. Now don't get confused with the name of a servlet with the actual servlet. The actual servlet is Hello servlet. The name is something which you can set anything you want."**

**Three Different Things:**

```java
public class HelloServlet extends HttpServlet { }
//           ↑
// 1. Class name (Java class)

Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
//                          ↑
// 2. Servlet name (logical identifier, can be anything!)

context.addServletMapping("/hello", "HelloServlet");
//                        ↑
// 3. URL pattern (what users type in browser)
```

**Example with Different Names:**

```java
// Class: HelloServlet
public class HelloServlet extends HttpServlet { }

// Logical name: "h1" (you choose!)
Tomcat.addServlet(context, "h1", new HelloServlet());

// URL: "/greet"
context.addServletMapping("/greet", "h1");
//                                   ↑
//                              Must match "h1" above!
```

**"Here also you have to make sure we are using H1. So whatever your servlet name you have mentioned here the same name you have to mention here as well. Okay, that's how it works."**

**The Connection:**

```
URL Pattern         Servlet Name        Servlet Class
"/hello"     →     "HelloServlet"  →   HelloServlet.class
    ↓                   ↓                    ↓
User types      Logical reference      Actual code
```

**"But let's go with the same name and there's no issue. You can change it if you want."**

**Best Practice:** Use same name as class for clarity!

```java
// Class name
public class HelloServlet extends HttpServlet { }

// Same name in registration
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());

// Same name in mapping
context.addServletMapping("/hello", "HelloServlet");

// Clear and consistent! ✅
```

---

## Step 5: Complete Mapping Code

**"And that's it. We have done with the mapping."**

### Full Implementation

```java
package com.telusko;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        // Create Tomcat instance
        Tomcat tomcat = new Tomcat();
        
        // Create context (root context, no static files)
        Context context = tomcat.addContext("", null);
        
        // Register servlet with Tomcat
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        
        // Map URL pattern to servlet name
        context.addServletMapping("/hello", "HelloServlet");
        
        // Start Tomcat
        tomcat.start();
        
        // Keep Tomcat running
        tomcat.getServer().await();
    }
}
```

**"Now the only thing you have to do is you have to start the server after all this mapping and yeah, looks good. Looks good."**

### The Three Critical Lines

**"So we have done with the mapping part. This three lines are responsible to do that."**

```java
// Line 1: Create container for web application
Context context = tomcat.addContext("", null);

// Line 2: Register servlet with logical name
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());

// Line 3: Map URL to servlet name
context.addServletMapping("/hello", "HelloServlet");
```

**The Complete Flow:**

```
1. tomcat.addContext("", null)
   ↓
   Creates root context container

2. Tomcat.addServlet(context, "HelloServlet", new HelloServlet())
   ↓
   Registers HelloServlet instance with name "HelloServlet"

3. context.addServletMapping("/hello", "HelloServlet")
   ↓
   Maps URL "/hello" to servlet "HelloServlet"

Result: Request to /hello → Routes to HelloServlet.service()
```

---

## Step 6: Testing - It Works!

**"Now let's rerun this and I hope this time it will work."**

### Running the Application

**Console Output:**

```
Hello World!
Dec 20, 2023 2:15:30 PM org.apache.catalina.startup.Catalina start
INFO: Server startup in 245 ms
```

**"Let me go back here and say refresh okay it worked."**

### Browser Test

**URL:** `http://localhost:8080/hello`

**Browser Display:**
```
[Blank white screen]
```

**Console Output:**
```
in service
```

**"You can see we got a blank screen. But in the console we got in service. So something is working right. And that's how basically you can do the mapping."**

### Success! 🎉

**What's Working:**

✅ **Tomcat running** (server started)
✅ **Context created** (application container)
✅ **Servlet registered** (HelloServlet known to Tomcat)
✅ **URL mapped** (/hello → HelloServlet)
✅ **service() called** ("in service" printed!)

**What's Not Working:**

❌ **Response sent to browser** (blank screen)

**Why Blank Screen?**

```java
public void service(HttpServletRequest request, 
                   HttpServletResponse response) {
    System.out.println("in service");  // Prints to console
    // Nothing written to response! ❌
}
```

**We're printing to console, not to HTTP response!**

```
System.out.println()  →  Console (server-side)
response.getWriter()  →  Browser (client-side)
```

**"So mapping is happening. We are able to call the service method and it is printing in service. But I want to send some data back to the client because see if you see this page it's empty. We don't want this to be empty. We want to print something. Maybe I want to say hello world. Say as simple as that okay."**

---

## Understanding What Happened

### Request-Response Flow

```
1. Browser → http://localhost:8080/hello
        ↓
2. Tomcat receives HTTP GET request
        ↓
3. Tomcat looks up URL mapping: /hello → "HelloServlet"
        ↓
4. Tomcat finds servlet: "HelloServlet" → HelloServlet instance
        ↓
5. Tomcat calls: servlet.service(request, response)
        ↓
6. Your code executes: System.out.println("in service")
        ↓
7. Method returns (no response written)
        ↓
8. Tomcat sends empty response → Blank page
```

**Server Console vs Browser:**

```
Server Console (System.out):
"in service"  ✅ Visible here

Browser (HTTP response):
[empty]  ❌ Nothing sent
```

### Visualization

```
┌─────────────────┐                    ┌──────────────────┐
│                 │  HTTP GET /hello   │                  │
│    Browser      │ ────────────────>  │     Tomcat       │
│                 │                    │                  │
│   [Blank Page]  │                    │  Routing...      │
│                 │                    │  /hello → ?      │
│                 │                    │  Found: Hello    │
│                 │                    │         Servlet  │
│                 │                    │                  │
│                 │  HTTP Response     │  Calls service() │
│                 │ <────────────────  │                  │
│                 │  (empty body)      │  Prints: "in     │
└─────────────────┘                    │  service"        │
                                       │                  │
                                       │  (console)       │
                                       └──────────────────┘
```

---

## Next: Sending Response to Browser

**"So how do we do that. So we'll see that in the next video."**

We need to write to the **response object**, not console:

```java
// Current (prints to console)
System.out.println("in service");

// Next video (sends to browser)
response.getWriter().println("Hello World!");
```

**Coming in Document 47:**
- Using `response.getWriter()`
- Setting content type
- Sending HTML to browser
- Seeing "Hello World" in browser! 🌐

---

## Bonus: Changing Port Number

**"I want to point out one more thing. By default the port number is 8080. What if you want a different port number. You can also do that."**

### Setting Custom Port

**"So with the Tomcat object here you can set the port number. So you can say set port 8081. If you want and whatever boat, so I will stick to a straight one."**

```java
public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8081);  // Custom port!
        
        Context context = tomcat.addContext("", null);
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        context.addServletMapping("/hello", "HelloServlet");
        
        tomcat.start();
        tomcat.getServer().await();
    }
}
```

### When to Change Port

**"But if you want to change the port number, you can. Sometimes you might be running some other service which is using a zero, so you can change it if you want."**

**Reasons to Change Port:**

**1. Port Already in Use**

```
ERROR: Address already in use: bind
Could not bind to port 8080
```

Another application is using 8080! Try 8081, 8082, etc.

**2. Multiple Applications**

```
App 1: http://localhost:8080
App 2: http://localhost:8081
App 3: http://localhost:8082
```

Run multiple servers simultaneously.

**3. Corporate Restrictions**

Some companies block certain ports. Use allowed port numbers.

**4. Standard Ports**

```
Development:  8080, 8081, 3000, 4200
Production:   80 (HTTP), 443 (HTTPS)
```

**"Again, that's an option."**

### Testing Custom Port

```java
tomcat.setPort(8081);
```

**New URL:** `http://localhost:8081/hello`

**"Let's restart and I hope this set port will work and it's working."**

**Console:**
```
Hello World!
INFO: Starting ProtocolHandler ["http-nio-8081"]
in service
```

Notice: `http-nio-8081` instead of `8080`!

**"But now I want to print something here. How do you print that. Let's see in the next video."**

---

## Complete Code Summary

### App.java (Main Class with Mapping)

```java
package com.telusko;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class App {
    public static void main(String[] args) throws LifecycleException {
        System.out.println("Hello World!");
        
        // Create Tomcat instance
        Tomcat tomcat = new Tomcat();
        
        // Optional: Set custom port (default is 8080)
        // tomcat.setPort(8081);
        
        // Step 1: Create context (application container)
        // Parameters: contextPath (root), docBase (null for no static files)
        Context context = tomcat.addContext("", null);
        
        // Step 2: Register servlet
        // Parameters: context, servlet name, servlet instance
        Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
        
        // Step 3: Map URL pattern to servlet name
        // Parameters: URL pattern, servlet name (must match step 2)
        context.addServletMapping("/hello", "HelloServlet");
        
        // Start Tomcat
        tomcat.start();
        
        // Keep server running (blocks main thread)
        tomcat.getServer().await();
    }
}
```

### HelloServlet.java (Servlet Class)

```java
package com.telusko;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloServlet extends HttpServlet {
    
    public void service(HttpServletRequest request, 
                       HttpServletResponse response) {
        // Prints to server console (not browser)
        System.out.println("in service");
        
        // Next: Write to response for browser display!
    }
}
```

---

## Key Concepts Deep Dive

### 1. Servlet Context Explained

**Context = Web Application Container**

```
Tomcat (Server)
    ↓
Context: "" (root)
    ├── Servlets
    │   └── HelloServlet (mapped to /hello)
    ├── Filters (none yet)
    ├── Listeners (none yet)
    └── Resources (none)
```

**Context Properties:**

**contextPath:** `/` or `/appname`
- Prefix for all URLs in this application
- Empty `""` = root context (no prefix)

**docBase:** Directory path or `null`
- Where static files live (HTML, CSS, images)
- `null` = no static files (pure servlet app)

**Multiple Contexts Example:**

```java
// Application 1: Blog
Context blog = tomcat.addContext("/blog", "/path/to/blog");
// URLs: http://localhost:8080/blog/home, /blog/post, etc.

// Application 2: API
Context api = tomcat.addContext("/api", null);
// URLs: http://localhost:8080/api/users, /api/products, etc.
```

### 2. Servlet Registration Process

**Three-Step Dance:**

**Step 1: Create Context** (Application Container)
```java
Context context = tomcat.addContext("", null);
```

**Step 2: Register Servlet** (Add to Container)
```java
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
```

**Step 3: Map URL** (Connect URL to Servlet)
```java
context.addServletMapping("/hello", "HelloServlet");
```

**Why Three Steps?**

Separation of concerns:
1. **Context** = Where (which application)
2. **Registration** = What (which servlet)
3. **Mapping** = When (which URL triggers it)

### 3. URL Pattern Matching

**Exact Match:**
```java
"/hello"  → Only http://localhost:8080/hello
```

**Wildcard Path:**
```java
"/hello/*"  → http://localhost:8080/hello/anything
            → http://localhost:8080/hello/world
            → http://localhost:8080/hello/x/y/z
```

**Extension Match:**
```java
"*.jsp"  → http://localhost:8080/page.jsp
         → http://localhost:8080/any/path/file.jsp
```

**Default Servlet:**
```java
"/"  → Handles everything not matched by other patterns
```

**Our Usage:**
```java
context.addServletMapping("/hello", "HelloServlet");
```

Only exact `/hello` matches! (Not `/hello/world`, `/goodbye`, etc.)

### 4. Servlet Naming Conventions

**Three Identifiers:**

```java
// 1. Java Class Name
public class HelloServlet extends HttpServlet { }

// 2. Servlet Name (logical identifier)
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
//                          ↑
//                    You choose this!

// 3. URL Pattern (what users see)
context.addServletMapping("/hello", "HelloServlet");
//                        ↑              ↑
//                   User sees      Matches servlet name
```

**Best Practices:**

✅ **Match class name:**
```java
class HelloServlet → name: "HelloServlet" → url: /hello
```

✅ **Descriptive names:**
```java
class UserServlet → name: "UserServlet" → url: /users
```

❌ **Cryptic names:**
```java
class HelloServlet → name: "h1" → url: /xyz  (confusing!)
```

### 5. Port Numbers

**Common Port Numbers:**

| Port | Service | Usage |
|------|---------|-------|
| 80 | HTTP | Standard web traffic |
| 443 | HTTPS | Secure web traffic |
| 8080 | Tomcat | Development server |
| 3000 | React | Dev server |
| 3306 | MySQL | Database |
| 5432 | PostgreSQL | Database |
| 27017 | MongoDB | Database |

**Setting Custom Port:**

```java
tomcat.setPort(8080);  // Default
tomcat.setPort(8081);  // Custom
tomcat.setPort(9090);  // Another option
```

**URL Changes:**
```
Port 8080: http://localhost:8080/hello
Port 8081: http://localhost:8081/hello
Port 9090: http://localhost:9090/hello
```

---

## Common Errors and Solutions

### Error 1: 404 Not Found (Still!)

**Symptom:** Browser shows 404 after adding mapping.

**Possible Causes:**

**1. Servlet name mismatch:**
```java
// Registration uses "HelloServlet"
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());

// Mapping uses different name ❌
context.addServletMapping("/hello", "Hello");  // Mismatch!
```

**Solution:** Match names exactly!
```java
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/hello", "HelloServlet");  // ✅
```

**2. Wrong URL:**
```java
context.addServletMapping("/greet", "HelloServlet");
```

Browser: `http://localhost:8080/hello` ❌ (404)
Should be: `http://localhost:8080/greet` ✅

**3. Mapping after start:**
```java
tomcat.start();  // Started!
context.addServletMapping("/hello", "HelloServlet");  // Too late! ❌
```

**Solution:** Map before starting!

### Error 2: NullPointerException

**Cause:** Context is null.

```java
Context context = tomcat.addContext("", null);
Tomcat.addServlet(null, "HelloServlet", new HelloServlet());  // ❌
```

**Solution:** Pass actual context!
```java
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
```

### Error 3: Port Already in Use

**Error Message:**
```
java.net.BindException: Address already in use
```

**Cause:** Another application using port 8080.

**Solution 1:** Stop other application
**Solution 2:** Use different port
```java
tomcat.setPort(8081);
```

### Error 4: ClassNotFoundException

**Error:**
```
java.lang.ClassNotFoundException: javax.servlet.http.HttpServlet
```

**Cause:** Missing servlet-api dependency.

**Solution:** Check pom.xml:
```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.4</version>
    <scope>provided</scope>
</dependency>
```

### Error 5: Blank Screen (Expected!)

**Symptom:** 
- Console: "in service" ✅
- Browser: Blank page ⚠️

**Cause:** Not writing to response object.

```java
System.out.println("in service");  // Only to console!
```

**Solution:** (Next video!)
```java
response.getWriter().println("Hello World!");
```

---

## Mapping Variations

### Multiple Servlets

```java
Context context = tomcat.addContext("", null);

// Servlet 1
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/hello", "HelloServlet");

// Servlet 2
Tomcat.addServlet(context, "ByeServlet", new ByeServlet());
context.addServletMapping("/bye", "ByeServlet");

// Servlet 3
Tomcat.addServlet(context, "UserServlet", new UserServlet());
context.addServletMapping("/users", "UserServlet");
```

**URLs:**
```
http://localhost:8080/hello  → HelloServlet
http://localhost:8080/bye    → ByeServlet
http://localhost:8080/users  → UserServlet
```

### Multiple URLs to Same Servlet

```java
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());

context.addServletMapping("/hello", "HelloServlet");
context.addServletMapping("/hi", "HelloServlet");
context.addServletMapping("/greet", "HelloServlet");
```

**All These Work:**
```
http://localhost:8080/hello  → HelloServlet
http://localhost:8080/hi     → HelloServlet
http://localhost:8080/greet  → HelloServlet
```

### Wildcard Patterns

```java
// Match /user/anything
context.addServletMapping("/user/*", "UserServlet");

// URLs matched:
/user/1         → UserServlet
/user/profile   → UserServlet
/user/edit/123  → UserServlet
```

---

## Comparing Configuration Approaches

### XML Configuration

**File: web.xml**
```xml
<web-app>
    <servlet>
        <servlet-name>HelloServlet</servlet-name>
        <servlet-class>com.telusko.HelloServlet</servlet-class>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>HelloServlet</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>
</web-app>
```

**Pros:**
- Centralized configuration
- No code recompilation needed
- Traditional approach

**Cons:**
- Verbose XML
- Separate from code
- Requires webapp structure

### Annotation Configuration

**In Servlet Class:**
```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    // ...
}
```

**Pros:**
- Concise (one line!)
- Co-located with code
- Modern approach

**Cons:**
- Requires Servlet 3.0+
- Needs annotation scanning
- Doesn't work with embedded Tomcat (without extra config)

### Programmatic Configuration (Our Approach)

**In Main Class:**
```java
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/hello", "HelloServlet");
```

**Pros:**
- Full programmatic control
- Works with embedded Tomcat
- Type-safe (compile-time checks)
- Flexible (dynamic configuration)

**Cons:**
- More verbose than annotations
- Code changes require recompilation
- Manual registration for each servlet

---

## What We Achieved Today

### Before This Video

```
Status: 404 Not Found
Reason: Tomcat doesn't know about HelloServlet
Problem: No mapping between URL and servlet
```

### After This Video

```
Status: 200 OK (blank page, but working!)
Reason: Servlet successfully called
Achievement: service() method executed! ✅
```

### The Progress

```
Document 44: Environment setup (Maven, dependencies)
Document 45: Servlet creation (HelloServlet, service method)
Document 46: URL mapping (Connect URL to servlet) ← Today!
Document 47: HTTP response (Send data to browser) ← Next!
```

---

## Spring Boot Preview

**"We are moving towards Spring Boot. Now this all these things will be much easier in Spring Boot."**

**What We Did Today (Manual):**

```java
// 12 lines of configuration!
Tomcat tomcat = new Tomcat();
tomcat.setPort(8080);
Context context = tomcat.addContext("", null);
Tomcat.addServlet(context, "HelloServlet", new HelloServlet());
context.addServletMapping("/hello", "HelloServlet");
tomcat.start();
tomcat.getServer().await();
```

**Spring Boot Equivalent:**

```java
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

**That's it!** Spring Boot handles:
- ✅ Embedded Tomcat creation
- ✅ Context creation
- ✅ Servlet registration (DispatcherServlet)
- ✅ URL mapping
- ✅ Starting server
- ✅ Response handling

**But now you understand what happens behind `@RestController`!** 🎓

---

## Conclusion: Connection Established!

We've completed the critical missing piece:

✅ **Created context** (application container)
✅ **Registered servlet** (made Tomcat aware of Hello Servlet)
✅ **Mapped URL to servlet** (/hello → HelloServlet)
✅ **Verified mapping works** ("in service" printed!)
✅ **Learned port configuration** (setPort for custom ports)

**The Circuit is Complete:**

```
Browser Request
    ↓
http://localhost:8080/hello
    ↓
Tomcat receives request
    ↓
Looks up: /hello → "HelloServlet"
    ↓
Finds: HelloServlet instance
    ↓
Calls: service(request, response)
    ↓
Executes: System.out.println("in service") ✅
    ↓
Returns empty response (blank page)
```

**Almost There!**

We can **receive** requests, but we're not **sending** responses.

**"But now I want to print something here. How do you print that. Let's see in the next video."**

**Next:** Learn to write HTML to the browser using `response.getWriter()`! 🌐

The foundation is solid—let's make our servlet actually say "Hello World" in the browser!

