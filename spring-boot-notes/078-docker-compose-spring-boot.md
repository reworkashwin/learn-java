# No More Manual Docker Runs — Let Spring Boot Compose It

## Introduction

Picture this: you're done coding for the day. You stop your Spring Boot application. Then you go to Docker Desktop and manually stop the MySQL container. Next morning, you start the MySQL container first, wait for it to be ready, *then* start your Spring Boot app.

Now imagine your app depends on **five containers** — MySQL, Redis, RabbitMQ, Kafka, and Elasticsearch. Starting and stopping each one manually every day? That's a nightmare.

What if Spring Boot could **automatically start all dependent containers** when you launch your app, and **stop them all** when you shut down? That's exactly what **Spring Boot Docker Compose Support** does.

---

## The Problem — Manual Container Management

Every time a developer wants to work on the application, they have to:

1. Open Docker Desktop
2. Start the MySQL container
3. Wait for it to be healthy
4. *Then* start the Spring Boot application

And when they're done:
1. Stop the Spring Boot application
2. Go to Docker Desktop
3. Stop the MySQL container

Now multiply this by the number of containers your app depends on. As your application grows and adds more dependencies (cache, message queue, search engine), this manual process becomes **increasingly painful**.

> Wouldn't it be amazing if starting your Spring Boot app automatically started all its Docker dependencies?

---

## The Solution — Spring Boot Docker Compose Support

### 🧠 What is it?

Spring Boot has a built-in dependency that integrates your application with **Docker Compose**. When you add this dependency:

- **On startup:** Spring Boot detects your `compose.yml` file and starts all defined containers
- **On shutdown:** Spring Boot stops all those containers automatically

The developer never touches Docker Desktop manually again.

### ⚙️ Step 1: Add the Dependency

Search for **"Docker Compose Support"** on [start.spring.io](https://start.spring.io) and add it, or paste this into your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-docker-compose</artifactId>
    <scope>runtime</scope>
</dependency>
```

Don't forget to **sync Maven** after adding this.

---

## Understanding Docker Compose

### 🧠 What is Docker Compose?

Before diving into the Spring Boot integration, let's understand Docker Compose itself.

Previously, we created containers using `docker run` commands — one command per container. If your app depends on 5 services, you run 5 separate commands. That's tedious.

**Docker Compose** lets you define **all your containers in a single YAML file** and manage them with one command:

```bash
docker compose up     # Start all containers
docker compose down   # Delete all containers
docker compose start  # Start existing stopped containers
docker compose stop   # Stop containers (without deleting)
```

> Think of it as a "playlist" for containers — instead of playing songs one by one, you hit play on the entire playlist.

---

## Step 2: Create the `compose.yml` File

When Spring Boot starts with the Docker Compose dependency, it looks for a file named **`compose.yml`** in your project root directory. If it doesn't find it, the startup **fails**.

Create a file named `compose.yml` in the **root of your project** (same level as `pom.xml`):

```yaml
services:
  dbservice:
    image: mysql:latest
    container_name: jobportaldatabase
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: jobportal
    volumes:
      - ~/Desktop/jobportal-data:/var/lib/mysql
```

### 📌 Line-by-Line Breakdown

#### `services:`
The top-level key. All container definitions go under this.

#### `dbservice:`
A name for this service. You choose this — it's just a label. If you had multiple services, you'd have multiple entries here:

```yaml
services:
  dbservice:
    # MySQL config...
  cacheservice:
    # Redis config...
  messageservice:
    # RabbitMQ config...
```

#### `image: mysql:latest`
The Docker image to use. `latest` means always use the newest version. You could also pin a specific version: `mysql:8.0`.

#### `container_name: jobportaldatabase`
The name Docker will give to this container — just like `--name` in the `docker run` command.

#### `ports:`
Port mappings. This is a **list** (hence the `-` prefix in YAML):

```yaml
ports:
  - "3306:3306"     # host_port:container_port
```

Some products expose multiple ports. For example, RabbitMQ exposes:
- Port 5672 for queue functionality
- Port 15672 for the admin dashboard

In those cases, you'd list multiple port mappings.

#### `environment:`
Environment variables — same as `-e` flags in `docker run`:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: jobportal
```

#### `volumes:`
Volume mappings for data persistence:

```yaml
volumes:
  - ~/Desktop/jobportal-data:/var/lib/mysql
```

---

## YAML Syntax — Critical Rules

YAML is very **sensitive to indentation and spacing**. Getting it wrong causes cryptic errors.

### Rules to Remember:

1. **Indentation matters** — Use consistent spaces (2 spaces is standard)
2. **Colon + Space** — After every key, you need `: ` (colon followed by space)
3. **List items** use `-` (hyphen) with proper indentation
4. **Sibling properties** must be at the same indentation level

```yaml
services:                    # Level 0
  dbservice:                 # Level 1 (under services)
    image: mysql:latest      # Level 2 (under dbservice)
    container_name: jobdb    # Level 2 (same level as image)
    ports:                   # Level 2
      - "3306:3306"          # Level 3 (list item under ports)
    environment:             # Level 2
      MYSQL_ROOT_PASSWORD: x # Level 3 (under environment)
```

> 💡 **Pro Tip:** Copy this file from the GitHub repo instead of typing it manually. A single misplaced space can break everything.

---

## Step 3: See It in Action

### Before Starting

Make sure you:
1. Delete any existing MySQL container (so Spring Boot creates a fresh one)
2. Have the `compose.yml` in your project root
3. Have the Docker Compose dependency in `pom.xml`

### Start Your Application

When you start your Spring Boot app, watch the console logs:

```
Creating container jobportaldatabase...
Created
Starting...
Started
Waiting...
Healthy
```

Once the container is **Healthy**, your actual Spring Boot application starts.

### Check Docker Desktop

You'll see a container group named after your project folder (e.g., `jobportal`) with `jobportaldatabase` running inside it.

### Stop Your Application

When you stop your Spring Boot app, the framework **automatically stops the container** too. No manual intervention needed!

### Volume Magic

Since we used the **same local folder** (`~/Desktop/jobportal-data`) in our `compose.yml` as we did earlier, all the previously saved data (tables, records) is **automatically available** in the new container. No need to re-run SQL scripts!

---

## ✅ Key Takeaways

- **Spring Boot Docker Compose Support** automatically starts/stops dependent containers with your app
- Add `spring-boot-docker-compose` dependency to `pom.xml`
- Create a `compose.yml` file in the project root directory
- The YAML file defines all container dependencies (image, ports, environment, volumes)
- Multiple services can be defined under `services:` for multi-container setups
- YAML indentation is critical — copy from the repo, don't type manually
- Volumes in `compose.yml` work exactly like `-v` in `docker run`

## ⚠️ Common Mistakes

- **Missing `compose.yml`** — The app will fail to start if the file doesn't exist
- **Wrong file name** — It must be exactly `compose.yml` (not `docker-compose.yml` or `compose.yaml`)
- **YAML indentation errors** — Even one wrong space breaks the entire file
- **Forgetting to delete existing containers** before first run — May cause port conflicts

## 💡 Pro Tips

- Use the same volume path in `compose.yml` as you used in manual Docker commands to **preserve existing data**
- If containers are already running when you start your app, Spring Boot detects them and connects directly — no restart needed
- This is a `runtime` dependency, meaning it only activates when running the app — it won't affect your tests or build
