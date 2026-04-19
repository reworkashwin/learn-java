# Deep Dive on Docker Commands

## Introduction

Docker has a rich set of CLI commands beyond `docker run` and `docker ps`. Whether you're debugging a container, cleaning up unused images, or inspecting what's happening inside a running container — there's a command for it. This is your reference guide to the Docker commands you'll use on a daily basis.

---

## Image Commands

### Listing Images

```bash
docker images
```

Shows all Docker images present on your local Docker server.

### Inspecting an Image

```bash
docker image inspect <image-id>
```

Returns detailed metadata about a specific image. You don't need to type the full image ID — the first 3-4 characters are enough for Docker to identify it.

### Removing Images

```bash
docker image rm <image-id>
```

Removes a Docker image. You can pass multiple image IDs separated by spaces to remove several at once.

### Building an Image

```bash
docker build -t <image-name:tag> .
```

Builds a Docker image from a Dockerfile in the current directory. The `-t` flag assigns a name and tag.

### Viewing Image History

```bash
docker history <image-name>
```

Shows all intermediate layers and commands executed while building an image. Useful for debugging build issues.

---

## Container Lifecycle Commands

### Running a Container

```bash
docker run -p <host-port>:<container-port> <image-name>
```

Creates and starts a container from a Docker image with port mapping.

### Listing Containers

```bash
docker ps          # Running containers only
docker ps -a       # All containers (running + stopped)
```

### Starting a Stopped Container

```bash
docker container start <container-id>
```

Starts a previously stopped container. Pass multiple container IDs (space-separated) to start several.

### Pausing and Unpausing

```bash
docker container pause <container-id>     # Pause — stops accepting traffic
docker container unpause <container-id>   # Resume — accepts traffic again
```

### Stopping vs. Killing

```bash
docker container stop <container-id>    # Graceful — gives ~5 seconds to close resources
docker container kill <container-id>    # Immediate — kills instantly
```

💡 **Pro Tip**: Always prefer `stop` over `kill`. The 5-second grace period lets your container close database connections, file handles, and other resources cleanly.

### Restarting

```bash
docker container restart <container-id>
```

### Inspecting a Container

```bash
docker container inspect <container-id>
```

Returns detailed information about the container's configuration, networking, and state.

---

## Logging and Debugging

### Viewing Logs

```bash
docker container logs <container-id>
```

Fetches all logs for a given container.

### Following Logs in Real-Time

```bash
docker container logs -f <container-id>
```

The `-f` flag streams logs continuously — like `tail -f` for Docker containers.

### Executing Commands Inside a Running Container

```bash
docker exec -it <container-id> sh
```

Opens a shell inside a running container. This lets you run CLI commands directly within the container's isolated environment.

---

## Cleanup Commands

### Removing Containers

```bash
docker rm <container-id>                # Remove specific container(s)
docker container prune                  # Remove ALL stopped containers
```

### Removing Images

```bash
docker rmi <image-id>                   # Remove specific image
docker image prune                      # Remove all unused images
```

An "unused" image is one with **no associated containers** (running or stopped).

### System-Wide Cleanup

```bash
docker system prune
```

Removes **everything** unused — stopped containers, unused images, unused networks, volumes, and build cache. Use with caution.

---

## Container Statistics

```bash
docker container stats
```

Shows real-time CPU, memory, and I/O usage for all running containers.

---

## Docker Hub Authentication

```bash
docker login -u <username>     # Log in (prompts for password)
docker logout                  # Log out
```

💡 **Pro Tip**: If you're using Docker Desktop, signing in through the UI automatically connects your CLI as well. The `docker login` command is mainly for environments without Docker Desktop.

---

## Docker Compose Commands Summary

```bash
docker compose up -d      # Create and start containers (detached)
docker compose down        # Stop and remove containers
docker compose stop        # Stop without removing
docker compose start       # Start existing stopped containers
```

---

## ✅ Key Takeaways

- Use short IDs (first 3-4 chars) — Docker is smart enough to resolve them
- `stop` gives a graceful 5-second shutdown; `kill` is immediate
- `docker container prune` cleans up all stopped containers in one shot
- `docker system prune` is the nuclear option — use carefully
- `docker exec -it <id> sh` lets you debug inside a running container
- `docker logs -f` gives you real-time log streaming
- Docker Desktop provides a UI alternative for most of these commands
