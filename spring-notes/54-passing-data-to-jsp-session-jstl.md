# 📤 Passing Data from Controller to JSP — Session, JSP Expressions & JSTL

## 🎯 Introduction

We've hit a wall. Our calculator works on the server — 6 + 7 = 13 prints perfectly in the console. But the user doesn't see the console. They see the browser, and the browser just shows a static "Result is:" with no number.

The question is: **how do we send data from the controller to the JSP page?**

This might sound trivial, but it's actually one of the most fundamental concepts in web development. The controller and the view are **separate**. They don't share variables. They don't share memory. Data computed in the controller doesn't magically appear in the JSP.

You have to **explicitly pass it**.

In this lesson, we'll learn:
- Why you can't just "use" controller variables in JSP
- Using `HttpSession` to pass data between pages
- Setting attributes on the session object
- Reading session data in JSP using **expression syntax** (`<%= %>`)
- Reading session data using **JSTL syntax** (`${ }`)
- Debugging the classic 500 error (forgot the `=` sign!)
- Setting the stage for the cleaner Spring way

---

## 🤔 Concept 1: The Problem — Controller and JSP Don't Share Variables

### 🧠 What's Going On?

Right now our controller looks like this:

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

And our `result.jsp` says:

```jsp
<h2>Result is:</h2>
```

The variable `result` exists in the controller method. But when Spring renders `result.jsp`, that method is already done executing. The JSP has **no access** to local variables from the controller.

### ❓ Why Can't JSP Access Controller Variables?

Think about it from a lifecycle perspective:

```
1. add() method executes        ← result = 13 exists here
2. Method returns "result.jsp"  ← method execution ENDS
3. Spring finds result.jsp      ← new context begins
4. Jasper compiles JSP          ← no knowledge of result variable
5. HTML is generated            ← "Result is:" (nothing else)
```

The variable `result` was a **local variable** inside the `add()` method. When the method finishes, that variable is gone. JSP runs in a completely different context.

**Real-world analogy**: Imagine you calculate something on a whiteboard in Room A, then tell someone in Room B to write a report. They can't see your whiteboard! You have to **carry the answer** from Room A to Room B.

### 💡 How Do We Carry Data?

We need a **shared storage mechanism** — something both the controller and the JSP can access. There are several options:

1. **URL parameters** — Append `?result=13` to the URL
2. **Session** — Store data in the user's session (shared across pages)
3. **Model** — Spring's built-in way (we'll learn this next lesson)

For now, we'll use **Session** — the traditional servlet approach.

---

## 🗂️ Concept 2: HttpSession — Shared Storage Between Pages

### 🧠 What is HttpSession?

`HttpSession` is a **server-side storage** mechanism that persists data across multiple requests from the same user. When a user visits your website, the server creates a session for them. That session can hold data, and any page in the application can read from it.

Think of it like a **locker at a gym**:
- You (the controller) put something in the locker
- Later, your friend (the JSP) opens the same locker and takes it out
- Both of you share the same locker (session)

### ❓ Why Use Session?

When you have **two different pages** (the controller method and the result JSP), you need to maintain data between them. Session is the classic servlet way to do this.

```
Controller:  "I computed result = 13. Let me put it in the session."
Session:     [result → 13]
JSP:         "Let me check the session... result is 13! I'll display it."
```

### ⚙️ How to Use It in Spring Boot

**Step 1**: Add `HttpSession` as a method parameter

```java
@RequestMapping("/add")
public String add(HttpServletRequest req, HttpSession session) {
    int num1 = Integer.parseInt(req.getParameter("num1"));
    int num2 = Integer.parseInt(req.getParameter("num2"));
    int result = num1 + num2;
    
    session.setAttribute("result", result);
    
    return "result.jsp";
}
```

**Who provides the session object?** Just like `HttpServletRequest`, you declare it as a parameter and **Spring injects it** automatically. You don't create it. You just ask for it.

**Step 2**: Store data with `setAttribute()`

```java
session.setAttribute("result", result);
```

This method takes **two arguments**:

| Argument | What It Is | Example |
|----------|-----------|---------|
| First (String) | The **name** — a key to retrieve the data later | `"result"` |
| Second (Object) | The **value** — the actual data you want to store | `result` (the int variable, value 13) |

**Important distinction**: The first `"result"` is a **string name** (the key). The second `result` is the **variable** containing the computed value (13).

```java
session.setAttribute("result", result);
//                     ↑ key       ↑ value
//                   "result"       13
```

You can name the key anything:

```java
session.setAttribute("answer", result);       // Key is "answer"
session.setAttribute("sum", result);          // Key is "sum"
session.setAttribute("calculationResult", result); // Key is "calculationResult"
```

Whatever name you choose here, you **must use the same name** when retrieving it in the JSP.

