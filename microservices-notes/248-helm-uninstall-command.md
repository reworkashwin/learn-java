# Helm Uninstall Command

## Introduction

We've seen how Helm can install an entire microservices stack with one command, upgrade it with one command, and roll it back with one command. Naturally, it can also **tear everything down** with one command. This is especially valuable for lower environments (dev, QA, staging) where you regularly spin up and shut down clusters.

---

## The Uninstall Command

### Basic Usage

```bash
helm uninstall easybank
```

That's it. Every microservice, every deployment, every service, every config map, every secret that was installed as part of the `easybank` release — gone. One command, complete cleanup.

### Checking What's Installed First

Before you start uninstalling, it's smart to see what releases exist:

```bash
helm ls
```

This lists all active Helm releases. For our setup, you might see:

| Name      | Status   |
|-----------|----------|
| easybank  | deployed |
| grafana   | deployed |
| tempo     | deployed |
| loki      | deployed |
| prometheus| deployed |
| kafka     | deployed |
| keycloak  | deployed |

### Uninstalling Everything

Since each supporting component (Grafana, Kafka, Keycloak, etc.) was installed as a separate release, you need to uninstall them individually:

```bash
helm uninstall easybank
helm uninstall grafana
helm uninstall tempo
helm uninstall loki
helm uninstall prometheus
helm uninstall kafka
helm uninstall keycloak
```

After all uninstalls, running `helm ls` returns an empty result — confirming everything is cleaned up.

---

## The Persistent Volume Claims Gotcha

Here's something critical that can bite you: **Helm does NOT delete Persistent Volume Claims (PVCs)** during uninstall.

Why does this matter? Components like Keycloak and Kafka use PVCs to store data. If you leave these PVCs around and try to reinstall later, you'll likely run into issues — stale data, configuration conflicts, unexpected behavior.

### How to Clean Up PVCs

After uninstalling, go to your Kubernetes dashboard (or use `kubectl`):

```bash
kubectl get pvc
kubectl delete pvc <pvc-name>
```

Delete all leftover PVCs manually. This ensures a truly clean slate for your next installation.

⚠️ **Common Mistake**: Forgetting to delete PVCs after uninstall. This causes mysterious failures the next time you try to install Keycloak, Kafka, or other stateful components. Whether this is a Helm bug or intentional behavior is debatable, but the workaround is always the same — manually clean up PVCs.

---

## Alternatives to Helm

Is Helm the only option for managing Kubernetes deployments? Not at all. The most notable alternative is **Kustomize**:

- **Kustomize** takes a different approach — instead of templating, it uses overlays to patch base Kubernetes manifests
- It's built directly into `kubectl` (via `kubectl apply -k`)
- Some teams prefer it for simpler setups where Helm's templating feels like overkill

Both tools are widely used in the industry. For complex microservice architectures though, Helm's packaging, versioning, and release management features often make it the preferred choice.

---

## ✅ Key Takeaways

- `helm uninstall <release-name>` removes all Kubernetes resources associated with that release
- Use `helm ls` to see all active releases before uninstalling
- Each independently installed chart needs its own `helm uninstall` command
- **Always delete Persistent Volume Claims manually** after uninstalling — Helm doesn't clean these up
- Kustomize is a viable alternative to Helm if you prefer overlay-based configuration over templating

## 💡 Pro Tip

For lower environments where you frequently tear down and rebuild, consider writing a simple shell script that chains all your `helm uninstall` commands and `kubectl delete pvc` cleanup into a single executable. Saves time and avoids forgetting steps.
