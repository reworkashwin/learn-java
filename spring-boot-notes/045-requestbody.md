# Reading Payloads with @RequestBody

## Introduction

So far, we've focused on **GET** REST APIs — read-only operations where clients tell the server *what data they want* using path variables and query parameters. But what about creating, updating, or modifying data? When a client wants to **create a new user**, it needs to send an entire package of information — name, email, gender, address, and more. That's way too much data to stuff into a URL.

This is where the **request body** comes in. And to read it in Spring Boot, we use the **`@RequestBody`** annotation. Let's dive in.

---

## Concept 1: Why Do We Need a Request Body?

### ❓ Can't We Just Use Path Variables and Query Params?

For a GET request like "fetch user #42", sure — `/users/42` is perfectly fine. But imagine creating a new user. Would you do this?

```
POST /users?name=John&email=john@example.com&gender=male&phone=1234567890&city=NYC&...
```

That's ugly, impractical, and has serious problems:
- **URL length limits** — URLs have size restrictions
- **Security** — all that data is visible in the URL, browser history, and server logs
- **Complexity** — what if you need to send nested objects like an address with street, city, and zip code?

### 🧠 The Solution: Request Body

The **request body** is a dedicated section of the HTTP request where clients can send structured data (usually JSON). It's:
- **Not visible** in the URL or address bar
- **Not limited** in size (practically speaking)
- **Structured** — supports nested objects, arrays, and complex data

### 💡 Which HTTP Methods Use Request Body?

| Method | Uses Body? | Purpose |
|--------|-----------|---------|
| GET | ❌ No | Read data |
| POST | ✅ Yes | Create data |
| PUT | ✅ Yes | Replace data |
| PATCH | ✅ Yes | Update partial data |
| DELETE | ❌ Usually no | Delete data |

---

## Concept 2: Sending JSON in the Request Body

### 🧪 What Does It Look Like in Postman?

1. Create a new request → Select **POST** method
2. Enter the path: `/api/dummy/users`
3. Go to the **Body** tab
4. Select **raw** and choose **JSON** from the dropdown
5. Write the JSON:

```json
{
    "name": "Madan Reddy",
    "email": "tutor@ezbytes.com",
    "gender": "male"
}
```

### 🧠 Why JSON?

JSON (JavaScript Object Notation) is the **universal format** for data communication between clients and servers. It's:
- Human-readable
- Lightweight
- Supported by virtually every programming language and framework

---

## Concept 3: Creating a DTO (Data Transfer Object)

### ❓ The Problem: Java Doesn't Understand JSON

When the client sends this JSON:
```json
{ "name": "Madan Reddy", "email": "tutor@ezbytes.com", "gender": "male" }
```

Java doesn't know what to do with it. Java works with **objects**, not JSON strings. So we need a Java class that mirrors the structure of the JSON.

### ⚙️ Creating a DTO Class Using Java Records

```java
package com.example.dto;

public record UserDto(String name, String email, String gender) {
}
```

### 🧠 What is a Record?

A **record** (introduced in Java 16) is a concise way to create a data-carrying class. Behind the scenes, Java automatically generates:
- A **constructor** with all fields
- **Getter methods** for each field
- `equals()`, `hashCode()`, and `toString()` methods
- All fields are marked **final** — the object is **immutable**

> Think of a record as a "read-only data container" — once created, its values can't be changed.

### 💡 What is a DTO?

**DTO** stands for **Data Transfer Object**. It's a class whose sole purpose is to carry data between layers — from client to server and back. We put DTOs in a separate `dto` package to keep things organized.

---

## Concept 4: Reading the Body with @RequestBody

### ⚙️ The Controller Method

```java
@PostMapping
public String createUser(@RequestBody UserDto userDto) {
    return "Created user with data: " + userDto;
}
```

### 🧠 How Does the Magic Work?

Here's the flow:

1. Client sends a **POST** request with JSON in the body
2. Spring Boot receives the request
3. Spring Boot uses the **Jackson** library to convert JSON → Java object
4. It matches JSON field names to the record's field names:
   - `"name"` → `UserDto.name`
   - `"email"` → `UserDto.email`
   - `"gender"` → `UserDto.gender`
