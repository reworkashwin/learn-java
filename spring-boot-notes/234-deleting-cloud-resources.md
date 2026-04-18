# Deleting Cloud Resources — Avoiding Unnecessary Costs

## Introduction

Cloud resources cost money for **every minute they're running**. If you leave your Elastic Beanstalk environment and RDS database running after your demo, you'll get a **surprise bill** next month. This lesson covers how to properly clean up all resources — and a bonus: how to **restrict database access** for production security.

---

## Bonus: Restricting Database Access (Production Security)

### 🧠 The Problem

Right now, our database is publicly accessible — anyone with the credentials can connect from anywhere. That's dangerous in production.

### ⚙️ The Fix: Security Group Inbound Rules

**Step 1: Remove all public inbound rules**

Go to Security Groups → find `mysqldb` → Edit inbound rules → **Delete all rules** → Save

**Result:** Nobody can access the database — not even your application. If you try to access your API, you'll get:
> "Could not open JPA EntityManager for transaction"

**Step 2: Allow access only from Beanstalk**

Add a new inbound rule:

| Type | Source |
|------|--------|
| MySQL/Aurora | Security group of your Beanstalk environment (not the load balancer one) |

**Result:** Only your Beanstalk application can access the database. Public access is blocked.

### 💡 This Is How Production Works

In real enterprise environments:
- Databases are **never publicly accessible**
- Only application servers in the same VPC (Virtual Private Cloud) can reach the database
- Security groups act as firewalls controlling traffic flow

---

## Step 1: Delete Elastic Beanstalk Environment

### ⚙️ The Process

1. Go to **Elastic Beanstalk** console
2. Select your environment (e.g., `jobportal-env`)
3. Click **Actions** → **Terminate environment**
4. Type the environment name to confirm
5. Wait **5-10 minutes** for termination to complete

### 🧠 What Gets Deleted?

Beanstalk cleans up everything it created:
- EC2 instances
- Load balancer
- Auto-scaling group
- CloudWatch alarms
- Security groups (created by Beanstalk)

---

## Step 2: Delete the RDS Database

### ⚙️ The Process

1. Go to **RDS** console
2. Select your database instance (`jobportal`)
3. Click **Actions** → **Delete**
4. **Uncheck** "Create final snapshot" (no backup needed for demo data)
5. Check the acknowledgment box
6. Type `delete me` to confirm
7. Wait **~5 minutes** for deletion

---

## Step 3: (Optional) Delete IAM Roles

### 🧠 Do I Need To?

IAM roles don't incur charges, so deleting them is **optional**. But for a clean account:

1. Go to **IAM** → **Roles**
2. Search for the Elastic Beanstalk roles you created
3. Select and delete them
4. Type `delete` to confirm

---

## Cleanup Checklist

| Resource | How to Delete | Charges If Left Running? |
|----------|---------------|------------------------|
| Elastic Beanstalk | Terminate environment | ✅ Yes (EC2, load balancer) |
| RDS Database | Delete DB instance | ✅ Yes (hourly charges) |
| IAM Roles | Delete from IAM console | ❌ No charges |
| Security Groups | Auto-deleted with Beanstalk or delete manually | ❌ No charges |

---

## Verification: Make Sure Everything Is Gone

### ⚠️ Come Back in 2-3 Days

Log back into AWS and verify:
- **Elastic Beanstalk**: No environments listed
- **RDS**: No database instances
- **EC2**: No running instances
- **Load Balancers**: None active

> Sometimes termination takes longer than expected. Verify to avoid surprise charges.

---

## ✅ Key Takeaways

- **Always delete cloud resources after demos** — every minute costs money
- Delete both Beanstalk environment AND RDS database separately
- Security groups restrict who can access your database — configure them properly for production
- Allow only your application's security group to access the database — block public access
- IAM roles don't cost anything but can be cleaned up for tidiness
- Come back in 2-3 days to verify everything is truly deleted

## ⚠️ Common Mistakes

- Leaving the database running after deleting Beanstalk — RDS charges separately
- Taking a "final snapshot" during deletion — this also incurs storage costs
- Only deleting Beanstalk and forgetting about RDS — both need to be deleted
- Not verifying deletion after a few days — some deletions silently fail

## 💡 Pro Tips

- Set a **calendar reminder** to check your AWS account 3 days after deployment demos
- Use **AWS Billing Dashboard** to monitor any unexpected charges
- In production, use **budget alerts** — AWS can notify you when spending exceeds a threshold
- For learning purposes, consider using the **AWS Free Tier** tracker in the billing console
- The free tier gives you 750 hours/month of RDS and EC2 — roughly one instance running 24/7 for a month
