# Generate Docker Image of Loans Microservice with Buildpacks

## Introduction

Tired of writing Dockerfiles? Enter **Buildpacks** — a framework that transforms your application source code into a production-ready Docker image with a **single Maven command**. No Dockerfile needed. No Docker expertise required. Let the tool that was built on years of Heroku and Pivotal production experience do the heavy lifting.

---

## What Are Buildpacks?

Buildpacks is a framework that automatically:

1. **Scans** your source code and dependencies
2. **Detects** the language, framework, and runtime requirements
3. **Generates** an optimized Docker image following all production best practices

It was originally created by **Heroku**, then jointly developed with **Pivotal** as **Cloud Native Buildpacks (CNB)**.

For Java applications, the implementation is called **Paketo Buildpacks**.

### Multi-Language Support

Buildpacks isn't Java-only. It supports:

- Java, Go, GraalVM, Python, Ruby, PHP, Node.js

This makes it a versatile choice for organizations with microservices in multiple languages.

---

## Setting Up Buildpacks in Your Project

### Step 1: Set Packaging to JAR

In your Loans microservice `pom.xml`, add (just after `<version>`):

```xml
<packaging>jar</packaging>
```

### Step 2: Configure the Image Name

Inside the `spring-boot-maven-plugin` in your `pom.xml`, add:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <image>
            <name>eazybytes/${project.artifactId}:s4</name>
        </image>
    </configuration>
</plugin>
```

Notice the use of `${project.artifactId}` — this dynamically reads the artifact ID from your `pom.xml` (which is `loans`), avoiding hardcoded names.

The image name follows the same format: `<docker-username>/<app-name>:<tag>`

---

## Generating the Docker Image

Run from the directory containing `pom.xml`:

```bash
mvn spring-boot:build-image
```

### What Happens Behind the Scenes?

1. The `spring-boot-maven-plugin` invokes **Buildpacks**
2. Buildpacks downloads the **Paketo base image** (first run takes ~5 minutes)
3. It scans your `pom.xml` for Java version, dependencies, etc.
4. It generates an optimized, production-ready Docker image

> ⚠️ Docker server must be running during this process.

---

## The Size Difference — A Revelation

After the build completes, compare image sizes:

```bash
docker images
```

| Image    | Approach    | Size     |
|----------|-------------|----------|
| accounts | Dockerfile  | **456 MB** |
| loans    | Buildpacks  | **311 MB** |

That's a **32% reduction** in size — without you doing anything special! Buildpacks automatically applies:

- Efficient layer caching
- Compression
- Minimal base images
- Security best practices

All the things you'd have to manually configure in a Dockerfile.

---

## Running the Loans Container

```bash
docker run -d -p 8090:8090 eazybytes/loans:s4
```

Verify in Docker Desktop:
- Loans container should be in **Running** status
- Logs should show Spring Boot started at port 8090

Test with Postman — send a Create Loan request and confirm a successful response.

---

## Summary of Steps

| Step | Action                                              |
|------|-----------------------------------------------------|
| 1    | Add `<packaging>jar</packaging>` to `pom.xml`      |
| 2    | Configure image name in `spring-boot-maven-plugin`  |
| 3    | Run `mvn spring-boot:build-image`                   |
| 4    | Run `docker run -d -p 8090:8090 eazybytes/loans:s4` |

---

## Buildpacks vs Dockerfile at a Glance

| Aspect              | Dockerfile                  | Buildpacks                       |
|---------------------|-----------------------------|----------------------------------|
| Dockerfile needed?  | Yes                         | No                               |
| Best practices      | Manual implementation       | Automatic                        |
| Image size          | 456 MB (unoptimized)        | 311 MB (optimized)               |
| Security            | Your responsibility         | Built-in                         |
| Caching             | Manual layer ordering       | Automatic                        |
| Setup complexity    | High                        | Low (one Maven command)          |

---

## ✅ Key Takeaways

- Buildpacks generates Docker images from source code **without a Dockerfile**
- One command: `mvn spring-boot:build-image`
- Built on years of Heroku + Pivotal production experience
- Automatically follows all Docker best practices (security, caching, compression)
- Supports multiple languages — not just Java
- Produces significantly smaller images than manual Dockerfiles

---

## ⚠️ Common Mistakes

- Running `mvn spring-boot:build-image` without Docker running → build fails
- Forgetting to add the image name configuration in `pom.xml` → random/default name
- Not using `${project.artifactId}` → hardcoded names that get out of sync

---

## 💡 Pro Tip

First-time Buildpacks builds are slow because it downloads the Paketo base image (~1.3 GB). Subsequent builds are much faster due to caching. Don't panic if the first run takes 5+ minutes.
