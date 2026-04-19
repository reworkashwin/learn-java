# Understanding Helm Chart Structure

## Introduction

Every Helm chart — whether you build it yourself or pull it from a public repository — follows a **predefined structure**. Understanding this structure is essential before you start creating your own charts. Let's dissect it.

---

## The Standard Chart Structure

```
my-chart/
├── Chart.yaml          # Metadata about the chart
├── values.yaml         # Default dynamic values for templates
├── charts/             # Dependent/child charts
└── templates/          # Kubernetes manifest template files
```

That's the core. Let's break each piece down.

---

## Chart.yaml — The Chart's Identity Card

This file contains **metadata** about the Helm chart itself:

```yaml
apiVersion: v2
name: wordpress
description: WordPress is the world's most popular blogging platform
version: 17.1.4        # Version of the Helm chart
appVersion: 6.3.1      # Version of the application being deployed
dependencies:
  - name: mariadb
  - name: memcached
  - name: common
```

Two version numbers to keep straight:
- **`version`** — the Helm chart version (how the chart itself evolves)
- **`appVersion`** — the application version being deployed (e.g., WordPress 6.3.1)

The `dependencies` section lists other Helm charts this chart relies on.

---

## values.yaml — The Dynamic Values

This file holds all the **key-value pairs** that get injected into the template files at runtime.

```yaml
image:
  repository: bitnami/wordpress
  tag: 6.3.1
service:
  type: LoadBalancer
  port: 80
```

Think of `values.yaml` as the **configuration layer** that sits on top of your templates. Different environments (dev, staging, prod) can provide different values files while using the exact same templates.

---

## charts/ — Dependent Charts

This folder contains **other Helm charts** that your chart depends on. For example, the WordPress chart depends on MariaDB and Memcached. Those charts live here in compressed format.

Each dependent chart follows the same Helm chart structure — it's charts all the way down.

---

## templates/ — The Kubernetes Manifests

This is where the actual Kubernetes manifest **template files** live — deployment.yaml, service.yaml, configmap.yaml, etc.

These aren't plain Kubernetes manifests though. They contain **Go template syntax** with placeholders that reference values from `values.yaml`:

```yaml
metadata:
  name: {{ .Values.serviceName }}
spec:
  type: {{ .Values.service.type }}
```

At install time, Helm merges these templates with the values and generates the final Kubernetes manifest files.

---

## Listing and Uninstalling Releases

To see what's currently installed via Helm:

```bash
helm ls
```

Output shows the release name, namespace, revision, status, chart, and app version.

To uninstall a release and clean up all its Kubernetes resources:

```bash
helm uninstall happy-panda
```

This single command deletes **everything** the chart created — deployments, pods, services, config maps, secrets — all gone.

---

## ✅ Key Takeaways

- Every Helm chart has four core components: `Chart.yaml`, `values.yaml`, `charts/`, and `templates/`
- **Chart.yaml** holds metadata — distinguish between `version` (chart) and `appVersion` (app)
- **values.yaml** holds dynamic values that get injected into templates at runtime
- **charts/** contains dependent charts in compressed format
- **templates/** contains Kubernetes manifest template files with Go template placeholders
- `helm ls` lists installed releases; `helm uninstall <name>` removes everything cleanly

💡 **Pro Tip:** You can ignore auto-generated files like `.helmignore`, `Chart.lock`, and `values.schema.json`. They're maintained by Helm and don't require manual editing.
