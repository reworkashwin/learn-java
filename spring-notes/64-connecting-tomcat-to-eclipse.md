# 🔌 Connecting Tomcat to Eclipse and Running the Project

## 🎯 Introduction

We have our Spring MVC project set up in Eclipse — code, views, and dependencies are ready. But right now, there's no server to run it on. Unlike Spring Boot where you just click Run and the embedded Tomcat starts, here we need to **manually connect** the external Tomcat to Eclipse.

In this lesson, we'll:
- Add Tomcat as a server in Eclipse
- Deploy our project to that server
- Start the server and see what happens
- Discover that the project **doesn't work yet** — and understand why

---

## 🧩 Concept 1: Adding Tomcat as a Server in Eclipse

### ⚙️ Step-by-Step Setup

1. **Find the Servers tab** at the bottom of Eclipse. You'll see a message: *"No servers are available. Click this link to create a new server..."*

2. **Click the link** — A dialog opens asking you to select a server type.

3. **Select the server type**:
   - Expand **Apache**
   - Choose **Tomcat v10.1 Server**
   - Click **Next**

4. **Point to your Tomcat installation**:
   - Click **Browse**
   - Navigate to your downloaded and extracted Tomcat folder (e.g., `apache-tomcat-10.1.16`)
   - Select it
   - Click **Next**

   💡 If you haven't downloaded Tomcat yet, Eclipse offers a **"Download and Install"** button right here that does it for you.

5. **Add your project to the server**:
   - You'll see your `SpringMVCDemo` project in the "Available" column
   - Move it to the **"Configured"** column using the **Add >** button
   - Click **Finish**

### ✅ After Setup

You'll see in the Servers tab:
```
Tomcat v10.1 Server at localhost [Stopped]
  └── SpringMVCDemo
```

Tomcat is registered, and your project is deployed to it. The server is currently stopped — we need to start it.

---

## 🧩 Concept 2: Starting Tomcat

### ⚙️ Start the Server

Right-click on the Tomcat server in the Servers tab → **Start**

Or use the green **play button** in the Servers toolbar.

### ⚠️ "Port Already in Use" Error

If you get an error saying the port is already in use:

```
Port 8080 required by Tomcat v10.1 Server at localhost is already in use.
```

This means **something else is running on port 8080** — likely the IntelliJ Spring Boot project from earlier. You have two options:

**Option A: Stop the other application**
- Go to IntelliJ and stop the Spring Boot application
- Come back to Eclipse and start Tomcat again

**Option B: Change the port**
- Double-click on the Tomcat server in Eclipse → Opens the server configuration
- Find the **HTTP/1.1** connector port setting
- Change it from `8080` to something else (e.g., `9090`)
- Save and restart

### ✅ Tomcat Started Successfully

Once the port conflict is resolved and Tomcat starts, the console shows startup messages. The server is running and ready to serve requests.

---

## 🧩 Concept 3: Running the Project

### ⚙️ Deploy and Run

1. Right-click on the project → **Run As** → **Run on Server**
2. Select the Tomcat server we just configured
3. Click **Next** → **Finish**

Eclipse might open a built-in browser, but you can use your own browser instead.

### 🧪 Testing in the Browser

Navigate to:

```
http://localhost:8080/SpringMVCDemo/
```

⚠️ **Notice the URL difference from Spring Boot!**

| Spring Boot | Spring MVC (External Tomcat) |
|------------|----------------------------|
| `localhost:8080/` | `localhost:8080/SpringMVCDemo/` |

With an external Tomcat, your application is deployed under a **context path** — the project name becomes part of the URL. In Spring Boot with embedded Tomcat, the app runs at the root (`/`). With external Tomcat, it runs under `/SpringMVCDemo/`.

### ❌ The Result: "Resource Not Available"

When you hit the URL, you see an error:

```
HTTP Status 404 – Not Found
The requested resource is not available.
```

The server is running. The project is deployed. But the page doesn't load.

**Why?**

---

## 🧩 Concept 4: Why It Doesn't Work — What's Missing

### 🧠 The Core Problem

Our Spring MVC project has code and views, but it's missing the **wiring** that connects everything together. Specifically:

### ❌ Missing Piece 1: DispatcherServlet Registration

In Spring Boot, the DispatcherServlet is automatically registered and mapped to `/`. It intercepts all requests and routes them to the right controller.

In our Spring MVC project, **nobody has told Tomcat about the DispatcherServlet**. Tomcat doesn't know that Spring should handle requests. It's like having a receptionist (DispatcherServlet) who never showed up to work — calls come in, but nobody answers.

### ❌ Missing Piece 2: Spring Configuration

