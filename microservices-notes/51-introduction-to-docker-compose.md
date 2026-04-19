# Introduction to Docker Compose

## Introduction

You've learned how to build Docker images and run individual containers. But here's the reality check — what happens when you have **three microservices** to start? You run `docker run` three times. What about ten? A hundred? What if you need multiple instances of each?

Manually running `docker run` for every microservice is painful, error-prone, and simply doesn't scale. This is exactly the problem **Docker Compose** solves.

---

## The Problem: Manual Container Management Doesn't Scale

Picture this: you have three Docker images — `accounts`, `loans`, and `cards`. To start them, you issue:

```bash
docker run -p 8080:8080 eazybytes/accounts:s4
docker run -p 8090:8090 eazybytes/loans:s4
docker run -p 9000:9000 eazybytes/cards:s4
```

That's three commands for three services. Now imagine you need to scale `accounts` to five instances. That's five separate `docker run` commands just for one microservice. Multiply that across 100 microservices and you're looking at a nightmare.

> Why should you, as a developer, be responsible for typing hundreds of commands just to start your application?

---

## What is Docker Compose?

Docker Compose is a tool within the Docker ecosystem for **defining and running multi-container Docker applications**. Instead of running individual `docker run` commands, you:

1. Define all your services in a single **YAML configuration file**
2. Start everything with **one command**
3. Stop everything with **one command**

That's it. One file, one command — all your microservices are running.

### What Can Docker Compose Do?

- Start, stop, and rebuild services
- View the status of running services
- Stream log output from all services
- Run one-off commands on services

Docker Compose comes **pre-installed** with Docker Desktop. You can verify this by running:

```bash
docker compose version
```

If it's not installed, the official Docker documentation provides installation instructions for every OS.

---

## Writing the Docker Compose File

The configuration file is named `docker-compose.yml`. You can place it anywhere, but keeping it alongside your project code (so it gets checked into version control) is a good practice.

### Basic Structure

```yaml
services:
  accounts:
    image: "eazybytes/accounts:s4"
    container_name: accounts-ms
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          memory: 700m

  loans:
    image: "eazybytes/loans:s4"
    container_name: loans-ms
    ports:
      - "8090:8090"
    deploy:
      resources:
        limits:
          memory: 700m

  cards:
    image: "eazybytes/cards:s4"
    container_name: cards-ms
    ports:
      - "9000:9000"
    deploy:
      resources:
        limits:
          memory: 700m
```

Let's break this down piece by piece.

### `services` — The Parent Element

Everything lives under `services`. Each child element under `services` defines one microservice.

### Service Configuration Keys

| Key | Purpose | Example |
|-----|---------|---------|
| `image` | Which Docker image to use | `"eazybytes/accounts:s4"` |
| `container_name` | Give your container a readable name (otherwise Docker assigns random names like "angry_cannon") | `accounts-ms` |
| `ports` | Map host port to container port | `"8080:8080"` |
| `deploy.resources.limits.memory` | Cap memory usage (critical on local machines with limited RAM) | `700m` |

💡 **Pro Tip**: Without `container_name`, Docker generates random names. When you have dozens of containers, identifying which container belongs to which service becomes impossible without meaningful names.

---

## Adding Networking for Inter-Service Communication

By default, each container runs in its own **isolated network**. If your microservices need to talk to each other, they can't — unless you place them on the same network.

### Tagging Services with a Network

Add a `networks` section to each service:

```yaml
services:
  accounts:
    image: "eazybytes/accounts:s4"
    container_name: accounts-ms
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          memory: 700m
    networks:
      - eazybank

  loans:
    # ... same config ...
    networks:
      - eazybank

  cards:
    # ... same config ...
    networks:
      - eazybank
```

### Defining the Network

At the **root level** (same indentation as `services`), define the network:

```yaml
networks:
  eazybank:
    driver: bridge
```

The `bridge` driver creates a network bridge that enables all tagged services to communicate with each other. This is the most common network driver for local development.

---

## The Complete Docker Compose File

```yaml
services:
  accounts:
    image: "eazybytes/accounts:s4"
    container_name: accounts-ms
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          memory: 700m
    networks:
      - eazybank

  loans:
    image: "eazybytes/loans:s4"
    container_name: loans-ms
    ports:
      - "8090:8090"
    deploy:
      resources:
        limits:
          memory: 700m
    networks:
      - eazybank

  cards:
    image: "eazybytes/cards:s4"
    container_name: cards-ms
    ports:
      - "9000:9000"
    deploy:
      resources:
        limits:
          memory: 700m
    networks:
      - eazybank

networks:
  eazybank:
    driver: bridge
```

⚠️ **Common Mistake**: YAML is whitespace-sensitive. Every indentation matters. A misplaced space will break your entire configuration. Always double-check indentation levels.

---

## ✅ Key Takeaways

- **Docker Compose** replaces repetitive `docker run` commands with a single YAML file and a single command
- The `docker-compose.yml` file defines all your services, their images, ports, memory limits, and networks
- Use `container_name` to give meaningful names to containers
- Use `deploy.resources.limits.memory` to prevent containers from consuming all available RAM
- Define a shared `network` with a `bridge` driver to enable inter-service communication
- YAML indentation is **critical** — every space counts
