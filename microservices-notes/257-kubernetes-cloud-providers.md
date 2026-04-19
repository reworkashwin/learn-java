# Kubernetes Support by Cloud Providers

## Introduction

So far, we've deployed our microservices into a **local** Kubernetes cluster using Docker Desktop. That's great for development and learning, but real-world production deployments live in the cloud. Let's understand the landscape of cloud-based Kubernetes offerings and why we're choosing Google Cloud for our next step.

---

## Kubernetes: Anywhere and Everywhere

Kubernetes is remarkably flexible — it can run:

- **On-premises** (your own data center)
- **In third-party data centers**
- **In any cloud provider**
- **Across multiple cloud providers** (multi-cloud)

But creating and maintaining a Kubernetes cluster, especially on-premises, is **very challenging**. That's why enterprise organizations typically rely on cloud providers that handle the heavy lifting of cluster management.

---

## The Big Three Cloud Kubernetes Products

| Cloud Provider | Kubernetes Product | Full Name |
|---|---|---|
| **Google Cloud (GCP)** | **GKE** | Google Kubernetes Engine |
| **Amazon (AWS)** | **EKS** | Elastic Kubernetes Service |
| **Microsoft (Azure)** | **AKS** | Azure Kubernetes Service |

All three provide managed Kubernetes — the cloud provider handles the control plane (API server, scheduler, etc.), and you manage your workloads. The core Kubernetes concepts remain the same across all of them.

---

## Why Google Cloud (GCP)?

The course uses GCP for one simple, practical reason: **free credits**.

- GCP gives new accounts **$300 in free credits** usable within 90 days
- With GCP's free tier, you can create a Kubernetes cluster **without paying anything**
- AWS and Azure also offer some free tiers, but creating a Kubernetes cluster on those platforms typically requires payment even for new users

This means you can follow along with the entire cloud deployment section without spending your own money — as long as you're careful about resource cleanup.

---

## What Doesn't Change?

Here's the reassuring part: **everything we've learned about Kubernetes works the same in the cloud**. The `kubectl` commands, Helm charts, manifest files, Discovery Server setup — all identical. The only difference is that your cloud cluster has:

- More capacity (multiple real nodes, not a single laptop node)
- Better reliability (managed control plane)
- External accessibility (public IPs, load balancers)

If your organization uses AWS (EKS) or Azure (AKS) instead of GCP, the concepts transfer directly. Only the cloud-specific setup steps differ.

---

## ✅ Key Takeaways

- Three major cloud Kubernetes offerings: **GKE** (Google), **EKS** (Amazon), **AKS** (Azure)
- All provide managed Kubernetes with the same core concepts
- GCP is chosen for this course because it offers $300 free credits that can cover Kubernetes cluster usage
- Everything we've learned (kubectl, Helm, manifests, etc.) works the same regardless of the cloud provider
- If your organization uses a different cloud, the knowledge transfers — only the setup steps differ
