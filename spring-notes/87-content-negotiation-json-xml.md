# Content Negotiation — JSON, XML, and Format Control

## Introduction

Our REST API returns JSON by default. But JSON isn't the only data format out there — what if a client specifically wants **XML**? And what if you, as the server developer, want to **restrict** which formats your API supports?

This is called **content negotiation** — the process where the client and server agree on the data format. Let's see how it works.

---

## Concept 1: Who Converts Java Objects to JSON?

### 🧠 The hidden hero — Jackson

When you return a `List<JobPost>` from your controller, it magically shows up as JSON in Postman. But it's not magic — someone is doing the conversion.

That someone is **Jackson** — a serialization library that Spring Boot includes by default. If you expand your external libraries (in IntelliJ or your IDE), you'll find Jackson in there.

Jackson's job:
- **Serialization**: Java object → JSON (when sending responses)
- **Deserialization**: JSON → Java object (when receiving `@RequestBody`)

### 💡 Insight

Jackson isn't the only serialization library out there (Gson is another popular one), but Spring Boot uses Jackson by default. You never had to configure it — it just works out of the box for JSON.

---

## Concept 2: Requesting XML — And Why It Fails

### 🧠 How does a client request a specific format?

In Postman, go to the **Headers** tab and add:

```
Key:   Accept
Value: application/xml
```

The `Accept` header tells the server: "I want the response in XML format."

### 🧪 What happens?

Send the request and... **406 Not Acceptable**.

Why? Because the Jackson library that comes with Spring Boot **only supports JSON**. It doesn't know how to convert Java objects to XML. There's no XML converter available, so the server says: "I can't give you what you asked for."

---

## Concept 3: Adding XML Support

### ⚙️ The fix — Jackson XML library

To enable XML support, add the **Jackson Data Format XML** dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.15.3</version>
</dependency>
```

**Important:** Use the same version as your existing Jackson Core library. Check your external libraries to find the version your project already uses.

After adding the dependency, reload Maven and restart the application.

### 🧪 Testing

Go back to Postman with the `Accept: application/xml` header and click Send:

```xml
<List>
    <item>
        <postId>1</postId>
        <postProfile>Java Developer</postProfile>
        <postDesc>Build backend services</postDesc>
        <reqExperience>3</reqExperience>
        <postTechStack>
            <postTechStack>Java</postTechStack>
            <postTechStack>Spring Boot</postTechStack>
        </postTechStack>
    </item>
    ...
</List>
```

The same data, now in XML format. The Jackson XML library handles the conversion automatically — you didn't change any controller code.

### 💡 Insight

This is the power of content negotiation. Your controller method stays exactly the same — it still returns `List<JobPost>`. The format conversion happens in the serialization layer based on what the client requests in the `Accept` header.

---

## Concept 4: Restricting What Your API Produces

### 🧠 Why restrict?

Maybe you only want your API to return JSON — no XML. Perhaps your team has standardized on JSON, or you don't want to support the complexity of multiple formats.

### ⚙️ Using the `produces` attribute

In your mapping annotation, specify what formats the method can produce:

```java
@GetMapping(path = "jobPosts", produces = {"application/json"})
public List<JobPost> getAllJobs() {
    return service.getAllJobs();
}
```

Now this method will **only** return JSON, regardless of the XML library being present.

### 🧪 What happens with XML requests?

If a client sends `Accept: application/xml` → **406 Not Acceptable**

If a client sends `Accept: application/json` (or no Accept header) → Works fine, returns JSON.

The server is explicitly saying: "I can produce JSON and nothing else."

---

## Concept 5: Restricting What Your API Consumes

### 🧠 Controlling incoming formats

Just as you can control what your API **produces** (sends), you can also control what it **consumes** (accepts).

### ⚙️ Using the `consumes` attribute

```java
@PostMapping(path = "jobPosts", consumes = {"application/json"})
public JobPost addJob(@RequestBody JobPost jobPost) {
    service.addJob(jobPost);
    return service.getJob(jobPost.getPostId());
}
```

This means the POST endpoint only accepts JSON data. If someone tries to send XML:

In Postman, set the header:
```
Key:   Content-Type
Value: application/xml
```

**Result: 415 Unsupported Media Type** — the server refuses to accept XML input.

### ❓ What's the difference between Accept and Content-Type headers?

| Header         | Who uses it | Purpose                                      |
|----------------|-------------|----------------------------------------------|
| `Accept`       | Client      | "I want the **response** in this format"     |
| `Content-Type` | Client      | "I'm **sending** data in this format"        |

And on the server side:

| Attribute    | Controls                                          |
|--------------|---------------------------------------------------|
| `produces`   | What format the response will be in               |
| `consumes`   | What format the server accepts for incoming data   |

---

## Concept 6: The Full Picture — Content Negotiation Summary

### 🧠 How it all fits together

```
Client                                    Server
  │                                         │
  │  Accept: application/json  ────────►  produces = {"application/json"}
  │  (I want JSON back)                    (I can give you JSON)
  │                                         │
  │  Content-Type: application/json ────► consumes = {"application/json"}
  │  (I'm sending JSON)                    (I accept JSON)
  │                                         │
```

If the client's request matches what the server supports → success.
If there's a mismatch → error (406 or 415).

### 💡 Insight

Most of the time, you **don't** need to explicitly set `produces` and `consumes`. JSON is the default, and most REST APIs just work with JSON. But it's good to know these exist for cases where you need strict format control or when you're working with legacy systems that require XML.

---

## ✅ Key Takeaways

- **Jackson** is the library that converts Java objects to JSON (and back) — it comes with Spring Boot by default
- For XML support, manually add the **jackson-dataformat-xml** dependency
- The client uses the `Accept` header to request a specific response format
- The client uses the `Content-Type` header to declare the format of data it's sending
- Server-side: `produces` controls output format, `consumes` controls accepted input format
- Default behavior without any configuration: JSON in, JSON out

## ⚠️ Common Mistakes

- Adding the XML library but using a different version than your existing Jackson — always match versions to avoid compatibility issues
- Confusing `Accept` (what you want back) with `Content-Type` (what you're sending) — they serve different purposes
- Over-restricting with `produces`/`consumes` when there's no real need — keep it simple unless you have specific requirements

## 💡 Pro Tips

- You almost never need to configure `produces` and `consumes` in typical REST APIs — JSON is the universal default
- If you find yourself needing XML support, question whether it's truly necessary — JSON covers 99% of modern use cases
- The version of `jackson-dataformat-xml` should exactly match the Jackson Core version in your project to avoid runtime errors
