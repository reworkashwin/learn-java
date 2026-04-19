# Docker Installation & Docker Hub Introduction

## Introduction

Time to get hands-on. Before we can containerize anything, we need Docker installed locally and a Docker Hub account ready. This lecture walks through the setup — it's straightforward, but essential.

---

## Installing Docker Desktop

### Step 1: Download

1. Visit [docker.com](https://www.docker.com)
2. The homepage auto-detects your OS and shows the right download
3. Click **"Download Docker Desktop"** for your platform:
   - **macOS** (Apple Silicon / Intel)
   - **Windows**
   - **Linux**

### Step 2: Install

- **Mac**: Open the `.dmg`, drag Docker to Applications
- **Windows**: Run the installer, follow the wizard (Next → Next → Finish)
- **Linux**: Follow the distro-specific instructions in Docker docs

### System Requirements

- At least **4 GB RAM**
- **64-bit processor**
- Windows: WSL 2 enabled (for Windows containers)

### Troubleshooting

If you hit issues:
- Docker docs have a dedicated **Troubleshoot** section with common problems and fixes
- Stack Overflow and Docker Community forums have extensive help
- Check Docker Desktop's built-in diagnostics

---

## Verifying the Installation

Open a terminal and run:

```bash
docker version
```

You should see output like:

```
Client:
 Version:    24.x.x
 OS/Arch:    darwin/arm64     ← Your host OS

Server:
 Version:    24.x.x
 OS/Arch:    linux/arm64      ← Linux VM (even on Mac/Windows)
```

The **Client** runs on your host OS. The **Server** runs on a lightweight Linux VM managed by Docker Desktop. This confirms Docker is working correctly.

---

## Setting Up Docker Hub

### Why Docker Hub?

Docker Hub (hub.docker.com) is where you:
- **Store** your Docker images (like GitHub for code, but for containers)
- **Share** images publicly or privately
- **Pull** official images from other products (MySQL, Redis, Nginx, etc.)

### Create an Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up with a username and password (no credit card needed)
3. **Remember your username** — you'll use it in Docker commands

### Plans

| Plan | Cost | Public Repos | Private Repos |
|------|------|-------------|---------------|
| Personal | $0 | Unlimited | Limited |
| Pro | Paid | Unlimited | Unlimited |
| Team | Paid | Unlimited | Unlimited |
| Business | Paid | Unlimited | Unlimited |

The **Personal plan** (free) is perfect for learning. In real projects, organizations typically use a paid plan for private image storage.

### Log In from Docker Desktop

1. Click the Docker Desktop icon in your system tray
2. Click **Sign In** (top right corner)
3. Enter your Docker Hub credentials

This connects your local Docker to your remote Docker Hub account — so you can push and pull images.

---

## Exploring Docker Hub

Docker Hub hosts **official images** for virtually every major technology:

| Product | Docker Hub Image | Downloads |
|---------|-----------------|-----------|
| MySQL | `mysql` | 1 Billion+ |
| PostgreSQL | `postgres` | 1 Billion+ |
| Python | `python` | 1 Billion+ |
| Ubuntu | `ubuntu` | 1 Billion+ |
| Redis | `redis` | 1 Billion+ |
| Nginx | `nginx` | 1 Billion+ |

To pull any of these to your local machine:
```bash
docker pull mysql
```

One command — and you have MySQL ready to run as a container. No installer, no manual configuration.

---

## Docker Desktop Dashboard

Once installed and logged in, Docker Desktop gives you a visual dashboard showing:
- **Containers** — all running and stopped containers
- **Images** — all locally stored Docker images
- **Volumes** — persistent data storage for containers

We'll use this dashboard extensively throughout the course.

---

## ✅ Key Takeaways

- Install **Docker Desktop** from docker.com — available for Mac, Windows, and Linux
- Verify installation with `docker version` — you should see both Client and Server info
- Create a free **Docker Hub** account at hub.docker.com — remember your username
- Log in to Docker Hub from Docker Desktop to connect local and remote
- Docker Hub hosts official images for all major technologies — pull them with one command
- The free Personal plan works perfectly for learning

⚠️ **Important**: Without Docker installed, you cannot practice any of the microservice concepts from this point forward. Make sure it's working before moving on.

💡 **Pro Tip**: Explore Docker Hub even before you need it. Search for technologies you use daily (MySQL, Redis, MongoDB) and look at their official images. Understanding how others package their software will help when you create your own Docker images.
