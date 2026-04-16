# 🔗 Handling Form Requests — Controller Methods and HttpServletRequest

## 🎯 Introduction

In the previous lesson, we built a calculator form that sends two numbers to the server when you click Submit. But clicking Submit gave us a **404 error** because no controller was mapped to handle the `/add` URL.

Now it's time to fix that. We're going to:
- Create a new controller method to handle the `/add` request
- Map it with `@RequestMapping("/add")`
- Create a `result.jsp` page for displaying output
- Learn about the **DispatcherServlet** and its role
- Accept user data using `HttpServletRequest` (the servlet way)
- Parse, process, and compute the result on the server

This lesson bridges the gap between the old servlet world and the new Spring world. We'll start with the familiar servlet approach, and in the next lesson, we'll see how Spring makes it even cleaner.

---

## 🏗️ Concept 1: Adding Multiple Methods to a Controller

### 🧠 What's the Idea?

A single controller class can handle **multiple URLs**. You don't need a separate controller for every single request. Instead, you group **related requests** into one controller.

Think about it — our `HomeController` currently has one method:

```java
@RequestMapping("/")
public String home() {
    return "index.jsp";
}
```

This handles the homepage. But now we also need to handle `/add`. Should we create a whole new controller class? We could, but for related functionality it makes more sense to add another method to the same controller.

### ❓ When to Use One Controller vs Multiple Controllers?

**One controller with multiple methods** — when the requests are **logically related**:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() { ... }       // Show calculator
    
    @RequestMapping("/add")
    public String add() { ... }        // Process addition
}
```

Both deal with the calculator feature, so they belong together.

**Multiple controllers** — when dealing with **different domains** in a real application:

```java
// User-related requests
@Controller
public class UserController {
    @RequestMapping("/addUser")     // Add a user
    @RequestMapping("/deleteUser")  // Delete a user
    @RequestMapping("/updateUser")  // Update a user
}

// Product-related requests
@Controller
public class ProductController {
    @RequestMapping("/addProduct")     // Add a product
    @RequestMapping("/removeProduct")  // Remove a product
    @RequestMapping("/updateProduct")  // Update a product
}

// Order-related requests
@Controller
public class OrderController {
    @RequestMapping("/placeOrder")     // Place an order
    @RequestMapping("/cancelOrder")    // Cancel an order
    @RequestMapping("/orderStatus")   // Check order status
}
```

**The rule of thumb**: Group by **domain responsibility**. Everything about users goes in `UserController`, everything about products in `ProductController`, and so on.

### 💡 Insight: Think of Controllers Like Departments

Imagine a company:
- **HR Department** handles hiring, firing, payroll (= `UserController`)
- **Warehouse** handles inventory, shipping, receiving (= `ProductController`)
- **Sales** handles orders, returns, billing (= `OrderController`)

You wouldn't send a shipping question to HR. Similarly, you wouldn't put product logic in `UserController`. Controllers organize your code by responsibility.

---

## ⚙️ Concept 2: Creating the Add Method

### 🧠 What We Need

A method that:
1. Gets called when someone requests `/add`
2. Eventually returns a result page

### 🔧 Step-by-Step

**Step 1**: Add a new method to `HomeController`:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index.jsp";
    }
    
    @RequestMapping("/add")
    public String add() {
        return "result.jsp";
    }
}
```

**Breaking this down**:

| Part | Purpose |
|------|---------|
| `@RequestMapping("/add")` | Maps this method to the `/add` URL |
| `public String add()` | Method that handles the request; returns a view name |
| `return "result.jsp"` | Tells Spring to render `result.jsp` as the response |

**Step 2**: But wait — does `result.jsp` exist? No! We need to create it.

### 🧪 The Debugging Approach — Step by Step

Before creating `result.jsp`, let's first verify that the mapping works. Add a print statement:

```java
@RequestMapping("/add")
public String add() {
    System.out.println("in add");
    return "result.jsp";
}
```

**Restart → Go to calculator → Enter numbers → Click Submit**

**Check the console**: Do you see "in add"?

- **Yes** → The mapping works! The method is being called.
- **No** → Something's wrong with the mapping. Go back and check `@RequestMapping("/add")`.

If you see "in add" in the console but get an error in the browser, the problem is with the view — `result.jsp` doesn't exist yet.

