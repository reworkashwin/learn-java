# Exposing Application Metadata — The Info Endpoint

## Introduction

In a large enterprise, multiple teams interact with your application — QA wants to know which version is deployed, operations wants a contact email, and third-party teams want to know the app description. Instead of answering these questions manually over and over, you can **expose this metadata programmatically** through the Actuator **info** endpoint.

By default, `/actuator/info` returns an **empty response**. But with a few properties, it becomes a self-service metadata API that anyone can query.

---

## Why the Info Endpoint Matters

### ❓ Questions You Keep Getting

- "Which version is deployed in QA right now?"
- "Who do I contact if there's an issue?"
- "What does this application do?"

Instead of Slack messages, emails, or wiki pages that go stale — expose it **as a live API** that always reflects the current state.

---

## Setting Up the Info Endpoint

### Step 1: Enable Info Exposure

```properties
management.info.env.enabled=true
```

This tells Actuator to read `info.*` properties and expose them.

### Step 2: Define Your Application Metadata

```properties
info.app.name=${spring.application.name}
info.app.description=A job portal backend application built with Spring Boot
info.app.version=1.0.0
info.app.contact=support@eazybytes.com
```

Notice how `info.app.name` references `${spring.application.name}` — you can reuse existing properties.

### Step 3: Access the Info Endpoint

```
GET /actuator/info
```

**Response:**
```json
{
  "app": {
    "name": "job-portal",
    "description": "A job portal backend application built with Spring Boot",
    "version": "1.0.0",
    "contact": "support@eazybytes.com"
  }
}
```

---

## How Properties Map to JSON

The property naming convention directly maps to the JSON structure:

| Property | JSON Path |
|----------|-----------|
| `info.app.name` | `{ "app": { "name": "..." } }` |
| `info.app.version` | `{ "app": { "version": "..." } }` |
| `info.developer.name` | `{ "developer": { "name": "..." } }` |

Everything after `info.` becomes nested JSON. The second segment (e.g., `app`, `developer`) becomes a JSON object, and the third segment becomes the key within that object.

### Adding More Sections

```properties
info.developer.name=EazyBytes
```

Result:
```json
{
  "app": { ... },
  "developer": {
    "name": "EazyBytes"
  }
}
```

You can define as many sections and properties as you want — just keep `info.` as the prefix.

---

## Environment-Specific Info

The info properties in `application.properties` apply to all profiles. For environment-specific values, define them in the corresponding profile file:

- `application-qa.properties` → QA-specific version, contact, etc.
- `application-prod.properties` → production-specific details

This way, the `/actuator/info` response reflects the **correct environment**.

---

## IntelliJ Ultimate — Actuator Integration

If you're using **IntelliJ Ultimate**, the IDE integrates with Actuator endpoints directly in the debug window:

| Tab | What It Shows |
|-----|---------------|
| **Beans** | All beans with their dependency graphs |
| **Health** | Health details from `/actuator/health` |
| **API** | All mappings (REST API endpoints) |
| **Environment** | All environment properties |

You can even view a **beans dependency diagram** — a visual representation of how beans are connected. This is incredibly useful for understanding complex dependency chains.

💡 **Pro Tip:** If IntelliJ shows these options, use them! They're faster than switching to a browser. For endpoints not available in IntelliJ, fall back to the browser or Postman.

---

## ✅ Key Takeaways

- The `/actuator/info` endpoint is empty by default — you must define `info.*` properties
- Enable it with `management.info.env.enabled=true`
- Any property prefixed with `info.` is automatically exposed
- Use `${property.name}` syntax to reference existing properties
- Define environment-specific info in profile property files
- IntelliJ Ultimate offers built-in Actuator integration for beans, health, APIs, and environment
- Share the info endpoint URL with QA, ops, and other teams instead of answering repeated questions

---

## ⚠️ Common Mistakes

- Forgetting `management.info.env.enabled=true` — without it, info properties won't be exposed
- Putting sensitive data under `info.*` — remember, this endpoint may be publicly accessible
- Not updating version numbers in profile-specific property files after deployments

---

## 💡 Pro Tips

- Automate the `info.app.version` value by pulling it from your Maven `pom.xml` using `@project.version@`
- Add build timestamp, Git commit hash, or branch name to make deployments traceable
- This endpoint is a lightweight alternative to a dedicated "version API" that many teams build manually
