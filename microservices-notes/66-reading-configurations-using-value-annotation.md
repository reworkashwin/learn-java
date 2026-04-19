# Reading Configurations Using @Value Annotation

## Introduction

In any real-world microservice, you'll eventually need to read configuration values — things like build versions, feature flags, or external URLs — from your properties files. Spring Boot gives you several ways to do this. In this section, we start with the simplest approach: the `@Value` annotation.

This is the first of three approaches for reading configuration in Spring Boot. It's simple, direct, and perfect when you only have one or two properties to read. But as we'll see, it falls apart quickly when things scale up.

---

## Setting Up Configuration Properties

### Where Do Properties Live?

Spring Boot lets you define custom properties in your `application.yml` (or `application.properties`) file. These are key-value pairs your Java code can read at runtime.

For example, let's define a simple property:

```yaml
build:
  version: "1.0"
```

In YAML, `build.version` becomes a hierarchical structure — `build` is the parent, `version` is the child. The value `"1.0"` is what we want to read in code.

Why would you want this? Imagine your client applications need to know which version of your microservice is currently deployed. Instead of hardcoding this in Java, you externalize it to a config file — making it easy to change without touching code.

---

## Using the @Value Annotation

### 🧠 What Is @Value?

The `@Value` annotation is Spring's way of injecting a single property value from your configuration file directly into a Java field. You annotate a field, tell Spring which property key to look for, and Spring fills in the value at startup.

### ⚙️ How It Works

Here's the pattern inside a controller class:

```java
@Value("${build.version}")
private String buildVersion;
```

Let's break this down:
- `@Value` tells Spring: "Inject a property value here"
- `"${build.version}"` uses Spring Expression Language (SpEL) — the `${}` syntax tells Spring to look up the key `build.version` from the loaded properties
- At application startup, Spring resolves `build.version` → `"1.0"` and assigns it to `buildVersion`

### 🧪 Building a REST API to Expose It

Once you have the value injected, you can expose it through a simple GET endpoint:

```java
@GetMapping("/build-info")
public ResponseEntity<String> getBuildInfo() {
    return ResponseEntity.status(HttpStatus.OK).body(buildVersion);
}
```

When a client calls `GET /api/build-info`, they get back `1.0` — the value from your YAML file.

---

## A Gotcha with Constructor Injection and Lombok

### ⚠️ Common Mistake: @AllArgsConstructor with @Value Fields

If you're using Lombok's `@AllArgsConstructor` on your controller, you'll run into trouble. Here's why:

Lombok generates a constructor that accepts **all** fields — including the `buildVersion` string. Spring then tries to find a bean of type `String` to inject through the constructor, and fails:

```
AccountsController is missing a bean of type String
```

### How to Fix It

Remove `@AllArgsConstructor` and create a manual constructor that only injects the actual Spring-managed beans:

```java
private final IAccountsService accountsService;

@Value("${build.version}")
private String buildVersion;

public AccountsController(IAccountsService accountsService) {
    this.accountsService = accountsService;
}
```

This way, `accountsService` gets injected via constructor (the recommended approach for required dependencies), while `buildVersion` gets injected separately via `@Value`.

💡 **Pro Tip:** When using constructor injection, mark your dependency fields as `final`. This makes them immutable after construction and signals to other developers that these are required collaborators.

---

## Limitations of @Value

So `@Value` works — but should you use it everywhere? Definitely not.

Think about it:
- What if your microservice has **100 different properties**? Are you going to create 100 separate fields with 100 `@Value` annotations?
- Every field requires you to **hardcode the property key** as a string — `"${build.version}"`. Typo in the key? Silent null at runtime.
- If the same properties are needed in multiple classes, you're duplicating `@Value` annotations everywhere.

This approach is like writing post-it notes for your config — fine for one or two reminders, but chaos when you have a wall full of them.

---

## ✅ Key Takeaways

- `@Value("${property.key}")` injects a single property value from `application.yml` into a Java field
- It uses Spring Expression Language syntax: `${...}`
- Watch out for conflicts with `@AllArgsConstructor` — prefer manual constructors when mixing `@Value` fields with bean dependencies
- Mark injected beans as `final` for safety; `@Value` fields should **not** be `final` (Spring needs to set them after construction)
- This approach is only practical for **1-2 properties** — it doesn't scale

⚠️ **When NOT to use @Value:** When you have many properties sharing a common prefix, or when the same config is needed across multiple classes. There are better approaches for that — coming next.