### 💡 Insight: Session Scope

Session data persists across **multiple requests** from the same user. This means:

- If the user submits the form again, the old session data is still there (until overwritten)
- If the user navigates to another page, session data is still accessible
- Session data expires after a timeout (usually 30 minutes of inactivity)

**For simple calculations, session is overkill.** We're using it here because it's the traditional servlet approach. Spring has a better way (using `Model`) that we'll see in the next lesson.

---

## 📝 Concept 3: Reading Session Data in JSP — The Expression Way

### 🧠 The Challenge

We've stored the result in the session. Now, how do we display it in `result.jsp`?

You might try this:

```jsp
<h2>Result is: result</h2>
```

But that literally prints the word "result" on the page, not the number 13. JSP treats everything as **plain text** unless you explicitly tell it otherwise.

### ❓ How Does JSP Know Something Is Java Code?

JSP uses special syntax to distinguish between HTML text and Java code. You write Java code inside special tags:

```
<%   %>   →  Java code block (scriptlet)
<%=  %>   →  Java expression (prints the result)
<%@  %>   →  Directive (page configuration)
```

### ⚙️ Using JSP Expression Syntax

To print the session attribute, we use the **expression tag** `<%= %>`:

```jsp
<h2>Result is: <%= session.getAttribute("result") %></h2>
```

**Breaking this down**:

| Part | Purpose |
|------|---------|
| `<%=` | Start of JSP expression — "evaluate this Java code and print the result" |
| `session` | The session object — available **automatically** in JSP |
| `.getAttribute("result")` | Retrieves the value stored with key `"result"` |
| `%>` | End of JSP expression |

### 🔑 Key Point: JSP Implicit Objects

Did you notice we didn't create or inject the `session` object in JSP? We just used it directly. How?

**JSP provides built-in objects** called **implicit objects** that are available automatically:

| Implicit Object | What It Is |
|-----------------|-----------|
| `session` | The `HttpSession` object |
| `request` | The `HttpServletRequest` object |
| `response` | The `HttpServletResponse` object |
| `out` | The `PrintWriter` for output |
| `application` | The `ServletContext` |

So in your controller, you had to explicitly declare `HttpSession session` as a parameter to get it. But in JSP, it's just... there. Ready to use.

**Why?** Because behind the scenes, JSP gets compiled into a servlet, and that generated servlet has all these objects pre-configured.

### ⚠️ The Classic Mistake: Forgetting the `=` Sign

Here's a trap that catches almost everyone:

```jsp
<!-- ❌ WRONG — This runs the code but prints NOTHING -->
<h2>Result is: <% session.getAttribute("result") %></h2>

<!-- ✅ CORRECT — The = sign means "print the result" -->
<h2>Result is: <%= session.getAttribute("result") %></h2>
```

**What's the difference?**

- `<% code %>` → **Scriptlet** — Executes Java code but doesn't output anything
- `<%= expression %>` → **Expression** — Evaluates the expression AND prints the result

Without the `=`, Java runs `session.getAttribute("result")` but throws the value away. With the `=`, it takes the return value and writes it into the HTML.

**If you forget the `=` sign**, you'll get a **500 Internal Server Error** because the code block expects a statement (ending with `;`), not a standalone expression.

### 🧪 Testing It

**Updated `result.jsp`**:

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Result</title>
</head>
<body>
    <h2>Result is: <%= session.getAttribute("result") %></h2>
</body>
</html>
```

**Restart → Homepage → Enter 7 and 88 → Click Submit**

**Browser shows**:
```
Result is: 95
```

It works! 7 + 88 = 95, computed on the server, stored in the session, retrieved by the JSP, and displayed in the browser.

---

## 🚨 Concept 4: The 500 Error — Debugging JSP Mistakes

### 🧠 What is a 500 Error?

We briefly encountered this when we forgot the `=` sign. Let's understand it:

| HTTP Status | Meaning |
|-------------|---------|
| **200** | OK — everything worked |
| **404** | Not Found — page/resource doesn't exist |
| **500** | Internal Server Error — something crashed on the server |

**404** means "I can't find what you're looking for."
**500** means "I found it, but something broke while processing it."

### ❓ What Caused Our 500?

When we wrote:

```jsp
<% session.getAttribute("result") %>
```

Without the `=` sign, this is treated as a **scriptlet** (code block). Java expects a complete statement inside a scriptlet:

```jsp
<% String value = session.getAttribute("result").toString(); %>  <!-- OK: complete statement -->
<% session.getAttribute("result") %>  <!-- ERROR: expression is not a statement -->
```

The expression `session.getAttribute("result")` just returns a value but doesn't **do** anything with it. Java sees this as an incomplete statement and throws an error.

### 💡 Pro Tip: The 500 Fix Checklist

When you get a 500 error in JSP:

1. **Check the console/logs** — The actual error message tells you exactly what went wrong
2. **Check JSP syntax** — Missing `=`, unclosed `%>`, wrong method calls
3. **Check null values** — Is the session attribute actually set? Could it be null?
4. **Check data types** — Are you calling methods on the wrong type?

---

## ✨ Concept 5: JSTL — A Cleaner Way to Access Data in JSP

### 🧠 What is JSTL?

**JSTL** stands for **JSP Standard Tag Library** (sometimes called JSP Standard Template Library). It provides a cleaner, more readable syntax for accessing data in JSP pages.

Instead of writing Java code inside JSP (which gets messy), JSTL lets you use **expression language** (EL) with a simple `${ }` syntax.

### ❓ Why Use JSTL Over JSP Expressions?

Compare the two approaches:

```jsp
<!-- JSP Expression Way (verbose) -->
<h2>Result is: <%= session.getAttribute("result") %></h2>

