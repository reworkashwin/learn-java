# Implementing Role-Based Authorization — Testing & Validation

## Introduction

We've configured role-based authorization in the Gateway server and created the `ACCOUNTS` role in Keycloak. But we deliberately left out the `CARDS` and `LOANS` roles. Why? Because the best way to validate security is to test that it *denies* unauthorized access before confirming it *allows* authorized access.

---

## Testing with Only the ACCOUNTS Role

### Accounts API — Should Work ✅

1. Get a fresh access token (it now contains the `ACCOUNTS` role)
2. POST to `/eazybank/accounts/api/create`
3. **Result:** 201 Created — the client has the required `ACCOUNTS` role

### Cards API — Should Fail ❌

1. Use the same access token (which does NOT have the `CARDS` role)
2. POST to `/eazybank/cards/api/create`
3. **Result:** **403 Forbidden**

Notice: you get 403 (Forbidden), **not** 401 (Unauthorized). This distinction matters:
- **401** = "I don't know who you are" (authentication failure)
- **403** = "I know who you are, but you don't have permission" (authorization failure)

The client is authenticated (valid token), but not authorized (missing `CARDS` role).

---

## Fixing the Authorization — Adding Missing Roles

### Adding the CARDS Role

1. Go to **Realm roles** → Create role → Name: `CARDS`
2. Go to **Clients** → open your client → **Service account roles**
3. Click **Assign role** → select `CARDS`
4. Get a **new access token** (old token won't have the updated roles!)

Now decode the new token at `jwt.io`. You should see both `ACCOUNTS` and `CARDS` in `realm_access.roles`.

**Test again:** POST to Cards API → ✅ 201 Created

### Adding the LOANS Role

Same process:
1. Create `LOANS` realm role
2. Assign to client under Service account roles
3. Get a **new** access token

**Test:** POST to Loans API → ✅ 201 Created

---

## The Complete Authorization Matrix

| API Path | Required Role | Without Role | With Role |
|----------|--------------|-------------|-----------|
| GET any microservice | None (permitAll) | ✅ 200 | ✅ 200 |
| POST accounts/create | ACCOUNTS | ❌ 403 | ✅ 201 |
| POST cards/create | CARDS | ❌ 403 | ✅ 201 |
| POST loans/create | LOANS | ❌ 403 | ✅ 201 |

---

## ⚠️ Critical Point: Always Get a Fresh Token After Role Changes

When you add a new role in Keycloak, existing access tokens don't magically update. The roles are baked into the JWT at the time of issuance. You **must** request a new token to get the updated role claims.

This is a common debugging headache — "I added the role, why am I still getting 403?" The answer is almost always: you're using a stale token.

---

## ✅ Key Takeaways

- 403 Forbidden means authentication passed but authorization failed — missing roles
- 401 Unauthorized means the token itself is invalid or missing
- Role changes in Keycloak require a **fresh** access token to take effect
- Role names are **case-sensitive** — `ACCOUNTS` ≠ `accounts`
- Always test negative cases first (missing roles → 403) before positive cases

💡 **Pro Tip:** In real-world systems, the authorization matrix will be more complex — but the approach remains the same: define roles, assign them to clients/users, and enforce them at the gateway level.
