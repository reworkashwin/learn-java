# Log Aggregation with Grafana, Loki & Promtail — Part 1

## Introduction

You've built microservices, containerized them with Docker, and set up a gateway server. But here's a question that haunts every production system: **where do the logs go?**

When you have 5, 10, or 100 microservices running in containers, each one is generating its own log output. If something breaks at 3 AM, is a developer supposed to SSH into every container, grep through logs, and piece together what happened? That's madness.

This is where **log aggregation** comes in — and the stack we'll use is **Grafana + Loki + Promtail**. Together, these three tools give you a centralized, searchable view of all your microservice logs without changing a single line of Java code.

---

## Understanding the Three-Tool Architecture

### 🧠 What Are Grafana, Loki, and Promtail?

Think of it like a well-organized library system:

- **Promtail** is the librarian who goes to every bookshelf (container) and collects all the books (logs)
- **Loki** is the catalog system — it indexes and stores everything Promtail collects
- **Grafana** is the search terminal where you type in what you're looking for and get instant results

Why three separate tools? Because each one does its job extremely well. Grafana is already a world-class UI for observability. Loki is optimized for storing logs at scale. Promtail is a lightweight agent that efficiently scrapes logs from containers.

---

## Breaking Down the Docker Compose Configuration

### 🧠 How Does This Setup Work?

Grafana's official documentation provides three YAML files you need:
1. **docker-compose.yml** — defines all the services
2. **loki-config.yml** — configures how Loki stores and processes logs
3. **promtail-local-config.yml** — tells Promtail where to find logs and where to send them

### ⚙️ The Services in the Stack

**Loki Read & Write Components:**
Loki splits into a **read** component (searches logs) and a **write** component (ingests logs). The read component exposes port `3101`, the write component exposes port `3102`. Both share the same Docker image — the difference is just the `--target` flag in the startup command.

**Promtail:**
This is the log collector. It reads logs from all Docker containers via the Docker socket and pushes them to Loki. It uses a configuration file that defines:
- Where to scrape logs from (Docker container sockets)
- How often to refresh (every 5 seconds)
- What label to assign (target label: `container`)

**Minio:**
In production, you'd store logs in AWS S3 or similar cloud storage. For local development, Minio acts as an S3-compatible object store running on your machine. It stores Loki's log data under a local `./data` directory.

**Grafana:**
The UI layer. It automatically connects to Loki using a data source configuration baked into the Docker Compose entry point.

**Gateway (Nginx):**
Acts as a reverse proxy in front of Loki's read and write components, routing requests appropriately.

---

## Understanding YAML Volumes

### 🧠 What Are Docker Volumes?

Volumes let you map a file or directory from your **host machine** into a **Docker container**. The syntax is:

```yaml
volumes:
  - ./local-path/file.yml:/container-path/file.yml
```

This means: "Take this file from my machine and make it available inside the container at this path."

For read-only volumes, you append `:ro`:
```yaml
volumes:
  - ./config.yml:/etc/promtail/config.yml:ro
```

This prevents the container from modifying the configuration file — it can only read it.

### 💡 Why Do We Need Volumes Here?

Both Loki and Promtail need configuration files to know how to behave. Instead of baking those configs into the Docker image, we mount them from outside. This makes it easy to change configurations without rebuilding images.

---

## YAML Anchors and Merge Keys

### 🧠 What Are `&` and `<<` in YAML?

Two special YAML features appear in this configuration:

- **`&variable-name`** (Ampersand) — Creates an **anchor** (think of it as a variable assignment)
- **`*variable-name`** (Asterisk) — References that anchor (like using the variable)
- **`<<:`** (Double less-than) — **Merge key** that copies the referenced anchor's content into the current location

```yaml
# Define an anchor
networks:
  loki:
    aliases:
      - loki
    <<: &loki-dns   # Assigns this block to variable loki-dns

# Use it elsewhere
networks:
  <<: *loki-dns     # Merges the content from loki-dns here
```

This keeps the YAML DRY — you define network configuration once and reuse it across multiple services.

---

## Key Configuration Files Explained

### Promtail Configuration
- Listens on HTTP port `9080` and gRPC port `0`
- Pushes logs to the gateway at port `3100`
- Scrapes all Docker container logs via the socket path
- Assigns a target label of `container` to all logs

### Loki Configuration
- Listens on port `3100`
- Uses Minio at port `9000` for storage
- Configures bucket names, access keys, and storage paths
- In production, you'd replace Minio details with cloud storage credentials

---

## ✅ Key Takeaways

- Log aggregation lets you search **all microservice logs from one UI** without touching individual containers
- **Promtail** scrapes logs, **Loki** stores/indexes them, **Grafana** provides the search UI
- Docker **volumes** map host files into containers — essential for passing configuration
- YAML **anchors** (`&`) and **merge keys** (`<<`) help avoid duplication in large Docker Compose files
- For local development, **Minio** replaces cloud storage; in production, use AWS S3 or equivalent
- The `flog` sample app in the official docs is not needed — your own microservices generate the logs

### ⚠️ Common Mistakes

- Forgetting to update volume paths when your config files aren't in the same directory as the Docker Compose file
- Not understanding that the `flog` service in the official docs is just a demo log generator — you don't need it
- Trying to set up log aggregation for local IDE development — it's meant for containerized/deployed environments

### 💡 Pro Tip

Increase the Gateway server's response timeout (e.g., from 2s to 10s) when running many containers locally. Resource constraints on your machine can cause legitimate requests to time out.
