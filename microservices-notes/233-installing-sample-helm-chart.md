# Installing a Sample Helm Chart

## Introduction

Now that Helm is installed, let's see its real power in action. Instead of building our own chart from scratch, we'll install a pre-built chart from a public repository — a full WordPress website — with a single command. This will demonstrate just how much Helm does behind the scenes.

---

## How Helm Connects to Your Cluster

You might wonder: how does Helm know which Kubernetes cluster to talk to?

Helm reads the same `~/.kube/config` file that `kubectl` uses. Whatever cluster your `kubectl` is connected to, Helm will use that same connection. No extra configuration needed.

You can verify Helm's connection:
```bash
helm ls
```

If you get an empty list (no errors), Helm is connected to your cluster.

---

## Searching for Charts

Helm has a powerful search system. The community has built charts for thousands of applications. Want to deploy WordPress?

```bash
helm search hub wordpress
```

This searches **Artifact Hub** — a centralized repository for Helm charts — and returns all WordPress-related charts from various publishers.

---

## Adding a Chart Repository

Before installing, you need to add the repository that hosts the chart. **Bitnami** is one of the most trusted publishers of production-ready Helm charts.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

---

## Installing a Chart

Now the magic. One command to deploy a complete WordPress website:

```bash
helm install happy-panda bitnami/wordpress
```

Let's break this down:
- `helm install` — the install command
- `happy-panda` — the **release name** (you choose any name)
- `bitnami/wordpress` — the **repository/chart** to install

After execution, Helm outputs instructions on how to access your new WordPress site.

### What just happened behind the scenes?

That single command created:
- A **Deployment** for the WordPress application
- A **Deployment** for MariaDB (the database)
- **Pods** for both WordPress and MariaDB
- **Services** — MariaDB as ClusterIP (internal only), WordPress as LoadBalancer (external access)
- **ConfigMaps** with environment properties
- **Secrets** containing database passwords and admin credentials
- **ReplicaSets** managing the pods

All of this was generated from the chart's templates and default values. You did zero manual YAML writing.

---

## Accessing the Application

After giving it 1-2 minutes for the LoadBalancer to be ready:

```bash
# Get the WordPress URL
http://localhost

# Admin panel
http://localhost/admin
```

To retrieve the auto-generated admin credentials:
```bash
# Username
echo "User"

# Password (from the secret)
kubectl get secret happy-panda-wordpress -o jsonpath="{.data.wordpress-password}" | base64 -d
```

---

## Where Are Charts Stored Locally?

To see where Helm stores downloaded charts:

```bash
helm env
```

Look for `HELM_CACHE_HOME` — that's where compressed chart archives are stored. If you extract the WordPress chart archive, you'll see its full file structure including templates, values, and dependent charts.

---

## ✅ Key Takeaways

- Helm uses your existing `~/.kube/config` to connect to Kubernetes — no extra setup
- `helm search hub <name>` finds charts across public repositories
- `helm repo add` registers a chart repository locally
- `helm install <release-name> <repo/chart>` deploys an entire application stack
- A single Helm install can create deployments, services, secrets, config maps, and more
- Bitnami is a widely trusted source for production-ready Helm charts

⚠️ **Common Mistake:** Don't forget to wait 1-2 minutes after installation for LoadBalancer services to get their external IPs, especially in local environments.

💡 **Pro Tip:** The release name you provide (`happy-panda` in our example) is how Helm tracks this specific installation. You'll use it later for upgrades, rollbacks, and uninstalls.
