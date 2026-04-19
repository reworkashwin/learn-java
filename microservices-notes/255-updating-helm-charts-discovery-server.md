# Updating Helm Charts for Kubernetes Discovery Server Changes

## Introduction

The code changes are done, Docker images are built with the `s17` tag. But there's one more piece of the puzzle: updating the Helm charts. We need to remove all Eureka references, add Discovery Server configuration, and ensure the deployment templates inject the right environment variables. This lecture covers all the Helm chart changes — and a debugging story that highlights why thorough configuration matters.

---

## Helm Chart Changes Overview

There are four categories of changes:

1. **Remove Eureka Server chart** from dependencies
2. **Update image tags** to `s17` across all service charts
3. **Update shared templates** to use Discovery Server URL instead of Eureka Server URL
4. **Update environment-specific values** with the Discovery Server URL

---

## Step 1: Remove Eureka Server from Dependencies

In each environment's `Chart.yaml` (dev-env, prod-env, qa-env), delete the dependency entry for Eureka Server:

```yaml
# DELETE this dependency block from each environment Chart.yaml
- name: eurekaserver
  version: 0.1.0
  repository: file://../../easybank-services/eurekaserver
```

Also delete the Eureka Server folder from `easybank-services/`.

---

## Step 2: Update Image Tags

In every microservice's `values.yaml`, update the image tag:

```yaml
image:
  tag: s17    # was s14
```

For Accounts specifically, also set replicas to demonstrate load balancing:

```yaml
replicaCount: 2
```

---

## Step 3: Update the Shared ConfigMap Template

In the `easybank-common` chart's ConfigMap template, replace the Eureka Server URL with the Discovery Server URL:

```yaml
# BEFORE
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: {{ .Values.eurekaServerURL }}

# AFTER
SPRING_CLOUD_KUBERNETES_DISCOVERY_DISCOVERY-SERVER-URL: {{ .Values.discoveryServerURL }}
```

### Update the Deployment Template

In the deployment template, update the conditional injection:

```yaml
# BEFORE
{{- if .Values.eurekaEnabled }}
- name: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
  valueFrom:
    configMapKeyRef:
      name: {{ .Values.configMapName }}
      key: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
{{- end }}

# AFTER
{{- if .Values.discoveryEnabled }}
- name: SPRING_CLOUD_KUBERNETES_DISCOVERY_DISCOVERY-SERVER-URL
  valueFrom:
    configMapKeyRef:
      name: {{ .Values.configMapName }}
      key: SPRING_CLOUD_KUBERNETES_DISCOVERY_DISCOVERY-SERVER-URL
{{- end }}
```

---

## Step 4: Update values.yaml in Service Charts

In each microservice's `values.yaml`, change the boolean flag:

```yaml
# BEFORE
eurekaEnabled: true

# AFTER
discoveryEnabled: true
```

---

## Step 5: Update Environment values.yaml

In each environment's `values.yaml` (dev-env, prod-env, qa-env):

```yaml
# BEFORE
eurekaServerURL: http://eurekaserver:8070/eureka

# AFTER
discoveryServerURL: http://spring-cloud-kubernetes-discoveryserver:80
```

How do you know this URL? From the Kubernetes manifest we used to install the Discovery Server — the Service name is `spring-cloud-kubernetes-discoveryserver` and it exposes port `80`.

---

## Recompiling the Charts

After all changes, recompile every chart:

```bash
# For each service chart
cd helm/easybank-services/accounts
helm dependencies build

# Repeat for cards, configserver, gatewayserver, loans, message

# For each environment chart
cd helm/environments/dev-env
helm dependencies build
# If you get errors, delete the Chart.lock file and retry

cd helm/environments/prod-env
helm dependencies build

cd helm/environments/qa-env
helm dependencies build
```

⚠️ **Gotcha**: When you remove dependencies from `Chart.yaml`, the `Chart.lock` file may cause issues. Delete `Chart.lock` and retry if you get compilation errors.

---

## The Missing Property Debugging Story

After the first deployment attempt, the microservices failed to start with an error:

> **"Discovery Server URL not provided"**

What went wrong? The `SPRING_CLOUD_KUBERNETES_DISCOVERY_DISCOVERY-SERVER-URL` property wasn't being set. The fix required:

1. Adding the ConfigMap entry with the Discovery Server URL
2. Adding the environment variable injection in the deployment template
3. Recompiling all Helm charts

This is a great reminder: **always validate with `helm template`** before deploying:

```bash
helm template prod-env
```

This renders all manifests so you can verify environment variables, ConfigMap values, and other configurations are correct before hitting the cluster.

---

## Final Installation

After fixing the Helm charts:

```bash
# Uninstall the failed deployment
helm uninstall easybank

# Recompile and reinstall
cd helm/environments
helm install easybank prod-env
```

---

## ✅ Key Takeaways

- Remove Eureka Server from all environment `Chart.yaml` dependencies
- Update all image tags to the new version (`s17`)
- Replace `eurekaServerURL` with `discoveryServerURL` in environment values
- Replace `eurekaEnabled` with `discoveryEnabled` in service values
- Update shared templates (ConfigMap and Deployment) to use the new property names
- Delete `Chart.lock` files when removing dependencies to avoid build errors
- **Always use `helm template` to validate** before deploying — it catches configuration issues early

## ⚠️ Common Mistake

Forgetting to define the Discovery Server URL in the environment's `values.yaml`. The code changes might be perfect, but if the Helm chart doesn't inject the URL as an environment variable, the microservices won't know where the Discovery Server lives.
