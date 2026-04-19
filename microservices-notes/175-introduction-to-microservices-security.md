# Introduction to Microservices Security

## Introduction

Welcome to the security section — Challenge #9 in our microservices journey. This is the topic every developer knows is important but often puts off. How good is your microservice architecture if *anyone* can invoke your APIs and access sensitive data?

Right now, anyone with the right URL can hit our microservices and fetch account details, loan information, or card data for *any* customer. That's a serious problem. Let's fix it.

---

## The Three Security Questions

When securing microservices, there are three fundamental questions we need to answer:

### 1. How Do We Secure from Unauthorized Users?

Currently, our microservices are wide open. Anyone can invoke the APIs by providing a mobile number and get back full account details. No credentials required, no verification of identity.

This is unacceptable in any real-world application. We need a mechanism to ensure only legitimate users or applications can access our services.

### 2. How Do We Enforce Authentication and Authorization?

These are two different things, and confusing them is a common mistake:

- **Authentication** — *Who are you?* Verifying the identity of the person or application making the request. Think of it like checking someone's ID card.
- **Authorization** — *What are you allowed to do?* After we know who you are, we determine what resources you can access. Think of it like checking if that person has clearance to enter a restricted area.

Authentication always comes first. You can't authorize someone whose identity you haven't verified.

### 3. How Do We Centralize Identity Management?

Here's a tempting but terrible idea: implement security logic individually in each microservice.

Why is this bad? Imagine you have 100 microservices. If a single security requirement changes — say, you need to add multi-factor authentication — you'd have to modify *all 100 services*. That's a maintenance nightmare.

Instead, we need a **single, centralized component** responsible for:
- Storing user and application credentials
- Handling authentication
- Managing authorization and access control

⚠️ **Common Mistake:** Implementing security logic in every individual microservice. Always centralize security into a dedicated component.

---

## The Solution Stack

To solve all three challenges, we'll use a combination of:

| Component | Purpose |
|-----------|---------|
| **OAuth2** | Security standard/specification for authorization |
| **OpenID Connect** | Protocol built on OAuth2 for authentication |
| **Keycloak** | Open-source IAM (Identity & Access Management) product to set up the auth server |
| **Spring Security** | Spring's security framework to integrate OAuth2 into our microservices |

Throughout this section, we'll use these tools together to implement a complete security solution for our microservices network.

---

## ✅ Key Takeaways

- Microservices security addresses three concerns: preventing unauthorized access, enforcing authentication + authorization, and centralizing identity management
- Authentication = "Who are you?"; Authorization = "What can you do?"
- Never implement security in each microservice individually — centralize it
- OAuth2 + OpenID Connect + Keycloak + Spring Security is the stack we'll use
- Security is not optional — it's a fundamental requirement for any production system
