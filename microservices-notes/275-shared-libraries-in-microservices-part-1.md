# Shared Libraries in Microservices — Part 1: The Problem & Approaches

## Introduction

Code duplication is the silent enemy of microservices. You'll find the same DTO classes, the same utility methods, the same error handling code copy-pasted across 10 different services. How do you handle this? Should you even try to share code? This section explores three approaches, their trade-offs, and lands on the best practice.

---

## The Problem: Duplicate Code Everywhere

Look at `ErrorResponseDto` — it's a DTO class with **identical code** in accounts, cards, and loans microservices. Three copies of the same file. When you create a fourth microservice? You copy it again.

This isn't just about DTOs. Common candidates for duplication include:
- Error response DTOs
- Utility/helper classes
- Logging configurations
- Security filters
- Audit interceptors
- Common constants

Every copy is a maintenance liability. Fix a bug in one? You have to remember to fix it in all others.

---

## Approach 1: Single Shared Maven Project

**The idea**: Create one Maven project, dump all common code into it, import it everywhere.

**Why it fails**:

Your "common" project grows into a **big fat JAR** containing utilities, security, logging, auditing, and more. If a microservice only needs the utility logic, it still has to carry security, logging, and everything else in its Docker image.

```
common.jar (10 MB)
├── utilities/
├── security/
├── logging/
├── auditing/
└── error-handling/

Microservice A: Only needs utilities → forced to carry 10 MB
```

This violates the microservices principle of keeping things lightweight and independent.

---

## Approach 2: Multiple Separate Maven Projects

**The idea**: Split common code into many small, focused libraries — `common-utils`, `common-security`, `common-logging`, etc.

**The improvement**: Microservices can pick only what they need.

**Why it's still painful**:

You end up with 20-30 separate Maven repositories. Each one needs:
- Its own versioning scheme
- Separate CI/CD pipelines
- Individual PRs for changes
- Independent publishing to a Maven repository

Managing versions and publishing across 30 separate repos is a nightmare. The cure becomes worse than the disease.

---

## Approach 3: Multi-Module Maven Project (Recommended)

**The idea**: Create submodules **inside your existing BOM project**. Each module focuses on one concern (logging, security, utilities), and they all share the same parent POM, the same repository, and the same versioning.

```
eazy-bom/
├── pom.xml (parent)
├── common/          ← submodule for shared DTOs/utilities
├── common-security/ ← submodule for shared security  
├── common-logging/  ← submodule for shared logging
└── (your microservices reference these as dependencies)
```

### Why This Works

- **Single repository** — all modules live in the same Git repo
- **Unified versioning** — one version bump, all modules aligned
- **Simple PRs** — changes to shared code are in the same repo as the microservices
- **Selective imports** — each microservice picks only the modules it needs
- **No publishing complexity** — `mvn install` on the parent builds everything

---

## The Disclaimer: Shared Libraries Are Debated

Before diving into implementation, a critical warning:

**Sharing code between microservices is a contentious topic.** Some experienced engineers are strongly against it.

### When shared libraries are GOOD:
- The shared code is truly **generic** (error DTOs, utility functions)
- Changes to the shared code don't create **deployment dependencies** between services
- The shared code doesn't create **tight coupling**

### When shared libraries are BAD:
- Changing the shared library forces you to **redeploy multiple services**
- The shared code contains **business logic** that makes services coupled
- The shared library grows into a **monolith** of its own

### The Rule of Thumb

> If sharing the code doesn't create deployment challenges or coupling, use shared libraries. If it does, embrace the duplication. Sometimes **controlled duplication** is healthier than artificial coupling.

---

## ✅ Key Takeaways

- **Code duplication** across microservices is a real maintenance problem
- **Single shared JAR** → becomes bloated, forces unnecessary dependencies
- **Multiple separate repos** → version management and publishing nightmare
- **Multi-module Maven** → the sweet spot: single repo, selective imports, unified versioning
- Shared libraries are **debated** — only share code that won't create coupling or deployment challenges
- When in doubt, it's okay to keep duplicate code rather than introduce tight coupling

---

## ⚠️ Common Mistakes

- Sharing **business logic** in a common library — this tightly couples microservices
- Creating a common library that grows endlessly — it becomes a mini-monolith
- Not considering deployment impact — if changing the library requires redeploying 10 services, you've lost the independence that microservices promise
