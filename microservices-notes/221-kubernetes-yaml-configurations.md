# Deep Dive into Kubernetes YAML Configurations

## Introduction

You have your local Kubernetes cluster running. Now, how do you actually tell Kubernetes to deploy your microservices? Through **YAML configuration files** — also called **Kubernetes manifest files**. These files describe *what* you want deployed and *how* you want it exposed. Let's break down every line.

---

## Why Not Docker Compose YAML?

Kubernetes **cannot understand** Docker Compose syntax. Kubernetes has its own format with its own rules. You need to learn this format to work with Kubernetes — but don't worry, the DevOps team usually writes these in production. As a developer, you just need to understand them.

---

## The Two Essential Objects

Every microservice deployment in Kubernetes needs two things:

1. **Deployment** — tells Kubernetes *what* to deploy and *how many* instances
2. **Service** — tells Kubernetes *how to expose* the deployed containers

Both are defined in the same YAML file, separated by `---` (triple hyphens).

---

## Part 1: The Deployment Object

Here's the structure of a Deployment configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configserver-deployment
  labels:
    app: configserver
spec:
  replicas: 1
  selector:
    matchLabels:
      app: configserver
  template:
    metadata:
      labels:
        app: configserver
    spec:
      containers:
        - name: configserver
          image: eazybytes/configserver:s14
          ports:
            - containerPort: 8071
```

Let's understand each section:

### `apiVersion` and `kind`
- `apiVersion: apps/v1` — the API version for Deployment objects
- `kind: Deployment` — must be exactly "Deployment" (not "Deploy" or anything else)

### `metadata`
- `name` — a unique name for your deployment (e.g., `configserver-deployment`)
- `labels.app` — a label used to **link** the Deployment to its Service (this is critical!)

### `spec` (Deployment level)
- `replicas: 1` — how many instances of this container to run. Change to 3 for three instances.
- `selector.matchLabels` — tells Kubernetes which pods belong to this deployment (must match the label defined in metadata)

### `template`
This is the blueprint for creating Pods. It has its own metadata (with the same label) and spec.

### `spec.containers` (Template level)
- `name` — name of the container inside the pod
- `image` — the Docker image to use (defaults to Docker Hub if no registry is specified)
- `ports.containerPort` — the port your application listens on

### Helper Containers (Sidecar Pattern)
If your application needs a helper container, add another entry under `containers`. But typically, each Pod has just one container.

---

## Part 2: The Service Object

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: configserver
spec:
  selector:
    app: configserver
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 8071
      targetPort: 8071
```

### The Triple Hyphens (`---`)
This separator tells YAML to treat everything above and below as **separate documents** within the same file. Without it, you'd need separate files for Deployment and Service.

### `kind: Service`
- `apiVersion: v1` — Service uses a different API version than Deployment
- `kind: Service` — creates a Service object

### `metadata.name`
This is **critically important** — the service name becomes the **hostname** within your Kubernetes cluster. Other microservices will use this name to communicate with your service (e.g., `configserver` at port `8071`).

### `spec.selector`
Links this Service to containers with the matching label `app: configserver`. This is how Kubernetes knows which Deployment this Service belongs to.

### `spec.type: LoadBalancer`
Exposes the service to the **outside world** — traffic from outside the Kubernetes cluster can reach it. Other types (ClusterIP, NodePort) exist and will be covered later.

### `ports`
- `protocol: TCP` — standard web communication
- `port: 8071` — the port exposed externally
- `targetPort: 8071` — the port where the container listens internally (must match `containerPort`)

---

## The Label Linking Pattern

This is the **most important concept** to understand. Labels create the connection between Deployment and Service:

1. **Deployment** defines `labels: { app: configserver }` in metadata
2. **Deployment spec** uses `matchLabels: { app: configserver }` to associate pods
3. **Template** includes the same `labels: { app: configserver }`
4. **Service** uses `selector: { app: configserver }` to find the right pods

All four places must use the **same label value**. If they don't match, your Service won't connect to your Deployment.

---

## ✅ Key Takeaways

- Kubernetes manifest files define **what** to deploy and **how** to expose it
- Two essential objects: **Deployment** (deploy containers) and **Service** (expose containers)
- Use `---` to define multiple objects in a single YAML file
- **Labels** are the glue connecting Deployments and Services — they must match everywhere
- The **Service name** becomes the hostname for internal cluster communication
- `targetPort` must match `containerPort` — they represent the same thing
- In production, DevOps writes these files — but developers must understand them

---

## ⚠️ Common Mistake

Using different label values in the Deployment metadata, the selector, and the Service selector. If they don't all match, Kubernetes can't link your Service to your containers and nothing will work correctly.
