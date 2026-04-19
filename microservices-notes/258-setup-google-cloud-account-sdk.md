# Set Up Google Cloud Account and Install Google Cloud SDK

## Introduction

We've decided to deploy our microservices to Google Cloud's Kubernetes Engine (GKE). Before we can create a cluster, we need two things: a Google Cloud account with free credits and the Google Cloud CLI installed locally. This lecture walks through both.

---

## Step 1: Create a Google Cloud Account

### Visit cloud.google.com

Log in with your Gmail account. If you're a first-time user, Google offers **$300 in free credits** usable within 90 days.

### Important Tips

- If you've used Google Cloud with this Gmail before, you won't get the free credit again. Consider creating a **new Gmail account** specifically for this purpose.
- Under the free tier products, you'll see **Google Kubernetes Engine** listed — this is exactly what we need, and it's eligible under the free tier.

### Account Setup Process

1. Click on "Try for Free" when prompted
2. Fill in your country and account type details
3. Accept the Terms of Service
4. Click "Continue"
5. **Enter credit card details** — Google Cloud requires this. They promise: "No auto-charge after free trial ends"

⚠️ **Important**: If you're uncomfortable providing credit card details, that's completely fine. You can follow along by watching the demo without setting up your own account. The concepts are the same.

### After Setup

Once your payment method is verified, you'll land on the Google Cloud Console homepage. A default project called "My First Project" is automatically created for you.

---

## Step 2: Install Google Cloud SDK (CLI)

### Why Do We Need This?

The Google Cloud CLI lets you interact with your cloud resources (including Kubernetes clusters) **from your local terminal**. Without it, you'd be limited to the web console. With it, you can:

- Connect your local `kubectl` to the remote cluster
- Run Helm install commands against the cloud cluster
- Manage resources via command line

### Installation

Visit: **cloud.google.com/sdk**

1. Click "Get Started"
2. Follow the installation steps for your operating system (Windows, macOS, or Linux)
3. The page provides detailed instructions for each platform

### Verify Installation

```bash
gcloud --version
```

If successful, you'll see version information for the Google Cloud SDK.

### Initialize and Login

```bash
gcloud init
```

This command starts an interactive setup:

1. Choose to reinitialize existing configuration (or create new)
2. When asked to log in, type `Y`
3. A browser window opens — select your Gmail account
4. Grant the requested permissions
5. Back in terminal, select your project (e.g., "My First Project")

After completion, you'll see a confirmation: "Your Google Cloud SDK is configured and ready to use."

---

## Cost Awareness

Google Cloud is very transparent about costs, but you need to be proactive:

- **Don't create unnecessary resources** — everything costs money from your free credits
- **Always delete resources when done** — unused clusters, VMs, and databases eat through credits fast
- **Monitor your spending** — check the billing dashboard regularly
- Your $300 can evaporate in 1-2 days if you're not careful

---

## ✅ Key Takeaways

- Google Cloud offers $300 free credits for new accounts — enough to experiment with GKE
- Credit card details are required even for the free trial
- Install Google Cloud SDK/CLI to interact with cloud resources from your terminal
- Run `gcloud init` to authenticate and connect to your Google Cloud project
- Be extremely conscious of resource costs — delete everything when not in use

## ⚠️ Common Mistake

Creating resources in Google Cloud and forgetting to delete them. A Kubernetes cluster running 24/7 costs about $0.24/hour ($176/month). Your $300 credit will last about 7 weeks at that rate — much less if you create databases, load balancers, and other services alongside it.