<!-- JSTL Way (clean) -->
<h2>Result is: ${result}</h2>
```

The JSTL way is dramatically simpler. No Java code, no method calls, no angle brackets and percentages. Just `${variableName}`.

### ⚙️ How JSTL Expression Language Works

When you write `${result}`, JSTL searches for the value named `"result"` in multiple places, in this order:

```
1. Page scope     → Was it set on this page?
2. Request scope  → Was it set in the request attributes?
3. Session scope  → Was it set in the session? ✅ Found it!
4. Application scope → Was it set at application level?
```

It **automatically** searches through all these scopes. You don't have to specify `session.getAttribute()`. Just say `${result}`, and JSTL finds it wherever it was stored.

### 🔧 Using JSTL Syntax

**Updated `result.jsp`**:

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Result</title>
</head>
<body>
    <h2>Result is: ${result}</h2>
</body>
</html>
```

**That's it!** The `${result}` expression:
1. Sees the key name `result`
2. Searches page → request → session → application scopes
3. Finds `result = 95` in the session
4. Prints `95`

### 🧪 Important: The Dollar Sign

The `$` symbol is what tells JSP: "This is an expression, not plain text."

```jsp
<!-- Without $ — prints literally: {result} -->
<h2>Result is: {result}</h2>

<!-- With $ — evaluates the expression -->
<h2>Result is: ${result}</h2>
```

The `${ }` together is the **expression language (EL) syntax**. The dollar sign activates EL processing, and the curly braces contain the expression to evaluate.

### 🔄 Comparison: Three Ways to Display Data

| Approach | Syntax | Readability |
|----------|--------|-------------|
| JSP Scriptlet | `<% out.println(session.getAttribute("result")); %>` | Complex |
| JSP Expression | `<%= session.getAttribute("result") %>` | Moderate |
| JSTL / EL | `${result}` | Clean ✅ |

**JSTL is the preferred approach** when working with JSPs. It's cleaner, less error-prone, and separates Java logic from HTML presentation.

### 💡 Insight: JSTL Goes Beyond Simple Values

JSTL expression language can do more than just print values:

```jsp
<!-- Access object properties -->
${user.name}

<!-- Simple arithmetic -->
${num1 + num2}

<!-- Conditional checks -->
${result > 100 ? "Big number!" : "Small number"}

<!-- Null-safe access -->
${result}   <!-- Prints empty string if null, no NullPointerException! -->
```

Compare that with JSP expressions where `null` would throw an error — JSTL handles it gracefully.

---

## 📊 The Complete Code

### HomeController.java

```java
package com.telusko.app;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index.jsp";
    }
    
    @RequestMapping("/add")
    public String add(HttpServletRequest req, HttpSession session) {
        int num1 = Integer.parseInt(req.getParameter("num1"));
        int num2 = Integer.parseInt(req.getParameter("num2"));
        int result = num1 + num2;
        
        session.setAttribute("result", result);
        
        return "result.jsp";
    }
}
```

### webapp/result.jsp (JSTL version)

```jsp
<%@ page language="java" %>
<html>
<head>
    <title>Result</title>
</head>
<body>
    <h2>Result is: ${result}</h2>
</body>
</html>
```

---

## 🔄 The Complete Request Flow (Updated)

```
Step 1:  User visits localhost:8080/
Step 2:  DispatcherServlet → home() → returns "index.jsp"
Step 3:  Calculator form displayed to user
Step 4:  User enters 7 and 88, clicks Submit
Step 5:  Browser sends GET /add?num1=7&num2=88
Step 6:  DispatcherServlet → add(req, session)
Step 7:  Spring injects HttpServletRequest and HttpSession
Step 8:  req.getParameter("num1") → "7" → parseInt → 7
         req.getParameter("num2") → "88" → parseInt → 88
Step 9:  result = 7 + 88 = 95
Step 10: session.setAttribute("result", 95)
Step 11: Returns "result.jsp"
Step 12: JSP reads ${result} → finds 95 in session
Step 13: Browser displays "Result is: 95" 🎉
```

