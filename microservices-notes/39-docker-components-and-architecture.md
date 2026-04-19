# Docker Components & Architecture

## Introduction

Now that we understand *what* Docker is and *why* we need it, let's look at *how* it's structured internally. Docker has three main components that work together — understanding this architecture is key to using Docker effectively.

---

## Component 1: Docker Client

The Docker client is your interface — it's how you talk to Docker.

### Docker CLI (Command Line Interface)

The most common way to interact with Docker. You type commands in your terminal:

```bash
docker build .        # Build an image
docker run myapp      # Create and start a container
docker push myapp     # Push image to a registry
```

This is what we'll use throughout the course.

### Docker Remote API

An alternative for programmatic access — you can issue Docker commands via REST API calls. Useful for CI/CD tools and automation platforms, but less common for day-to-day development.

---

## Component 2: Docker Server (Docker Host)

The Docker server (also called **Docker Host**) is where the real work happens. Despite the name "server," it runs on your **local machine** — both client and server are on the same system.

### Docker Daemon

A continuously running background process that:
- Listens for commands from the Docker client
- Builds Docker images from your instructions
- Creates and manages running containers
- Manages networks and storage volumes

### Images

When you tell Docker to package your Spring Boot application, the daemon creates a **Docker image** — a read-only template containing:
- Your application code
- JDK and runtime
- Libraries and dependencies
- Configuration files
- Startup commands

Think of it as a snapshot of everything needed to run your application.

### Containers

When you tell Docker to "run" an image, the daemon creates a **container** — a live, running instance of that image. The container is your microservice, actually serving requests.

```
Instructions (Dockerfile) → Docker Daemon → Image (blueprint) → Container (running app)
```

All images and containers live inside the Docker server on your machine.

---

## Component 3: Docker Registry

Once you've built and tested a Docker image locally, you need to store it somewhere accessible — just like pushing code to GitHub.

### Docker Hub

Docker's own public registry (hub.docker.com). You can:
- **Push** your images to make them available
- **Pull** images from other projects (MySQL, Redis, Nginx, etc.)
- Store images as **public** (anyone can pull) or **private** (authenticated access only)

### Private Registries

Major platforms offer their own registries:
- **AWS ECR** (Elastic Container Registry)
- **Azure Container Registry**
- **Google Container Registry**
- **GitHub Container Registry**

In production, organizations typically use private registries for security.

---

## How It All Works Together

Here's the complete flow:

### Scenario: Running a MySQL container

```
Step 1: You type: docker run mysql
        [Docker Client] → sends command to → [Docker Server]

Step 2: Docker Server checks: "Do I have a MySQL image locally?"
        If NO → pulls from Docker Hub

Step 3: Docker Hub sends the MySQL image to your local system

Step 4: Docker Server creates a container from the image

Step 5: MySQL is now running in a container on your machine ✅
```

### The Traditional Way vs. Docker Way

**Without Docker** (to use MySQL locally):
1. Go to MySQL website
2. Download the installer
3. Run the installer
4. Configure paths, users, ports
5. Start the MySQL service
6. Debug installation issues...

**With Docker**:
```bash
docker run mysql
```

One command. Everything packaged. Works the same on every machine.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        Your Machine                             │
│                                                                  │
│  ┌──────────────────┐      ┌──────────────────────────────┐   │
│  │   Docker Client   │ ───→ │      Docker Server (Host)     │   │
│  │                    │      │                                │   │
│  │  • Docker CLI      │      │  ┌──────────┐  ┌──────────┐  │   │
│  │  • Remote API      │      │  │  Images   │  │Containers│  │   │
│  │                    │      │  │           │  │          │  │   │
│  └──────────────────┘      │  │ • myapp   │  │ • myapp  │  │   │
│                              │  │ • mysql   │  │ • mysql  │  │   │
│                              │  └──────────┘  └──────────┘  │   │
│                              │                                │   │
│                              │      Docker Daemon (running)   │   │
│                              └──────────┬─────────────────────┘   │
│                                          │                         │
└──────────────────────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────┐
                              │    Docker Registry     │
                              │  (Docker Hub / ECR /   │
                              │   ACR / GCR / GHCR)    │
                              └──────────────────────┘
```

---

## ✅ Key Takeaways

- **Docker Client** — your interface (CLI or API) to issue commands
- **Docker Server/Host** — where images are stored and containers run (on your local machine)
- **Docker Daemon** — the background process that does the actual work
- **Docker Registry** — remote storage for images (Docker Hub, AWS ECR, etc.)
- Flow: Client sends command → Server checks local images → Pulls from registry if needed → Creates container
- Docker eliminates manual installation of tools — just `docker run <product>`

💡 **Pro Tip**: Just like you push code to GitHub, you push Docker images to Docker Hub (or a private registry). The registry is the bridge between your local development and production deployment.