**This step-by-step debugging approach is crucial.** Always isolate where the problem is:
1. Is the method being called? (Check with `System.out.println`)
2. Is the view being found? (Check if the file exists)
3. Is the view rendering correctly? (Check the output)

### 💡 Insight: Why Method Names Don't Matter

Notice the method is called `add()`. But we could call it anything:

```java
@RequestMapping("/add")
public String handleAddition() { ... }

@RequestMapping("/add")
public String processNumbers() { ... }

@RequestMapping("/add")
public String xyz() { ... }  // Even this works (don't do this though!)
```

**Spring doesn't care about the method name.** It only looks at `@RequestMapping` to decide which method to call. The method name is for **your** readability, not Spring's routing.

That said, always use **descriptive names**. `add()` or `handleAddition()` is much better than `xyz()`.

---

## 📄 Concept 3: Creating result.jsp

### 🧠 Why Do We Need It?

When the user clicks Submit, they expect to see a **new page** with the result. The `add()` method returns `"result.jsp"`, so Spring will look for this file in the `webapp/` folder.

### ⚙️ Creating the File

**Location**: `src/main/webapp/result.jsp`

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Result</title>
</head>
<body>
    <h2>Result is:</h2>
</body>
</html>
```

For now, we're just displaying "Result is:" without the actual number. We'll add the computed value shortly.

### 🧪 Testing the Flow

**Restart → Homepage → Enter 6 and 7 → Click Submit**

**Expected result in browser**:
```
Result is:
```

**Expected console output**:
```
in add
```

If you see both, the complete flow is working:

```
1. User visits localhost:8080/ → home() → index.jsp (calculator form)
2. User types 6 and 7, clicks Submit
3. Browser sends GET /add?num1=6&num2=7
4. DispatcherServlet routes to add() method
5. Console prints "in add"
6. add() returns "result.jsp"
7. Browser displays "Result is:"
```

The routing works. Now we need to actually **read the numbers** and **compute the result**.

---

## 🎯 Concept 4: The DispatcherServlet — Who's Doing the Magic?

### 🧠 What is DispatcherServlet?

You might be wondering: "We didn't register any mapping in an XML file. We didn't create a `web.xml`. How does Spring know which method to call?"

The answer is the **DispatcherServlet** — Spring's central request handler.

### ❓ Why Does It Exist?

In the servlet world (Documents 45-47), every servlet needed manual registration:

```java
// Document 46 - manual mapping for EVERY servlet
Tomcat.addServlet(context, "HomeServlet", new HomeServlet());
context.addServletMapping("/", "HomeServlet");
Tomcat.addServlet(context, "AddServlet", new AddServlet());
context.addServletMapping("/add", "AddServlet");
// Imagine doing this for 100 servlets...
```

That's tedious and error-prone. Spring says: "Let me handle all of that."

### ⚙️ How It Works (Simplified)

```
ALL requests come in
    ↓
DispatcherServlet receives EVERY request
    ↓
Looks at the URL: what's the path?
    ↓
Scans all @RequestMapping annotations
    ↓
Finds matching method
    ↓
Calls that method
    ↓
Takes the return value (view name)
    ↓
Finds the view file
    ↓
