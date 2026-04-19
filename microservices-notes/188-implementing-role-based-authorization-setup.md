# Implementing Role-Based Authorization in the Gateway Server — Setup

## Introduction

Authentication answers the question: *"Are you who you claim to be?"*  
Authorization answers a different question: *"Are you allowed to do this?"*

So far, our Gateway server only checks authentication. Once you have a valid token, you're in — full access to everything. But what if the accounts team should only access account APIs, and the cards team should only access card APIs? That's where **role-based authorization** comes in.

---

## Switching from `authenticated()` to `hasRole()`

### 🧠 The Concept

Instead of just checking if a request carries a valid token, we now check if the token holder has the right **role** for the specific API being accessed.

### ⚙️ The Code Change

In `SecurityConfig.java`, replace `.authenticated()` with `.hasRole()`:

```java
http.authorizeExchange(exchanges -> exchanges
        .pathMatchers(HttpMethod.GET).permitAll()
        .pathMatchers("/eazybank/accounts/**").hasRole("ACCOUNTS")
        .pathMatchers("/eazybank/cards/**").hasRole("CARDS")
        .pathMatchers("/eazybank/loans/**").hasRole("LOANS")
);
```

Now each path requires a *specific* role. This is exactly why the path matchers were written as separate lines — each one needs a different role.

---

## Configuring Roles in Keycloak

### Creating Realm Roles

1. Go to **Realm roles** in Keycloak Admin Console
2. Click **Create role**
3. Create a role named `ACCOUNTS` (case-sensitive!)

For testing, intentionally create only the ACCOUNTS role first — we'll do negative testing before adding CARDS and LOANS.

### Assigning Roles to the Client

Since this is a client credentials flow (machine-to-machine, no end user), roles are assigned under **Service account roles**, not "Roles":

1. Go to **Clients** → open your client
2. Click **Service account roles** tab
3. Click **Assign role** → select `ACCOUNTS`

---

## Where Do Roles Appear in the Access Token?

After assigning the role, request a fresh access token and decode it at `jwt.io`. In the payload, look for:

```json
{
  "realm_access": {
    "roles": [
      "ACCOUNTS",
      "default-roles-master",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

The custom role `ACCOUNTS` sits alongside Keycloak's default roles inside `realm_access.roles`.

---

## Building the KeycloakRoleConverter

### ❓ Why do we need a converter?

Spring Security doesn't automatically know how to extract roles from Keycloak's JWT structure. Keycloak nests roles under `realm_access → roles`, but Spring Security expects them in a specific format (`GrantedAuthority` objects with a `ROLE_` prefix). We need a bridge.

### ⚙️ The Converter Class

Create `KeycloakRoleConverter` implementing `Converter<Jwt, Collection<GrantedAuthority>>`:

```java
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
        
        if (realmAccess == null || realmAccess.isEmpty()) {
            return Collections.emptyList();
        }
        
        Collection<String> roles = (Collection<String>) realmAccess.get("roles");
        
        return roles.stream()
                .map(role -> "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
```

### Step-by-Step Breakdown

1. **`jwt.getClaims().get("realm_access")`** — Dive into the JWT payload and grab the `realm_access` object
2. **`.get("roles")`** — Extract the list of role names from the map
3. **`.map(role -> "ROLE_" + role)`** — Prefix each role with `ROLE_`
4. **`.map(SimpleGrantedAuthority::new)`** — Convert each string into a `SimpleGrantedAuthority` object

### ❓ Why the `ROLE_` prefix?

When you use `hasRole("ACCOUNTS")` in Spring Security, the framework internally checks for `ROLE_ACCOUNTS`. You write `hasRole("ACCOUNTS")`, but Spring looks for `ROLE_ACCOUNTS`. The converter must add this prefix, otherwise the role matching silently fails.

⚠️ **Common Mistake:** Adding the `ROLE_` prefix in the `hasRole()` call. Don't write `hasRole("ROLE_ACCOUNTS")` — Spring adds the prefix automatically. You'd end up checking for `ROLE_ROLE_ACCOUNTS`.

---

## Wiring the Converter into SecurityConfig

### The Helper Method

```java
private Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
    return new ReactiveJwtAuthenticationConverterAdapter(converter);
}
```

### Updating the JWT Configuration

Replace `Customizer.withDefaults()` with the extractor:

```java
http.oauth2ResourceServer(rs -> rs
        .jwt(jwtSpec -> jwtSpec.jwtAuthenticationConverter(grantedAuthoritiesExtractor()))
);
```

This tells Spring Security: "When validating JWT tokens, use my custom converter to extract roles."

---

## ✅ Key Takeaways

- `hasRole()` enforces specific role requirements per API path
- Keycloak stores roles in `realm_access.roles` inside the JWT payload
- Spring Security requires roles as `GrantedAuthority` objects with a `ROLE_` prefix
- The `KeycloakRoleConverter` bridges the gap between Keycloak's JWT structure and Spring Security's expectations
- For client credentials flow, roles are assigned under **Service account roles** (not the generic "Roles" tab)

💡 **Pro Tip:** Always decode your access tokens at `jwt.io` during development to verify roles are actually present before debugging authorization failures.
