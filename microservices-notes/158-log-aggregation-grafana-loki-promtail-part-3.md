# Log Aggregation with Grafana, Loki & Promtail — Part 3 (Demo)

## Introduction

We've set up all the configuration files and Docker Compose changes. Now comes the satisfying part — **seeing it all work**. In this lecture, we run the entire stack, generate some traffic, and explore logs through Grafana's beautiful UI.

The most remarkable thing? **Not a single line of Java code was changed.** Log aggregation happens entirely at the infrastructure level.

---

## Starting the Stack

### ⚙️ Launching Everything

From the `prod` profile directory, run:

```bash
docker compose up -d
```

If you encounter YAML alignment errors (a common issue when pasting content), fix the indentation and retry. All service definitions must be at the same indentation level.

The observability containers (Minio, Loki Read/Write, Promtail, Grafana, Gateway) start very quickly because they're **lightweight** — they don't consume significant CPU or memory.

### 💡 Pro Tip: Handling Slow Startup on Low-Resource Machines

If your microservices fail health checks, increase the health check `interval` to `20s` and `retries` to `20` in the Docker Compose file. This gives containers more time to start and prove their health.

---

## Generating Test Data

Before exploring logs, we need some logs to exist. Hit a few APIs through Postman:

1. **Create** an account via the Accounts microservice
2. **Create** a card via the Cards microservice
3. **Create** a loan via the Loans microservice
4. **Fetch customer details** — this triggers cross-service calls through the Gateway

If you see timeout errors or circuit breaker fallbacks locally, just retry. Local systems running many containers will be slower than production servers.

---

## The Old Way: Manually Checking Container Logs

Without log aggregation, debugging means visiting **each container individually**:

- Open Gateway Server logs → scan
- Open Accounts logs → scan
- Open Loans logs → scan
- Open Cards logs → scan

For 100 microservices, this is an absolute nightmare. This is exactly the problem we're solving.

---

## Exploring Logs in Grafana

### ⚙️ Accessing Grafana

Open `http://localhost:3000` in your browser. Grafana's UI loads immediately.

### How Does Grafana Know About Loki?

The connection is pre-configured. Navigate to **Toggle Menu → Connections → Data Sources**, and you'll see a Loki data source already created. The URL and headers were defined in the Docker Compose file's Grafana entry point command — so the data source is **automatically provisioned** at startup.

### Searching Logs by Container

1. Click the **Explore** button
2. Under **Select Label**, choose `container` (defined in the Promtail config as the target label)
3. Under **Value**, select any container name (e.g., `accounts`)
4. Click **Run Query**

All logs from the Accounts microservice appear instantly. You can also enable **Live Streaming** to watch logs arrive in real-time (every 5 seconds).

### Searching for Specific Text

This is where Grafana really shines. Want to find only logs containing your correlation ID?

1. Select your container (e.g., Gateway Server)
2. Add a filter: **Line Contains** → paste a specific string like `easybank-correlation-id`
3. Run the query

Only matching log lines appear. You can also use:
- **Line Does Not Contain** — exclude noise
- **Case Insensitive Match** — flexible searching
- **Regex Match** — powerful pattern matching

---

## Why This Changes Everything

Consider the production scenario: you have **100 microservices**, each with multiple instances. Without log aggregation, debugging a single user request means:
- Figuring out which services were involved
- SSH-ing into each container (or accessing each log stream)
- Manually correlating timestamps

With Grafana + Loki + Promtail:
- Open Grafana
- Select the container
- Search for the specific log text
- Done.

And most importantly: **zero code changes** were required in the microservices. The aggregation happens at the Docker/infrastructure layer through Promtail automatically scraping container logs.

---

## Where Are the Logs Stored?

The logs are stored locally via Minio. Navigate to your workspace:

```
section_11/docker-compose/prod/.data/
```

Inside you'll find `loki-data` and `loki-ruler` directories. The `.data/minio` folder is mounted into the Docker container via volumes:

```yaml
volumes:
  - ./.data/minio:/data
```

In production, replace Minio configuration in `loki-config.yml` with your cloud storage credentials (AWS S3, Azure Blob, etc.) to store logs at any scale.

---

## When Do You Need This vs. Local Debugging?

This setup is for **deployed environments** — dev, staging, production. For local development:
- Use your IDE's console tab
- Set breakpoints
- Use the debugger

Don't try to set up Grafana/Loki/Promtail for local development — it's unnecessary complexity.

---

## ✅ Key Takeaways

- Log aggregation with Grafana + Loki + Promtail requires **zero code changes** in your microservices
- Promtail automatically reads all Docker container logs and sends them to Loki
- Grafana provides powerful search: by container name, text content, regex patterns
- Live streaming lets you watch logs arrive in real-time
- Logs are stored in Minio locally; in production, use cloud storage like AWS S3
- This solution is for deployed environments, not local IDE development

### ⚠️ Common Mistakes

- Expecting to use Grafana/Loki for local development — it's designed for containerized environments
- Not generating test traffic before checking Grafana — you need logs to exist first
- Panicking at timeout errors when running many containers locally — just increase timeouts

### 💡 Pro Tip

The **Logs Volume** chart in Grafana shows you when your services generated the most logs. Spikes in log volume often correlate with bursts of API traffic or error cascades — a useful signal even before you read individual log lines.
