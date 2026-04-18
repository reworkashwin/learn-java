# Creating a Cloud Database with AWS RDS MySQL

## Introduction

Before deploying your backend application, its dependencies must be ready — and the most critical dependency is the **database**. In this lesson, we'll create a MySQL database in the cloud using **AWS RDS (Relational Database Service)**, connect to it from our local machine, and set up the required tables and data.

---

## What Is AWS RDS?

### 🧠 Simple Explanation

AWS RDS is a **managed database service**. Instead of installing MySQL on a server yourself, AWS does it for you. They handle backups, patches, scaling, and availability.

Think of it like renting a furnished apartment vs building a house — RDS gives you a ready-to-use database without the infrastructure headache.

---

## Step 1: Create the MySQL Database

### ⚙️ The Process

1. **Log into AWS Console** and select a **region** close to you (e.g., Mumbai, US East)

2. **Search for RDS** → Click on "Aurora and RDS"

3. **Click "Create database"** and configure:

| Setting | Value | Why |
|---------|-------|-----|
| Creation method | Full configuration | More control |
| Engine | MySQL | Our app uses MySQL |
| Template | Free tier | No charges (if eligible) |
| DB identifier | `jobportal` | Name for the DB instance |
| Master username | `admin` | Default admin user |
| Password | Auto-generated | Let AWS create a secure password |
| Public access | **Yes** | So we can connect from local machine |
| Security group | Create new → `mysqldb` | Controls who can access the DB |
| Initial database name | `jobportal` | Auto-creates this schema on startup |
| Automated backups | **Uncheck** | Avoid extra charges |

4. **Click "Create database"** — takes ~5 minutes

5. **IMPORTANT: Click "View connection details"** to see the auto-generated password. Copy it immediately!

### ⚠️ Critical Step: Save Your Credentials

After creation, you need three pieces of information:
- **Hostname/Endpoint** — found on the database details page
- **Username** — `admin`
- **Password** — from the "View connection details" popup

> If you miss the password popup, you can reset it from the RDS console.

---

## Step 2: Connect from Your Local Machine

### ⚙️ Using SQLectron (Free Database Client)

1. Open SQLectron and click **Add**
2. Fill in:
   - **Name**: AWS Database
   - **Database type**: MySQL
   - **Host**: paste the RDS endpoint hostname
   - **Port**: 3306
   - **User**: admin
   - **Password**: paste the auto-generated password
3. Click **Test** → Connection successful!
4. **Save** and **Connect**

### 🧠 What You'll See

- A `jobportal` database schema exists (created automatically)
- No tables or data — we need to create them

---

## Step 3: Troubleshooting Connection Issues — Security Groups

### ❓ Can't Connect? Check Security Groups

AWS uses **Security Groups** to control who can access your database. Think of them as a **firewall**.

**To fix connection issues:**

1. Go to the RDS database details page → scroll to **Security Groups**
2. Click on the security group (e.g., `mysqldb`)
3. Click **Edit inbound rules**
4. **Add two new rules:**

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| MySQL/Aurora | TCP | 3306 | Anywhere-IPv4 |
| MySQL/Aurora | TCP | 3306 | Anywhere-IPv6 |

5. **Save rules** → retry connection

> These rules allow traffic from any IP address. This is fine for development/demos but **never for production**.

---

## Step 4: Execute SQL Scripts

### ⚙️ Create Tables and Insert Data

Your Spring Boot project has SQL scripts under the `resources/` folder:

1. **Execute `jobportal-schema.sql`** — creates all required tables
2. **Execute `data.sql`** — inserts sample data

After execution, log out and log back in to see the tables populated with data.

---

## AWS Free Tier

### 💡 What You Get for Free

- Up to **750 hours** of RDS (db.t2.micro or db.t3.micro) per month for one year
- If you're new to AWS, this demo should cost nothing

### ⚠️ Cost Warning

If you exceed the free tier or your credits have expired, you'll be charged. **Always delete resources when done** (covered in a later lesson).

---

## ✅ Key Takeaways

- AWS RDS provides managed MySQL databases — no server setup needed
- Choose a region close to you for better latency
- **Save the auto-generated password immediately** after database creation
- Security Groups control access — add inbound rules to allow connections
- Execute your SQL schema and data scripts to prepare the database
- Free tier covers 750 hours/month for the first year

## ⚠️ Common Mistakes

- Missing the auto-generated password popup — you'll need to reset it
- Not enabling public access — you won't be able to connect from your local machine
- Forgetting to add inbound rules in Security Groups — connections will time out
- Not specifying the initial database name (`jobportal`) — you'll need to create it manually
- Leaving the database running after demos — AWS will charge you

## 💡 Pro Tips

- In production, databases are **never publicly accessible** — only the application servers can reach them
- SQL scripts should be version-controlled and reviewed just like application code
- Use IntelliJ Ultimate's database tool or SQLectron for free database management
- Always select a region close to where your application will be deployed for minimal latency
