# Creating Helm Charts for Other Microservices

## Introduction

Once you've built the Helm chart for one microservice, creating charts for all the others is largely a copy-and-customize job. The templates stay the same — only the `values.yaml` changes per microservice. Let's walk through what's different for each one.

---

## The Fast Track: Copy and Customize

Instead of running `helm create` for each microservice, you can simply:
1. Copy the accounts chart folder
2. Rename it to the target microservice
3. Update `Chart.yaml` (change the `name`)
4. Update `values.yaml` with microservice-specific values

The `templates/` folder stays identical — those one-line references to the common chart don't change. The `charts/` folder already has the compiled common chart dependency.

---

## Cards Microservice

```yaml
# Key differences in values.yaml
deploymentName: cards-deployment
serviceName: cards
appLabel: cards
appName: cards
image:
  repository: eazybytes/cards
  tag: "s14"
containerPort: 9000
service:
  port: 9000
  targetPort: 9000
  type: ClusterIP

kafka_enabled: false    # Cards doesn't use Kafka
```

The main differences: image name, port number, and Kafka is disabled since Cards doesn't participate in event-driven messaging.

---

## Config Server

```yaml
deploymentName: configserver-deployment
serviceName: configserver
containerPort: 8071
service:
  port: 8071
  type: ClusterIP

profile_enabled: false    # Loads ALL profiles, doesn't need one activated
config_enabled: false     # It IS the config server
eureka_enabled: false     # Doesn't register with Eureka
resourceserver_enabled: false
otel_enabled: true
kafka_enabled: false
```

Why so many `false` values? The Config Server is a **foundational service**. It doesn't need to connect to itself, doesn't need a profile activated (it serves properties for all profiles), and doesn't register with Eureka.

---

## Eureka Server

```yaml
containerPort: 8070
service:
  port: 8070
  type: ClusterIP

profile_enabled: false
config_enabled: true      # Connects to Config Server for its own properties
eureka_enabled: false      # It IS the Eureka server
resourceserver_enabled: false
otel_enabled: true
kafka_enabled: false
```

Eureka connects to Config Server but doesn't need its own Eureka URL (it *is* the service registry).

---

## Gateway Server

```yaml
containerPort: 8072
service:
  type: LoadBalancer      # ← The only service exposed externally!

resourceserver_enabled: true   # ← Acts as OAuth2 resource server
```

Two critical differences:
- **LoadBalancer** service type — this is the only microservice accessible from outside the cluster
- **Resource server enabled** — Gateway validates OAuth2 tokens with KeyCloak, so it needs the KeyCloak URL

---

## Loans Microservice

```yaml
containerPort: 8090
image:
  repository: eazybytes/loans
# Nearly identical to Cards/Accounts
```

Very similar to Accounts and Cards, just different port and image.

---

## Message Microservice

```yaml
containerPort: 9010
image:
  repository: eazybytes/message

profile_enabled: false
config_enabled: false
eureka_enabled: false
otel_enabled: false
kafka_enabled: true       # Connects to Kafka broker
```

The Message microservice is built with Spring Cloud Functions and Spring Cloud Stream. It doesn't use Config Server, Eureka, or OpenTelemetry. Its only infrastructure dependency is Kafka.

---

## Recompiling Charts

If you recompile any chart, it simply replaces the existing compressed dependency:

```bash
cd loans
helm dependency build
```

But since all microservice charts use the same `eazybank-common` dependency that was already compiled for Accounts, recompilation isn't strictly necessary unless the common chart changes.

---

## ✅ Key Takeaways

- Creating charts for additional microservices is a **copy-and-customize** process
- The only file that truly changes between microservices is `values.yaml`
- Boolean flags make the common template flexible enough for all services:
  - **Config Server** disables most features (it's a foundational service)
  - **Gateway Server** enables resource server mode and uses LoadBalancer
  - **Message microservice** only needs Kafka, nothing else
- This is a **one-time setup** — once the Helm ecosystem is built, managing deployments becomes trivial

💡 **Pro Tip:** If you ever update the `eazybank-common` chart, you need to rerun `helm dependency build` in *every* dependent chart to pick up the changes. Consider scripting this if you have many microservices.
