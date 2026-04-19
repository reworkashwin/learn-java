# Demo: Implementing Spring Boot Profiles in Accounts Microservice

## Introduction

Now that we understand what profiles are conceptually, let's get our hands dirty. In this section, we implement multiple profiles — default, QA, and production — inside the accounts microservice. You'll see exactly how to structure the files, what values go where, and how Spring Boot decides which properties to use.

---

## Step 1: Identify Which Properties Change

Not everything needs to be in a profile. Look at your `application.yml` and ask: **"Which values differ between environments?"**

| Property | Changes? | Reason |
|----------|----------|--------|
| `server.port` | ❌ No | Same port everywhere |
| H2 database config | ❌ No | Same for all environments (in this demo) |
| `build.version` | ✅ Yes | Different version deployed per environment |
| `accounts.message` | ✅ Yes | Different messages per environment |
| `accounts.contactDetails` | ✅ Yes | Different contacts per environment |
| `accounts.onCallSupport` | ✅ Yes | Different phone numbers per environment |

Only the properties that **change** need to go into profile-specific files. Everything else stays in the default `application.yml`.

---

## Step 2: Create Profile Files

Create two new files under `src/main/resources`:

**`application-qa.yml`** — properties for the QA/testing environment:

```yaml
spring:
  config:
    activate:
      on-profile: qa

build:
  version: "2.0"

accounts:
  message: "Welcome to EazyBank accounts related QA APIs"
  contactDetails:
    name: "QA Lead - Jane Smith"
    email: "jane.qa@eazybank.com"
  onCallSupport:
    - "(555) 222-3333"
    - "(555) 444-5555"
```

**`application-prod.yml`** — properties for production:

```yaml
spring:
  config:
    activate:
      on-profile: prod

build:
  version: "1.0"

accounts:
  message: "Welcome to EazyBank accounts related prod APIs"
  contactDetails:
    name: "Product Owner - Mike Johnson"
    email: "mike.prod@eazybank.com"
  onCallSupport:
    - "(555) 666-7777"
    - "(555) 888-9999"
```

### The Critical Configuration: `on-profile`

Each profile file must declare **when** it should be activated:

```yaml
spring:
  config:
    activate:
      on-profile: qa   # This file loads only when "qa" profile is active
```

Without this, Spring Boot won't know which file maps to which profile.

---

## Step 3: Import Profile Files

In your main `application.yml`, tell Spring Boot about the extra profile files:

```yaml
spring:
  config:
    import:
      - application-qa.yml
      - application-prod.yml
```

This registers the files. Spring decides which one to **activate** based on the `spring.profiles.active` property.

---

## Step 4: Activate a Profile

Add the activation property to `application.yml`:

```yaml
spring:
  profiles:
    active: qa
```

### What Happens at Startup?

1. Spring loads `application.yml` — this gives the default values (build version `3.0`, developer contact details)
2. Spring sees `active: qa` and loads `application-qa.yml`
3. Any overlapping properties from `application-qa.yml` **override** the defaults
4. Result: build version is now `2.0`, contact is the QA lead

---

## Step 5: Test and Validate

With the QA profile active, hitting the APIs confirms:

- **`GET /api/build-info`** → Returns `2.0` (QA profile value, overriding default `3.0`)
- **`GET /api/contact-info`** → Returns QA lead details, QA phone numbers
- **`GET /api/java-version`** → Same as always (environment variable, unaffected by profiles)

Switch to `active: prod` in `application.yml`, restart, and:

- **`GET /api/build-info`** → Returns `1.0`
- **`GET /api/contact-info`** → Returns product owner details

---

## The Override Mechanism

This is worth understanding clearly. Profile properties don't **replace** the default file — they **overlay** on top of it:

```
Default (always loaded):     build.version = 3.0
QA profile (when activated): build.version = 2.0  ← This wins

Default:                     server.port = 8080
QA profile:                  (not defined)         ← Default stays
```

Properties not defined in the profile file keep their default values. Only the ones explicitly set in the profile file get overridden.

---

## The Remaining Problem

Right now, activating a profile requires changing `spring.profiles.active` in `application.yml` and **restarting** (or rebuilding). That defeats the immutability principle:

> If you change `active: qa` to `active: prod` in your YAML, you've modified your source code.

The solution? Pass the profile from **outside** the application — via command-line arguments, JVM properties, or environment variables. That's the next step.

---

## ✅ Key Takeaways

- Only externalize properties that **actually differ** between environments
- Use `spring.config.activate.on-profile` in each profile file to declare its identity
- Import profile files in `application.yml` using `spring.config.import`
- Profile properties **override** default values — they don't replace the entire config
- Be extremely careful with YAML indentation — a single misplaced space can silently break profile activation

⚠️ **Common Mistake:** Using underscores (`application_qa.yml`) instead of hyphens (`application-qa.yml`). The naming convention uses hyphens — getting this wrong means your profile silently won't load.
