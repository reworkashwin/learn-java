# 🧩 Replacing HttpSession with Model — And Removing JSP Extensions

## 🎯 Introduction

We've been progressively cleaning up our controller code. First, we replaced `HttpServletRequest` with `@RequestParam` (Document 55). Now it's time to tackle the other servlet relic sitting in our method signature: `HttpSession`.

Session was useful for passing data from the controller to the JSP, but it's overkill for this purpose. Session persists data across multiple requests — we just need to send data to a single view render. Spring has something built specifically for this: the **Model** object.

In this lesson, we'll:
- Replace `HttpSession` with Spring's `Model` interface
- Understand what Model is and why it exists
- Remove the `.jsp` extension from our return values
- Move JSP files into a subfolder for better organization
- Discover that these changes break things (and set up the fix for next lesson)

**The transformation**: From servlet APIs to pure Spring — no `HttpServletRequest`, no `HttpSession`, just clean Spring annotations and objects.

---

## 🔄 Concept 1: From HttpSession to Model

### 🧠 Where We Stand

Let's look at our current controller:

```java
@RequestMapping("/add")
public String add(@RequestParam("num1") int num1, 
                  @RequestParam("num2") int num2, 
                  HttpSession session) {
    int result = num1 + num2;
    session.setAttribute("result", result);
    return "result.jsp";
}
```

We got rid of `HttpServletRequest` in the last lesson. Now `HttpSession` is the last piece of servlet API left. Can we replace it?

### ❓ Why Replace HttpSession?

**HttpSession is designed for persistent data** — data that needs to survive across multiple requests from the same user. Things like:
- Login status ("Is this user authenticated?")
- Shopping cart contents
- User preferences

**Our calculator result doesn't need persistence.** We compute it, send it to the JSP, and we're done. Using session for this is like renting a storage unit to hold a letter you're about to hand-deliver.

**Enter Model** — designed specifically for passing data from a controller to a view for a **single request**.

### 🧠 What is Model?

`Model` is a Spring interface (introduced in Spring 2.5) that acts as a **data container** between the controller and the view.

Think of it as a **tray at a restaurant**:
- The chef (controller) puts the food (data) on the tray (Model)
- The waiter carries the tray to the table
- The customer (JSP) takes the food off the tray

The tray exists only for that one delivery. It doesn't stay at the table permanently (unlike session, which is more like a fridge that stores things long-term).

### ⚙️ How to Use Model

**Step 1**: Replace `HttpSession` with `Model` in the method parameters:

```java
import org.springframework.ui.Model;

@RequestMapping("/add")
public String add(@RequestParam("num1") int num1, 
                  @RequestParam("num2") int num2, 
                  Model model) {
    int result = num1 + num2;
    model.addAttribute("result", result);
    return "result.jsp";
}
```

**Step 2**: That's it! No changes needed in the JSP.

**What changed**:

| Before (Session) | After (Model) |
|-------------------|--------------|
| `HttpSession session` | `Model model` |
| `session.setAttribute("result", result)` | `model.addAttribute("result", result)` |

Almost identical API, but fundamentally different scope and purpose.

### 🔍 Breaking Down model.addAttribute()

```java
model.addAttribute("result", result);
//                   ↑ key       ↑ value
//                 "result"       13
```

Just like `session.setAttribute()`, it takes two arguments:
- **Key** (String): The name you'll use to access the data in JSP
- **Value** (Object): The actual data

**In the JSP**, nothing changes:

```jsp
<h2>Result is: ${result}</h2>
```

The JSTL expression `${result}` searches through all scopes — and Model attributes are placed in the **request scope**, which JSTL checks automatically.

### 🧪 Testing

**Restart → Homepage → Enter numbers → Submit**

**Browser shows**: `Result is: [correct sum]`

It works exactly as before, but now we're using Spring's `Model` instead of the servlet's `HttpSession`.

### 💡 Insight: Session vs Model — When to Use Which

