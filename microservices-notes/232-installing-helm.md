# Installing Helm

## Introduction

Before you can leverage the power of Helm charts, you need Helm installed on your local machine. The good news? It's as simple as installing any other CLI tool through your platform's package manager. And yes — the irony isn't lost on anyone: we're installing a package manager *using* a package manager.

---

## Prerequisites

Before installing Helm, make sure you have:

1. **A running Kubernetes cluster** — either locally (Docker Desktop, Minikube) or in the cloud
2. **kubectl configured** and pointing at your cluster

That's it. Security configurations are optional for getting started.

---

## Installing Helm on macOS

The simplest way on macOS is through **Homebrew**:

```bash
brew install helm
```

Once installed, verify it:

```bash
helm version
```

You should see output showing the installed Helm version (e.g., v3.x.x).

---

## Installing Helm on Windows

On Windows, the recommended approach uses **Chocolatey** (a popular Windows package manager).

### Step 1: Install Chocolatey

1. Open **PowerShell as Administrator**
2. Check your execution policy:
   ```powershell
   Get-ExecutionPolicy
   ```
3. If it returns `Restricted`, enable installs:
   ```powershell
   Set-ExecutionPolicy AllSigned
   ```
4. Install Chocolatey by running the install script from [chocolatey.org/install](https://chocolatey.org/install)
5. Verify the installation:
   ```powershell
   choco -?
   ```

### Step 2: Install Helm

```powershell
choco install kubernetes-helm
```

Verify:
```powershell
helm version
```

---

## Other Operating Systems

For Ubuntu, Linux, or other platforms, the official Helm website provides additional installation methods:
- Binary releases
- Shell scripts
- Other package managers

Visit [helm.sh/docs/intro/install](https://helm.sh/docs/intro/install/) for the full list.

---

## ✅ Key Takeaways

- On **macOS**: `brew install helm`
- On **Windows**: install Chocolatey first, then `choco install kubernetes-helm`
- Always verify with `helm version`
- The only real prerequisite is a running Kubernetes cluster with kubectl configured

💡 **Pro Tip:** Helm 3 is the current major version and doesn't require Tiller (the server-side component from Helm 2). If you see old tutorials mentioning Tiller, ignore that — it's no longer needed.
