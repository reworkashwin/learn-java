# Introduction to Kubernetes Ingress

## Introduction

We've learned how to expose microservices using Kubernetes **Service** objects — ClusterIP, NodePort, and LoadBalancer. But there's a more powerful way to manage external traffic into your cluster: **Kubernetes Ingress**. Understanding Ingress gives you an edge in interviews and in real production environments, even if setting it up isn't your job as a developer.

---

## Quick Recap: Kubernetes Service Types

Before we dive into Ingress, let's recall the service types we already know:

| Service Type | Purpose |
|---|---|
| **ClusterIP** | Internal access only — within the cluster |
| **NodePort** | Exposes on a static port on each node |
| **LoadBalancer** | Creates a public IP via cloud provider |
| **ExternalName** | Maps a service to a DNS/domain name |

### What's ExternalName?

This is one we haven't discussed yet. When your organization owns a domain name and wants to map a Kubernetes service to it, you use `ExternalName`. This lets external clients access your microservice via a friendly domain name, while Kubernetes handles forwarding to the correct pod behind the scenes.

---

## So What Is Kubernetes Ingress?

Ingress is a **separate Kubernetes concept** — it's not a service type. It's its own resource that sits in front of your services.

Think of it this way:
- **LoadBalancer** exposes **one microservice** with **one public IP**
- **Ingress** exposes **many microservices** through **one single entry point** with routing rules

If you have 5 microservices with LoadBalancer type, you get 5 different public IPs and 5 separate load balancers from your cloud provider. That's expensive and hard to manage.

Ingress gives you **one entry point** that routes traffic to the right service based on paths or hostnames.

> Sound familiar? That's exactly what **Spring Cloud Gateway** does! The difference is *who* builds and maintains it — developers (Gateway) vs. DevOps teams (Ingress).

---

## Why Should You Know About This?

As a microservices developer, you might never set up Ingress yourself. But in interviews and real-world discussions, knowing what Ingress is, how it compares to Spring Cloud Gateway, and when organizations prefer one over the other sets you apart.

Imagine this interview question: *"How do you expose your microservices externally?"*

If you only talk about LoadBalancer, you're giving a basic answer. If you understand Ingress, you can discuss trade-offs between developer-managed and infrastructure-managed approaches.

---

## ✅ Key Takeaways

- **Ingress** is a separate Kubernetes resource — not a service type
- It provides a **single entry point** to route external traffic to multiple internal services
- **LoadBalancer** gives one public IP per service; **Ingress** gives one entry point for all services
- Ingress is conceptually similar to Spring Cloud Gateway but managed at the infrastructure level
- Knowing Ingress as a developer demonstrates production awareness in interviews

---

## 💡 Pro Tip

When someone mentions "Ingress" in a microservices discussion, they're talking about the Kubernetes routing layer — not just "incoming traffic." The word has a specific meaning in the Kubernetes ecosystem, and confusing the two in an interview can hurt your credibility.
