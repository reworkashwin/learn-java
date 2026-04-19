# Deploying ConfigServer into Kubernetes Cluster

## Introduction

We've prepared the Kubernetes manifest file for our Config Server. Now let's actually deploy it and validate that everything works. This is where the theory meets practice.

---

## Verifying the Empty Cluster

Before deploying, let's confirm the default namespace is empty:

```bash
kubectl get deployments      # No resources found
kubectl get services          # Only the default Kubernetes service
kubectl get replicaset        # No resources found
kubectl get pods              # No resources found
```

You can also verify through the **Kubernetes Dashboard** under the `default` namespace.

---

## Deploying with kubectl apply

Navigate to the folder containing your manifest file and run:

```bash
kubectl apply -f configserver.yaml
```

You'll see:
```
deployment.apps/configserver-deployment created
service/configserver created
```

That's it — Kubernetes reads your YAML, creates the Deployment, provisions the Pod, starts the container, and creates the Service. All from one command.

---

## Verifying the Deployment

### Check Deployments
```bash
kubectl get deployments
```
Shows your `configserver-deployment` with `1/1` replicas — desired state matches actual state.

### Check Services
```bash
kubectl get services
```
Shows the `configserver` service with type `LoadBalancer`, cluster IP, and `localhost` as the external IP (since it's local). Exposed at port `8071`.

### Check Replica Sets
```bash
kubectl get replicaset
```
Shows the replica set maintaining 1 desired → 1 current → 1 ready.

### Check Pods
```bash
kubectl get pods
```
Shows your Pod with status `Running`.

---

## Validating Through the Dashboard

In the Kubernetes Dashboard under the `default` namespace:
- **Services** — shows `configserver` with type LoadBalancer and external endpoint `localhost:8071`
- **Deployments** — shows `configserver-deployment`
- **Pods** — click on the Pod to see details. Click **Logs** to view Spring Boot startup logs

The Logs view is invaluable for debugging — whenever your container has issues, this is where you check what's happening.

---

## Testing the Config Server

Access it through your browser:

```
http://localhost:8071/accounts/prod
```

You should see accounts microservice properties for the production and default profiles. Try other paths:

```
http://localhost:8071/loans/prod
http://localhost:8071/eurekaserver/default
```

If you see configuration properties in the response, your Config Server is successfully deployed and running inside the Kubernetes cluster.

---

## ✅ Key Takeaways

- `kubectl apply -f <file>.yaml` deploys your manifest to the cluster
- Use `kubectl get deployments/services/pods/replicaset` to verify
- The Kubernetes Dashboard provides a visual way to inspect deployments, pods, and **logs**
- When desired state matches actual state (e.g., 1/1 replicas), your deployment is healthy
- **Pod logs** are your primary debugging tool for container issues

---

## 💡 Pro Tip

Always check pod logs through the Dashboard or `kubectl logs <pod-name>` when something isn't working. Most deployment issues show up clearly in the Spring Boot startup logs — missing config, connection failures, or application errors.