| Aspect | HttpSession | Model |
|--------|------------|-------|
| **Scope** | Across multiple requests | Single request only |
| **Lifetime** | Until session expires (~30 min) | Until the view is rendered |
| **Memory** | Consumes server memory per user | Lightweight, garbage collected |
| **Use case** | Login state, shopping cart | Passing data to a view |
| **Spring-native?** | No (servlet API) | Yes (Spring API) |

**Rule of thumb**:
- Need data for the **next page only**? → Use `Model`
- Need data to **persist across many pages**? → Use `HttpSession`

For our calculator, `Model` is the right choice. We compute the result, display it, and we're done.

---

## 📊 The Complete Controller Evolution

Let's see how far we've come:

### Version 1: Pure Servlet Way (Document 53)

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

**Imports needed**: `HttpServletRequest`, `HttpSession`
**Servlet API usage**: Heavy (request object, session object, manual parsing)

### Version 2: @RequestParam (Document 55)

```java
@RequestMapping("/add")
public String add(@RequestParam("num1") int num1, 
                  @RequestParam("num2") int num2, 
                  HttpSession session) {
    int result = num1 + num2;
    session.setAttribute("result", result);
    return "result.jsp";
}
```

**Imports needed**: `HttpSession`, `@RequestParam`
**Servlet API usage**: Partial (still using session)

### Version 3: Model (This Document) ✅

```java
@RequestMapping("/add")
public String add(@RequestParam("num1") int num1, 
                  @RequestParam("num2") int num2, 
                  Model model) {
    int result = num1 + num2;
    model.addAttribute("result", result);
    return "result.jsp";
}
```

**Imports needed**: `Model`, `@RequestParam`
**Servlet API usage**: **None!** ✨

**We've completely eliminated the servlet API** from our controller. No `HttpServletRequest`, no `HttpSession`. Pure Spring.

---

## 🗂️ Concept 2: Removing the .jsp Extension

### 🤔 The Problem with Hardcoded Extensions

Look at our controller methods:

```java
@RequestMapping("/")
public String home() {
    return "index.jsp";
}

@RequestMapping("/add")
public String add(...) {
    return "result.jsp";
}
```

Notice the `.jsp` extension? Why is this a problem?

**Think about flexibility.** Remember from Document 48 (MVC Architecture), there are multiple view technologies:
- **JSP** — Java Server Pages
- **Thymeleaf** — Modern template engine
- **FreeMarker** — Another template engine

What happens if you decide to switch from JSP to Thymeleaf one day? You'd have to find and change **every single `return` statement** across **every controller** in your entire application:

```java
// Before: 50 controllers, 200 methods, all returning ".jsp"
return "index.jsp";
return "result.jsp";
return "users.jsp";
return "products.jsp";
// ... 196 more ...

// After switching to Thymeleaf: Change ALL of them
return "index.html";   // or "index" for Thymeleaf
return "result.html";
return "users.html";
return "products.html";
// ... 196 more nightmare changes ...
```

### ❓ The Better Approach

What if controllers just returned the **logical name** without any extension?

```java
return "index";     // No .jsp, no .html, no extension
return "result";    // Just the name
```

Then, somewhere in the configuration, you'd specify:
- "My views are JSP files, add `.jsp` to the name"
- "My views are in the `/views/` folder"

If you switch view technology later, you change **one configuration** instead of **200 return statements**.

### 🔧 Removing the Extension

Let's update our controller:

```java
@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index";     // Removed .jsp
    }
    
    @RequestMapping("/add")
    public String add(@RequestParam("num1") int num1, 
                      @RequestParam("num2") int num2, 
                      Model model) {
        int result = num1 + num2;
        model.addAttribute("result", result);
        return "result";    // Removed .jsp
    }
}
```

**Cleaner.** But will it work?

### 💡 Insight: Logical Names vs Physical Paths

