# Setting Up a Local Kubernetes Cluster with Docker Desktop

## Introduction

We understand what Kubernetes is and how it works internally. Now it's time to get our hands dirty. Before deploying to the cloud (which costs money), let's set up a **local Kubernetes cluster** using Docker Desktop — it's free, fast, and works just like a production cluster.

---

## Why Not Minikube?

There's a popular tool called **Minikube** for local Kubernetes clusters, but it has a drawback — some commands differ from production Kubernetes commands. Since we want to learn commands that work in real environments, we'll use **Docker Desktop** instead. It creates a local cluster that behaves identically to a production cluster.

---

## Enabling Kubernetes in Docker Desktop

Since you already have Docker Desktop installed, this is straightforward:

1. Open **Docker Dashboard**
2. Click **Settings** (gear icon, top right)
3. Select **Kubernetes** from the left sidebar
4. Check **"Enable Kubernetes"**
5. **Do NOT** check "Show system containers" — this would clutter your `docker ps` output with Kubernetes internal containers
6. Click **"Apply & Restart"**

Docker Desktop will restart and create your cluster. This takes a few minutes.

### What Gets Created?

A **single-node cluster** — the same node acts as both the master node and worker node. This is fine for local testing since your laptop doesn't have the resources for a multi-node setup. When you deploy to the cloud later, you'll create a proper multi-node cluster.

### How to Verify?

Once Docker Desktop restarts, look at the **bottom-left** of the Docker Dashboard window. You'll see two status indicators:
- Docker engine: "Engine is running"
- Kubernetes: "Kubernetes is running"

---

## Setting Up kubectl

**kubectl** is the CLI tool for interacting with your Kubernetes cluster. Docker Desktop installs it automatically during cluster setup.

Verify it's working:

```bash
kubectl config get-contexts
```

This shows available contexts (isolated environments for interacting with clusters). You should see one called `docker-desktop`.

```bash
kubectl config get-clusters
```

This lists Kubernetes clusters running locally. You should see `docker-desktop`.

### Setting the Default Context

If you have multiple contexts (maybe from Minikube or other installations), set Docker Desktop as the default:

```bash
kubectl config use-context docker-desktop
```

### Verify the Cluster Nodes

```bash
kubectl get nodes
```

This returns one node — your local single-node cluster. In cloud environments, you'll see multiple nodes here.

---

## ✅ Key Takeaways

- Use **Docker Desktop** (not Minikube) for a local Kubernetes cluster — commands match production
- Enable Kubernetes through Docker Desktop **Settings → Kubernetes → Enable Kubernetes**
- A local cluster is a **single-node** cluster (master + worker combined)
- `kubectl` is your primary tool for interacting with Kubernetes
- Key commands: `kubectl config get-contexts`, `kubectl get nodes`, `kubectl config use-context`

---

## 💡 Pro Tip

Keep "Show system containers" **unchecked** in Docker Desktop. Otherwise, `docker ps` will show Kubernetes internal containers alongside your own containers — which creates unnecessary noise during development.
