# Running Microservices with Docker Compose

## Introduction

You've written the `docker-compose.yml` file. Now comes the magic — starting all your microservices with a **single command**. No more running `docker run` three times. No more remembering port mappings. Just one command, and everything comes alive.

---

## Starting All Services: `docker compose up`

Navigate to the directory where your `docker-compose.yml` file lives, then run:

```bash
docker compose up
```

⚠️ **Common Mistake**: If you run this command from a directory that **doesn't contain** the `docker-compose.yml` file, you'll see:

```
no configuration file provided: not found
```

Always `cd` into the correct directory first.

### Running in Detached Mode

By default, `docker compose up` keeps your terminal busy with live log output. To start containers in the background:

```bash
docker compose up -d
```

The `-d` flag runs everything in **detached mode** — containers start behind the scenes, and your terminal stays free.

### Verifying Everything is Running

```bash
docker ps
```

You'll see all three containers running with their assigned names (`accounts-ms`, `loans-ms`, `cards-ms`) and their respective port mappings (8080, 8090, 9000).

In Docker Desktop, you'll see the containers grouped under a parent folder named after the directory you ran the command from.

---

## Testing the Services

With all containers running, you can hit each service's API:

- **Accounts** (port 8080): Create account → ✅ Successful response
- **Loans** (port 8090): Create loan → ✅ Successful response
- **Cards** (port 9000): Create card → ✅ Successful response

All three services started and responded successfully with a single command.

---

## Stopping All Services: `docker compose down`

Stopping is just as easy:

```bash
docker compose down
```

This command does two things:
1. **Stops** all running containers
2. **Removes** all containers

After running this, check Docker Desktop — the containers are completely gone.

💡 **Pro Tip**: If you want to stop containers **without deleting them**, use `docker compose stop` instead. But `docker compose down` is the recommended approach — always clean up containers you don't need, especially on local machines with limited resources.

---

## The Docker Compose Workflow

```
docker compose up -d    →  Creates + starts all containers
docker compose down     →  Stops + removes all containers
```

That's it. One command to start your entire microservice ecosystem. One command to tear it all down.

---

## ✅ Key Takeaways

- Run `docker compose up -d` from the directory containing `docker-compose.yml` to start all services in detached mode
- Run `docker compose down` to stop and remove all containers
- Use `docker ps` to verify running containers
- The YAML file indentation must be precise — every space matters
- The network configuration enables inter-service communication (demo coming in future sections)