Renders the response
```

**Think of DispatcherServlet as a receptionist**:

> Every visitor (request) arrives at the front desk (DispatcherServlet). The receptionist checks the visitor's purpose (URL) and directs them to the right office (controller method). When the office is done, the receptionist collects the response and delivers it back to the visitor.

### 🔑 Key Point

**You never create or configure DispatcherServlet.** Spring Boot does it automatically when you add `spring-boot-starter-web`. It's one of those "magic" things that Spring Boot handles behind the scenes.

We'll dive deeper into DispatcherServlet when we study the Spring Framework itself. For now, just know: **it's the traffic cop routing all your requests**.

### 💡 Insight: One Servlet to Rule Them All

In the old servlet approach, you had one servlet per URL. With Spring, you have **one DispatcherServlet** that handles ALL URLs. Your controller methods aren't servlets — they're just methods that DispatcherServlet calls based on the URL mapping.

```
Old way: 10 URLs = 10 servlets to register
Spring:  10 URLs = 10 methods in controllers, 1 DispatcherServlet handles all
```

---

## 📥 Concept 5: Accepting Request Data — The Servlet Way

### 🧠 The Problem

Our `add()` method is being called, but it doesn't read the numbers from the request. The URL contains `?num1=6&num2=7`, but we're ignoring that data completely.

How do we access it?

### ❓ Two Approaches

There are **two ways** to read request parameters in Spring Boot:

1. **The Servlet Way** — Using `HttpServletRequest` (familiar from Documents 45-47)
2. **The Spring Way** — Using `@RequestParam` annotation (cleaner, we'll learn this next)

Let's start with the servlet way, since we already understand it.

### ⚙️ Using HttpServletRequest

Remember `HttpServletRequest` from the servlet days? It holds **all the data** that a client sends — URL, headers, parameters, cookies, everything.

In Spring Boot, you can still use it. Just add it as a **method parameter**:

```java
@RequestMapping("/add")
public String add(HttpServletRequest req) {
    // Now we have access to the request object!
    return "result.jsp";
}
```

**Wait — who provides this object?**

That's the beauty of Spring. When Spring calls your `add()` method, it sees that you need an `HttpServletRequest` object. Spring says: "Oh, you want the request object? Here, let me give it to you."

Spring **automatically injects** the request object. You don't create it. You don't look it up. You just declare it as a parameter, and Spring fills it in.

### 🔧 Reading the Parameters

Now that we have the request object, we can read the form values:

```java
@RequestMapping("/add")
public String add(HttpServletRequest req) {
    String n1 = req.getParameter("num1");
    String n2 = req.getParameter("num2");
    
    return "result.jsp";
}
```

**`req.getParameter("num1")`** — This reads the value of the `num1` parameter from the URL.

When the URL is `localhost:8080/add?num1=6&num2=7`:
- `req.getParameter("num1")` returns `"6"` (as a String!)
- `req.getParameter("num2")` returns `"7"` (as a String!)

### ⚠️ The Type Problem

Notice something important: `getParameter()` always returns a **String**, not an `int`.

```java
// This WON'T work:
int num1 = req.getParameter("num1");  // ❌ Type mismatch!
```

Why? Because HTTP is a **text-based protocol**. Everything coming from the browser — URLs, headers, form data — is text. The number `6` arrives as the string `"6"`.

### 🔧 Parsing Strings to Integers

To do math, we need to convert the strings to integers:

```java
@RequestMapping("/add")
public String add(HttpServletRequest req) {
    int num1 = Integer.parseInt(req.getParameter("num1"));
    int num2 = Integer.parseInt(req.getParameter("num2"));
    
    int result = num1 + num2;
    System.out.println("Result: " + result);
    
    return "result.jsp";
}
```

**`Integer.parseInt("6")`** converts the string `"6"` to the integer `6`.

### 🧪 Testing the Computation

**Restart → Homepage → Enter 6 and 7 → Click Submit**

**Browser**: Shows "Result is:" (still static — we haven't sent the result to the page yet)

**Console**:
```
in add
Result: 13
```

It works! 6 + 7 = 13 is computed on the server. But we're only printing to the console, not to the browser. We'll fix that in the next lesson.

### 💡 Insight: Spring Injects What You Need

This is a powerful Spring concept: **dependency injection through method parameters**.

```java
// You declare what you need:
public String add(HttpServletRequest req) { ... }

// Spring provides it automatically.
// You don't do: new HttpServletRequest() — that doesn't even make sense.
// Spring handles object creation and injection.
```

This pattern extends beyond just `HttpServletRequest`. Spring can inject many things into your controller methods — we'll see more examples as we progress.

---

## 📊 The Complete Code So Far

### HomeController.java

```java
package com.telusko.app;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index.jsp";
    }
    
    @RequestMapping("/add")
    public String add(HttpServletRequest req) {
        int num1 = Integer.parseInt(req.getParameter("num1"));
        int num2 = Integer.parseInt(req.getParameter("num2"));
        
        int result = num1 + num2;
        System.out.println("Result: " + result);
        
        return "result.jsp";
    }
}
```

### webapp/index.jsp

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

### webapp/result.jsp

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Result</title>
</head>
<body>
    <h2>Result is:</h2>
</body>
</html>
```

