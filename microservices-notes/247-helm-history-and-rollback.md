# Helm History and Rollback Commands

## Introduction

You've deployed changes using `helm upgrade` — but what if something goes wrong? What if the new version breaks things and you need to go back to a known good state? With plain `kubectl`, you'd have to rollback each component one by one. But with Helm? A single command rolls back your **entire** cluster state. Let's see how.

---

## Helm History: Understanding Your Deployment Timeline

Before you can roll back, you need to know *what* to roll back to. That's where `helm history` comes in.

### How to Use It

```bash
helm history easybank
```

This shows you every revision of your release — every install and every upgrade:

| Revision | Status     | Description                         |
|----------|------------|-------------------------------------|
| 1        | superseded | Initial install (Gateway tag: s14)  |
| 2        | superseded | Upgraded Gateway tag to s12         |
| 3        | deployed   | Upgraded Gateway tag to s11         |

The revision marked as `deployed` is what's currently running in your cluster. All previous revisions are marked as `superseded`.

### Why This Matters

This is essentially a **version history** of your entire microservices deployment. Unlike `kubectl`, which tracks rollout history per deployment, Helm gives you a holistic view of your entire release — all services, all configs, everything.

---

## Helm Rollback: One Command to Rule Them All

### The Command

```bash
helm rollback easybank 1
```

That's it. This rolls back the **entire release** — every microservice, every configuration — to exactly what it looked like at Revision 1.

- `easybank` is the release name
- `1` is the revision number you want to return to

### What Happens Behind the Scenes?

When you run this command, Helm:
1. Looks up the full state of Revision 1
2. Compares it with the current state
3. Applies all the necessary changes to restore your cluster to Revision 1
4. Creates a **new revision** (e.g., Revision 4) with the status `deployed`

So your history would now look like:

| Revision | Status     | Description                           |
|----------|------------|---------------------------------------|
| 1        | superseded | Initial install                       |
| 2        | superseded | Upgrade (tag s12)                     |
| 3        | superseded | Upgrade (tag s11)                     |
| 4        | deployed   | Rollback to Revision 1                |

Notice: the rollback itself becomes a new revision. This means you can even roll back a rollback if needed!

### Without a Revision Number

If you omit the revision number:
```bash
helm rollback easybank
```
Helm rolls back to the **immediately previous** revision.

---

## Helm Rollback vs. Kubectl Rollback

This is the killer advantage of Helm rollback:

| Feature | kubectl rollback | helm rollback |
|---------|-----------------|---------------|
| Scope | Single deployment | Entire release (all services) |
| Command count | One per deployment | One for everything |
| History | Per-deployment | Unified release history |

If you changed 5 different microservices in one upgrade and need to revert, with `kubectl` you'd run 5 separate rollback commands. With Helm? Just one.

---

## ✅ Key Takeaways

- `helm history <release>` shows the complete deployment timeline with revision numbers and statuses
- `helm rollback <release> <revision>` restores your entire cluster to a previous known state with a single command
- Rollbacks create new revisions in the history — nothing is ever lost
- Omitting the revision number rolls back to the immediately previous revision
- Helm rollback is **holistic** — it rolls back everything in the release, unlike `kubectl` which is per-deployment

## ⚠️ Common Mistake

Don't confuse revision numbers with version numbers. Revision numbers are Helm's internal tracking mechanism. They increment on every install, upgrade, or rollback — they don't correspond to your application version.
