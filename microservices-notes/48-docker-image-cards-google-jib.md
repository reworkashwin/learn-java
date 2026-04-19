# Generate Docker Image of Cards Microservice with Google Jib

## Introduction

Google Jib is the third and final approach for generating Docker images. It's a Java-specific tool from Google that's **blazing fast** and has a unique superpower — it can build Docker images **even without Docker installed** on your system. Let's see how it works with the Cards microservice.

---

## What Is Google Jib?

Jib is an open-source Java containerization tool from Google, available as a **Maven/Gradle plugin**. It:

- Generates production-ready Docker images
- Requires no Dockerfile
- Requires no Docker installation (optionally)
- Is extremely fast (builds in seconds, not minutes)

Find it at: `github.com/GoogleContainerTools/jib`

### Key Difference from Buildpacks

| Feature               | Buildpacks           | Google Jib          |
|-----------------------|----------------------|---------------------|
| Language support      | Java, Python, Go, Ruby, Node, PHP | **Java only** |
| Requires Docker?      | Yes                  | Optional            |
| Build speed           | Slow (~minutes)      | Fast (~seconds)     |

---

## Setting Up Jib in Your Project

### Step 1: Set Packaging to JAR

In your Cards microservice `pom.xml`:

```xml
<packaging>jar</packaging>
```

### Step 2: Add the Jib Maven Plugin

Add this plugin to the `<plugins>` section of your `pom.xml` (alongside the existing `spring-boot-maven-plugin`):

```xml
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>3.3.2</version>
    <configuration>
        <to>
            <image>eazybytes/${project.artifactId}:s4</image>
        </to>
    </configuration>
</plugin>
```

The image name follows the same convention: `<docker-username>/<app-name>:<tag>`

---

## Generating the Docker Image

Navigate to the Cards project directory and run:

```bash
mvn compile jib:dockerBuild
```

### What Happens?

1. Jib scans your `pom.xml` for dependencies and Java version
2. It builds an optimized Docker image using your **local Docker daemon**
3. The image is stored locally — ready to run

### Speed Comparison

Jib completed in **~11 seconds**. Compare that to Buildpacks which can take several minutes. This speed advantage is significant during development when you're rebuilding frequently.

---

## Verifying the Image

```bash
docker images
```

| Image    | Approach    | Size       |
|----------|-------------|------------|
| accounts | Dockerfile  | 456 MB     |
| loans    | Buildpacks  | 311 MB     |
| cards    | Google Jib  | **322 MB** |

Jib's image size is comparable to Buildpacks and **far smaller** than the manual Dockerfile approach.

### About the "53 Years Ago" Created Date

You'll notice Buildpacks and Jib images show creation dates like "43 years ago" or "53 years ago." This is **not a bug** — it's a feature.

They use a fixed epoch date (around 1970) so that if you rebuild the **exact same image** without changes, the hash stays identical. If they used the current timestamp, every rebuild would produce a "different" image even with the same content. This optimization enables better caching and deduplication.

---

## Running the Cards Container

```bash
docker run -d -p 9000:9000 eazybytes/cards:s4
```

Verify:
- Check Docker Desktop → container is running
- Check logs → Spring Boot started at port 9000
- Test with Postman → Create Card API returns success

---

## Jib's Secret Weapon: No Docker Required

Jib has an alternative command:

```bash
mvn compile jib:build
```

Notice: `jib:build` instead of `jib:dockerBuild`. This version:

- Generates and **pushes** the image directly to a remote registry
- **Does not require Docker installed locally**
- Supports Docker Hub, GCR, ECR, and other registries

### When Is This Useful?

In **CI/CD pipelines** (Jenkins, GitHub Actions, etc.) where:
- You don't want to install Docker on the build server
- You want to build and push images in one step
- The pipeline handles everything automatically

Configure the remote registry in the `<to>` section:

```xml
<!-- Docker Hub -->
<image>docker.io/eazybytes/cards:s4</image>

<!-- Google Container Registry -->
<image>gcr.io/your-project/cards:s4</image>

<!-- AWS ECR -->
<image>your-account.dkr.ecr.region.amazonaws.com/cards:s4</image>
```

---

## Summary of Steps

| Step | Action                                                       |
|------|--------------------------------------------------------------|
| 1    | Add `<packaging>jar</packaging>` to `pom.xml`              |
| 2    | Add Jib Maven plugin with image name configuration           |
| 3    | Run `mvn compile jib:dockerBuild`                            |
| 4    | Run `docker run -d -p 9000:9000 eazybytes/cards:s4`         |

---

## ✅ Key Takeaways

- Google Jib is a **Java-specific** tool for generating Docker images via a Maven plugin
- It's **extremely fast** — builds in seconds, not minutes
- No Dockerfile needed — no Docker knowledge required
- Unique ability: can build images **without Docker installed** (`jib:build`)
- Produces optimized, production-ready images comparable in size to Buildpacks
- The "old date" in created field is a feature for reproducible builds, not a bug

---

## ⚠️ Common Mistakes

- Using `jib:build` when you want the image locally — that pushes to a remote registry
- Forgetting to update the Docker username in the image name
- Not having Docker running when using `jib:dockerBuild` (only `jib:build` works without Docker)

---

## 💡 Pro Tip

Use `jib:dockerBuild` during development (fast local builds) and `jib:build` in your CI/CD pipeline (no Docker dependency on build servers). This gives you the best of both worlds.
