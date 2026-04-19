# Deep Dive into Kubernetes Internal Architecture

## Introduction

Before deploying microservices into Kubernetes, you need to understand what's happening under the hood. What components make up a Kubernetes cluster? How do they coordinate to deliver automated deployments, scaling, and self-healing? Let's dissect the architecture piece by piece.

---

## What Is a Kubernetes Cluster?

A **cluster** is a set of servers (or virtual machines) working together to deliver a desired outcome. A Kubernetes cluster contains various nodes that collaborate to keep your microservices running smoothly.

### Why Not Just Docker Compose?

Good question. Docker Compose deploys all containers on a **single server**. That works for development, but in production with hundreds of microservices, you can't put everything on one machine. You need a **distributed environment** with containers spread across multiple nodes. Plus, Docker Compose can't do automated deployments, rollouts, or scaling — Kubernetes can.

---

## Two Types of Nodes

Every Kubernetes cluster has two types of nodes:

1. **Master Node (Control Plane)** — controls and maintains the entire cluster
2. **Worker Nodes** — handle the actual traffic and run your microservice containers

Think of it like a project team: the master node is the manager, and the worker nodes are the developers doing the actual work.

---

## Master Node Components (Control Plane)

### 1. Kube API Server

This is the **front door** of your Kubernetes cluster. It exposes APIs that allow:
- External users to interact with the cluster via **kubectl CLI** or **Admin UI**
- Master node and worker nodes to communicate with each other

Every instruction — "deploy this microservice," "scale to 5 replicas" — goes through the API Server first.

### 2. Scheduler

Once the API Server receives instructions (e.g., "deploy accounts microservice"), it passes them to the **Scheduler**. The Scheduler's job is to figure out **which worker node** should receive the deployment.

It does this by calculating which worker node has available bandwidth, which ones are busy, and which are best suited. Once it decides, it sends the decision back through the API Server to the chosen worker node.

### 3. Controller Manager

The Controller Manager is the **guardian** of the cluster. It constantly tracks the health of containers and worker nodes, comparing the **actual state** against the **desired state**.

For example, if you've specified that 3 instances of accounts microservice should always be running, the Controller Manager continuously monitors those 3 containers. If one crashes, it immediately kills the unhealthy container and creates a new one to match the desired state.

### 4. etcd

Think of etcd as the **brain** (or database) of the Kubernetes cluster. It stores all cluster information as **key-value pairs**:
- Desired replica counts
- Deployment configurations
- Cluster state information

The Controller Manager queries etcd to know the desired state. The API Server writes to etcd when it receives new instructions. Every component relies on etcd as the source of truth.

---

## Worker Node Components

### 1. Kubelet

Kubelet is an **agent** running on every worker node. It's the communication bridge between the master node and the worker node — receiving deployment instructions through the API Server and executing them.

### 2. Container Runtime

Since all microservices run as containers, every worker node needs a **container runtime** installed. Most commonly, this is **Docker**. It provides the engine that actually runs your containers.

### 3. Pods

A **Pod** is the smallest deployable unit in Kubernetes. You don't deploy containers directly into worker nodes — instead, Kubernetes creates Pods, and containers live inside Pods.

Key rules about Pods:
- **One microservice per Pod** — accounts, loans, and cards each get their own Pod
- Pods provide **isolation** between different microservices on the same worker node
- Usually, a Pod has a **single container**

But wait — sometimes you'll see two containers in one Pod. Why? The second container is a **helper/utility container** (called a **sidecar**). It assists the main application container with tasks like logging, monitoring, or proxying. This pattern is called the **Sidecar Pattern**.

### 4. Kube Proxy

Kube Proxy handles **networking** for the worker node. It exposes containers to:
- The outside world (external traffic)
- Other containers within the same cluster (internal traffic)

It controls whether a container is publicly accessible or restricted to internal communication only.

---

## The Full Flow

Here's how it all works together:

1. **You** give instructions via kubectl CLI or Admin UI
2. **Kube API Server** receives the instructions
3. **Scheduler** decides which worker node should handle the deployment
4. Instructions flow back through the **API Server** to the chosen worker node's **Kubelet**
5. **Kubelet** tells the **Container Runtime** (Docker) to create a **Pod** with your container
6. **Kube Proxy** exposes the container for internal or external access
7. **Controller Manager** continuously monitors health, matching actual state to desired state
8. **etcd** stores all configuration and state data as the single source of truth

---

## Scaling the Cluster

You can have **any number** of master nodes and worker nodes. If you have a large number of worker nodes, you'll need multiple master nodes — a single master can't manage an unlimited number of workers, just like one manager can't effectively oversee an unlimited number of developers.

---

## ✅ Key Takeaways

- A Kubernetes cluster = **Master Node(s)** + **Worker Node(s)**
- Master Node (Control Plane) contains: API Server, Scheduler, Controller Manager, etcd
- Worker Nodes contain: Kubelet, Container Runtime, Pods, Kube Proxy
- **Pods** are the smallest deployable unit — one microservice per pod
- **etcd** is the brain/database of the cluster
- Controller Manager ensures **desired state = actual state** at all times
- The **Sidecar Pattern** allows helper containers alongside the main container in a Pod

---

## ⚠️ Common Mistake

Don't confuse Pods with containers. A Pod is a *wrapper* around containers. Kubernetes manages Pods, not containers directly. Always think in terms of Pods when working with Kubernetes.
