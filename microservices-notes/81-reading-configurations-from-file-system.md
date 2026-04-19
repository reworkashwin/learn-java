# Reading Configurations from a File System Location

## Introduction

We've been loading configuration properties from the classpath inside our Spring Cloud Config Server. But what if your organization wants to store all configurations in a specific folder on the server — locked down with security restrictions so only the config server can access it?

That's exactly what the **file system approach** offers. Let's explore how and why some projects prefer this method.

---

## Why Use a File System for Configuration?

Think about this: your server admins want tight control over who can see sensitive configuration files. By storing properties in a dedicated folder on the server, they can enforce OS-level security — restricting read access to only the config server application.

This approach is common in organizations where:
- Security policies restrict storing configs in version control
- Server admins want filesystem-level access control
- The deployment environment already uses shared file storage

---

## How It Works

### Step 1: Copy Config Files to a Folder

Take all your YAML configuration files (e.g., `accounts-prod.yml`, `loans-prod.yml`, `cards-prod.yml`) and copy them into a folder on your local system or server.

For example:
```
/users/eazybytes/documents/config/
```

This folder contains all the environment-specific YAML files for every microservice.

### Step 2: Update the Config Server's `application.yml`

Previously, the `search-locations` property pointed to the classpath:

```yaml
spring:
  cloud:
    config:
      server:
        native:
          search-locations: "classpath:/config"
```

Now, change it to point to the file system:

```yaml
spring:
  cloud:
    config:
      server:
        native:
          search-locations: "file:///users/eazybytes/documents/config"
```

### Understanding the URI Format

The `file:` prefix tells the config server you're using a file-based location.

- **macOS/Linux**: `file:///users/eazybytes/documents/config`
- **Windows**: `file:///C://config`

Notice the **three forward slashes** after `file:` — this is required. Between each folder, use **two forward slashes** as separators.

### Step 3: Keep the Profile as `native`

The `native` profile must remain active — it's used for both classpath and file system approaches:

```yaml
spring:
  profiles:
    active: "native"
```

---

## Testing the Setup

After restarting the config server and all microservices:

1. Hit the config server endpoint: `localhost:8071/loans/prod`
2. In the response, the `location` field shows the file path: `/users/eazybytes/documents/config/loans-prod.yml`
3. This confirms the config server is reading from the file system, not from the classpath

Invoking a microservice's `contact-info` endpoint returns the prod-profile properties correctly, proving the integration is working end-to-end.

---

## ✅ Key Takeaways

- The **only change** needed is updating `search-locations` from `classpath:/config` to `file:///your/folder/path`
- The profile remains `native` for both classpath and file system approaches
- The file system approach gives server admins control over who can see the config files
- Use the correct URI format (`file:///`) with proper slash conventions for your OS

---

## 💡 Pro Tip

This approach works well when your security team mandates that configuration files should never leave the server. But it lacks **versioning and audit trails** — you can't track who changed what and when. For that, the GitHub-based approach (covered next) is more powerful.
