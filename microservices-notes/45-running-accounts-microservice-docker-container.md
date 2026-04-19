# Running Accounts Microservice as a Docker Container

## Introduction

We've got the Docker image ready. Now it's time to **bring it to life** by creating a container. If the Docker image is the class, then the container is the object — you can create as many instances as you want from a single image. This is where Docker's power for scalability truly shines.

---

## Creating a Container with `docker run`

```bash
docker run -p 8080:8080 eazybytes/accounts:s4
```

### Breaking Down the Command

| Part                      | Meaning                                              |
|---------------------------|------------------------------------------------------|
| `docker run`              | Create and start a new container                     |
| `-p 8080:8080`            | Port mapping (host:container)                        |
| `eazybytes/accounts:s4`   | The Docker image to create the container from        |

Think of `docker run` like the `new` operator in Java. Just as `new MyClass()` creates an object from a class definition, `docker run` creates a container from an image definition. You can create as many containers as you want from one image.

---

## Understanding Port Mapping

This is one of the most important Docker networking concepts.

By default, containers run in their own **isolated network**. Nothing can reach them from the outside unless you explicitly **expose a port**.

```
-p <host-port>:<container-port>
```

- **Container port** (right side: `8080`) — where your app actually runs *inside* the Docker network
- **Host port** (left side: `8080`) — the port exposed to *your local machine*

### Visual Example

```
Your Local Machine (localhost:8081)
         │
         ▼
   ╔═══════════════╗
   ║  Docker Host   ║
   ║  Port: 8081    ║  ◄── Host port (external access)
   ║       │        ║
   ║       ▼        ║
   ║  Container     ║
   ║  Port: 8080    ║  ◄── Container port (internal)
   ╚═══════════════╝
```

You can map to a **different** host port:

```bash
docker run -p 8081:8080 eazybytes/accounts:s4
```

Now the app runs internally at 8080, but you access it at `localhost:8081`.

---

## Detached Mode (`-d`)

Without `-d`, the container logs fill your terminal and you can't run other commands:

```bash
# Foreground mode (blocks terminal)
docker run -p 8080:8080 eazybytes/accounts:s4

# Detached mode (runs in background)
docker run -d -p 8080:8080 eazybytes/accounts:s4
```

Detached mode returns a **container ID** and frees your terminal immediately.

---

## Managing Containers

### List Running Containers

```bash
docker ps          # Only running containers
docker ps -a       # All containers (including stopped)
```

### Stop a Container

```bash
docker stop <container-id>
```

### Start a Stopped Container

```bash
docker start <container-id>
```

> You only need the first 3-4 characters of the container ID.

### Delete a Container

You can delete containers from Docker Desktop or the CLI. Periodically clean up unused containers to free memory and storage.

---

## Creating Multiple Containers (Scaling)

Want two instances? Just use a different host port:

```bash
docker run -d -p 8080:8080 eazybytes/accounts:s4   # Instance 1
docker run -d -p 8081:8080 eazybytes/accounts:s4   # Instance 2
```

Both containers run the same app at internal port 8080, but they're exposed on different host ports. This is because:

- Each container has its **own isolated network** → same internal port is fine
- Your host machine shares **one network** → ports must be unique

This shows how effortlessly Docker enables **horizontal scaling**.

---

## Docker Desktop Features

When you click on a running container in Docker Desktop, you get access to:

| Tab          | What It Shows                                    |
|--------------|--------------------------------------------------|
| **Logs**     | Application output (Spring Boot startup logs)    |
| **Inspect**  | JAVA_VERSION, JAVA_HOME, port info               |
| **Files**    | File system inside the container                 |
| **Stats**    | CPU usage, memory usage, network I/O             |
| **Terminal** | Shell access inside the running container        |

Under **Files**, you can verify the JAR was copied to the root directory. Under **Terminal**, you're actually running commands *inside* the container.

---

## How Docker Solves Our Core Challenges

| Challenge       | How Docker Solves It                                                |
|-----------------|---------------------------------------------------------------------|
| **Scalability** | `docker run` creates new instances instantly — scale from 1 to N   |
| **Portability** | Same image works everywhere Docker is installed — no JDK/Maven/Spring setup needed |
| **Deployment**  | Same image, same commands — local, VM, cloud, nothing changes       |

---

## Summary of Steps

1. **Build the image**: `docker build . -t eazybytes/accounts:s4`
2. **Run as container**: `docker run -d -p 8080:8080 eazybytes/accounts:s4`
3. **Test**: Send requests to `localhost:8080`
4. **Scale**: Run more containers with different host ports

---

## ✅ Key Takeaways

- `docker run` creates a container from an image (like `new` in Java)
- `-p host:container` maps ports — without it, your app is unreachable
- `-d` runs in detached mode so your terminal stays free
- `docker ps` shows running containers; `docker ps -a` shows all
- Multiple containers from the same image can run simultaneously with different port mappings

---

## ⚠️ Common Mistakes

- Reusing the same host port for two containers → port conflict error
- Forgetting `-p` → container starts but is inaccessible from your machine
- Not cleaning up old containers → wastes storage and memory
- Confusing `docker run` (creates new) with `docker start` (resumes existing)

---

## 💡 Pro Tip

Get in the habit of using `-d` (detached mode) for containers. Then monitor logs via Docker Desktop or `docker logs <container-id>`. This keeps your terminal clean and productive.
