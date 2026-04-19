# Reading Configurations from a GitHub Repository

## Introduction

We've explored classpath and file system approaches for configuration management. Now it's time for the **most recommended, production-standard approach** — storing configurations in a **GitHub repository**. This gives you versioning, auditing, security, and collaboration — all the things the other approaches lack.

---

## Why GitHub Is the Best Approach

Why do most production systems prefer GitHub for configuration management?

1. **Security** — Properly secure your repo (private, with access controls)
2. **Versioning** — Every change is tracked with commit history. Want to know what a property was two years ago? Just check the git log
3. **Auditing** — You know who changed what, when, and why
4. **Collaboration** — Pull requests, code reviews for config changes
5. **Branching** — Maintain different config branches for different environments

With classpath or file system approaches, tracking historical changes is nearly impossible. GitHub solves this completely.

---

## Setting Up the GitHub Approach

### Step 1: Create a GitHub Repository

Create a repository (e.g., `eazybytes-config`) and upload all your configuration YAML files:

```
accounts.yml
accounts-prod.yml
accounts-qa.yml
cards.yml
cards-prod.yml
cards-qa.yml
loans.yml
loans-prod.yml
loans-qa.yml
```

### Step 2: Update Config Server's `application.yml`

The key change: switch the active profile from `native` to `git`:

```yaml
spring:
  profiles:
    active: "git"
  cloud:
    config:
      server:
        git:
          uri: "https://github.com/eazybytes/eazybytes-config"
          default-label: "main"
          timeout: 5
          clone-on-start: true
          force-pull: true
```

Let's break down each property:

### `uri`
The HTTPS URL of your GitHub repository. Copy it directly from GitH's "Code" button.

### `default-label`
Which branch to use. If your default branch is `main`, specify it here. This avoids confusion when you have multiple branches.

### `timeout`
Maximum seconds to wait when connecting to GitHub. Set to `5` — if the connection isn't established in 5 seconds, fail immediately. This gives your ops team a fast signal that something is wrong.

### `clone-on-start`
**Critical setting.** Set to `true`.

Without this, cloning happens on the first client request — not at startup. Imagine your config server starts fine, but then the first microservice connects and the clone fails. Now your microservice fails too. By cloning at startup, you catch problems early.

### `force-pull`
Set to `true`. If someone accidentally modified the local clone inside the config server, this ensures every restart pulls fresh from GitHub, overriding local changes. Your GitHub repo is always the **master copy**.

---

## Testing the Integration

After restarting everything:

1. **Config Server**: Hit `localhost:8071/accounts/prod` — you'll see properties loaded from the GitHub repo URL
2. **Microservice**: Invoke `cards/contact-info` — prod-profile properties come back correctly

This confirms the config server reads from GitHub, and microservices read from the config server.

---

## What About Private Repositories?

In production, your repo will be private. You'll need to authenticate:

**Using username/password:**
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: "https://github.com/your-org/config-repo"
          username: "your-username"
          password: "your-token"
```

**Using SSH:** Configure SSH keys for passwordless authentication. Refer to the [official Spring Cloud Config documentation](https://docs.spring.io/spring-cloud-config/docs/current/reference/html/) for detailed SSH setup instructions.

---

## Other Supported Backends

Spring Cloud Config Server supports many more backends beyond GitHub:

| Backend | Use Case |
|---------|----------|
| **AWS CodeCommit** | AWS-native teams |
| **Google Cloud Source** | GCP-native teams |
| **Vault** | Secret management (HashiCorp Vault) |
| **CredHub** | Cloud Foundry environments |
| **AWS Secrets Manager** | AWS secret storage |
| **AWS Parameter Store** | AWS configuration storage |
| **JDBC Backend** | Store configs in a database |

---

## ✅ Key Takeaways

- GitHub approach is the **most recommended** for production — it gives versioning, auditing, and security
- Switch the profile from `native` to `git` and provide the repo URI
- Always set `clone-on-start: true` and `force-pull: true` for reliability
- The official Spring Cloud Config documentation is your best resource for advanced scenarios

---

## 💡 Pro Tip

> "Courses and tutorials make the subject simple. Once you understand the concept, refer to the **official documentation** for complex scenarios. That's how you grow from junior to senior developer — your knowledge matters, not your years of experience."
