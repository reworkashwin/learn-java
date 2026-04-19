# Installing Spring Cloud Kubernetes Discovery Server in K8s Cluster

## Introduction

We've prepared the Kubernetes manifest file for the Discovery Server. Now it's time to actually install it into our cluster. This is a one-time setup — once the Discovery Server is running, all our microservices can leverage it for server-side service discovery.

---

## Why Not Use a Helm Chart?

You might wonder: we've been using Helm for everything else — why not for the Discovery Server? Two reasons:

1. **It's a one-time setup.** You install it once and rarely touch it again. There's no need for Helm's versioning, upgrade, and rollback capabilities for something this static.
2. **No community Helm chart exists.** As of now, neither the Helm community nor Bitnami has created a Helm chart for this Discovery Server. Building one ourselves would require significant effort that isn't justified for a one-time installation.

Running the manifest file manually with `kubectl` is perfectly fine here.

---

## Installing the Discovery Server

### The Command

```bash
kubectl apply -f kubernetes-discoveryserver.yaml
```

This single command creates all five Kubernetes objects defined in the manifest:
- Service
- ServiceAccount
- RoleBinding
- Role
- Deployment

### Verifying the Installation

Check the Kubernetes dashboard or run:

```bash
kubectl get pods
```

Look for the Discovery Server pod. Open its logs and you should see Spring Boot startup messages confirming:
- The application is a Spring Boot application
- It started successfully (typically within 20 seconds)

---

## Preparing the Microservices Code

With the Discovery Server running, the next step is modifying our microservices to:

1. **Remove** all Eureka-related code and dependencies
2. **Add** Kubernetes Discovery Client dependencies
3. **Configure** services to use the Discovery Server

### What to Copy

From Section 14 (which has the latest microservice code), copy these services into the new section folder:
- Accounts
- Cards
- Config Server
- Gateway Server
- Loans
- Message

### What NOT to Copy

- **Eureka Server** — we're replacing it, so no need to carry it forward
- **Docker Compose files** — we're deploying to Kubernetes now, so Docker Compose is no longer needed

Also copy the **Helm folder** from Section 16 into the new section, as we'll need to update the Helm charts with the new configurations.

---

## ✅ Key Takeaways

- Install the Discovery Server using `kubectl apply -f` — no Helm needed for this one-time setup
- Verify installation by checking pod logs for Spring Boot startup messages
- Copy all microservices except Eureka Server for modification
- Docker Compose files are no longer needed in a Kubernetes-only deployment
- In the next lectures, we'll modify each microservice to swap Eureka for the Kubernetes Discovery Client

## 💡 Pro Tip

Keep the Discovery Server manifest file in your version control. Even though it's a one-time setup, you'll need it whenever you create a new Kubernetes cluster (different environment, disaster recovery, etc.).
