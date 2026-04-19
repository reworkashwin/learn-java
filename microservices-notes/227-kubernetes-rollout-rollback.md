# Automatic Rollout & Rollback in Kubernetes

## Introduction

Self-healing keeps existing deployments healthy. But what about deploying **new changes**? In production, you can't just stop everything, update, and restart. You need **zero-downtime deployments** — and if something goes wrong, you need an instant **rollback**. Kubernetes handles both beautifully.

---

## Scaling Down with kubectl

Before diving into rollouts, let's cover another way to adjust replicas — via the command line instead of editing YAML:

```bash
kubectl scale deployment accounts-deployment --replicas=1
```

This immediately scales the accounts deployment to 1 replica. But remember — always update your YAML file too, otherwise the next `kubectl apply` will revert to whatever `replicas` value is in the file.

---

## Rolling Out New Changes

Let's say you want to deploy a new version of Gateway Server — switching from `s12` (with OAuth2 security) to `s11` (without security).

### Using kubectl set image

```bash
kubectl set image deployment/gatewayserver-deployment gatewayserver=eazybytes/gatewayserver:s11 --record
```

Breaking this down:
- `deployment/gatewayserver-deployment` — which deployment to update
- `gatewayserver=eazybytes/gatewayserver:s11` — container name = new image
- `--record` — records the reason for this change in rollout history

### What Happens Behind the Scenes?

1. Kubernetes creates a **new Pod** with the `s11` image
2. It waits for the new Pod to be **healthy and running**
3. **Only then** does it terminate the old Pod with the `s12` image

```bash
kubectl get pods
```

You'll see both pods briefly — the new one starting up, the old one still running. After the new pod is ready, the old pod transitions to `Terminating`.

This is the **rolling update strategy** — incremental replacement, never all-at-once. If you had 50 instances, Kubernetes would replace them gradually, ensuring continuous availability.

---

## What If the New Image Is Invalid?

Let's intentionally use a wrong image tag (`s111` — doesn't exist):

```bash
kubectl set image deployment/gatewayserver-deployment gatewayserver=eazybytes/gatewayserver:s111 --record
```

Check the pods:
```bash
kubectl get pods
```

You'll see the new pod stuck with status **`ErrImagePull`** — it can't download the image. But here's the key insight: **the old pod is still running**. Kubernetes doesn't kill working pods until the replacement is confirmed healthy. Your users experience zero impact.

---

## Rolling Back to a Previous Version

Discovered a bug in the new deployment? Roll back instantly.

### Check Rollout History

```bash
kubectl rollout history deployment/gatewayserver-deployment
```

This shows all revisions:
- **Revision 1** — original deployment (s12)
- **Revision 2** — failed deployment (s111 — invalid image)
- **Revision 3** — current deployment (s11)

### Execute the Rollback

```bash
kubectl rollout undo deployment/gatewayserver-deployment --to-revision=1
```

This rolls back to revision 1 (the s12 image). Check the pods:

```bash
kubectl get pods     # New pod created with s12, old pod terminating
```

Verify the image:
```bash
kubectl describe pod <new-pod-name>    # Image now shows s12
```

The rollback follows the same rolling update strategy — new pod starts first, old pod terminates only after the new one is healthy.

---

## Validating the Rollout and Rollback

After rolling out s11 (no security), test:
```bash
# POST to accounts via gateway — no auth needed → Success
```

After rolling back to s12 (with security), test:
```bash
# POST to accounts via gateway — no auth → 401 Unauthorized ✓
```

---

## Auto-Scaling (Brief Introduction)

Kubernetes also supports **Horizontal Pod Autoscaler (HPA)** — automatically scaling pods based on CPU/memory utilization. You define rules like "scale up if CPU usage exceeds 80%", and Kubernetes handles the rest.

This is an advanced topic typically managed by Kubernetes admins. The concept:

```
Deployment → ReplicaSet → Pods → Containers
```

- **Deployment** defines what to deploy
- **ReplicaSet** ensures the desired number of pods
- **Pods** contain the running containers
- **HPA** adjusts the ReplicaSet's desired count dynamically

---

## The Deployment → ReplicaSet → Pod → Container Relationship

Think of it as a hierarchy:
1. You give specifications via a **Deployment**
2. The Deployment creates a **ReplicaSet** based on your replica count
3. The ReplicaSet creates the specified number of **Pods**
4. Each Pod runs the actual **Container** with your microservice

---

## ✅ Key Takeaways

- **Rolling updates** replace pods incrementally — never all at once
- Kubernetes **never kills a working pod** until its replacement is healthy
- Invalid images cause new pods to fail, but **existing pods continue running** — zero impact
- Use `kubectl rollout history` to view deployment revision history
- Use `kubectl rollout undo --to-revision=N` to roll back to any previous version
- Both rollout and rollback are **zero-downtime operations**
- `--record` flag records change reasons (deprecated but still functional)
- HPA enables automatic scaling based on resource utilization

---

## ⚠️ Common Mistake

Forgetting to update the YAML file after using `kubectl scale` or `kubectl set image`. The command works immediately, but the next time you `kubectl apply` the YAML file, it'll revert to whatever values are in that file. Always keep your manifest files in sync with your cluster state.
