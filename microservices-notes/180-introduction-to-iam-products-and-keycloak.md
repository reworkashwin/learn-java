# Introduction to IAM Products & Why KeyCloak

## Introduction

OAuth2 and OpenID Connect are *specifications* — they tell you **what** to build, but they don't build it for you. To actually set up an authorization server, you need a product that implements these specifications. That's where IAM (Identity & Access Management) products come in.

Let's explore the options and understand why we're choosing Keycloak.

---

## What Are IAM Products?

Big organizations like Google, GitHub, Facebook, and Twitter can afford to build their own authorization servers from scratch based on OAuth2/OIDC specs. They have dedicated security teams and virtually unlimited engineering resources.

But what about everyone else? What about startups, mid-size companies, or organizations that don't want to reinvent the wheel?

That's where **pre-built IAM products** come in — they implement OAuth2 and OpenID Connect out of the box, so you just configure and use them.

---

## The IAM Product Landscape

| Product | Type | Best For |
|---------|------|----------|
| **Keycloak** | Open source (Red Hat) | Learning, small-to-large orgs, full control |
| **Okta** | Commercial | Enterprise applications with support needs |
| **Amazon Cognito** | Cloud service (AWS) | AWS-native apps, auto-scaling identity |
| **FusionAuth** | Freemium | Developer-friendly, self-hosted option |
| **ForgeRock** | Commercial | Large enterprise identity management |
| **Spring Authorization Server** | Open-source framework | Building your own custom auth server |

### Why Not Spring Authorization Server?

Spring recently developed their own project called **Spring Authorization Server**, which lets you build a custom auth server. However, it's still relatively new and needs to mature compared to established products like Keycloak and Okta. If you need to build a custom auth server, it's worth exploring — but for most use cases, an established product is the better choice.

---

## Why Keycloak?

We're choosing Keycloak for this course because:

1. **Open source** — No license costs, perfect for learning and practice
2. **Backed by Red Hat** — Enterprise-grade quality and community support
3. **Supports all standards** — OpenID Connect, OAuth2, SAML
4. **Feature-rich** — Social login, single sign-on (SSO), user federation, and more
5. **Production-ready** — Used by real organizations in production environments
6. **Docker-friendly** — Easy to spin up as a container in our microservices stack

💡 **Pro Tip:** In interviews, if asked about your auth server choice, mention Keycloak's open-source nature, Red Hat backing, and support for standard protocols. If the interviewer asks about alternatives, being able to name Okta, Cognito, and Spring Authorization Server shows breadth of knowledge.

---

## ✅ Key Takeaways

- OAuth2 and OIDC are specifications — you need a product to implement them
- Keycloak is an open-source IAM product backed by Red Hat
- It supports OAuth2, OpenID Connect, SAML, social login, and SSO out of the box
- Alternatives include Okta (commercial), Amazon Cognito (AWS), FusionAuth, and ForgeRock
- Spring Authorization Server exists but is still maturing
- We use Keycloak because it's free, feature-rich, and easy to run in Docker
