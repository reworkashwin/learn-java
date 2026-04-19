# Problems with Manually Created Kubernetes Manifest Files

## Introduction

We've successfully deployed all our microservices into Kubernetes with hand-written manifest files. Job done? Not quite. This approach works for a small number of services, but it has serious scalability problems. Let's understand why — and what the solution is.

---

## Problem 1: Manifest File Explosion

For our 7 microservices, we created 8 manifest files. Manageable. But in real production with **100+ microservices**, you'd need 100+ manifest files. Creating and maintaining them is a nightmare — each file needs precise configuration with correct labels, ports, environment variables, and image tags.

One typo in one file? Your deployment breaks. Multiply that risk by 100 files.

---

## Problem 2: Sequential Deployment

Every manifest file must be applied individually:

```bash
kubectl apply -f 1_keycloak.yaml
kubectl apply -f 2_configmaps.yaml
kubectl apply -f 3_configserver.yaml
kubectl apply -f 4_eurekaserver.yaml
# ... and so on for all 100 microservices
```

There's no "apply everything in order" command. Each one runs separately, and you need to wait for dependencies to start before applying the next. With 100 services, this becomes a full-time job.

---

## Problem 3: Multiple Environments

Real organizations have multiple environments — **Dev, QA, Staging, Production**. Each environment may have different requirements:

| | Dev | QA | Production |
|---|---|---|---|
| Replicas | 1 | 3 | 10 |
| Image Tag | latest | release-candidate | v2.1.0 |
| Resources | minimal | moderate | high |

That means you need **separate manifest files per environment**. So 100 microservices × 3 environments = **300+ manifest files** to maintain. Any shared change (like an image tag update) needs to be replicated across all environments.

---

## Problem 4: Painful Uninstall

Deploying is tedious, but uninstalling is just as bad:

```bash
kubectl delete -f 8_gatewayserver.yaml
kubectl delete -f 7_cards.yaml
kubectl delete -f 6_loans.yaml
kubectl delete -f 5_accounts.yaml
kubectl delete -f 4_eurekaserver.yaml
kubectl delete -f 3_configserver.yaml
kubectl delete -f 2_configmaps.yaml
kubectl delete -f 1_keycloak.yaml
```

Every service needs its own delete command. With 100 microservices, that's 100 separate deletions — reverse-ordered to respect dependencies.

---

## The Real-World Impact

| Task | 7 Services | 100 Services |
|------|-----------|-------------|
| Create manifests | Manageable | Nightmare |
| Deploy all | 8 commands | 100+ commands |
| Per environment | 8 × 3 = 24 files | 100 × 3 = 300 files |
| Uninstall all | 8 commands | 100+ commands |
| Update image tag | Change 7 files | Change 100 files |

None of this scales. You need a better way.

---

## The Solution: Helm

**Helm** is a **package manager for Kubernetes** — just like how npm manages JavaScript packages or Maven manages Java dependencies.

What Helm provides:
- **Templates** — write manifest structure once, reuse across all services with different values
- **Charts** — package all related manifests into a single deployable unit
- **One-command install/uninstall** — deploy or remove entire applications with a single command
- **Environment-specific values** — maintain one template with different value files per environment
- **Pre-built charts** — install complex infrastructure (Kafka, Grafana, Prometheus) without writing a single manifest

Instead of managing 300 files across 3 environments, you manage a single Helm chart with 3 value files. Instead of 100 `kubectl apply` commands, you run one `helm install`.

---

## ✅ Key Takeaways

- Manual Kubernetes manifest files **don't scale** beyond a handful of services
- Key problems: too many files, sequential deployment, multi-environment duplication, painful uninstall
- Every change (even a simple image tag update) must be replicated across all files and environments
- **Helm** is the industry-standard solution — a package manager for Kubernetes
- Helm uses templates + value files to eliminate duplication
- Complex infrastructure (Kafka, Grafana, etc.) can be installed with pre-built Helm charts instead of custom manifests

---

## 💡 Pro Tip

Don't try to solve Kubernetes manifest management with shell scripts or custom automation. Helm is the industry standard for a reason — it handles templating, versioning, rollback, and dependency management out of the box. Invest time in learning Helm rather than building your own tooling.
