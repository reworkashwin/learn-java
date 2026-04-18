# Deploying Spring Boot to AWS Using Elastic Beanstalk

## Introduction

Database is ready. JAR is packaged. Now comes the exciting part — **deploying to the cloud**. We'll use **AWS Elastic Beanstalk**, which automates all the heavy lifting: server provisioning, load balancing, scaling, and deployment.

---

## Why Not Just Use EC2 Directly?

### 🧠 The Manual Way (EC2)

You *could* deploy to a raw EC2 instance (AWS virtual server):
1. Launch a server
2. SSH into it
3. Install JDK, Maven
4. Copy your JAR
5. Run the application
6. Configure security groups
7. Set up a load balancer
8. Configure auto-scaling

That's a **lot of manual work**. And maintaining all of it? Even more work.

### 🧠 The Easy Way (Elastic Beanstalk)

Elastic Beanstalk handles **all of the above automatically**:
- Creates EC2 instances
- Installs JDK and build tools
- Deploys your JAR
- Sets up load balancing
- Configures auto-scaling
- Creates security groups
- Provides a domain name

> You upload your JAR → Beanstalk deploys everything. That's it.

---

## Step 1: Create IAM Roles

### 🧠 Why Do We Need Roles?

Beanstalk needs **permission** to create EC2 instances, load balancers, and other AWS resources on your behalf. Roles define these permissions.

### ⚙️ Create Two Roles

**Role 1: Environment Role**
1. IAM → Create Role → AWS Service → Elastic Beanstalk → Environment
2. Accept default permission policies
3. Name: `ElasticBeanstalkEnvironment`

**Role 2: EC2 Role**
1. IAM → Create Role → AWS Service → Elastic Beanstalk → Compute
2. Accept default permission policies (3 policies)
3. Name: `ElasticBeanstalkEC2Role`

---

## Step 2: Create the Elastic Beanstalk Environment

### ⚙️ Configuration Walkthrough

**Page 1 — Application Info:**
| Setting | Value |
|---------|-------|
| Environment type | Web server |
| Application name | `jobportal` |
| Domain name | Choose a unique name (e.g., `eazy-jobportal`) |
| Platform | Java |
| Platform branch | Default (Java 25 or latest) |
| Application code | Upload your JAR |
| Version label | `v1` |

**Page 2 — Service Access (Roles):**
| Setting | Value |
|---------|-------|
| Service role | `ElasticBeanstalkEnvironment` |
| EC2 instance profile | `ElasticBeanstalkEC2Role` |

**Page 3 — Network:** Keep defaults.

**Page 4 — Scaling:**
| Setting | Value |
|---------|-------|
| Environment type | Load balanced (not single instance) |
| Min instances | 1 |
| Max instances | 2 |
| Fleet | Combined purchase options |

**Page 5 — Environment Properties** (critical!):

| Property | Value | Purpose |
|----------|-------|---------|
| `SERVER_PORT` | `5000` | Beanstalk's load balancer forwards to port 5000 |
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production configuration |
| `DATABASE_HOST` | (RDS endpoint) | Points to the cloud database |
| `DATABASE_USERNAME` | `admin` | RDS username |
| `DATABASE_PASSWORD` | (RDS password) | RDS password |

### ⚠️ Why Port 5000?

By default, Beanstalk's load balancer forwards traffic to port **5000**. If your app starts on 8080 (the default), the load balancer can't reach it. Setting `SERVER_PORT=5000` ensures connectivity.

### ⚠️ About Passwords in Environment Variables

Storing passwords as plain text environment variables is fine for demos but **never for production**. In enterprise apps, use:
- **AWS Secrets Manager**
- **AWS Systems Manager Parameter Store**

---

## Step 3: Deploy and Wait

Click **Create** and wait **5-10 minutes**. Beanstalk will:

1. Create a security group
2. Create an auto-scaling group
3. Launch EC2 instances
4. Install JDK and build tools
5. Set up CloudWatch alarms
6. Create a load balancer
7. Deploy your application

You'll see: **"Environment successfully launched"**

---

## What Beanstalk Creates Behind the Scenes

```
Elastic Beanstalk Environment
├── Load Balancer (distributes traffic)
├── Auto-Scaling Group (manages instances)
│   ├── EC2 Instance 1 (your app running here)
│   └── EC2 Instance 2 (created when traffic increases)
├── Security Groups (control access)
├── CloudWatch Alarms (monitoring)
└── Domain Name (your-app.elasticbeanstalk.com)
```

---

## ✅ Key Takeaways

- Elastic Beanstalk automates server setup, deployment, load balancing, and scaling
- Create two IAM roles: one for the environment, one for EC2 compute
- Set `SERVER_PORT=5000` — Beanstalk's load balancer forwards to this port
- Activate the prod profile via `SPRING_PROFILES_ACTIVE=prod`
- Database credentials are passed as environment variables
- Deployment takes 5-10 minutes — Beanstalk handles everything automatically

## ⚠️ Common Mistakes

- Forgetting `SERVER_PORT=5000` — the load balancer can't reach your app
- Not activating the prod profile — Docker Compose support will try to kick in
- Wrong database hostname — copy the exact RDS endpoint
- Not creating IAM roles before setting up Beanstalk — configuration page won't have role options
- Storing passwords as plain text in production — use AWS Secrets Manager instead

## 💡 Pro Tips

- Beanstalk installs both Maven and Gradle — regardless of your build tool
- The domain name format is: `your-name.region.elasticbeanstalk.com`
- You can configure custom domain names for production use
- Max instances of 2 is fine for demos — enterprise apps may use 10-30+
