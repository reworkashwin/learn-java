# Install Kafka in Kubernetes Using Helm Chart

## Introduction

With KeyCloak running, the next infrastructure component to set up is **Kafka** — the message broker that powers our event-driven communication between the Accounts and Message microservices. Like KeyCloak, we'll use a Bitnami Helm chart to get Kafka running with minimal effort.

---

## A Helm Caveat: Persistent Volume Claims

Before installing Kafka, there's an important gotcha to know about.

When you `helm uninstall` a release, Helm deletes most Kubernetes resources — but it **does not delete Persistent Volume Claims (PVCs)**. This is a known limitation. If you uninstall and reinstall the same chart, leftover PVCs can cause conflicts.

To check for orphaned PVCs:
```bash
kubectl get pvc
```

To clean them up manually:
```bash
kubectl delete pvc <pvc-name>
```

Always check for leftover PVCs if a reinstallation fails unexpectedly.

---

## Customizing the Kafka Chart for Local Use

The default Bitnami Kafka chart is configured for production — 3 broker replicas, SASL security, the works. For local testing, we need to scale it down.

### 1. Reduce Replica Count

Find `replicaCount` in `values.yaml` and change it from `3` to `1`:
```yaml
replicaCount: 1    # Changed from 3 — one broker is enough locally
```

### 2. Simplify Security Protocol

Production Kafka uses `SASL_PLAINTEXT` for secure authentication. For local development, simplify to `PLAINTEXT`:

Search for all occurrences of `SASL_PLAINTEXT` in `values.yaml` and replace with `PLAINTEXT`. There will be multiple matches — change all of them (skip the ones in comments).

---

## Installing Kafka

```bash
cd kafka
helm dependency build
cd ..
helm install kafka kafka
```

The output provides the internal DNS name for connecting producers and consumers:

```
kafka.default.svc.cluster.local:9092
```

This is the broker URL configured in the environment chart's ConfigMap values:
```yaml
global:
  kafkaBrokerUrl: "kafka.default.svc.cluster.local:9092"
```

---

## Verifying the Installation

Check the Kubernetes dashboard:
- **Pods:** A Kafka pod should be running
- **Services:** Kafka services exposed as ClusterIP (internal only — no need for external access)

```bash
kubectl get pods | grep kafka
kubectl get services | grep kafka
```

---

## ✅ Key Takeaways

- Bitnami's Kafka Helm chart is production-ready by default — scale it down for local development
- Change `replicaCount` to `1` and security from `SASL_PLAINTEXT` to `PLAINTEXT` for local testing
- `helm uninstall` does **not** delete PVCs — clean them up manually with `kubectl delete pvc` before reinstalling
- Kafka's internal DNS (`kafka.default.svc.cluster.local:9092`) is used in the environment chart's ConfigMap
- Only Accounts and Message microservices need `kafka_enabled: true` in their values

⚠️ **Common Mistake:** Forgetting to replace **all** occurrences of `SASL_PLAINTEXT` in the values file. There are multiple matches — miss one and Kafka will fail to start properly.

💡 **Pro Tip:** In production, never reduce replicas or disable security. The Bitnami defaults are there for good reason — they ensure high availability and secure broker communication.