The return value should be a **logical view name** — a label that Spring's view resolver translates into an actual file path.

```
Logical name:    "index"
Physical path:   /WEB-INF/views/index.jsp
                 ↑ prefix    ↑ name  ↑ suffix
```

A **View Resolver** connects the logical name to the physical file. We'll configure this next.

---

## 📁 Concept 3: Organizing Views in a Subfolder

### 🤔 Why Move JSP Files?

Currently, our JSP files sit directly in `webapp/`:

```
webapp/
├── index.jsp
└── result.jsp
```

This works, but in a real application with dozens of views, it gets messy. It's better to organize them in a dedicated folder:

```
webapp/
└── views/
    ├── index.jsp
    └── result.jsp
```

### ⚙️ Making the Move

**Step 1**: Create a `views` folder inside `webapp/`

```
src/main/webapp/
└── views/              ⬅️ NEW FOLDER
    ├── index.jsp       ⬅️ MOVED
    └── result.jsp      ⬅️ MOVED
```

**Step 2**: Move both JSP files into `views/`

Your updated project structure:

```
spring-boot-web1/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/telusko/app/
│   │   │       ├── Application.java
│   │   │       └── HomeController.java
│   │   ├── resources/
│   │   │   ├── application.properties
│   │   │   └── static/
│   │   │       └── style.css
│   │   └── webapp/
│   │       └── views/              ⬅️ Organized!
│   │           ├── index.jsp
│   │           └── result.jsp
├── pom.xml
```

---

## 🚫 Concept 4: Why It Breaks — And What's Missing

### 🧪 Testing After Changes

We've made two changes:
1. Removed `.jsp` from return values → `return "index"` instead of `return "index.jsp"`
2. Moved JSP files into a `views/` subfolder

**Restart → Open browser → `localhost:8080`**

**Result**: 💥 **404 Error!**

Even the homepage doesn't work anymore.

### 🤔 What Went Wrong?

**Problem 1 — No extension**: The controller returns `"index"`. Spring looks for a file literally called `index` (with no extension). That doesn't exist.

**Problem 2 — Wrong location**: Even if Spring guessed the `.jsp` extension, the files are now in `webapp/views/`, not in `webapp/`. Spring is looking in the wrong place.

### 🔍 What Spring Needs to Know

Spring needs two pieces of information:

```
Return value:  "index"
What Spring needs:
  1. PREFIX — where to look → "/views/"
  2. SUFFIX — what extension to add → ".jsp"

Combined: /views/ + index + .jsp = /views/index.jsp ✅
```

This is the job of a **View Resolver** — a Spring component that transforms logical view names into actual file paths.

### 🗺️ The Configuration We Need

We need to tell Spring:
- **Prefix**: `"/views/"` — look in the views folder
- **Suffix**: `".jsp"` — add the .jsp extension

This configuration goes in `application.properties`:

```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

**We'll configure this in the next lesson** and see everything come together.

### 💡 Insight: Why This Design Pattern Matters

This is the **separation of concerns** principle:

```
Controller:     Decides WHAT to show     → "index"
View Resolver:  Decides WHERE to find it → /views/index.jsp
```

The controller doesn't care about:
- What folder views are in
- What extension they use
- What view technology is being used

The controller just says: "Show 'index'." Everything else is configuration.

**The payoff**: Change your view folder? Update one property. Switch from JSP to Thymeleaf? Update one property. No controller code changes.

---

## 📊 The Full Picture — What We've Accomplished

### The Complete Controller (Clean Spring Code)

```java
package com.telusko.app;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {
    
    @RequestMapping("/")
    public String home() {
        return "index";
    }
    
    @RequestMapping("/add")
    public String add(@RequestParam("num1") int num1, 
                      @RequestParam("num2") int num2, 
                      Model model) {
        int result = num1 + num2;
        model.addAttribute("result", result);
        return "result";
    }
}
```

**Look at how clean this is!**

- No `HttpServletRequest`
- No `HttpSession`  
- No `getParameter()`
- No `Integer.parseInt()`
- No `.jsp` extensions
- No servlet API imports

**Pure Spring.** Every piece is handled by the framework.

### The Journey (Documents 53-56)

```
Document 53: Full servlet way
  HttpServletRequest + getParameter() + parseInt() + HttpSession + setAttribute()

