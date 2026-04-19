# Deleting the Google Cloud Kubernetes Cluster

## Introduction

You've deployed, validated, and confirmed everything works. Now comes the most important step that many beginners forget — **deleting the cluster**. Cloud resources cost money every minute they run. A forgotten Kubernetes cluster can easily generate a surprise bill. This section covers the exact steps to cleanly tear everything down.

---

## Why This Matters

Cloud Kubernetes clusters are billed by the hour. Even if you're on a free tier, there are limits. A typical GKE cluster with 3 nodes can cost **$0.30–$0.50 per hour** or more depending on node size. Leave it running overnight and you're looking at $5–$10. Leave it for a week? That's a nasty surprise.

> Think of it like leaving the lights on in a hotel room — except the hotel charges by the minute.

---

## Step 1: Uninstall All Helm Releases

Before deleting the cluster, cleanly remove all installed components using `helm uninstall`:

```bash
helm uninstall easybank
helm uninstall grafana
helm uninstall tempo
helm uninstall loki
helm uninstall prometheus
helm uninstall kafka
helm uninstall keycloak
```

Verify everything is uninstalled:

```bash
helm ls
```

If the output is empty, all releases are removed.

---

## Step 2: Delete Kubernetes Manifest Resources

For components deployed via raw Kubernetes manifests (like the Discovery Server), navigate to the folder containing your manifest files and run:

```bash
kubectl delete -f <manifest-file-name>.yml
```

This removes any resources not managed by Helm.

---

## Step 3: Verify the Cluster Is Empty

In the GKE console, check:

- **Workloads** → should be empty
- **Services & Ingress** → should be empty
- **Secrets & ConfigMaps** → deployment-related ones should be deleted

Once everything is clean, the cluster is ready to be deleted.

---

## Step 4: Delete the Cluster

1. Go to **Clusters** in the GKE console
2. Select your cluster
3. Click **Delete**
4. Enter the cluster name (e.g., `cluster-one`) as confirmation
5. Click **Delete**

The deletion takes **2–3 minutes**. Wait until the clusters page shows **no clusters** — this confirms permanent deletion.

---

## ⚠️ Common Mistakes

- **Forgetting to delete the cluster** — the #1 mistake. Always delete after you're done experimenting
- **Deleting the cluster without uninstalling Helm releases first** — while the cluster deletion will remove everything, it's good practice to uninstall cleanly
- **Not verifying deletion** — always wait and confirm the cluster is fully gone from the console
- **Assuming free tier covers everything** — free tier credits expire, and certain resources may not be covered

---

## ✅ Key Takeaways

- **Always delete your cluster** when you're done — cloud resources are billed continuously
- Uninstall in reverse order: applications first, then infrastructure components (Kafka, Keycloak)
- Use `helm ls` to verify all releases are removed
- A typical demo session costs only $0.30–$0.50 if you clean up within an hour
- The deployment process between **local Kubernetes** and **cloud Kubernetes** is identical — same commands, same Helm charts, same workflow

---

## 💡 Pro Tip

Set a phone reminder or calendar alarm when you spin up cloud clusters for learning. It's easy to get distracted and forget. Some cloud providers also let you set **billing alerts** — configure one for even a small threshold like $5 so you're notified if something is still running.
