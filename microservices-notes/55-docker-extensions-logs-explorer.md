# Docker Extensions and Logs Explorer

## Introduction

Docker Desktop isn't just a container management tool — it's an extensible platform. When you're running multiple microservices, navigating to each container individually to check logs is tedious. Docker extensions solve problems like this, and **Logs Explorer** is one of the most useful ones.

---

## Docker Extensions Marketplace

Inside Docker Desktop, there's an **Add Extensions** option that gives you access to thousands of extensions. Think of it like a plugin marketplace — whenever you face a repetitive problem or time-consuming task with Docker, search for an extension first. Someone has probably already built a solution.

---

## Logs Explorer Extension

### The Problem It Solves

When you have three (or thirty) microservices running, checking logs means clicking into each container individually. That's slow. Logs Explorer aggregates all container logs into a **single view**.

### Installation

1. Open Docker Desktop → **Add Extensions**
2. Search for "log"
3. Find **Logs Explorer** (published by Docker officially)
4. Click **Install**

### How It Works

Once installed, Logs Explorer appears under the Extensions tab. It shows logs from all running containers simultaneously, with each service color-coded:

- 🔵 Accounts microservice logs in **blue**
- 🔴 Loans microservice logs in **red**
- 🟢 Cards microservice logs in **green**

### Key Features

- **Filter by container**: Select a specific service to see only its logs
- **Filter by state**: View running containers or stopped container logs
- **Search**: Full-text search across all logs
- **Log type filtering**: Filter by standard output (`stdout`) or standard error (`stderr`)

---

## ✅ Key Takeaways

- Docker Desktop has an extensions marketplace — always check for extensions before doing repetitive manual work
- **Logs Explorer** aggregates logs from all containers into a single, color-coded view
- You can filter by container, log type, and search across all logs
- It's officially published by Docker — install it for a better debugging experience
