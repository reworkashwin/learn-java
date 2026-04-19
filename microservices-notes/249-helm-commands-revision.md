# Quick Revision of Important Helm Commands

## Introduction

Before we move on to new topics, let's consolidate everything we've learned about Helm into a quick reference. These are the commands you'll use daily when managing microservices in Kubernetes. Bookmark this page — you'll come back to it.

---

## Helm Command Cheat Sheet

### 1. `helm create <chart-name>`

Creates a blank/default Helm chart with the given name.

**What it generates:**
- `Chart.yaml` — metadata about the chart
- `values.yaml` — configurable values
- `charts/` — directory for sub-chart dependencies
- `templates/` — Kubernetes manifest templates

```bash
helm create my-service
```

---

### 2. `helm dependencies build`

Compiles a Helm chart and downloads/copies all dependent charts into the `charts/` folder.

```bash
cd helm/environments/prod-env
helm dependencies build
```

Run this whenever you modify a sub-chart's values or add/remove dependencies. The parent chart won't pick up changes automatically.

---

### 3. `helm install <release-name> <chart>`

Installs a chart into the Kubernetes cluster. All deployment instructions in the chart and its dependencies are executed.

```bash
helm install easybank prod-env
```

---

### 4. `helm upgrade <release-name> <chart>`

Deploys changes to an existing release. Helm detects the diff and applies only what changed.

```bash
helm upgrade easybank prod-env
```

Always run `helm dependencies build` before upgrading if sub-charts were modified.

---

### 5. `helm history <release-name>`

Shows the complete history of installations and upgrades for a release.

```bash
helm history easybank
```

Use this to find the revision number you want to roll back to.

---

### 6. `helm rollback <release-name> [revision]`

Rolls back the entire release to a previous revision. If no revision number is provided, rolls back to the immediately previous one.

```bash
helm rollback easybank 1
```

---

### 7. `helm uninstall <release-name>`

Removes all Kubernetes resources associated with a release.

```bash
helm uninstall easybank
```

Remember: PVCs are **not** deleted automatically.

---

### 8. `helm template <chart>`

Renders all Kubernetes manifest files that Helm would use during installation — without actually installing anything. Great for debugging.

```bash
helm template prod-env
```

Use this to verify your templates render correctly before deploying.

---

### 9. `helm ls`

Lists all active releases in the cluster.

```bash
helm ls
```

---

## ✅ Key Takeaways

| Command | Purpose |
|---------|---------|
| `helm create` | Scaffold a new chart |
| `helm dependencies build` | Compile chart with dependencies |
| `helm install` | Deploy a chart to the cluster |
| `helm upgrade` | Apply changes to an existing release |
| `helm history` | View deployment history |
| `helm rollback` | Revert to a previous revision |
| `helm uninstall` | Remove all resources for a release |
| `helm template` | Preview rendered manifests (dry run) |
| `helm ls` | List all active releases |

## 💡 Pro Tip

When troubleshooting, your workflow should typically be: `helm ls` → `helm history <release>` → `helm template <chart>` → fix → `helm dependencies build` → `helm upgrade`. This sequence helps you understand the current state before making changes.
