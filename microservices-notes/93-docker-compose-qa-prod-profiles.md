# Preparing Docker Compose Files for QA and Prod Profiles

## Introduction

We have a working Docker Compose setup for the `default` profile. Now we need similar setups for `qa` and `prod` environments. Thanks to the `common-config.yml` abstraction we built earlier, this is surprisingly simple.

---

## How Easy Is It?

**One line.** That's all you change.

### Step 1: Copy the Files

Copy both `docker-compose.yml` and `common-config.yml` from the `default/` folder into `qa/` and `prod/`:

```
docker-compose/
├── default/
│   ├── docker-compose.yml
│   └── common-config.yml
├── qa/
│   ├── docker-compose.yml      ← copied from default
│   └── common-config.yml       ← copied from default
└── prod/
    ├── docker-compose.yml      ← copied from default
    └── common-config.yml       ← copied from default
```

### Step 2: Change One Environment Variable

In `qa/common-config.yml`:
```yaml
SPRING_PROFILES_ACTIVE: "qa"
```

In `prod/common-config.yml`:
```yaml
SPRING_PROFILES_ACTIVE: "prod"
```

That's it. The `docker-compose.yml` files are identical across all three environments. Only the profile value differs.

---

## Why This Works So Well

This is the power of our earlier design decisions:

1. **Same Docker images** across all environments — the images are immutable
2. **Profile-driven configuration** — Spring Boot loads different YAML files based on the active profile
3. **Centralized common config** — one variable controls the entire environment behavior
4. **Config Server integration** — the config server serves different properties for different profiles from the same GitHub repo

You could even add environment-specific customizations. For example, in `prod/common-config.yml`, increase the memory limit:

```yaml
deploy:
  resources:
    limits:
      memory: 1024m
```

---

## Testing the Prod Profile

```bash
cd docker-compose/prod/
docker compose up -d
```

After containers start:

1. Change `cards-prod.yml` in GitHub: "prod" → "Docker APIs"
2. Webhook fires → automatic refresh
3. `GET /cards/api/contact-info` → "Docker APIs"
4. Revert in GitHub: "Docker APIs" → "prod"
5. `GET /cards/api/contact-info` → "prod APIs"

Everything works — same images, same pipeline, different profile.

---

## ✅ Key Takeaways

- Creating new environment Docker Compose files is as simple as copying and changing **one line**
- The `SPRING_PROFILES_ACTIVE` environment variable controls which profile each container uses
- Same immutable Docker images work across all environments
- Per-environment customization (memory, replicas, etc.) is possible in each `common-config.yml`
- This pattern scales cleanly as you add more environments

---

## 💡 Pro Tip

Don't try to complete an entire course in one sitting. Take breaks between sections — absorb the knowledge, let it settle. Learning is a marathon, not a sprint.
