# 🚀 Creating the Job Portal Spring Boot Project

## 🎯 Introduction

Time to set up the project. We're creating a fresh Spring Boot application for our Job Portal, adding the right dependencies, and importing the pre-built views (JSP files with CSS). By the end of this lesson, the project structure is ready — we just need to build the backend.

---

## 🧩 Concept 1: Creating the Project with Spring Initializr

### 🧠 The Setup

Since we're using IntelliJ IDEA Community Edition (which doesn't have built-in Spring support), we use **start.spring.io** — the Spring Initializr web tool.

### ⚙️ Project Configuration

| Setting | Value |
|---------|-------|
| **Project** | Maven |
| **Language** | Java |
| **Spring Boot Version** | 3.2.1 (latest stable at the time) |
| **Group** | com.telusko |
| **Artifact** | JobApp |
| **Java Version** | 21 |

### 📦 Dependencies Added

Two dependencies selected in the Initializr:

1. **Spring Web** — Because we're building a web application (provides `@Controller`, `@RequestMapping`, embedded Tomcat, etc.)
2. **Lombok** — A library that reduces boilerplate code (we'll explore what it does when we start coding)

After configuring everything, click **Generate**, download the ZIP, extract it, and open it in IntelliJ IDEA.

---

## 🧩 Concept 2: What is Lombok?

### 🧠 A Quick Preview

Lombok is a Java library that **automatically generates boilerplate code** at compile time. Things like:
- Getters and setters
- Constructors
- `toString()`, `equals()`, `hashCode()`

Instead of writing 50 lines of getters and setters for a class with 5 fields, you add a single annotation. We'll see it in action when we create the `JobPost` model class.

### 💡 Why Add It Now?

We add it as a dependency upfront so it's available when we start coding. No need to modify `pom.xml` later.

---

## 🧩 Concept 3: Additional Dependencies for JSP

### 🧠 The Problem

Spring Boot doesn't include JSP support out of the box. We need three additional dependencies to make JSP work:

### 🧪 The Dependencies

```xml
<!-- 1. Jasper — Converts JSP pages into servlets -->
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
</dependency>

<!-- 2. Jakarta JSTL API — JSTL tag support (post-Tomcat 10, jakarta namespace) -->
<dependency>
    <groupId>jakarta.servlet.jsp.jstl</groupId>
    <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
</dependency>

<!-- 3. JSTL Implementation — Actual JSTL tag library -->
<dependency>
    <groupId>org.glassfish.web</groupId>
    <artifactId>jakarta.servlet.jsp.jstl</artifactId>
</dependency>
```

### 🔍 Why Each One?

| Dependency | Purpose |
|-----------|---------|
| **Jasper** | The JSP engine — compiles `.jsp` files into Java servlets that Tomcat can execute |
| **JSTL API** | Provides JSTL tags like `<c:forEach>`, `<c:if>` for looping and conditionals in JSP |
| **JSTL Implementation** | The actual implementation of the JSTL tags (API alone isn't enough) |

### ❓ Why Jakarta Instead of Javax?

Remember from earlier lessons — Tomcat 10+ moved from `javax.*` to `jakarta.*`. Since Spring Boot 3.x uses Tomcat 10+, we need the `jakarta` versions of JSTL.

### 📋 Complete Dependency List

After adding everything, the `pom.xml` has five dependencies:

1. `spring-boot-starter-web` — Web framework
2. `lombok` — Boilerplate reduction
3. `tomcat-embed-jasper` — JSP compilation
4. `jakarta.servlet.jsp.jstl-api` — JSTL API
5. `jakarta.servlet.jsp.jstl` — JSTL implementation
6. `spring-boot-starter-test` — Testing (auto-added)

---

## 🧩 Concept 4: Setting Up the Views

### 📁 Creating the Folder Structure

JSP files need to go in a specific location. Inside `src/main/`:

1. Create a folder called **`webapp`**
2. Inside `webapp`, create two folders:
   - **`views`** — For JSP files
   - **`css`** — For stylesheets

```
src/
└── main/
    ├── java/
    │   └── com/telusko/jobapp/
    │       └── JobAppApplication.java
    ├── resources/
    │   └── application.properties
    └── webapp/                          ← Create this
        ├── views/                       ← JSP files go here
        │   ├── home.jsp
        │   ├── addJob.jsp
        │   ├── viewalljobs.jsp
        │   └── success.jsp
        └── css/                         ← Stylesheets go here
            └── style.css
```

### 📄 The Four JSP Views

| View | Purpose | What It Shows |
|------|---------|--------------|
| **home.jsp** | Homepage / landing page | Navigation links — "View All Jobs" and "Add Job" |
| **viewalljobs.jsp** | Job listing page | All available jobs with profile, description, experience, tech stack |
| **addJob.jsp** | Job posting form | Form fields for profile, description, experience, tech stack selection |
| **success.jsp** | Confirmation page | Shows the job that was just posted with all its details |

### 💡 These Are Pre-Built

The views come with CSS styling already done. We're not spending time writing HTML/CSS — we're copying the provided files into our project and focusing entirely on the **backend logic**.

---

## 🧩 Concept 5: How the Views Connect to the Backend

### 🔄 The Page Flow

```
home.jsp
   │
   ├── Click "View All Jobs"
   │        ↓
   │   viewalljobs.jsp ← Needs: List of JobPost objects from the backend
   │
   └── Click "Add Job"
            ↓
       addJob.jsp ← Form to fill in job details
            ↓
       Submit form → Controller processes data
            ↓
       success.jsp ← Shows: The job that was just added
```

### 🧠 What the Backend Needs to Provide

Each view expects certain data from the backend:

| View | What It Needs from Backend |
|------|---------------------------|
| **home.jsp** | Nothing — static navigation page |
| **viewalljobs.jsp** | A list of `JobPost` objects to iterate and display |
| **addJob.jsp** | Nothing — it's an input form (sends data TO the backend) |
| **success.jsp** | The `JobPost` object that was just created |

This tells us exactly what controller methods we need to write.

---

## 🧩 Concept 6: What the Final Application Does

### 🖥️ Complete User Journey

**As a Job Seeker:**
1. Land on the homepage
2. Click "View All Jobs"
3. See a list of all job postings — profile, description, experience, tech stack
4. Browse and find interesting positions

**As an Employer:**
1. Land on the homepage
2. Click "Add Job"
3. Fill in the form — profile (e.g., "React Developer"), description, experience (e.g., 1 year), tech stack (e.g., JavaScript, TypeScript)
4. Click Submit
5. See the success page confirming the job was posted
6. Go to "View All Jobs" — the new posting appears in the list

---

## 📝 Key Concepts Summary

### ✅ Key Takeaways

1. Project created using **Spring Initializr** (start.spring.io) with Maven, Java 21, Spring Boot 3.2.1.
2. Two main dependencies: **Spring Web** (web framework) and **Lombok** (boilerplate reduction).
3. Three additional dependencies for JSP: **Jasper** (JSP compilation), **JSTL API**, and **JSTL Implementation** — all using `jakarta` namespace.
4. Views go in `src/main/webapp/views/` — four JSP files: `home.jsp`, `viewalljobs.jsp`, `addJob.jsp`, `success.jsp`.
5. CSS files go in `src/main/webapp/css/`.
6. The views are **pre-built** — our focus is building the backend controllers and model to make them work.

### ⚠️ Common Mistakes

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Putting JSP files in `resources/templates/` | JSP won't render (that's for Thymeleaf) | Use `src/main/webapp/views/` |
| Using `javax.servlet` JSTL instead of `jakarta` | ClassNotFoundException at runtime | Use `jakarta.servlet.jsp.jstl` dependencies |
| Forgetting Jasper dependency | JSP pages return as raw text instead of rendering | Add `tomcat-embed-jasper` to `pom.xml` |
| Not creating the `webapp` folder manually | No place for JSP files | Manually create `src/main/webapp/` |

### 💡 Pro Tips

1. **Lombok saves serious time.** For a model class like `JobPost` with 5 fields, Lombok eliminates ~40 lines of getters, setters, and constructors. You'll appreciate it soon.
2. **Always check your Spring Boot version.** Version 3.x requires Java 17+ and uses `jakarta.*`. Version 2.x uses Java 8+ and `javax.*`. Don't mix them.
3. **The `webapp` folder is special.** Spring Boot looks for it specifically at `src/main/webapp`. Don't name it anything else or put it in the wrong place.
4. **Pre-built views are common in real projects.** In professional development, frontend teams often provide the templates and backend teams wire them up — exactly what we're doing here.
