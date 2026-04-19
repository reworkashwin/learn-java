# Preparing Kubernetes Manifest Files for Remaining Microservices

## Introduction

We've deployed Config Server and created our ConfigMap. Now we need manifest files for **all remaining microservices** — Keycloak, Eureka Server, Accounts, Loans, Cards, and Gateway Server. The pattern is the same for each, with some important variations worth understanding.

---

## File Naming Convention

Each manifest file gets a **numeric prefix** to indicate the deployment order:

```
1_keycloak.yaml
2_configmaps.yaml
3_configserver.yaml
4_eurekaserver.yaml
5_accounts.yaml
6_loans.yaml
7_cards.yaml
8_gatewayserver.yaml
```

This ordering matters because microservices have dependencies — Config Server must be running before Eureka, Eureka before the business services, and business services before the Gateway.

---

## The Common Pattern

Every manifest file follows the same structure: **Deployment** + **Service**, separated by `---`. What changes between microservices is:
- Container name, image, and port
- Environment variables injected from ConfigMap
- Service name (crucial for internal communication)

---

## Keycloak Manifest — Injecting Environment Variables

Keycloak introduces a new concept: **passing environment variables from ConfigMap to a Deployment**.

```yaml
spec:
  containers:
    - name: keycloak
      image: quay.io/keycloak/keycloak:24.0.3
      args: ["start-dev"]
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
      ports:
        - containerPort: 8080
```

Key observations:
- `args: ["start-dev"]` — passes command-line arguments to the container (starts Keycloak in dev mode)
- `env` — defines environment variables, each fetching values from the ConfigMap using `configMapKeyRef`
- The `name` under `env` must match what the container expects (e.g., `KEYCLOAK_ADMIN`)
- The `key` under `configMapKeyRef` references the key in your ConfigMap

The Service exposes Keycloak at port **7080** externally, with `targetPort: 8080` (matching the container port).

---

## Image Tag Strategy — Why S12 Instead of S14?

All microservices use the Docker image tag **S12** (Section 12) instead of S14. Why?

Sections 13 and 14 introduced **event-driven microservices** with Kafka/RabbitMQ. Since we're skipping Kafka setup in this section (it'll be easier with Helm later), we use S12 images that don't require messaging infrastructure.

---

## Eureka Server Manifest

Eureka Server needs two environment variables:
1. **Application name** — fetched from `EUREKA_APP_NAME` in ConfigMap
2. **Config Server URL** — fetched from `SPRING_CONFIG_IMPORT`

```yaml
env:
  - name: SPRING_APPLICATION_NAME
    valueFrom:
      configMapKeyRef:
        name: easybank-configmap
        key: EUREKA_APP_NAME
  - name: SPRING_CONFIG_IMPORT
    valueFrom:
      configMapKeyRef:
        name: easybank-configmap
        key: SPRING_CONFIG_IMPORT
```

Notice: The `key` is `EUREKA_APP_NAME` (not `SPRING_APPLICATION_NAME`) because multiple microservices share the same environment variable name but need different values.

---

## Business Microservices (Accounts, Loans, Cards)

These follow the same pattern as Eureka Server but add one more environment variable — the **Eureka Server URL** for service registration:

```yaml
- name: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
  valueFrom:
    configMapKeyRef:
      name: easybank-configmap
      key: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
```

---

## Gateway Server Manifest

The Gateway Server adds one extra environment variable compared to business microservices — the **Keycloak URL** for OAuth2 resource server certificate validation:

```yaml
- name: SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI
  valueFrom:
    configMapKeyRef:
      name: easybank-configmap
      key: KEYCLOAK_URL
```

This points to the Keycloak instance running inside the cluster at `http://keycloak:7080/realms/master/protocol/openid-connect/certs`.

---

## ✅ Key Takeaways

- All manifest files follow the same pattern: Deployment + Service separated by `---`
- Use **numeric prefixes** in filenames to define deployment order
- Inject ConfigMap values using `env` → `valueFrom` → `configMapKeyRef`
- The `env.name` must match what the container/Spring Boot expects
- The ConfigMap `key` can be whatever you choose — use distinct keys when multiple services need different values for the same property
- Use **S12 image tags** to avoid Kafka/RabbitMQ dependencies in this section
- Gateway Server needs an additional Keycloak URL environment variable for security

---

## 💡 Pro Tip

When multiple microservices share the same environment variable name (like `SPRING_APPLICATION_NAME`) but need different values, create distinct keys in your ConfigMap (like `ACCOUNTS_APP_NAME`, `LOANS_APP_NAME`). This avoids conflicts and makes configuration explicit.
