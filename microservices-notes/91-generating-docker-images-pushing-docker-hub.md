# Generating Docker Images and Pushing to Docker Hub

## Introduction

Before we can test our Docker Compose setup, we need Docker images for all microservices — including the config server. This lecture covers generating images with **Google Jib** and pushing them to **Docker Hub** for remote access.

---

## Generating Docker Images with Jib

Jib makes Docker image creation fast and simple — no Dockerfile needed. From each microservice's directory, run:

```bash
mvn compile jib:dockerBuild
```

This generates a Docker image using the configuration in `pom.xml`. Images are tagged based on the `<tag>` element in the Jib plugin config (e.g., `s6` for Section 6).

### Build Each Service

```bash
# From accounts/
mvn compile jib:dockerBuild
# → eazybytes/accounts:s6

# From cards/
mvn compile jib:dockerBuild
# → eazybytes/cards:s6

# From loans/
mvn compile jib:dockerBuild
# → eazybytes/loans:s6
```

Each build completes in under 10 seconds — Jib is remarkably fast.

### Adding Jib to Config Server

The config server didn't have the Jib plugin yet. Add it to the config server's `pom.xml` in the `<plugins>` section:

```xml
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>3.4.0</version>
    <configuration>
        <to>
            <image>eazybytes/${project.artifactId}:s6</image>
        </to>
    </configuration>
</plugin>
```

Then build:
```bash
# From configserver/
mvn compile jib:dockerBuild
# → eazybytes/configserver:s6
```

---

## Pushing to Docker Hub

Docker Hub is the remote registry where images are stored. Anyone (or any Docker Compose) can pull from there.

### Push Each Image

```bash
docker image push docker.io/eazybytes/accounts:s6
docker image push docker.io/eazybytes/loans:s6
docker image push docker.io/eazybytes/cards:s6
docker image push docker.io/eazybytes/configserver:s6
```

Ensure you're **logged in** to Docker Desktop before pushing.

### Verify on Docker Hub

On hub.docker.com, each image appears with its tags. For example, the `accounts` image might show both `s4` (from a previous section) and `s6` (current). The `configserver` image only has `s6` since it's new.

---

## Cleanup Tip

Delete old, unused Docker images from your local system to free up space. Old images from previous sections (tagged `s4`, buildpack images, etc.) are no longer needed:

```bash
docker image prune
# or manually remove via Docker Desktop
```

---

## ✅ Key Takeaways

- Use `mvn compile jib:dockerBuild` to generate Docker images without a Dockerfile
- Add the Jib Maven plugin to any new service that needs containerization
- Push images to Docker Hub with `docker image push` for remote access
- Tag images meaningfully (e.g., `s6` for section-based versioning)
- Clean up old images regularly to save local disk space
