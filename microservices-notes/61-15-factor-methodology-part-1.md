# 15-Factor Methodology Deep Dive — Part 1 (Factors 1-5)

## Introduction

Let's break down the first five factors of the 15-factor methodology. These are foundational — get these right and you're already on solid ground for building cloud-native microservices.

---

## Factor 1: One Codebase, One Application

### What Is It?

Each microservice gets its **own dedicated code repository**. One-to-one mapping between an application and its codebase. Period.

### Why Does This Matter?

In a monolith, everything lives in one giant repo. In microservices, if you cram multiple services into one repo, you lose the benefits of independent development, testing, and deployment.

### How to Apply It

- Each microservice → its own Git repository
- **Common/shared code** → managed as a separate library or a standalone backing service
- Build your codebase **once** → deploy the same artifact to dev, QA, and production

> What about environment-specific configurations like database credentials? Those vary between dev and production, right?

Exactly. That's why configurations must be kept **outside** the codebase and injected at deployment time. You package your code once, and inject the right config for each environment.

### Visualization

```
Single Codebase → Build Once → Same Package Deployed to:
                                ├── Development
                                ├── Testing
                                └── Production
```

⚠️ **Common Mistake**: Rebuilding the codebase for each environment with different configs baked in. With hundreds of microservices, this becomes unmanageable.

---

## Factor 2: API First

### What Is It?

Design and develop everything as **APIs**. From the very first design conversation, think in terms of API contracts.

### Why Does This Matter?

- Other microservices can invoke your business logic as a **backing service**
- Different teams can work on different APIs **independently**
- You can write **integration tests** against API contracts in your deployment pipeline
- Internal implementation can change without affecting consumers, as long as the API contract stays the same

### How to Apply It

Before writing business logic, define:
- What endpoints will this service expose?
- What request/response formats will it use?
- What HTTP methods and status codes are appropriate?

This "API-first" mindset ensures your services are composable and testable from day one.

---

## Factor 3: Dependency Management

### What Is It?

**Explicitly declare all dependencies** in a single manifest file, and use a dependency manager to resolve them from a central repository.

### Why This Matters

The old approach — manually downloading JARs and adding them to the classpath — is a nightmare with hundreds of microservices. Every service would need manual setup.

### How We Already Follow This

In Java, this is exactly what **Maven** (pom.xml) and **Gradle** (build.gradle) do:

1. Developer declares dependencies in `pom.xml`
2. Maven checks the local repository
3. If not found locally, downloads from Maven Central
4. During packaging, all dependencies are bundled into a single fat JAR
5. That JAR is used to generate the Docker image

```
pom.xml → Maven → Local Repo → Maven Central → Fat JAR → Docker Image
```

All dependencies are resolved automatically. No manual downloads. No classpath headaches.

---

## Factor 4: Design, Build, Release, Run

### What Is It?

Your codebase progresses through four strictly separated stages:

### Stage 1: Design

Determine all technologies, dependencies, and tools. Includes development and unit testing.

### Stage 2: Build

Compile and package the codebase with dependencies into an **immutable artifact**. Each build gets a unique identifier (version number).

### Stage 3: Release

Combine the build artifact with **environment-specific configurations**. The release is also immutable and gets its own unique identifier (e.g., `v6.1.5` or a timestamp).

### Stage 4: Run

Deploy and run the application in the target environment using a specific release.

### Critical Rules

- **Strict separation** between stages — never skip or combine them
- **No runtime code modifications** — if something needs to change, go back through the pipeline
- **Reproducibility** — the same release artifact should always produce the same behavior

```
Design → Build (immutable artifact, v1.0)
              → Release = Build + Config (immutable, v1.0-prod)
                    → Run (deployed in production)
```

---

## Factor 5: Configuration, Credentials, and Code

### What Is It?

**Configurations that change between environments must be kept outside the codebase.** Never embed environment-specific configs in your code.

### What Counts as Configuration?

Anything that differs between deployments:
- Database URLs, usernames, passwords
- Message broker connection details
- Third-party API credentials
- Feature flags

### Why Is This Critical?

If you embed QA database credentials in your code, you need a separate build for production with production credentials. With 100+ microservices, that's 100+ separate builds per environment. Unmanageable.

### How to Apply It

- **Default configs** can live with the application (e.g., default port number)
- **Environment-specific configs** must be injected externally at runtime
- Use tools like **Spring Cloud Config Server** (covered in detail later in this course)

### Visualization

```
Single Codebase → Single Docker Image → Deploy to:
                                         ├── Dev  + Dev Config (injected at runtime)
                                         ├── QA   + QA Config (injected at runtime)
                                         └── Prod + Prod Config (injected at runtime)
```

💡 **Pro Tip**: This factor is so important that there's an entire section in this course dedicated to implementing it using Spring Cloud Config Server.

---

## ✅ Key Takeaways

- **Factor 1**: One repo per microservice, build once, deploy everywhere
- **Factor 2**: Think APIs first — design contracts before implementations
- **Factor 3**: Declare dependencies explicitly (Maven/Gradle handle this for Java)
- **Factor 4**: Strictly separate Design → Build → Release → Run stages
- **Factor 5**: Never embed environment-specific configs in code — externalize them
- Factors 3, 1, and 2 are things we're already doing in our microservices
- Factor 5 will be implemented with Spring Cloud Config Server in an upcoming section
