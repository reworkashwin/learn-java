# Introduction to the Contact Us Page — Building a New REST API Scenario

## Introduction

So far, we've been building REST APIs for the company-related features of our Job Portal application. Now it's time to expand — we're going to build a **brand new REST API** for a completely different scenario: the **Contact Us** page.

Why does this matter? Because in the real world, applications have multiple features, each needing its own set of APIs. By building a second REST API from scratch, you'll reinforce everything you've learned and pick up **new concepts** from the Spring and Spring Boot ecosystem along the way.

---

## The Contact Us Page — What Are We Building?

### 🧠 What is it?

Every professional website has a way for users to reach out — whether they're facing a technical issue, have a question, or want to report a problem. That's exactly what the **Contact Us** page provides in our Job Portal UI application.

If you scroll to the footer of the homepage, you'll find a **"Contact Us"** link. When a user clicks on it, they're taken to a form where they can submit their concerns.

### 📝 What does the form look like?

The Contact Us form collects the following information:

| Field | Description |
|-------|-------------|
| **Name** | The user's full name |
| **Email** | The user's email address |
| **User Type** | Job Seeker, Employer, or Other |
| **Subject** | Dropdown with options like Technical Issue, Account Problem, Employer Onboarding, Job Posting Issue, Application Question, Feature Request, General Inquiry, Other |
| **Message** | A text area for the user to describe their issue in detail |

When the user clicks **"Send Message"**, the UI application invokes our backend REST API. The backend then **validates** the data and **saves** it into the database.

> 💡 The UI also supports **dark mode** — a nice touch for users who prefer it!

---

## Running the UI Application

### ⚙️ How to start it

The UI code is located under the **section5** folder. To get it running:

1. Make sure **Node.js** is installed
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the application

The UI will be available at **http://localhost:5173**.

> ⚠️ **Important:** If your Spring Boot backend isn't running, the homepage will show zero companies. Don't worry — once you start the backend, the company data will appear again.

---

## The Procedure for Building a New REST API

Whenever we need to build a new REST API that establishes communication between the UI and the backend, we follow a standard procedure. Let's quickly revise the steps:

### Step 1: Define the Controller Class

Create a controller class on the backend. Inside it, define REST API-related Java methods annotated with `@PostMapping`, `@GetMapping`, etc., along with the API path.

### Step 2: Build the Service Layer

Create the service interface and its implementation class to hold the business logic.

### Step 3: Build the Repository / Data Layer

This involves:
- Creating **entity classes** (representing database tables)
- Creating **repository interfaces** (for database operations)
- Making sure the required **database tables** exist

At the end of the day, whatever data the UI sends to our backend needs to be **saved into database tables**, and whatever data the REST API needs to return must be **read from database tables**.

---

## Two Approaches to Building the Data Layer

Here's where things get interesting. There are **two approaches** to setting up the repository/data layer:

### Approach 1: Table First (Traditional)

This is what we've done so far:

1. **Create the database table** first (using SQL scripts)
2. Then create the **entity class** to map to that table
3. Then create the **repository interface**

Think of it as: *"Build the house, then draw the blueprint."*

### Approach 2: Entity First (Reverse Approach)

This is the new approach we're about to explore:

1. **Create the entity class** first (in Java)
2. Let the **Spring Boot framework** create the corresponding database table automatically

Think of it as: *"Draw the blueprint, and the house builds itself."*

> 💡 **Pro Tip:** Both approaches are perfectly valid. The traditional approach gives you full control over the database schema. The reverse approach is faster for development and prototyping. In enterprise environments, the traditional approach is more common because database changes go through a formal approval process.

---

## What's Coming Next

Since we're already familiar with the first approach (table-first), in the upcoming lectures we'll explore the second approach — **creating entity classes first** and letting Hibernate/Spring Boot auto-generate the database tables.

This is powered by a property called `spring.jpa.hibernate.ddl-auto`, which we'll dive deep into in the next lecture.

---

## ✅ Key Takeaways

- The **Contact Us** page allows users to report issues or ask questions through a structured form
- Building a new REST API follows a standard pattern: **Controller → Service → Repository/Data Layer**
- There are **two approaches** to setting up the data layer:
  - **Table First** — create the database table, then the entity class
  - **Entity First** — create the entity class, then let the framework create the table
- The UI application runs on port **5173** and communicates with the Spring Boot backend via REST APIs
- Every REST API ultimately reads from or writes to **database tables**

## ⚠️ Common Mistakes

- Forgetting to start the **Docker Desktop** before running the Spring Boot application (the database container won't start)
- Not running `npm install` before `npm run dev` — the UI won't start without dependencies
- Confusing the two data layer approaches — remember, both are valid but suited for different scenarios

## 💡 Pro Tips

- In real enterprise applications, a **DBA team** manages the database schema — developers don't directly create or modify tables
- The "Entity First" approach is great for **prototyping**, **demos**, and **unit testing**, but the "Table First" approach is preferred for **production**
- Always think about the full flow: **UI → Controller → Service → Repository → Database**
