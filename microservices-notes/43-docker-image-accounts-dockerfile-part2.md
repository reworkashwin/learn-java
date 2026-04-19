# Generate Docker Image of Accounts Microservice with Dockerfile — Part 2

## Introduction

Now that we understand how a Spring Boot application gets compiled and packaged into a JAR, it's time to **write the actual Dockerfile**. A Dockerfile is just a set of instructions telling Docker how to build your image — think of it as an automated setup script.

---

## Creating the Dockerfile

Right-click on your **Accounts microservice project folder** → New File → Name it exactly:

```
Dockerfile
```

### Important Rules

- The filename must be exactly `Dockerfile` (capital D)
- **No file extension** — not `.txt`, not `.yml`, not `.xml`
- Docker looks for this exact filename by default

---

## Writing the Dockerfile Instructions

Here's the complete Dockerfile we're building, explained line by line:

```dockerfile
# Start with a base image containing Java runtime
FROM openjdk:17-jdk-slim

# Information around who maintains the image
MAINTAINER eazybytes.com

# Add the application's jar to the image
COPY target/accounts-0.0.1-SNAPSHOT.jar accounts-0.0.1-SNAPSHOT.jar

# Execute the application
ENTRYPOINT ["java", "-jar", "accounts-0.0.1-SNAPSHOT.jar"]
```

---

## Breaking Down Each Instruction

### `FROM` — The Base Image

```dockerfile
FROM openjdk:17-jdk-slim
```

Every Docker image starts from a **base image**. Since our application needs Java to run, we tell Docker: "Start with an image that already has Java installed."

- `openjdk` → the image name (available on Docker Hub)
- `17-jdk-slim` → the tag (version). This gives us Java 17 in a slim, lightweight variant

The format is always: `image-name:tag`

You can browse available tags on [Docker Hub](https://hub.docker.com/_/openjdk) — there are versions for Java 11, 17, 22, etc.

### `MAINTAINER` — Who Maintains This Image

```dockerfile
MAINTAINER eazybytes.com
```

This is metadata telling anyone who uses this image **who built and maintains it**. Replace with your own name or domain.

### `COPY` — Bring the JAR Into the Image

```dockerfile
COPY target/accounts-0.0.1-SNAPSHOT.jar accounts-0.0.1-SNAPSHOT.jar
```

This copies the JAR file **from your local machine** into the Docker image.

- **Source**: `target/accounts-0.0.1-SNAPSHOT.jar` (relative to where the Dockerfile lives)
- **Destination**: `accounts-0.0.1-SNAPSHOT.jar` (root directory inside the image)

Since the Dockerfile sits in the Accounts project root, and the JAR is in `target/`, this path works perfectly.

### `ENTRYPOINT` — What Runs When a Container Starts

```dockerfile
ENTRYPOINT ["java", "-jar", "accounts-0.0.1-SNAPSHOT.jar"]
```

This tells Docker what command to execute when creating a container from this image. It's the same `java -jar` command we used locally — but notice:

- No `target/` prefix because we copied the JAR to the root of the image
- Each argument is a **separate string** separated by commas (because of spaces in the command)

---

## How It All Connects

Think of the Dockerfile as answering four questions:

| Question                              | Instruction | Answer                              |
|---------------------------------------|-------------|-------------------------------------|
| What does my app need to run?         | `FROM`      | Java 17 (OpenJDK slim)             |
| Who built this image?                 | `MAINTAINER`| eazybytes.com                       |
| What files does my app need?          | `COPY`      | The fat JAR from `target/`         |
| How do I start my app?               | `ENTRYPOINT`| `java -jar accounts-...jar`        |

---

## ✅ Key Takeaways

- A Dockerfile is a text file with **no extension**, named exactly `Dockerfile`
- `FROM` sets the base image (Java runtime in our case)
- `COPY` brings your compiled JAR into the Docker image
- `ENTRYPOINT` defines the startup command for containers
- The Dockerfile sits in the **project root**, alongside `pom.xml`

---

## ⚠️ Common Mistakes

- Adding a file extension to the Dockerfile (`.txt`, `.yml`)
- Using the wrong JAR path in `COPY` — make sure `target/` has the JAR first (run `mvn clean install`)
- Forgetting to separate `ENTRYPOINT` arguments with commas
- Misspelling keywords — they must be uppercase: `FROM`, `COPY`, `ENTRYPOINT`

---

## 💡 Pro Tip

Comments in Dockerfiles start with `#`. Always add comments above each instruction for readability — future you (or your teammates) will thank you.