**Every piece connected. Every step accounted for.**

---

## 🤔 The Elephant in the Room

### Does This Feel Too Verbose?

Look at what we're doing just to add two numbers and display the result:

```java
// Reading parameters — 2 lines of parsing
int num1 = Integer.parseInt(req.getParameter("num1"));
int num2 = Integer.parseInt(req.getParameter("num2"));

// Storing result — need to import and inject HttpSession
session.setAttribute("result", result);
```

That's a lot of ceremony for a simple operation:
- Import `HttpServletRequest`
- Import `HttpSession`
- Manually read each parameter as a String
- Manually parse each String to int
- Manually store the result in session

**We're working with Spring Boot** — the framework that promises simplicity. Can we do better?

**Absolutely.** Spring provides:
- `@RequestParam` — Automatically reads and converts parameters (no `getParameter` or `parseInt`)
- `Model` — A cleaner way to pass data to views (no session needed for simple cases)

We'll see that in the next lesson. The current approach works, but it's the **servlet way transplanted into Spring**. The Spring way is much more elegant.

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **Controller and JSP don't share variables**
   - Local variables in controller methods disappear when the method ends
   - You must explicitly transfer data through a shared mechanism
   - Session, request attributes, or Model are the bridges

2. **HttpSession for passing data**
   - `session.setAttribute("key", value)` — stores data
   - `session.getAttribute("key")` — retrieves data
   - Spring injects the session automatically when you declare it as a parameter
   - Data survives across multiple requests from the same user

3. **JSP Expression syntax (`<%= %>`)**
   - `<%= expression %>` evaluates Java code and prints the result
   - `session` is an **implicit object** in JSP — available automatically
   - **Don't forget the `=` sign!** Without it, nothing prints (and you might get 500)

4. **JSTL Expression Language (`${ }`)**
   - `${result}` — clean, simple syntax to access stored data
   - Automatically searches page → request → session → application scopes
   - Null-safe (prints empty string instead of throwing errors)
   - Preferred over raw JSP expressions

5. **500 Internal Server Error**
   - Means something crashed on the server during processing
   - Common JSP causes: syntax errors, null values, wrong method calls
   - Always check console/logs for the detailed error message

### ⚠️ Common Mistakes

1. **❌ Forgetting the `=` in JSP expressions**
   ```jsp
   <!-- BAD — runs code but prints nothing (or throws 500) -->
   <% session.getAttribute("result") %>
   
   <!-- GOOD — evaluates and prints -->
   <%= session.getAttribute("result") %>
   ```

2. **❌ Key mismatch between controller and JSP**
   ```java
   session.setAttribute("answer", result);  // Key is "answer"
   ```
   ```jsp
   ${result}  <!-- ❌ Looking for "result" but it was stored as "answer" -->
   ${answer}  <!-- ✅ Correct key -->
   ```

3. **❌ Forgetting the `$` in JSTL**
   ```jsp
   {result}   <!-- ❌ Plain text, prints literally: {result} -->
   ${result}  <!-- ✅ Expression language, prints: 95 -->
   ```

4. **❌ Using session for everything**
   - Session data persists until timeout — it's not cleaned up automatically
   - For one-time data passing, `Model` (Spring way) is better
   - Session is for data that must survive across **multiple** requests (like login info)

### 💡 Pro Tips

1. **JSTL is your friend for JSP pages.** Use `${variableName}` instead of `<%= session.getAttribute("...") %>` whenever possible. It's cleaner and null-safe.

2. **JSP implicit objects save you work.** You don't need to create `session`, `request`, or `out` objects in JSP — they're pre-built and ready to use.

3. **The `=` sign in `<%= %>` is the "print" command.** Without it, you have a code block. With it, you have a print statement. Simple mnemonic: **"equals means echo."**

4. **Session is powerful but heavy.** It consumes server memory for each user. For a simple calculator result, session works but it's overkill. Spring's `Model` object (next lesson) is designed exactly for passing data to views without the baggage of session persistence.

---

## 🎬 What's Next

Our calculator is fully functional now — form input, server processing, and result display all working together. But our code still looks very "servlet-ish." We're using:
- `HttpServletRequest` with `getParameter()` and `parseInt()`
- `HttpSession` with `setAttribute()` and `getAttribute()`

Spring Boot can do all of this more elegantly with:
- **`@RequestParam`** — directly binds URL parameters to method arguments (no parsing needed!)
- **`Model`** — a Spring-specific way to pass data to views (cleaner than session)

The next lesson will transform our verbose servlet code into clean, idiomatic Spring code. Same functionality, half the code.
