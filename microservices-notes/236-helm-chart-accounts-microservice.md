# Creating Helm Chart for Accounts Microservice

## Introduction

We've built the common chart with reusable templates. Now it's time to create a chart for a specific microservice — Accounts — that *consumes* those templates and provides its own values. This is the pattern every microservice in your organization will follow.

---

## Step 1: Create the Chart

```bash
cd eazybank-services
helm create accounts
```

As before, clean out the generated defaults:
- Delete all template files in `templates/`
- Clear `values.yaml`

---

## Step 2: Declare the Dependency

In `Chart.yaml`, add the dependency on the common chart:

```yaml
apiVersion: v2
name: accounts
description: Helm chart for Accounts microservice
type: application
version: 0.1.0
appVersion: 1.0.0
dependencies:
  - name: eazybank-common
    version: 0.1.0
    repository: "file://../../eazybank-common"
```

The `repository` uses a **file path** because the common chart is local. The `../..` navigates up two directories from the accounts chart folder to where `eazybank-common` lives. If the common chart were in a remote repository, you'd put a URL here instead.

---

## Step 3: Create Template References

The `templates/` folder in the accounts chart doesn't contain full templates — it just **references** the common chart's named templates.

**deployment.yaml:**
```yaml
{{- include "common.deployment" . }}
```

**service.yaml:**
```yaml
{{- include "common.service" . }}
```

That's it. Each file is a single line that says: "Use the template defined in the common chart and pass the current context (`.`) to it." The dot passes the current chart's values so the common template can access them.

---

## Step 4: Define values.yaml

This is where the real microservice-specific configuration lives:

```yaml
deploymentName: accounts-deployment
serviceName: accounts
appLabel: accounts
appName: accounts
replicaCount: 1

image:
  repository: eazybytes/accounts
  tag: "s14"

containerPort: 8080

service:
  type: ClusterIP
  port: 8080
  targetPort: 8080

# Feature toggles
appName_enabled: true
profile_enabled: true
config_enabled: true
eureka_enabled: true
resourceserver_enabled: false    # Only Gateway Server is a resource server
otel_enabled: true
kafka_enabled: true              # Accounts connects to Kafka broker
```

### Why ClusterIP?

The Accounts microservice doesn't need external access. Only the Gateway Server should be reachable from outside. Internal services communicate within the cluster using ClusterIP.

### Why `resourceserver_enabled: false`?

Only the Gateway Server acts as an OAuth2 resource server that validates tokens with KeyCloak. Accounts doesn't need the KeyCloak URL.

### Why `kafka_enabled: true`?

The Accounts microservice communicates with the Message microservice asynchronously through Kafka for event-driven patterns.

---

## Step 5: Compile the Chart

Before you can install the chart, you need to compile its dependencies:

```bash
cd accounts
helm dependency build
```

This command:
1. Compiles the accounts chart
2. Downloads/packages all dependent charts
3. Places them in the `charts/` folder as compressed archives

After this, you'll see `eazybank-common-0.1.0.tgz` in the `charts/` directory.

---

## ✅ Key Takeaways

- Microservice charts are thin — they **reference** common templates instead of duplicating them
- Template files use `{{- include "common.<type>" . }}` to delegate to the common chart
- The `values.yaml` is the only file with real substance — it contains all microservice-specific configuration
- Boolean flags (`profile_enabled`, `kafka_enabled`, etc.) control which environment variables get injected
- Always run `helm dependency build` after adding or updating chart dependencies
- Use `ClusterIP` for internal services, `LoadBalancer` only for services that need external access

⚠️ **Common Mistake:** Forgetting to run `helm dependency build` before installing. Without it, the dependent charts aren't packaged in the `charts/` folder and Helm will fail.

💡 **Pro Tip:** The `file://` repository path uses relative navigation. Count your directory levels carefully — `../..` means "go up two levels from *this* chart's folder."
