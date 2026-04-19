# Setting Up Discovery Server in Kubernetes Using Spring Cloud Kubernetes

## Introduction

Now that we understand the theory behind server-side service discovery, how do we actually set it up? Kubernetes doesn't come with a discovery server out of the box — we need to install one. That's where **Spring Cloud Kubernetes** comes in. This project provides a pre-built Discovery Server as a Docker image that we can deploy into our cluster using a Kubernetes manifest file.

---

## Spring Cloud Kubernetes Project

The **Spring Cloud Kubernetes** project is a Spring Cloud sub-project specifically designed for Kubernetes environments. Among its features, it provides:

- A Discovery Server that monitors running services via the Kubernetes API
- Discovery Client libraries for microservices to use server-side discovery
- Integration with Spring Boot's existing discovery abstractions

The Spring Cloud Kubernetes team has published a [blog post](https://spring.io/blog) with the exact manifest file needed to set up the Discovery Server. We'll use that as our starting point — with a few important modifications.

---

## Understanding the Kubernetes Manifest File

The manifest file uses `kind: List` to create multiple Kubernetes objects in a single file. Let's walk through each one:

### 1. Service (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: spring-cloud-kubernetes-discoveryserver
  name: spring-cloud-kubernetes-discoveryserver
spec:
  ports:
    - port: 80
      targetPort: 8761
  type: ClusterIP
  selector:
    app: spring-cloud-kubernetes-discoveryserver
```

- Exposes the Discovery Server at **port 80** internally
- The actual application runs on **port 8761** (same default port as Eureka, interestingly)
- Uses **ClusterIP** — so it's only accessible within the cluster, not from outside
- No conflict with Keycloak's LoadBalancer service on port 80 since ClusterIP is internal only

### 2. ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: spring-cloud-kubernetes-discoveryserver
```

A dedicated identity for the Discovery Server to use when accessing Kubernetes APIs.

### 3. Role — `namespace-reader`

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: namespace-reader
rules:
  - apiGroups: [""]
    resources: ["services", "endpoints", "pods"]
    verbs: ["get", "list", "watch"]
```

This role grants **read-only access** to services, endpoints, and pods within the namespace.

⚠️ **Critical Fix**: The original blog post only includes `services` and `endpoints` in the resources list. You **must also add `pods`** — without it, the Discovery Server won't function correctly with current versions. This is a common pitfall if you copy directly from the blog.

### 4. RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: namespace-reader-binding
roleRef:
  kind: Role
  name: namespace-reader
  apiGroup: rbac.authorization.k8s.io
subjects:
  - kind: ServiceAccount
    name: spring-cloud-kubernetes-discoveryserver
```

Binds the `namespace-reader` role to the Discovery Server's service account.

### 5. Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-cloud-kubernetes-discoveryserver-deployment
spec:
  selector:
    matchLabels:
      app: spring-cloud-kubernetes-discoveryserver
  template:
    spec:
      serviceAccountName: spring-cloud-kubernetes-discoveryserver
      containers:
        - name: spring-cloud-kubernetes-discoveryserver
          image: springcloud/spring-cloud-kubernetes-discoveryserver:3.0.4
          imagePullPolicy: IfNotPresent
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8761
            initialDelaySeconds: 100
            periodSeconds: 30
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8761
            initialDelaySeconds: 100
            periodSeconds: 30
          ports:
            - containerPort: 8761
```

Key things to note about this deployment:

---

## Important Modifications from the Original Blog

### 1. Update the Image Tag

The blog uses an old tag (`2.1.0-M3`). Check [Docker Hub](https://hub.docker.com/r/springcloud/spring-cloud-kubernetes-discoveryserver) for the latest stable version. At the time of writing, use:

```
springcloud/spring-cloud-kubernetes-discoveryserver:3.0.4
```

### 2. Add `pods` to Role Resources

The original role only grants access to `services` and `endpoints`. Modern versions require `pods` access too.

### 3. Add Readiness and Liveness Probe Delays

Without `initialDelaySeconds`, Kubernetes checks health within 10-15 seconds of pod creation. The Discovery Server (being a Spring Boot app) won't start that fast. This causes a restart loop:

```
Pod starts → K8s checks health at 10s → App not ready → K8s restarts → repeat forever
```

The fix: set `initialDelaySeconds: 100` (or higher if needed — try 150 or 200 if 100 isn't enough). Also set `periodSeconds: 30` so health checks happen every 30 seconds instead of every 5-10 seconds.

---

## How Readiness and Liveness Probes Work in K8s Manifests

We've discussed these concepts with Docker Compose previously. In Kubernetes manifests, the format is:

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8761
  initialDelaySeconds: 100   # Wait 100s before first check
  periodSeconds: 30           # Check every 30s after that

livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8761
  initialDelaySeconds: 100
  periodSeconds: 30
```

These use Spring Boot Actuator's health endpoints — the same ones we've configured before.

---

## ✅ Key Takeaways

- Spring Cloud Kubernetes provides a pre-built Discovery Server as a Docker image — no need to build your own
- The manifest creates 5 objects: Service, ServiceAccount, Role, RoleBinding, and Deployment
- **Always add `pods` to the Role's resources** — the blog post is outdated on this point
- **Always set `initialDelaySeconds`** for probes to avoid restart loops with Spring Boot apps
- Use `3.0.4` or the latest stable tag from Docker Hub, not the old blog tag
- The service uses ClusterIP (internal only) — microservices within the cluster can reach it, but external traffic cannot

## 💡 Pro Tip

If you see your Discovery Server pod stuck in a `CrashLoopBackOff` state, check two things: (1) Are the probe delays sufficient? Try increasing `initialDelaySeconds` to 150-200. (2) Does the role include `pods` in resources?
