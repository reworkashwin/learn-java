# Pushing Docker Images to Docker Hub

## Introduction

Your Docker images exist on your local machine. But that's like writing code and never pushing to GitHub — it doesn't help anyone else and it doesn't get you closer to production. In this lecture, we'll push our Docker images to **Docker Hub**, a remote repository where they can be accessed by teammates, CI/CD pipelines, or any server that needs to deploy your microservices.

---

## Why Push to a Remote Repository?

Docker images need to eventually be deployed to:
- Development servers
- QA servers
- Production servers

Just like source code lives in GitHub, Docker images live in **container registries**:

| Registry         | Provider   |
|------------------|------------|
| Docker Hub       | Docker     |
| Amazon ECR       | AWS        |
| Google GCR       | GCP        |
| Azure ACR        | Microsoft  |
| GitHub Packages  | GitHub     |

In this course, we use **Docker Hub** — the default public registry.

---

## The Push Command

```bash
docker image push docker.io/<username>/<app-name>:<tag>
```

### Pushing All Three Images

```bash
# Push Accounts
docker image push docker.io/eazybytes/accounts:s4

# Push Loans
docker image push docker.io/eazybytes/loans:s4

# Push Cards
docker image push docker.io/eazybytes/cards:s4
```

Replace `eazybytes` with **your own Docker Hub username**.

---

## Authentication — How Does Docker Know Who You Are?

You might wonder — where are the credentials? Docker CLI automatically uses the credentials from your **Docker Desktop login**. If you're logged into Docker Desktop with your account, the CLI uses those same credentials to authenticate pushes.

If you're not logged in, you'll get an **"access denied"** or **"login failed"** error. In that case:

```bash
docker login
```

Then enter your Docker Hub username and password.

> ⚠️ **Critical**: Use YOUR Docker Hub username in image names. If your images are tagged with someone else's username, you won't be able to push them.

---

## Verifying the Push

### In Docker Desktop

Go to **Images** → **Hub** tab. This shows all images in your remote Docker Hub repository with:
- Image names
- Tag names
- Push timestamps
- Image sizes

### On Docker Hub Website

Log in to [hub.docker.com](https://hub.docker.com) and you'll see your repositories:

```
eazybytes/accounts    → pushed 9 minutes ago
eazybytes/loans       → pushed 5 minutes ago
eazybytes/cards       → pushed 2 minutes ago
```

Click on any image to see:
- Available tags (e.g., `s4`)
- Visibility (public or private)
- Pull command for others to use

---

## Public vs. Private Repositories

By default, Docker Hub images are **public** — anyone can pull them without credentials.

| Visibility | Who Can Pull?    | Who Can Push?           |
|------------|------------------|-------------------------|
| Public     | Anyone           | Only authenticated owner |
| Private    | Authenticated users only | Only authenticated owner |

To change visibility: Image → Settings → Visibility Settings

> On the free plan, you can have **one private repository**. For more, you need a paid plan.

---

## Pulling Images (The Opposite of Push)

Anyone can download your public images:

```bash
docker pull eazybytes/cards:s4
```

### Demo: Delete and Re-Pull

1. Delete the Cards image locally (remove containers first if they exist)
2. Verify it's gone: `docker images` — no cards image
3. Pull from Docker Hub: `docker pull eazybytes/cards:s4`
4. Verify it's back: `docker images` — cards image restored

This proves the image is safely stored in the remote registry and can be retrieved anytime, from any machine that has Docker installed.

---

## The Push/Pull Workflow

```
Developer Machine                    Docker Hub                    Production Server
     │                                    │                              │
     │  docker image push ──────────►     │                              │
     │                                    │  ◄──────── docker pull       │
     │                                    │                              │
     ├── Build image                      ├── Store image                ├── Run container
     ├── Test locally                     ├── Version management         ├── Scale as needed
     └── Push when ready                  └── Access control             └── Serve traffic
```

---

## CI/CD Integration

In real projects, developers typically don't push manually. Instead:

1. Developer pushes **code** to GitHub
2. CI/CD tool (Jenkins, GitHub Actions) triggers a build
3. CI/CD builds the Docker image (using Jib, Buildpacks, or Dockerfile)
4. CI/CD pushes the image to Docker Hub (or ECR/GCR/ACR)
5. Deployment pipeline pulls the image and runs containers on target servers

The commands we learned are the **same commands** used in CI/CD scripts — just automated.

---

## ✅ Key Takeaways

- `docker image push` uploads local images to a remote registry (Docker Hub)
- `docker pull` downloads images from a remote registry to your local system
- Docker CLI uses **Docker Desktop credentials** for authentication
- Always use **your own username** in image names — mismatched usernames cause push failures
- Public images can be pulled by anyone; private images require authentication
- Push/pull is the foundation of Docker-based deployment workflows

---

## ⚠️ Common Mistakes

- Using someone else's Docker username in image tags → push fails with access denied
- Not being logged into Docker Desktop or CLI → authentication errors
- Trying to delete an image that has running containers → delete the container first
- Forgetting to push after building → teammates can't access the latest image

---

## 💡 Pro Tip

Adopt a consistent tagging strategy early. Using `s4` (section 4) works for learning, but in production, teams typically use:
- **Semantic versioning**: `accounts:1.2.3`
- **Git commit hash**: `accounts:a1b2c3d`
- **Branch + build number**: `accounts:main-142`

A good tagging strategy makes rollbacks and debugging much easier.
