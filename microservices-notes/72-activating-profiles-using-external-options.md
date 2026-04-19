# Demo: Activating Profiles Using External Options

## Introduction

Theory is great, but let's see it work. In this section, we walk through activating Spring Boot profiles and overriding properties using all three externalized configuration approaches — command-line arguments, JVM system properties, and environment variables — right from the IDE.

The goal: prove that the **same code** can behave differently based on how you start it, without touching a single line of source code.

---

## Approach 1: Command-Line Arguments

### Setting It Up

In IntelliJ IDEA:
1. Right-click on your main class → **Modify Run Configuration**
2. In the **Program Arguments** field, enter:

```
--spring.profiles.active=prod --build.version=1.1
```

This passes two command-line arguments:
- Activate the `prod` profile
- Override `build.version` to `1.1` (even though `application-prod.yml` says `1.0`)

### What Happens

Start the application. Test the APIs:

- **`GET /api/contact-info`** → Returns production contact details ✅
- **`GET /api/build-info`** → Returns `1.1` (not `1.0`!) ✅

Why `1.1` instead of `1.0`? Because command-line arguments have **higher precedence** than profile YAML values. The prod profile set it to `1.0`, but the CLI override bumps it to `1.1`.

---

## Approach 2: JVM System Properties

### Setting It Up

1. Right-click → **Modify Run Configuration**
2. Remove the program arguments
3. Click **Modify Options** → **Add VM Options**
4. In the VM Options field, enter:

```
-Dspring.profiles.active=prod -Dbuild.version=1.1
```

Note the syntax difference: `-D` prefix instead of `--`.

### What Happens

Restart and test:

- **`GET /api/contact-info`** → Production profile ✅
- **`GET /api/build-info`** → Returns `1.1` ✅

Same result, different mechanism. JVM properties also override profile YAML values.

---

## Approach 3: Environment Variables

### Setting It Up

1. Right-click → **Modify Run Configuration**
2. Remove VM options
3. In the **Environment Variables** field, enter:

```
SPRING_PROFILES_ACTIVE=prod;BUILD_VERSION=1.8
```

Key differences from the other approaches:
- All **UPPERCASE** letters
- Dots replaced with **underscores**
- Multiple variables separated by **semicolons** (in IDE)

### What Happens

Restart and test:

- **`GET /api/contact-info`** → Production profile ✅
- **`GET /api/build-info`** → Returns `1.8` ✅

---

## The Precedence Showdown

Here's where it gets interesting. What if you set the **same property** in all three approaches simultaneously?

**Setup:**
- Environment variable: `BUILD_VERSION=1.8`
- VM option: `-Dbuild.version=1.1`
- Program argument: `--build.version=1.3`

**Result:** `GET /api/build-info` → **`1.3`**

Command-line arguments win. Now remove the program argument:

**Result:** → **`1.1`**

JVM properties win when CLI args are absent. Remove VM options too:

**Result:** → **`1.8`**

Environment variables are the last fallback before profile files. Remove the env var:

**Result:** → **`1.0`**

Now the value comes from `application-prod.yml`. This perfectly demonstrates the precedence chain in action.

---

## The Immutability Win

What we just proved is powerful. Consider the deployment flow:

1. Build your Docker image once — with `spring.profiles.active: qa` as the default in your YAML
2. Deploy to QA — no additional flags needed, QA profile activates by default
3. Deploy same image to production — pass `SPRING_PROFILES_ACTIVE=prod` as an environment variable
4. Need a quick override in staging? Add a command-line argument

Same binary. Same Docker image. Different behavior per environment. This is what microservices architecture demands.

---

## ✅ Key Takeaways

- All three approaches work in the IDE via Run Configuration settings
- Command-line: `--key=value` in Program Arguments
- JVM: `-Dkey=value` in VM Options
- Environment: `KEY_NAME=value` in Environment Variables (separated by `;`)
- The precedence chain is proven: CLI > JVM > Env Vars > Profile YAML > Default YAML
- Same application binary supports every environment — just change the external configuration

⚠️ **Common Mistake:** When using environment variables in an IDE, forgetting to convert dots to underscores and letters to uppercase. `spring.profiles.active` must become `SPRING_PROFILES_ACTIVE`.