Document 55: @RequestParam replaces HttpServletRequest
  @RequestParam + HttpSession + setAttribute()

Document 56: Model replaces HttpSession
  @RequestParam + Model + addAttribute()

Document 56: Remove extensions
  return "index" instead of return "index.jsp"

Next: Configure View Resolver to make it all work
```

---

## 📚 Key Concepts Summary

### ✅ What We Learned

1. **Model replaces HttpSession for view data**
   - `Model model` as a method parameter — Spring injects it
   - `model.addAttribute("key", value)` — stores data for the view
   - Data lives only for the current request (not persisted like session)
   - JSTL `${key}` still works — Model attributes are in request scope

2. **Model vs HttpSession**
   - Model: single request scope, lightweight, for passing data to views
   - Session: multi-request scope, persistent, for login state/shopping carts
   - Use Model for 95% of controller-to-view data passing

3. **Removing .jsp extensions**
   - Controllers should return **logical view names**: `"index"`, not `"index.jsp"`
   - Makes the application **view-technology agnostic**
   - Switching from JSP to Thymeleaf = one config change, not hundreds

4. **Organizing views in subfolders**
   - Move JSP files from `webapp/` to `webapp/views/`
   - Keeps the project organized as it grows
   - Requires view resolver configuration (prefix/suffix)

5. **View Resolver (preview)**
   - Translates logical names → physical paths
   - Prefix: folder path (`/views/`)
   - Suffix: file extension (`.jsp`)
   - Configured in `application.properties`

### ⚠️ Common Mistakes

1. **❌ Using Model for persistent data**
   ```java
   // BAD — Model data disappears after the request
   model.addAttribute("loggedInUser", user);  // Gone on next request!
   
   // GOOD — Use session for persistent data
   session.setAttribute("loggedInUser", user);  // Persists across requests
   ```

2. **❌ Removing extension without configuring View Resolver**
   ```java
   return "index";  // 404! Spring doesn't know to add .jsp
   // Must configure spring.mvc.view.suffix=.jsp
   ```

3. **❌ Importing the wrong Model class**
   ```java
   import org.springframework.ui.Model;          // ✅ Correct
   import java.awt.Model;                        // ❌ Wrong package!
   ```

4. **❌ Moving files without updating configuration**
   ```
   Files in: webapp/views/index.jsp
   Config says: (nothing about /views/ prefix)
   Result: 404 — Spring looks in webapp/ but files are in webapp/views/
   ```

### 💡 Pro Tips

1. **Model is your default choice** for passing data to views. Only reach for HttpSession when you genuinely need data to survive across multiple requests.

2. **Always use logical view names** (no extensions). This makes your controllers future-proof. Whether you use JSP today or Thymeleaf tomorrow, your controller code stays the same.

3. **The `addAttribute` method supports chaining** in some implementations:
   ```java
   model.addAttribute("result", result)
        .addAttribute("num1", num1)
        .addAttribute("num2", num2);
   ```

4. **Model attributes are automatically available in JSP** through JSTL `${}` syntax. No special import or configuration needed in the JSP itself.

---

## 🎬 What's Next

Our controller is clean and Spring-native, but the app is currently **broken** — removing the `.jsp` extension and moving files into `views/` means Spring can't find the views anymore.

In the next lesson, we'll fix this by configuring the **View Resolver** in `application.properties`:

```properties
spring.mvc.view.prefix=/views/
spring.mvc.view.suffix=.jsp
```

Two lines of configuration, and everything will work again — with cleaner, more maintainable code.
