# Does It Work? Testing the Contact API with Postman & UI

## Introduction

We've built the entire Contact Us REST API — controller, service, repository, entity, and DTO. But how do we know it actually works? In this lecture, we put our API to the test using **Postman** first, then through the **UI application** itself. Along the way, we'll encounter a bug, debug it, and fix it — because that's how real development works!

---

## Testing with Postman

### Setting Up the Request

In the Postman collection (shared with you), look for the **"Contacts"** folder. Inside, you'll find a request called **"Send Contact Message"**.

The request configuration:

| Setting | Value |
|---------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:8080/contacts` |
| **Accept Header** | Version `1.0` (best practice, even though `1.0` is the default) |
| **Body Type** | Raw → JSON |

The JSON body:

```json
{
    "name": "John Doe",
    "email": "john@gmail.com",
    "userType": "Job Seeker",
    "subject": "Technical Issue",
    "message": "Unable to upload my resume on the website"
}
```

> ⚠️ **Important:** The field names in the JSON **must exactly match** the field names in your `ContactRequestDto` class. If they don't match, Spring won't be able to map the data.

---

## The Bug — 404 Not Found!

### 🧪 What happened?

We clicked **Send** and got a **404 Not Found** response. But wait — 404 means the resource wasn't found, not that there was a data error. Let's check the backend console.

### 🔍 Diagnosing the Issue

The backend console revealed the real error:

> Column `status` — null value not allowed for a NOT NULL column

The `status` column in our `contacts` table has a **NOT NULL** constraint, but we weren't setting any value for it before saving!

### ❓ But didn't we use `@ColumnDefault("'NEW'")`?

Yes, we did. But here's the key insight:

**`@ColumnDefault` only affects the database schema definition** — it adds a `DEFAULT 'NEW'` clause to the column when Hibernate creates the table. It does **NOT** automatically set the value at the Java/JPA level when inserting a record.

If you check the database table definition, you'll see the `status` column has `DEFAULT 'NEW'` — but JPA is sending `NULL` explicitly, which overrides the database default.

> 🧠 **Think of it this way:** `@ColumnDefault` tells the database, "If nothing is provided, use this value." But JPA is explicitly providing `NULL`, so the database doesn't fall back to the default.

---

## The Fix

Go to `ContactServiceImpl` and add one line in the `transformToEntity()` method:

```java
private Contact transformToEntity(ContactRequestDto dto) {
    Contact contact = new Contact();
    BeanUtils.copyProperties(dto, contact);
    contact.setCreatedAt(Instant.now());
    contact.setCreatedBy("system");
    contact.setStatus("NEW");  // ✅ Fix: explicitly set the status
    return contact;
}
```

Rebuild and restart the application.

---

## A Note on Error Responses

You might have noticed that even when our backend had an error, we got **404 Not Found** instead of something more meaningful like **500 Internal Server Error** with error details.

This isn't ideal. In a proper application, we should return:
- The actual error code (e.g., 500)
- A meaningful error message
- Structured error details

We'll implement **proper exception handling** in the coming sections. For now, just be aware that the 404 is misleading.

---

## Successful Test with Postman

After the fix, clicking **Send** in Postman returns:

```
Status: 201 Created
Body: "Request processed successfully"
```

### Verifying in the Database

Check the `contacts` table (using IntelliJ Premium or **Sqlectron** for the free version):

```sql
SELECT * FROM contacts;
```

You'll see a new row with all the data we sent from Postman — name, email, user type, subject, message, status as "NEW", and the `createdAt` timestamp.

---

## Testing from the UI Application

### Starting the UI

Make sure your UI is running:

```bash
npm run dev
```

The UI starts at **http://localhost:5173**.

### Filling Out the Contact Form

1. Navigate to the homepage
2. Scroll to the footer and click **"Contact Us"**
3. Fill in the form:
   - **Name:** Will Smith
   - **Email:** will@gmail.com
   - **User Type:** Job Seeker
   - **Subject:** Technical Issue
   - **Message:** Not able to create an account on your website

> ⚠️ The UI has **client-side validations** — if you try to submit blank fields for name, email, or message, you'll see validation error messages. We'll explore server-side validations in future sections.

4. Click **"Send Message"**

### 🧪 Result

The UI displays a success confirmation: **"Message sent successfully!"**

Checking the database again:

```sql
SELECT * FROM contacts;
```

A second row appears with the data submitted from the UI — Will Smith, the subject, and the message. Everything works end to end!

---

## Section Recap

In this section, we accomplished a lot:

| What We Built | Details |
|---------------|---------|
| **New REST API** | POST endpoint for the Contact Us page |
| **Full stack flow** | UI → Controller → Service → Repository → Database |
| **JPA Buddy** | Used it to generate entity classes, repositories, and DTOs |
| **`spring.jpa.hibernate.ddl-auto`** | Learned all 8 values and when to use each one |
| **Bug fix** | Discovered `@ColumnDefault` vs explicit Java-level value setting |

---

## ✅ Key Takeaways

- Always **test your REST APIs with Postman** before integrating with the UI — it's faster to debug
- `@ColumnDefault` sets the default at the **database schema level**, not at the JPA/Java level — you still need to set values explicitly in your code
- JSON field names in the request body must **exactly match** the DTO field names
- Return **201 Created** for successful POST operations that create new records
- The UI has **client-side validations** — but server-side validations are equally important (coming in future sections)

## ⚠️ Common Mistakes

- Relying on `@ColumnDefault` to automatically populate field values during INSERT — it only affects the table definition
- Not restarting the Spring Boot application after making code changes
- Sending JSON with field names that don't match the DTO — the data silently won't bind
- Getting a **404** and assuming the endpoint doesn't exist — it could be a backend error with poor error handling

## 💡 Pro Tips

- Use **Sqlectron** (free) or IntelliJ's database viewer (Premium) to verify data after API calls
- Always check the **backend console** when you get unexpected responses — the real error is usually there
- Validate your data at **both layers** — client-side (UI) for user experience, server-side (backend) for security and data integrity
- Implement proper **exception handling** early in your project — generic 404s for all errors make debugging a nightmare
