# Introduction to Helm & the Problems It Solves

## Introduction

You've been writing Kubernetes manifest files for every microservice — deployment files, service files, config maps — and it's been a lot of repetitive work. Now imagine you have 50 microservices. Each one needs its own set of manifest files. Your DevOps team has to manually `kubectl apply` and `kubectl delete` each of them. That's a maintenance nightmare.

This is exactly the problem **Helm** was built to solve. If Kubernetes is your operating system for containers, Helm is the **package manager** that makes installing, upgrading, and managing applications on it effortless.

---

## What Is Helm?

Helm is a **package manager for Kubernetes** — similar to how `pip` manages Python packages, or `npm` manages JavaScript libraries. Just as you'd run `npm install react` to set up React, you can use Helm to deploy an entire application stack into Kubernetes with a single command.

### Why does Kubernetes need a package manager?

Without Helm, you're managing raw YAML files for every Kubernetes object — one for each deployment, service, config map — for every single microservice. That's fine for 3 services. For 50? It becomes unmanageable.

Helm solves this by introducing a packaging format called **Charts**.

---

## What Is a Helm Chart?

A Helm Chart is a **collection of files** that describes a related set of Kubernetes resources. Think of it as a bundle — you can package all 50 of your microservices' manifest files into a single chart.

### The key insight: charts can have dependencies

Just like Java classes can extend parent classes or depend on other classes, Helm charts can have **child charts** and **dependent charts**. If your microservices depend on Redis, Kafka, or a database, you can include those charts as dependencies. One install command sets up *everything* — your services and all their infrastructure.

---

## The Core Problem: Repetitive Manifest Files

Let's look at the real problem Helm tackles. Say you have three microservices — Accounts, Loans, and Cards. Each needs a Kubernetes Service manifest. If you line up those three YAML files, here's what you'll notice:

The **skeleton is almost identical**. The `apiVersion`, `kind`, `spec` structure — all the same. The only things that change are a few dynamic values:
- The **metadata name** (specific to the microservice)
- The **selector app label**
- The **service type** (LoadBalancer vs ClusterIP)
- The **port and targetPort** numbers

Everything else is static boilerplate.

---

## How Helm Solves This: Templates + Values

Instead of maintaining three nearly identical files, Helm lets you create **one template** and inject the differences at runtime.

### Step 1: Create a single template file

```yaml
metadata:
  name: {{ .Values.deploymentLabel }}
spec:
  selector:
    app: {{ .Values.appLabel }}
  type: {{ .Values.serviceType }}
  ports:
    - port: {{ .Values.servicePort }}
      targetPort: {{ .Values.serviceTargetPort }}
```

The double curly braces `{{ }}` represent **dynamic values** that get injected at runtime.

### Step 2: Provide a `values.yaml` per microservice

For the Accounts microservice:
```yaml
deploymentLabel: accounts
serviceType: ClusterIP
servicePort: 8080
serviceTargetPort: 8080
```

For Loans, Cards, etc., you just provide their own `values.yaml`. The template stays the same. Helm merges the template with the values and **automatically generates** the correct Kubernetes manifest file for each microservice.

### Step 3: Deploy everything with one command

No more running `kubectl apply` for each file. Helm deploys your entire application in one shot.

---

## Three Problems Helm Solves

### 1. Packaging
Helm bundles all your Kubernetes manifest files into a single chart. That chart can be stored in a **public or private repository** and shared across teams — just like storing and sharing Java JARs or Docker images.

### 2. Easier Installation & Lifecycle Management
With Helm, you can **deploy, upgrade, rollback, or uninstall** your entire microservice application with a single command. No manual `kubectl` needed.

### 3. Version Management & Rollback
This is a big one. With raw Kubernetes, you can only rollback a *single* deployment. But what if you need to rollback your **entire cluster** to a previous working state — all microservices at once? Helm supports that. It tracks releases and lets you rollback the whole thing with one command.

---

## ✅ Key Takeaways

- Helm is a **package manager for Kubernetes**, similar to pip (Python) or npm (JavaScript)
- A Helm **Chart** packages all Kubernetes resources for your application
- Charts use **templates + values** to eliminate duplicated YAML files
- Charts can have **dependencies** on other charts (like databases, message brokers)
- Helm enables **one-command install, upgrade, rollback, and uninstall** of entire application stacks
- Helm supports **release/version management** for cluster-wide rollbacks

💡 **Pro Tip:** Even if Helm feels like extra setup upfront, the payoff is massive once you have more than a handful of microservices. The initial chart creation is a one-time effort — after that, managing deployments becomes trivial.
