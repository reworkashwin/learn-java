# Creating Helm Charts for Dev, QA, and Prod Environments

## Introduction

We have Helm charts for each microservice, but we don't want to install them one by one. The whole point of Helm is to deploy *everything* with a single command. That's where **environment-level charts** come in — one chart per environment (dev, QA, prod) that pulls in all microservice charts as dependencies and configures the shared settings.

---

## The Environment Chart Strategy

The architecture looks like this:

```
environments/
├── dev-env/        → deploys all microservices with dev settings
├── qa-env/         → deploys all microservices with QA settings
└── prod-env/       → deploys all microservices with prod settings
```

Each environment chart:
1. Lists **all microservice charts** as dependencies
2. Includes a **ConfigMap template** for shared environment config
3. Provides a **values.yaml** with environment-specific values

---

## Creating the Dev Environment Chart

```bash
helm create dev-env
```

Clean it out as usual (delete default templates, clear values.yaml).

### Chart.yaml — All Microservices as Dependencies

```yaml
apiVersion: v2
name: dev-env
version: 0.1.0
appVersion: 1.0.0
dependencies:
  - name: eazybank-common
    version: 0.1.0
    repository: "file://../../eazybank-common"
  - name: configserver
    version: 0.1.0
    repository: "file://../../eazybank-services/configserver"
  - name: eurekaserver
    version: 0.1.0
    repository: "file://../../eazybank-services/eurekaserver"
  - name: accounts
    version: 0.1.0
    repository: "file://../../eazybank-services/accounts"
  - name: cards
    version: 0.1.0
    repository: "file://../../eazybank-services/cards"
  - name: loans
    version: 0.1.0
    repository: "file://../../eazybank-services/loans"
  - name: gatewayserver
    version: 0.1.0
    repository: "file://../../eazybank-services/gatewayserver"
  - name: message
    version: 0.1.0
    repository: "file://../../eazybank-services/message"
```

This single chart depends on *every* microservice chart. Install this one chart, and you install everything.

### Template — Just the ConfigMap

The environment chart only needs one template: the shared ConfigMap reference.

```yaml
{{- include "common.configmap" . }}
```

No deployment or service templates here — those live in the microservice charts. The environment chart only owns the **shared configuration** that all microservices read from.

---

## values.yaml — Environment-Specific Configuration

### Dev Environment

```yaml
global:
  configMapName: eazybank-dev-configmap
  activeProfile: default
  configServerUrl: "http://configserver:8071/"
  eurekaServerUrl: "http://eurekaserver:8070/eureka/"
  keycloakUrl: "http://keycloak.default.svc.cluster.local:80"
  otelJavaAgent: "-javaagent:/opentelemetry-javaagent.jar"
  tempoUrl: "http://tempo-grafana-tempo-distributor:4317"
  otelMetricsExporter: "none"
  kafkaBrokerUrl: "kafka.default.svc.cluster.local:9092"
```

Notice the **service DNS names**. Inside Kubernetes, services are accessible via their service name as hostname. For third-party components installed via Helm (KeyCloak, Kafka, Tempo), the DNS format is typically `<service-name>.default.svc.cluster.local`.

### QA Environment

Only two changes from dev:
```yaml
global:
  configMapName: eazybank-qa-configmap
  activeProfile: qa
  # Everything else stays the same
```

### Prod Environment

```yaml
global:
  configMapName: eazybank-prod-configmap
  activeProfile: prod
  # Everything else stays the same
```

In a real production setup, you might also have different hosts, different KeyCloak URLs (pointing to a production KeyCloak instance), different Kafka clusters, etc.

---

## Compiling the Environment Charts

```bash
cd dev-env
helm dependency build
```

This compiles and packages **all** dependent charts (all microservices + common chart) into the `charts/` folder. You'll see compressed archives for every microservice.

Repeat for QA and Prod environments.

---

## The Deployment Flow

To deploy all microservices to production:
```bash
helm install eazybank prod-env
```

One command. Every microservice gets deployed with production-specific configuration. The ConfigMap is created with `prod` profile values, and every microservice reads from it.

To switch to dev:
```bash
helm install eazybank dev-env
```

Same templates, same microservice charts — different values.

---

## ✅ Key Takeaways

- **Environment charts** aggregate all microservice charts as dependencies for single-command deployment
- Each environment chart provides its own `values.yaml` with environment-specific configuration (profiles, URLs, config map names)
- The only template an environment chart needs is the **shared ConfigMap**
- Inside Kubernetes, services are accessed by their service name as hostname
- Third-party components (KeyCloak, Kafka) installed via Helm get DNS names like `<name>.default.svc.cluster.local`
- Switching environments = installing a different chart with different values

💡 **Pro Tip:** In real production, you'd likely have separate Kubernetes clusters or namespaces per environment — not just different values in the same cluster. But the Helm chart pattern remains the same.
