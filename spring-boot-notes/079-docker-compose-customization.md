# Changing Docker Compose Defaults — Because You're the Boss

## Introduction

In the previous lecture, we integrated Spring Boot with Docker Compose. The framework automatically starts and stops containers when our app starts and stops. But what if you want more control? What if you want to use a different file name? Or prevent the framework from stopping containers when you shut down? Or understand the difference between `docker compose up` and `docker compose start`?

This lecture is all about **customizing the Docker Compose integration** in Spring Boot. Let's explore the important properties and understand when to use each one.

---

## Custom Compose File Name

### 🧠 The Default Behavior

By default, Spring Boot looks for a file named **`compose.yml`** in your project root directory.

### ⚙️ Overriding the Default

Want to use a different name? Use this property:

```properties
spring.docker.compose.file=jobportal-compose.yml
```

Now the framework will look for `jobportal-compose.yml` instead of `compose.yml`.

> If the specified file doesn't exist, your application **will fail to start**.

This is useful when you have **multiple compose files** for different scenarios (e.g., `compose-dev.yml`, `compose-test.yml`).

---

## Lifecycle Management — The Most Important Property

### 🧠 What is it?

This property controls **when** containers are started and stopped relative to your application:

```properties
spring.docker.compose.lifecycle-management=start-and-stop
```

### The Three Options

| Value | On App Start | On App Stop | Best For |
|-------|-------------|-------------|----------|
| `start-and-stop` | Starts containers | Stops containers | **Default — recommended for most cases** |
| `start-only` | Starts containers | Does nothing | When you want containers to keep running after app stops |
| `none` | Does nothing | Does nothing | When you manage containers manually |

### When to Use Each:

**`start-and-stop` (Default):**
- Your app starts → containers start
- Your app stops → containers stop
- Best for most development workflows

**`start-only`:**
- Your app starts → containers start
- Your app stops → containers **keep running**
- Useful when you're restarting your app frequently and don't want to wait for containers to boot up each time

**`none`:**
- Containers are managed entirely manually (via Docker Desktop or CLI)
- The Spring Boot integration is essentially disabled
- Useful when containers are shared across multiple applications

---

## Start and Stop Commands — Understanding the Docker Compose Lifecycle

### 🧠 Four Docker Compose Commands You Need to Know

Docker Compose has four key commands, and understanding their differences is crucial:

| Command | What It Does |
|---------|-------------|
| `docker compose up` | Creates containers from scratch (downloads images if needed, builds, creates, starts) |
| `docker compose start` | Starts **existing** stopped containers (doesn't create new ones) |
| `docker compose stop` | Stops running containers (containers still exist, can be restarted) |
| `docker compose down` | Stops **and deletes** containers (next run needs to recreate from scratch) |

### The Critical Difference

Think of it this way:

```
up   = Build the house and move in
start = Just walk back into an existing house

stop = Lock the door and leave (house still exists)
down = Demolish the house (need to rebuild next time)
```

### ⚙️ Configuring Start Command

```properties
spring.docker.compose.start.command=up
```

| Value | Behavior |
|-------|----------|
| `up` (default) | Creates containers from scratch if they don't exist. If they exist, starts them. |
| `start` | Only starts existing stopped containers. Fails if containers don't exist yet. |

**Recommendation:** Keep the default `up`. It handles both first-time setup (creating containers) and subsequent runs (starting existing ones) automatically.

### ⚙️ Configuring Stop Command

```properties
spring.docker.compose.stop.command=stop
```

| Value | Behavior |
|-------|----------|
| `stop` (default) | Stops containers but **keeps them** (data preserved, fast restart) |
| `down` | Stops and **deletes** containers (clean slate on next start) |

**Recommendation:** Keep the default `stop`. Using `down` means your containers are deleted every time you stop your app — you'd lose data unless you have volumes configured, and startup takes longer because containers must be recreated.

---

## Property Reference — All Docker Compose Properties

Here's a quick reference of the key properties:

```properties
# Custom compose file name (default: compose.yml)
spring.docker.compose.file=compose.yml

# Lifecycle management (default: start-and-stop)
spring.docker.compose.lifecycle-management=start-and-stop

# Command used when starting (default: up)
spring.docker.compose.start.command=up

# Command used when stopping (default: stop)
spring.docker.compose.stop.command=stop
```

To explore **all available properties**, type `spring.docker.compose` in your `application.properties` file and your IDE will autocomplete the full list.

---

## Smart Container Detection

Here's a nice behavior: if your containers are **already running** when you start your Spring Boot app, the framework is smart enough to **detect them and connect directly** — without restarting them.

This means:
- If you forgot to stop the containers from last session → no problem
- If another developer on your team already started the containers → your app connects seamlessly
- No duplicate containers, no port conflicts

---

## End-to-End Testing with the UI

With everything configured, let's verify the full stack works:

1. **Start the Spring Boot application** → Docker containers start automatically
2. **Start the UI application** (`npm run dev` or equivalent from the previous section)
3. Open `localhost:5173` → The homepage loads
4. Navigate to **Companies** → All 30 companies are displayed
5. This confirms:
   - UI ↔ Spring Boot (REST API)
   - Spring Boot ↔ MySQL (Spring Data JPA)
   - MySQL runs as a Docker container (managed by Spring Boot)

### 🛑 Shutting Down

When you're done for the day:
1. **Stop the UI app** → Press `Ctrl+C` in its terminal
2. **Stop the Spring Boot app** → Click the stop button in IntelliJ
3. Spring Boot **automatically stops the MySQL container** (thanks to `start-and-stop` lifecycle)

No manual Docker management needed!

---

## ✅ Key Takeaways

- Use `spring.docker.compose.file` to override the default `compose.yml` filename
- **Lifecycle management** controls whether containers start/stop with your app — `start-and-stop` is the default and recommended value
- `docker compose up` creates containers from scratch; `start` only starts existing ones
- `docker compose stop` preserves containers; `down` deletes them
- Keep the defaults (`up` for start, `stop` for shutdown) unless you have a specific reason to change them
- Spring Boot is smart — if containers are already running, it connects without restarting them

## ⚠️ Common Mistakes

- **Using `down` as the stop command** — Deletes containers every time, causing slow restarts and potential data loss
- **Using `start` as the start command** — Fails on first run because no containers exist yet
- **Setting lifecycle to `none`** and forgetting to manage containers manually — Your app can't connect to the database
- **Not stopping the UI app before shutting down** — Always clean up all running processes

## 💡 Pro Tips

- Keep `spring.docker.compose.stop.command=stop` (the default) — it preserves containers for faster restarts
- If you're frequently restarting your app during development, consider `start-only` for lifecycle management — containers stay running even when your app restarts
- Type `spring.docker.compose` in your `application.properties` to discover all available configuration options via IDE autocomplete
- Remember: Spring Boot + Docker Compose makes the full stack (UI → Backend → Database) manageable with just two commands: start the backend, start the frontend
