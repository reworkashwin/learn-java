# Helm Upgrade Command

## Introduction

You've installed all your microservices into a Kubernetes cluster using Helm — great! But what happens when you need to roll out changes? Maybe you want to deploy a new Docker image, increase replicas from 1 to 5, or tweak some configuration. Previously, we saw how to do rolling updates with `kubectl`. Now it's time to learn how Helm handles upgrades — and spoiler alert, it's much more elegant.

---

## Why Do We Need `helm upgrade`?

Think about it: your microservices are live in production. A bug fix comes in, or you need to scale up. Without Helm, you'd be running multiple `kubectl` commands, editing individual deployment manifests, and hoping you don't miss anything.

With `helm upgrade`, you make your changes in the Helm chart's `values.yaml`, recompile, and run a single command. Helm figures out what changed and deploys **only those changes**. That's the beauty of it — incremental, intelligent deployments.

---

## How the Upgrade Process Works

### Step 1: Modify Your Values

Let's say you want to change the Docker image tag for your Gateway Server from `s14` to `s11` (removing security for testing purposes). You'd go into the appropriate `values.yaml` file and update the tag:

```yaml
# Before
image:
  tag: s14

# After
image:
  tag: s11
```

### Step 2: Rebuild Dependencies

Since your environment chart (like `prod-env`) depends on individual service charts, you need to recompile:

```bash
cd helm/environments/prod-env
helm dependencies build
```

This ensures the parent chart picks up your changes from the child charts.

### Step 3: Run the Upgrade

Navigate back to the `environments` folder and run:

```bash
helm upgrade easybank prod-env
```

Here:
- `easybank` is the **release name** (the name you gave during `helm install`)
- `prod-env` is the **chart name** or folder

Helm will detect what's different from the previous revision and deploy only those changes. It also bumps the **revision number** — so if this is the second deployment, you'll see `Revision: 2`.

### Step 4: Validate

Go to your Kubernetes dashboard, check the pods, look at the logs, and test your APIs. If the Gateway Server now responds without requiring authentication, your upgrade worked.

---

## A Real-World Gotcha

Here's something interesting from the demo: the instructor changed the tag to `s12` thinking it would remove security. But `s12` actually had OAuth2 changes — the correct tag was `s11`. After realizing the mistake:

1. Updated `values.yaml` again (to `s11`)
2. Ran `helm dependencies build` again
3. Ran `helm upgrade easybank prod-env` again
4. Got **Revision 3**

This is a great lesson: Helm tracks every upgrade as a new revision. Even mistakes become part of the history — which is actually useful for rollbacks (next lecture!).

---

## What Can You Upgrade?

You can change virtually anything in your Helm chart values:
- Docker image tags (deploy new versions)
- Replica counts (scale up or down)
- Environment variables
- Resource limits
- Configuration properties

Helm will diff the old and new state and apply only what's needed.

---

## ✅ Key Takeaways

- `helm upgrade <release-name> <chart>` deploys changes incrementally — Helm is smart enough to identify only what changed
- Always run `helm dependencies build` before upgrading if your chart has sub-chart dependencies
- Every upgrade creates a new **revision number**, enabling easy rollback later
- Make sure you're modifying the right values — double-check image tags and configurations before upgrading

## 💡 Pro Tip

If you want to preview what Helm would deploy without actually deploying, use:
```bash
helm upgrade --dry-run easybank prod-env
```
This renders the templates and shows you the output without making any changes to the cluster.
