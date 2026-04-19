# Generate Docker Image of Accounts Microservice with Dockerfile — Part 3

## Introduction

The Dockerfile is ready. Now it's time to **feed it to Docker and generate the actual image**. This lecture covers the `docker build` command, inspecting the generated image, and understanding what's inside it.

---

## Prerequisites Check

Before building, make sure Docker is installed and running:

```bash
docker version
```

This should output both client and server version information. If you get an error, start Docker Desktop first.

---

## Building the Docker Image

From the terminal, navigate to the **Accounts project folder** (where both `pom.xml` and `Dockerfile` live) and run:

```bash
docker build . -t eazybytes/accounts:s4
```

### Breaking Down the Command

| Part                      | Meaning                                                   |
|---------------------------|-----------------------------------------------------------|
| `docker build`            | Tell Docker to build an image                             |
| `.`                       | Look for the Dockerfile in the **current directory**      |
| `-t`                      | Tag the image with a name                                 |
| `eazybytes/accounts:s4`   | The full image name: `username/app-name:tag`              |

### Image Naming Convention

The format is: `<docker-username>/<app-name>:<tag>`

- **Docker username** (`eazybytes`) — your Docker Hub username. This is critical because you'll later push images to Docker Hub, and it needs to match your account.
- **App name** (`accounts`) — identifies which microservice this image represents
- **Tag** (`s4`) — version/label, here indicating "Section 4"

> ⚠️ **Always use your own Docker Hub username**, not someone else's. You'll need your credentials to push images later.

---

## What Happens During the Build?

When you execute the command, Docker processes each Dockerfile instruction in order:

1. **Step 1**: Downloads the base image (`openjdk:17-jdk-slim`) from Docker Hub — this takes time the first time
2. **Step 2**: Copies the `accounts-0.0.1-SNAPSHOT.jar` from `target/` into the image
3. **Step 3**: Sets the entrypoint command

Once complete, you'll see a success message with the image name.

---

## Verifying the Image

### List All Images

```bash
docker images
```

You'll see output like:

| REPOSITORY           | TAG | IMAGE ID     | CREATED        | SIZE   |
|----------------------|-----|--------------|----------------|--------|
| eazybytes/accounts   | s4  | abc123...    | 1 minute ago   | 456 MB |

### Inspect the Image

```bash
docker inspect <image-id>
```

You only need the first 3-4 characters of the image ID. The inspect output reveals:

- **Author**: `eazybytes.com` (from `MAINTAINER`)
- **JAVA_HOME**: Set to OpenJDK 17 path (from the base image)
- **Entrypoint**: `["java", "-jar", "accounts-0.0.1-SNAPSHOT.jar"]`
- **Operating System**: Linux (Docker always uses Linux under the hood via namespaces and cgroups)

### Using Docker Desktop

You can also inspect images visually in Docker Desktop:

1. Go to **Images** tab
2. Click on `accounts:s4`
3. View layers, size, and configuration details

---

## Understanding the Image Size

The Accounts image is **456 MB**. That's quite large for what we're doing. Keep this number in mind — when we explore Buildpacks and Jib later, you'll see dramatically smaller images because they follow compression, caching, and layering best practices that we didn't implement in our basic Dockerfile.

---

## ✅ Key Takeaways

- `docker build . -t <name>:<tag>` builds an image from a Dockerfile in the current directory
- Always include your **Docker Hub username** as a prefix in the image name
- `docker images` lists all local images
- `docker inspect <id>` shows detailed image metadata
- The Docker server **must be running** for any Docker command to work
- The base image download happens only once — subsequent builds use the cached version

---

## ⚠️ Common Mistakes

- Running `docker build` without Docker Desktop running → connection error
- Not including your Docker Hub username in the image name → problems when pushing later
- Running the build command from the wrong directory → "Dockerfile not found"
- Forgetting to run `mvn clean install` first → the JAR file won't exist in `target/`

---

## 💡 Pro Tip

You don't need to type the full image ID in commands. Docker accepts the first **3-4 characters** as long as they uniquely identify the image. So `docker inspect abc1` works just as well as the full hash.
