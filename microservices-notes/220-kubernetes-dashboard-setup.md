# Deploying the Kubernetes Dashboard UI

## Introduction

Interacting with Kubernetes via the terminal alone works, but having a **visual dashboard** makes life significantly easier. You can see the overall health of your cluster, inspect pods, view logs, and manage resources — all from a browser. Let's set up the official Kubernetes Dashboard.

---

## Step 1: Install Helm (Package Manager for Kubernetes)

The Kubernetes Dashboard is installed via **Helm** — a package manager for Kubernetes (just like npm for JavaScript or Maven for Java).

### macOS
```bash
brew install helm
```

### Windows
1. Install **Chocolatey** package manager first (from chocolatey.org)
2. Then run:
```bash
choco install kubernetes-helm
```

### Verify Installation
```bash
helm version
```

You should see the installed Helm version.

---

## Step 2: Install the Kubernetes Dashboard

Follow the commands from the official Kubernetes Dashboard docs:

1. **Add the Helm repo:**
```bash
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
```

2. **Install the Dashboard:**
```bash
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard
```

This deploys the Dashboard into your local Kubernetes cluster. Wait 2-3 minutes for the installation to complete.

3. **Expose the Dashboard:**
```bash
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy 8443:443
```

⚠️ **Don't close this terminal** — the dashboard access depends on this port-forward running.

4. Access the dashboard at: `https://localhost:8443`
   - Your browser will warn about the certificate — that's fine for local testing
   - Click "Show details" → "Visit this website"

---

## Step 3: Create a Service Account for Dashboard Access

The Dashboard needs a login token. You'll create a Service Account with admin privileges.

### Create the Service Account

Create a file called `dashboard-admin-user.yaml`:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

Apply it:
```bash
kubectl apply -f dashboard-admin-user.yaml
```

### Create a Cluster Role Binding

Create a file called `dashboard-role-binding.yaml`:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
```

Apply it:
```bash
kubectl apply -f dashboard-role-binding.yaml
```

This assigns the **cluster-admin** role to your admin-user — making it a superuser.

---

## Step 4: Generate a Login Token

### Short-lived Token
```bash
kubectl -n kubernetes-dashboard create token admin-user
```

This generates a token that expires after inactivity. You'll need to regenerate it each time.

### Long-lived Token (Recommended for Development)

Create a file called `secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: admin-user
type: kubernetes.io/service-account-token
```

Apply it:
```bash
kubectl apply -f secret.yaml
```

Get the permanent token:
```bash
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath="{.data.token}" | base64 -d
```

⚠️ Copy the token carefully — on some terminals, a `%` character appears at the end. **Don't include it.**

Save this token somewhere convenient — you'll use it every time you log into the Dashboard.

---

## Navigating the Dashboard

Once logged in, you can explore:
- **Deployments** — see all running deployments
- **Pods** — inspect individual pods and view their **logs**
- **Replica Sets** — see desired vs. actual replica counts
- **Services** — view how containers are exposed
- **Service Accounts** — manage users
- **Cluster Role Bindings** — view role assignments
- **Namespaces** — switch between isolated environments

---

## ✅ Key Takeaways

- The Kubernetes Dashboard is **not installed by default** — you set it up via Helm
- Helm is a package manager for Kubernetes, similar to npm or Maven
- Dashboard access requires a **Service Account** with appropriate roles
- Use a **long-lived token** (via Secret) to avoid regenerating tokens each time
- The Dashboard is invaluable for visualizing your cluster's health, inspecting pods, and reading logs

---

## ⚠️ Common Mistake

When copying the token from the terminal, watch out for the trailing `%` character — including it will cause an "unauthorized" error when trying to log in.
