# Creating Environment Variables in Kubernetes with ConfigMap

## Introduction

Before deploying the remaining microservices, we need to solve a problem: our containers depend on **environment variables** — things like the active profile, config server URL, Eureka server URL, and Keycloak credentials. In Docker Compose, we defined these directly in the YAML. In Kubernetes, we need a different mechanism — **ConfigMaps**.

---

## What Is a ConfigMap?

A **ConfigMap** is a Kubernetes object used to store **non-confidential data** as key-value pairs. Your Pods and containers can consume ConfigMap values as:
- Environment variables
- Command-line arguments
- Configuration files in a volume

Think of it as a centralized properties file for your Kubernetes cluster — define your environment variables once, and any container can reference them.

---

## ConfigMap vs Secrets

Kubernetes provides two objects for storing data:

| Feature | ConfigMap | Secret |
|---------|-----------|--------|
| **Purpose** | Non-confidential data | Sensitive data (passwords, tokens) |
| **Visibility** | Visible in plain text in Dashboard | Base64 encoded, hidden by default |
| **Use for** | URLs, application names, profile names | Passwords, API keys, certificates |

⚠️ There's a running joke in the Kubernetes community: **"Your Secrets in Kubernetes are not actually secrets."** They're merely base64 encoded — not encrypted. For true secret management in production, teams use dedicated solutions like HashiCorp Vault or cloud-native secret managers.

---

## Creating a ConfigMap Manifest

Create a file called `configmaps.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: easybank-configmap
data:
  SPRING_PROFILES_ACTIVE: "default"
  SPRING_CONFIG_IMPORT: "configserver:http://configserver:8071/"
  EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: "http://eurekaserver:8761/eureka/"
  ACCOUNTS_APP_NAME: "accounts"
  LOANS_APP_NAME: "loans"
  CARDS_APP_NAME: "cards"
  EUREKA_APP_NAME: "eurekaserver"
  CONFIGSERVER_APP_NAME: "configserver"
  GATEWAY_APP_NAME: "gatewayserver"
  KEYCLOAK_ADMIN: "admin"
  KEYCLOAK_ADMIN_PASSWORD: "admin"
  KEYCLOAK_URL: "http://keycloak:7080/realms/master/protocol/openid-connect/certs"
```

### Important Details

- **Hostnames are Service names** — `configserver`, `eurekaserver`, `keycloak` match the `metadata.name` values in your Service configurations
- **Separate key names per microservice** — instead of using `SPRING_APPLICATION_NAME` for all services, use distinct keys like `ACCOUNTS_APP_NAME`, `LOANS_APP_NAME`, etc., since each microservice needs a different value

---

## Applying the ConfigMap

```bash
kubectl apply -f configmaps.yaml
```

Output: `configmap/easybank-configmap created`

### Verify in the Dashboard

Navigate to **ConfigMaps** under the `default` namespace. Click on `easybank-configmap` to see all key-value pairs displayed in plain text.

---

## Using ConfigMap Values in Deployments

In your microservice's Deployment manifest, inject ConfigMap values as environment variables:

```yaml
env:
  - name: KEYCLOAK_ADMIN
    valueFrom:
      configMapKeyRef:
        name: easybank-configmap
        key: KEYCLOAK_ADMIN
  - name: KEYCLOAK_ADMIN_PASSWORD
    valueFrom:
      configMapKeyRef:
        name: easybank-configmap
        key: KEYCLOAK_ADMIN_PASSWORD
```

The structure:
- `name` — the environment variable name your container expects
- `valueFrom.configMapKeyRef.name` — which ConfigMap to look in
- `valueFrom.configMapKeyRef.key` — which key to fetch the value from

---

## Why Not Include Kafka/Grafana Properties?

Writing Kubernetes manifest files for infrastructure components like Kafka or Grafana from scratch is overly complicated and unnecessary. When **Helm charts** are covered in the next section, you'll see how much easier it is to set up these components. For now, we deploy only our own microservices plus Keycloak (required for API security).

---

## ✅ Key Takeaways

- **ConfigMap** stores non-confidential environment variables as key-value pairs
- **Secrets** stores sensitive data (but aren't truly secure by default — use external secret managers in production)
- Hostnames in ConfigMap values must match your **Service names** in Kubernetes
- Use `configMapKeyRef` in Deployment manifests to inject ConfigMap values into containers
- Define **separate key names** for properties that differ per microservice (like application names)

---

## ⚠️ Common Mistake

Using `SPRING_APPLICATION_NAME` as a single key in the ConfigMap when multiple microservices need different values for the same property. Create distinct keys like `ACCOUNTS_APP_NAME`, `LOANS_APP_NAME`, etc., and reference the appropriate one in each microservice's deployment.
