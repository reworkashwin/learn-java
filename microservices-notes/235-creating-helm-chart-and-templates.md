# Creating Our Own Helm Chart & Template Files

## Introduction

So far, we've installed a third-party Helm chart (WordPress). But in any real project, you won't find a ready-made chart for *your* microservices. You need to **build your own**. This is where the real power of Helm unlocks — creating a common chart with reusable templates that all your microservices can share.

---

## Creating a New Helm Chart

Helm provides a scaffolding command:

```bash
helm create eazybank-common
```

This generates a default Helm chart with sample templates for an NGINX website. Since we're building our own templates, we:
1. **Delete** all generated template files in `templates/`
2. **Clear** the contents of `values.yaml`
3. Update `Chart.yaml` with our details (keep `appVersion` as `1.0.0`)

The `charts/` folder will be empty since this common chart has no dependencies.

---

## Why a "Common" Chart?

The strategy here is clever: create one **eazybank-common** chart that holds all the shared Kubernetes manifest templates (deployment, service, config map). Individual microservice charts will then *reference* these common templates and only supply their own `values.yaml`.

This means you maintain templates in **one place** instead of copying them across every microservice.

---

## Template File 1: service.yaml

```yaml
{{- define "common.service" }}
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.serviceName }}
spec:
  selector:
    app: {{ .Values.appLabel }}
  type: {{ .Values.service.type }}
  ports:
    - name: http
      protocol: TCP
      port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
{{- end }}
```

### Key concepts here:

- **`define "common.service"`** — gives this template a name so other charts can reference it
- **Static values** like `apiVersion: v1` and `protocol: TCP` are hardcoded — they never change
- **Dynamic values** use `{{ .Values.xxx }}` syntax to pull from the consuming chart's `values.yaml`
- The **`end`** statement closes the `define` block
- Hyphens (`{{-`) trim whitespace around the template directives

---

## Template File 2: deployment.yaml

This is the more complex template. Here's the structure:

```yaml
{{- define "common.deployment" }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.deploymentName }}
  labels:
    app: {{ .Values.appLabel }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.appLabel }}
  template:
    metadata:
      labels:
        app: {{ .Values.appLabel }}
    spec:
      containers:
        - name: {{ .Values.appLabel }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.containerPort }}
              protocol: TCP
          env:
            {{- if .Values.appName_enabled }}
            - name: SPRING_APPLICATION_NAME
              value: {{ .Values.appName }}
            {{- end }}
            {{- if .Values.profile_enabled }}
            - name: SPRING_PROFILES_ACTIVE
              valueFrom:
                configMapKeyRef:
                  name: {{ .Values.global.configMapName }}
                  key: SPRING_PROFILES_ACTIVE
            {{- end }}
            # ... more conditional env vars
{{- end }}
```

### The conditional pattern

Notice the `if` blocks? Not every microservice needs every environment variable. The deployment template uses **boolean flags** to decide which env vars to include:

- `appName_enabled` — injects `SPRING_APPLICATION_NAME`
- `profile_enabled` — injects `SPRING_PROFILES_ACTIVE` from ConfigMap
- `config_enabled` — injects `SPRING_CONFIG_IMPORT`
- `eureka_enabled` — injects Eureka service URL
- `resourceserver_enabled` — injects KeyCloak URL (only for Gateway Server)
- `otel_enabled` — injects OpenTelemetry properties (Java agent, exporter endpoint, service name)
- `kafka_enabled` — injects Kafka broker URL

This way, **one template handles all microservices**. Each microservice just toggles the booleans it needs in its own `values.yaml`.

---

## Template File 3: configmap.yaml

```yaml
{{- define "common.configmap" }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.global.configMapName }}
data:
  SPRING_PROFILES_ACTIVE: {{ .Values.global.activeProfile }}
  SPRING_CONFIG_IMPORT: {{ .Values.global.configServerUrl }}
  EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: {{ .Values.global.eurekaServerUrl }}
  # ... more properties
{{- end }}
```

### The `global` prefix convention

Properties prefixed with `global.` are values shared across **all microservices** — config map name, active profile, server URLs. This isn't a Helm requirement; it's a naming convention for clarity. These values will be defined in the *environment-level* chart (dev, QA, prod), not in individual microservice charts.

### Why no hardcoded values in the ConfigMap?

Because different environments need different values. Dev might use `default` profile, QA uses `qa`, prod uses `prod`. The template stays the same — only the values change.

---

## The Common Chart's values.yaml: Empty on Purpose

The `eazybank-common` chart's `values.yaml` is **intentionally empty**. Why? Because this chart is designed to be consumed by other charts. The consuming charts provide their own values. The common chart just provides the templates.

---

## ✅ Key Takeaways

- Use `helm create <name>` to scaffold a new chart, then clean out the defaults
- A **common chart** holds reusable templates that multiple microservice charts reference
- Templates use `{{- define "name" }}` and `{{- end }}` to create named, reusable blocks
- **Conditional injection** with `{{- if .Values.flag }}` lets one template serve many microservices with different requirements
- The `global.` prefix convention distinguishes shared values from microservice-specific ones
- The common chart's `values.yaml` stays empty — consuming charts supply their own values

⚠️ **Common Mistake:** Helm uses the Go template language. Be careful with whitespace — the `-` in `{{-` and `-}}` controls whitespace trimming. Missing or extra whitespace in YAML can cause subtle deployment issues.

💡 **Pro Tip:** This "common chart as dependency" pattern is widely used in enterprise Helm setups. It enforces consistency across all microservices while keeping maintenance centralized.
