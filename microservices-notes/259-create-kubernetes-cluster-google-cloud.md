# Create a Kubernetes Cluster in Google Cloud

## Introduction

Google Cloud account is set up, CLI is installed. Now the exciting part: actually creating a Kubernetes cluster in the cloud. Don't worry — it's surprisingly simple.

---

## Creating the Cluster

### Navigate to Kubernetes Engine

1. In the Google Cloud Console, either click "Create a GKE cluster" or search for "Kubernetes Engine" in the search box
2. First-time users need to **Enable the Kubernetes Engine API** — click the Enable button
3. You may also need to **Enable Billing** — click through that as well

### Autopilot vs. Standard Cluster

Google Cloud offers two flavors:

- **Autopilot**: Google manages everything — capacity auto-adjusts based on traffic. Easiest option but gives you less control and learning opportunity.
- **Standard**: You manage the nodes and configuration. More hands-on, more to explore.

For learning purposes, choose **"Switch to Standard Cluster"**. In production, many organizations prefer Autopilot for its simplicity.

### Configuration

You can keep most defaults:
- **Name**: `cluster-1` (or whatever you prefer)
- **Default node count**: 3 nodes
- **Estimated cost**: ~$176/month (~$0.24/hour)

Don't worry about the cost — we'll be done within an hour, and you have $300 in free credits.

Click **Create** and wait approximately 5 minutes.

---

## Exploring the Cluster

Once the green checkmark appears, your cluster is ready. Click the cluster name to explore:

### Cluster Details
- Location/zone information
- Kubernetes version
- Network configuration

### Nodes Tab
Shows your 3 nodes with:
- CPU allocation
- Memory allocation
- Disk information
- Currently running system pods (metrics agents, kube-proxy, etc.)

Google Cloud automatically installs management pods like `gke-metrics-agent` to collect cluster metrics — that's why you can see CPU/memory utilization out of the box.

### Scaling
Need more nodes? Use the "Add Node Pool" option to expand your cluster capacity.

---

## Connecting from Your Local System

This is the key step: linking your local `kubectl` to the cloud cluster.

### Get the Connection Command

1. On the clusters page, click the three dots (...) next to your cluster
2. Select **Connect**
3. Copy the `gcloud` command

### Run It Locally

```bash
gcloud container clusters get-credentials cluster-1 --zone us-central1-c --project your-project-id
```

Output: `kubeconfig entry generated for cluster-1`

### Verify the Connection

```bash
kubectl get nodes
```

You should see your 3 cloud nodes listed — confirming that your local `kubectl` is now talking to the remote Kubernetes cluster.

---

## Understanding Kubernetes Contexts

Here's something important: you now have **two** Kubernetes clusters — your local Docker Desktop one and the cloud one. How does `kubectl` know which one to talk to?

**Contexts.** Each cluster connection creates a context in your kubeconfig. The most recently connected cluster becomes the default context.

### Switching Contexts

You can switch between clusters:

- **Via Docker Desktop**: Click the Docker icon → Kubernetes → select the context
- **Via CLI**: `kubectl config use-context <context-name>`

When you switch to Docker Desktop context:
```bash
kubectl get nodes
# Returns: 1 node (your laptop)
```

When you switch to the cloud context:
```bash
kubectl get nodes
# Returns: 3 nodes (cloud cluster)
```

This means you can manage multiple clusters from a single terminal — just switch contexts as needed.

---

## ✅ Key Takeaways

- Creating a Kubernetes cluster in Google Cloud takes ~5 minutes and a few clicks
- Choose **Standard** cluster for learning (Autopilot for production simplicity)
- Use the `gcloud container clusters get-credentials` command to connect your local `kubectl` to the cloud cluster
- **Contexts** let you switch between multiple Kubernetes clusters (local and cloud)
- The cluster costs ~$0.24/hour — always delete it when done to preserve free credits
- Cloud-managed clusters come with built-in monitoring and metrics agents

## 💡 Pro Tip

Always verify which context you're in before running `kubectl` commands, especially destructive ones. Run `kubectl config current-context` to check. You don't want to accidentally deploy to production when you meant to target your local cluster.
