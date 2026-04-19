# Generating Docker Images with Service Discovery Changes

## Introduction

We've built our Eureka Server, connected all microservices to it, and verified everything works in our IDE. But microservices in the real world run in containers. So the next step is to generate fresh Docker images that include all the service discovery changes, and push them to Docker Hub.

---

## Updating the Jib Plugin for All Projects

### 🧠 Why Update Tags?

Each section of the course produces a new set of Docker images. We use **tag names** (like `s6`, `s8`, etc.) to version them. Since we're now in Section 8 with Eureka changes, all images need the `s8` tag.

### ⚙️ Steps

1. **Add Jib plugin to Eureka Server** — This is a new project, so it doesn't have the Google Jib Maven plugin yet. Copy the plugin configuration from any existing microservice's `pom.xml` and paste it into the Eureka Server's `pom.xml`.

2. **Update tag names** in all `pom.xml` files — Change from `s6` (or whatever previous section) to `s8`:
   - Config Server
   - Eureka Server
   - Accounts microservice
   - Loans microservice
   - Cards microservice

3. **Reload Maven changes** after each update.

---

## Building Docker Images

Run the same Jib command for each project:

```bash
mvn compile jib:dockerBuild
```

Do this for all five projects:
- Config Server
- Eureka Server
- Accounts
- Loans
- Cards

The order doesn't matter. Each command generates a local Docker image tagged with `s8`.

---

## Pushing to Docker Hub

Once all images are built locally, push them to your Docker Hub repository:

```bash
docker image push docker.io/<your-username>/configserver:s8
docker image push docker.io/<your-username>/eurekaserver:s8
docker image push docker.io/<your-username>/accounts:s8
docker image push docker.io/<your-username>/loans:s8
docker image push docker.io/<your-username>/cards:s8
```

After pushing, verify on Docker Hub that each repository has the new `s8` tag alongside previous versions.

---

## ✅ Key Takeaways

- Always add the Jib plugin to new projects (like Eureka Server) before trying to build Docker images
- Use consistent tag naming across all microservice images for a given section/version
- Clean up old, unused local images to save disk space
- Push all images to Docker Hub so they're available for Docker Compose and team members

## 💡 Pro Tip

Delete old section images from your local Docker after pushing them to Docker Hub. This frees up significant disk space, especially when you're iterating across many sections.