Even if we register the DispatcherServlet, we need to tell Spring:
- **Where to scan for controllers** — Which packages contain `@Controller` classes?
- **How to resolve views** — What's the prefix and suffix for JSP files?

In Spring Boot, this was auto-configured. Here, we need to do it manually.

### ❌ Missing Piece 3: No Spring Context

Spring Boot automatically creates and manages the application context (the container that holds all your beans). Without Spring Boot, we need to create a Spring configuration file that bootstraps the application context.

### 📋 What's Still Needed

| Configuration | What It Does | How It Was Done in Spring Boot |
|--------------|-------------|-------------------------------|
| Register DispatcherServlet | Routes requests to controllers | Auto-registered |
| Component scanning | Finds `@Controller` classes | Auto-detected from main class package |
| View Resolver | Maps view names to JSP paths | `application.properties` |

We'll set all of these up in the next lessons.

---

## 🧩 Concept 5: Eclipse Server Management — Quick Reference

### 🎛️ Server Controls in Eclipse

The Servers tab provides these controls:

| Icon/Action | What It Does |
|------------|-------------|
| ▶️ Start | Starts the server |
| ⏹️ Stop | Stops the server |
| 🔄 Restart | Stops and starts the server |
| 🐛 Debug | Starts in debug mode (breakpoints work) |
| Publish | Re-deploys changed files without restart |

### 💡 Useful Tips

- **Double-click** the server name to open its configuration (ports, timeouts, etc.)
- **Right-click** the server to add/remove projects
- The **Console** tab shows Tomcat logs — check here when things go wrong
- **Publish** is useful for JSP changes that don't require a full restart

---

## 🧩 Concept 6: The Deployment Model — How It Differs

### 🔄 Spring Boot Deployment Flow

```
Write code → Click Run → main() starts → Embedded Tomcat starts → App serves at localhost:8080
```

Everything is one step. One process. One click.

### 🔄 Spring MVC Deployment Flow

```
Write code → Eclipse builds .war → Tomcat is running → .war deployed to Tomcat → App serves at localhost:8080/ProjectName
```

Multiple steps. The application and the server are **separate entities**. The server can run without the app, and the app can't run without the server.

### 🧠 .war Files

In Spring Boot, your project is typically packaged as a `.jar` (Java Archive) with an embedded server.

In traditional Spring MVC, your project is packaged as a **`.war`** (Web Application Archive) — a special format designed to be deployed into an external web server. Eclipse handles this packaging and deployment automatically when you "Run on Server."

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. **Add Tomcat to Eclipse** via the Servers tab → Select Apache Tomcat v10.1 → Browse to the Tomcat installation folder
2. **Add your project** to the server during setup (or later via right-click → Add and Remove)
3. The application URL includes the **context path**: `localhost:8080/ProjectName/` (not just `localhost:8080/`)
4. **Port conflicts** happen if another server (like Spring Boot's embedded Tomcat) is running on the same port — stop it or change the port
5. The project **doesn't work yet** — we get a 404 because DispatcherServlet isn't registered and Spring isn't configured
6. The missing pieces are: DispatcherServlet registration, component scanning, and View Resolver — all auto-configured by Spring Boot, manual in Spring MVC

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Not adding the project to the server | Tomcat runs but doesn't serve your app | Add project via server configuration |
| Port 8080 already in use | Server fails to start | Stop the other process or change the port |
| Going to `localhost:8080/` without project name | 404 or Tomcat welcome page | Use `localhost:8080/SpringMVCDemo/` |
| Expecting the app to work without Spring config | 404 error | DispatcherServlet and View Resolver must be configured (next lessons) |
| Editing Java code without restarting | Old code still running | Restart or republish the server |

### 💡 Pro Tips

1. **Stop IntelliJ's server** before starting Eclipse's Tomcat — or change ports to avoid conflicts.
2. **Use the Console tab** in Eclipse for debugging — Tomcat logs all errors and Spring initialization here.
3. **Don't panic at the 404** — It's expected at this stage. We haven't configured Spring yet. The server is running fine; it just doesn't know how to route requests to our controller.
4. **Bookmark the context path** — `localhost:8080/ProjectName/` is easy to forget when you're used to Spring Boot's root URL.

---

## 🔗 What's Next?

The server is running, the project is deployed, but requests hit a dead end because Spring isn't wired up. We need to:

1. **Register the DispatcherServlet** — Tell Tomcat that Spring handles web requests
2. **Create a Spring configuration file** — Define component scanning and View Resolver
3. **Wire everything together** — So requests flow from browser → Tomcat → DispatcherServlet → Controller → View

That configuration is the heart of what Spring Boot automates. Time to see it done manually.
