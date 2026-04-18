# Preparing Your Spring Boot App for Production

## Introduction

You've built an impressive backend application. It runs perfectly on your local machine. But here's the reality — **nobody else can see it**. Unless you invite the world to your living room and point them at `localhost:8080`, your application is invisible.

To showcase your work — or more importantly, to serve real users — you need to **deploy to the cloud**. This section walks through deploying to **AWS (Amazon Web Services)**, the most widely used cloud platform.

---

## Why AWS?

AWS is used in the majority of enterprise projects. However, the cloud provider may vary:
- **AWS** — Amazon Web Services
- **Azure** — Microsoft's cloud
- **GCP** — Google Cloud Platform

The deployment steps differ between providers, but the **core concepts** remain the same.

### 💡 A Reality Check

> In real enterprise applications, **developers don't deploy to production**. The DevOps team handles deployment pipelines, CI/CD, and infrastructure. But understanding the process makes you a better developer and allows you to showcase personal projects.

---

## Step 1: Create an AWS Account

1. Go to `aws.amazon.com`
2. Create a new account (requires a credit card)
3. **Free tier**: first-year users get limited free credits for commonly used products

> If you're uncomfortable providing credit card details, you can follow along with the demos without creating an account.

---

## Step 2: Disable Docker Compose for Production

### 🧠 Why?

During local development, Spring Boot's Docker Compose support automatically creates containers (MySQL, observability tools) from your `compose.yml`. In production, this behavior is **unwanted** — databases and monitoring tools are managed by separate teams.

### ⚙️ application-prod.properties

```properties
# Disable Docker Compose support
spring.docker.compose.enabled=false

# Disable observability (no Grafana stack in cloud)
management.tracing.sampling.probability=0.0
management.tracing.enabled=false
management.metrics.export.otlp.enabled=false
management.logging.export.otlp.enabled=false
```

When the **prod profile** is activated, these properties take highest priority, overriding the default profile values.

---

## Step 3: Package the Application as a JAR

### 🧠 What Is a JAR?

A JAR (Java ARchive) is a packaged file containing your compiled application code plus all its dependencies. It's the **deployment artifact** — the thing you upload to the cloud.

### ⚙️ The Maven Command

```bash
mvn clean install -DskipTests=true
```

**Breaking it down:**
- `mvn clean` — deletes old build artifacts
- `install` — compiles, packages, and installs the JAR
- `-DskipTests=true` — skips unit tests during packaging (capital D required)

> Tests are skipped because they try to connect to the database. Without a database running locally, the build would fail.

### 📁 Where's the JAR?

The JAR is generated in the `target/` folder:
```
target/jobportal-0.0.1-SNAPSHOT.jar
```

### 💡 Customizing the JAR Name

By default, the JAR name comes from `artifactId` + `version` in `pom.xml`. To customize:

```xml
<build>
    <finalName>jobportal-aws-deployment</finalName>
</build>
```

This produces: `target/jobportal-aws-deployment.jar`

---

## Understanding the Production Setup

### 🧠 What's Different Between Local and Production?

| Aspect | Local Development | Production (AWS) |
|--------|------------------|------------------|
| Database | Docker container (auto-created) | AWS RDS (managed service) |
| Observability | Grafana stack (auto-created) | Managed by DevOps team |
| Profile | default | prod |
| Port | 8080 | 5000 (Beanstalk default) |
| Docker Compose | Enabled | Disabled |

### 🧠 How Are Database Credentials Configured?

In `application-prod.properties`, default values are set:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jobportal
spring.datasource.username=root
spring.datasource.password=root
```

These will be **overridden** using **environment variables** in AWS — a common pattern for externalizing sensitive configuration.

---

## ✅ Key Takeaways

- Disable Docker Compose and observability features for production using profile-specific properties
- Package your app as a JAR using `mvn clean install -DskipTests=true`
- Customize the JAR name using `<finalName>` in `pom.xml`
- Production config is externalized through environment variables — never hardcode credentials
- The **prod profile** overrides default property values

## ⚠️ Common Mistakes

- Running `mvn clean install` without `-DskipTests=true` when no database is available — build fails
- Forgetting the capital `D` in `-DskipTests` — the flag won't be recognized
- Leaving Docker Compose enabled for production — containers will be created unnecessarily
- Not activating the prod profile during deployment — default settings will be used

## 💡 Pro Tips

- Always create a `application-prod.properties` file to separate production config from development
- In enterprise apps, passwords are injected via AWS Secrets Manager or Parameter Store — never plain text
- The JAR is a self-contained executable — it includes an embedded Tomcat server, so no external server installation needed