---

## 🔄 The Complete Request Flow

```
Step 1: User visits localhost:8080/
    ↓
Step 2: DispatcherServlet → @RequestMapping("/") → home()
    ↓
Step 3: Returns "index.jsp" → Calculator form displayed
    ↓
Step 4: User enters 6 and 7, clicks Submit
    ↓
Step 5: Browser sends GET /add?num1=6&num2=7
    ↓
Step 6: DispatcherServlet → @RequestMapping("/add") → add(req)
    ↓
Step 7: Spring injects HttpServletRequest
    ↓
Step 8: req.getParameter("num1") → "6" → parseInt → 6
         req.getParameter("num2") → "7" → parseInt → 7
    ↓
Step 9: result = 6 + 7 = 13
    ↓
Step 10: System.out.println("Result: 13") → prints to console
    ↓
Step 11: Returns "result.jsp" → Page shows "Result is:"
    ↓
Step 12: PROBLEM — Result is computed but not sent to the page!
```

**Next step**: Learn how to pass the computed result from the controller to the JSP page so the browser displays "Result is: 13".

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **Multiple methods in one controller**
   - Group related requests in the same controller
   - Separate unrelated requests into different controllers (User, Product, Order)
   - Each method gets its own `@RequestMapping`

2. **Controller method → View mapping**
   - `return "result.jsp"` tells Spring to find and render `result.jsp`
   - The file must exist in `webapp/` folder
   - Always verify the method is called first (use `System.out.println`)

3. **DispatcherServlet**
   - Spring's central request router
   - Receives ALL requests, routes to correct controller method
   - Auto-configured by Spring Boot (`spring-boot-starter-web`)
   - Replaces manual servlet registration from the old days

4. **HttpServletRequest for reading data**
   - Add `HttpServletRequest req` as a method parameter
   - Spring automatically injects the request object
   - Use `req.getParameter("name")` to read form values
   - Returns String — must parse to int for numbers

5. **The debugging pattern**
   - Always add `System.out.println()` to verify method execution
   - Check console output before investigating view problems
   - Isolate issues: Is the method called? Is the view found? Is data correct?

### ⚠️ Common Mistakes

1. **❌ Forgetting to create the result page**
   ```java
   return "result.jsp";  // This file better exist in webapp/!
   ```

2. **❌ Not parsing strings to integers**
   ```java
   // BAD - getParameter returns String, can't do math on it
   int num1 = req.getParameter("num1");  // Compile error!
   
   // GOOD
   int num1 = Integer.parseInt(req.getParameter("num1"));
   ```

3. **❌ Parameter name mismatch**
   ```html
   <input name="num1">  <!-- HTML uses "num1" -->
   ```
   ```java
   req.getParameter("number1");  // ❌ Wrong! Must match: "num1"
   req.getParameter("num1");     // ✅ Correct!
   ```

4. **❌ Printing to console instead of sending to page**
   ```java
   System.out.println(result);  // Only YOU see this (in IDE console)
   // The user sees nothing in the browser!
   ```

### 💡 Pro Tips

1. **Step-by-step debugging is golden**. Don't try to build everything at once. First verify the mapping works, then verify data is received, then compute, then display. Each step should be tested before moving on.

2. **`System.out.println` is your development radar**. In production, you'd use a logger. But during development, a quick print statement tells you exactly what's happening and when.

3. **The servlet way works but isn't ideal**. Using `HttpServletRequest` with `getParameter()` and `Integer.parseInt()` is verbose. Spring provides `@RequestParam` which does all of this in one annotation. We'll see that soon.

4. **Method names are for humans, mappings are for Spring**. Name your methods descriptively (`add`, `handleAddition`, `processCalculation`), but remember Spring only cares about the `@RequestMapping` path.

---

## 🎬 What's Next

We've successfully computed the result on the server (6 + 7 = 13), but it only prints to the console. The browser still shows a static "Result is:" with no number.

In the next lesson, we'll learn:
- How to **pass data from the controller to the JSP page**
- Using the `Model` or `HttpSession` to carry data between controller and view
- Displaying dynamic values in JSP
- The cleaner **Spring way** of reading parameters with `@RequestParam`

The server knows the answer. Now we need to teach it how to tell the browser!
