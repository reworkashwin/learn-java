# Demo of Helm Template Command

## Introduction

You've spent time writing templates, values, and wiring up dependencies. But before you actually install anything into your cluster, wouldn't it be nice to **preview** what Kubernetes manifest files Helm will generate? That's exactly what `helm template` does — it renders all your templates locally without touching the cluster.

---

## The helm template Command

```bash
cd dev-env
helm template .
```

The dot (`.`) tells Helm to use the chart in the current directory. This command:
- Reads all templates across your chart and its dependencies
- Merges them with the values from `values.yaml`
- Outputs the **fully rendered Kubernetes manifest files**
- Does **not** apply anything to the cluster

Think of it as a dry run. You see exactly what would be deployed.

---

## What the Output Looks Like

The output is the actual Kubernetes YAML that Helm would apply. For each microservice, you'll see rendered manifests like:

```yaml
# Rendered deployment for message microservice
apiVersion: apps/v1
kind: Deployment
metadata:
  name: message-deployment
spec:
  replicas: 1
  # ... all environment variables injected based on boolean flags
```

For a setup with ~7 microservices, expect a **long output** — every deployment, service, and config map rendered with real values.

---

## Validating Across Environments

Since different environments use different values, you can validate each one:

```bash
# Dev environment
cd dev-env
helm template .
# Check: configMapName should be "eazybank-dev-configmap"

# Prod environment
cd ../prod-env
helm template .
# Check: configMapName should be "eazybank-prod-configmap"
```

This lets you confirm that environment-specific values (profiles, config map names, URLs) are being injected correctly before any real deployment.

---

## When Things Go Wrong

Template errors surface immediately with `helm template`. For example, a typo in a `values.yaml` key reference inside a template will produce an error pointing to the exact file and line.

If you fix something in the common chart, remember to **recompile all dependent charts**:

```bash
# Recompile each microservice chart
cd eazybank-services/accounts && helm dependency build
cd ../cards && helm dependency build
# ... for each microservice

# Then recompile environment charts
cd ../../environments/dev-env && helm dependency build
cd ../qa-env && helm dependency build
cd ../prod-env && helm dependency build
```

---

## ✅ Key Takeaways

- `helm template .` renders all Kubernetes manifests **without deploying** — always validate before installing
- The output shows exactly what will be applied to your cluster
- Use it to verify environment-specific values are injected correctly
- Template errors are caught at this stage, saving you from failed deployments
- After modifying the common chart, **recompile the entire dependency chain**: common → microservices → environments

⚠️ **Common Mistake:** Forgetting to recompile all dependent charts after changing the common chart. Each level of the dependency chain needs `helm dependency build` rerun.

💡 **Pro Tip:** Pipe the output to a file for easier review: `helm template . > rendered.yaml`. You can then diff between environments to spot unexpected differences.