5. The populated `UserDto` object is injected into your method parameter
6. You use the object in your business logic

### 🧪 Testing in Postman

Send the POST request with the JSON body. Response:
```
Created user with data: UserDto[name=Madan Reddy, email=tutor@ezbytes.com, gender=male]
```

The JSON was automatically converted to a Java object!

---

## Concept 5: Field Name Matching Is Critical

### ⚠️ The Golden Rule

The JSON field names must **exactly match** the Java class field names. If they don't, the value will be `null`.

### 🧪 Example

JSON sent by client:
```json
{
    "firstName": "Madan Reddy",
    "email": "tutor@ezbytes.com",
    "gender": "male"
}
```

Java record:
```java
public record UserDto(String name, String email, String gender) {}
```

Result: `name` will be **null** because `"firstName"` ≠ `"name"`. Spring Boot can't guess that `firstName` means `name`.

### 💡 Real-World Practice

In enterprise projects, backend developers and frontend developers **agree on field names beforehand**. They document the expected request payload format so both sides use matching names. This contract is typically captured in API documentation (like Swagger/OpenAPI).

---

## Concept 6: The Jackson Library — The Hero Behind the Scenes

### 🧠 What is Jackson?

**Jackson** is a powerful JSON processing library that Spring Boot uses internally for:
- **Deserialization** — Converting JSON → Java objects (reading request body)
- **Serialization** — Converting Java objects → JSON (sending response body)

### ⚙️ It Works Both Ways

**Request (JSON → Java):**
```
Client sends JSON → Jackson converts → Java object → your method
```

**Response (Java → JSON):**
```
Your method returns Java object → Jackson converts → JSON → sent to client
```

So even when your method returns a Java object, the client receives a JSON response. You don't have to do any manual conversion.

### 💡 Insight

Spring Boot includes Jackson **automatically** — you don't need to add any dependencies. It's part of the `spring-boot-starter-web` starter. This is one of those things Spring Boot handles for you so you can focus on business logic.

---

## Concept 7: What About Input Validation?

### ❓ A Natural Question

What if the client sends invalid data?
```json
{
    "name": "",
    "email": "not-an-email",
    "gender": "12345"
}
```

Shouldn't the server reject this?

### 🧠 The Answer

**Yes, absolutely!** Backend developers are responsible for validating all incoming data. Spring Boot provides powerful validation annotations (like `@NotBlank`, `@Email`, `@Pattern`) that we'll cover in a dedicated section later in the course.

For now, just know that validation is an essential part of building REST APIs — and Spring Boot makes it straightforward.

---

## ✅ Key Takeaways

1. **Request body** is used with POST, PUT, and PATCH — for sending structured data that's too complex for URL parameters
2. **`@RequestBody`** tells Spring Boot to read the request body and convert it into a Java object
3. Create a **DTO class** (or record) that mirrors the JSON structure being sent by the client
4. **Field names must match exactly** between JSON and Java — mismatches result in `null` values
5. **Jackson** library handles JSON ↔ Java conversion automatically (included in Spring Boot)
6. **Records** are a great choice for DTOs — they're immutable, concise, and reduce boilerplate
7. Data from the body is **not visible in the URL** — more secure than query params for sensitive data

## ⚠️ Common Mistakes

- JSON field names not matching Java field names — Spring Boot won't guess, and the value will silently become `null`
- Using primitive types (`String`, `Long`) for the `@RequestBody` parameter — use a proper DTO class for structured data
- Forgetting to select **POST** method in Postman and wondering why the body isn't being read
- Not selecting **raw** + **JSON** in Postman's Body tab — the body won't be sent as JSON otherwise
- Importing the wrong package for DTO classes

## 💡 Pro Tips

- Use **Java records** for DTOs — they're perfect for immutable data transfer and eliminate boilerplate (no need to write getters, constructors, or toString)
- Put all DTOs in a dedicated `dto` package to keep your project organized
- Always check Postman's response carefully when testing — `null` values in the response usually mean a field name mismatch
- Remember: request body data is invisible in the browser address bar — this is by design and a security advantage over query parameters
- Validation is coming in future sections — for now, focus on understanding how the data flows from JSON to Java and back
