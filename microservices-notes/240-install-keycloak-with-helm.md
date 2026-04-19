# Install KeyCloak in Kubernetes Using Helm Chart

## Introduction

One of Helm's greatest strengths is its community. Products like KeyCloak, Kafka, and Grafana have ready-made Helm charts maintained by organizations like **Bitnami** (backed by VMware). These charts follow production-ready standards — saving you from writing dozens of complex Kubernetes manifest files by hand.

Let's start by installing KeyCloak, the OAuth2/OpenID Connect server our microservices depend on.

---

## Bitnami: Your Go-To Chart Repository

Bitnami maintains a massive collection of Helm charts on GitHub for nearly every popular open-source product:
- Kafka, KeyCloak, MySQL, PostgreSQL, Redis
- Grafana, Prometheus, Elasticsearch
- MongoDB, RabbitMQ, NGINX
- And many more

You can download all charts from the [Bitnami Charts GitHub repo](https://github.com/bitnami/charts) and pick the ones you need.

---

## Customizing the KeyCloak Chart

Before installing, we need two tweaks in KeyCloak's `values.yaml`:

### 1. Expose as LoadBalancer

By default, KeyCloak is deployed with `ClusterIP`. Since we need to access the admin console from our browser, change it to `LoadBalancer`:

```yaml
# In values.yaml, find service type
service:
  type: LoadBalancer    # Changed from ClusterIP
```

### 2. Set the Admin Password

By default, the chart generates a random password stored in a Kubernetes Secret. For development, set a known password:

```yaml
auth:
  adminUser: user
  adminPassword: password    # Set explicitly instead of random
```

---

## Installing KeyCloak

First, compile the chart dependencies:
```bash
cd keycloak
helm dependency build
```

Then install:
```bash
cd ..
helm install keycloak keycloak
```

Behind the scenes, this creates:
- A KeyCloak pod with the application
- A PostgreSQL pod (KeyCloak's backing database)
- Services, secrets, config maps for both
- Persistent Volume Claims for data storage

---

## Accessing KeyCloak

After 1-2 minutes for the LoadBalancer to be ready:

```
http://localhost:80
```

Log in with `user` / `password` and set up your OAuth2 client:
1. Create a client: `eazybank-callcenter-cc`
2. Enable **Client Authentication**, **Service Account Roles**
3. Disable Standard Flow and Direct Access Grants
4. Create roles: `accounts`, `cards`, `loans`
5. Assign roles to the client's service account

---

## How Microservices Find KeyCloak

When KeyCloak is installed via Helm into Kubernetes, it gets a DNS name. The Helm output tells you:

```
KeyCloak can be accessed via the following DNS name from within your cluster:
keycloak.default.svc.cluster.local:80
```

This is exactly the URL configured in the environment chart's `values.yaml`:

```yaml
global:
  keycloakUrl: "http://keycloak.default.svc.cluster.local:80"
```

Since all microservices run in the same cluster, they can reach KeyCloak at this internal DNS name.

---

## The Complexity Helm Hides

Take a look at KeyCloak's `templates/` folder — there are dozens of template files for various Kubernetes objects. Creating all of these manually would take enormous effort and deep knowledge of both Kubernetes and KeyCloak's architecture.

Helm charts also handle dependencies automatically. KeyCloak's chart includes PostgreSQL as a dependency, so the database is set up without any extra work on your part.

---

## Resource Considerations

⚠️ Installing multiple components (KeyCloak, Kafka, Grafana, Prometheus, plus your microservices) on a local machine consumes significant resources. Consider increasing Docker Desktop's allocation:

- **CPUs:** 6 (up from default 4)
- **Memory:** 12GB (up from default 8GB)

In production cloud environments, this isn't an issue.

---

## ✅ Key Takeaways

- **Bitnami** provides production-ready Helm charts for most popular open-source products
- Customize charts by modifying `values.yaml` before installation (service type, credentials, etc.)
- Always run `helm dependency build` before `helm install`
- Helm creates **everything** needed — pods, services, databases, secrets, config maps
- Internal DNS names (`<service>.default.svc.cluster.local`) are how microservices discover each other in Kubernetes
- Don't underestimate local resource requirements when running many components

⚠️ **Common Mistake:** Using port 7080 (the standalone KeyCloak default) instead of port 80 (the Helm chart's default). Update your Postman/API requests accordingly when testing.
