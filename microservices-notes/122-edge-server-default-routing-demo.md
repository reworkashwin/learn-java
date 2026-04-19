# Demo: Edge Server with Default Routing

## Introduction

Our gateway server is built and configured. Let's see it in action — sending requests through the gateway instead of directly to microservices, and understanding how the default routing works under the hood.

---

## Checking the Setup

### Eureka Dashboard

At `http://localhost:8070`, you should see four services registered:
- **ACCOUNTS**
- **CARDS**
- **LOANS**
- **GATEWAY-SERVER**

Yes, the gateway itself registers with Eureka. You can also click on it to see its info metadata.

### Gateway Routes Endpoint

At `http://localhost:8072/actuator/gateway/routes`, you get a JSON response listing all automatically discovered routes. For each microservice, you'll see:

```json
{
  "route_id": "...",
  "predicate": "Paths: [/ACCOUNTS/**]",
  "filters": ["[RewritePath /ACCOUNTS/(?<remaining>.*) = '/${remaining}']"],
  "uri": "lb://ACCOUNTS",
  "order": 0
}
```

### 🧠 Breaking Down the Route Config

- **Predicate**: `Paths: [/ACCOUNTS/**]` — matches any request starting with `/ACCOUNTS/`
- **Filter**: `RewritePath` — removes the `/ACCOUNTS` prefix before forwarding. So `/ACCOUNTS/api/create` becomes `/api/create`
- **URI**: `lb://ACCOUNTS` — `lb` means "load balanced". It uses Eureka to find an ACCOUNTS instance and routes there

---

## Testing Through the Gateway

### Creating Data

```
POST http://localhost:8072/ACCOUNTS/api/create
Body: { "name": "...", "email": "...", "mobileNumber": "..." }
```

The gateway receives this, strips `/ACCOUNTS`, and forwards `POST /api/create` to the accounts microservice. Response: 201 Created.

### Fetching Data

```
GET http://localhost:8072/ACCOUNTS/api/fetch?mobileNumber=1234567890
```

Same principle — gateway strips the prefix and forwards. You get the account details back.

### Cross-Service Calls

Loans and cards work identically:

```
GET http://localhost:8072/LOANS/api/fetch?mobileNumber=...
GET http://localhost:8072/CARDS/api/fetch?mobileNumber=...
```

### 💡 The Key Insight

External clients no longer need to know individual microservice ports (8080, 8090, 8091). They only need to know:
- Gateway address: `localhost:8072`
- Service name: `ACCOUNTS`, `LOANS`, `CARDS`
- API path: `/api/create`, `/api/fetch`, etc.

---

## Gateway Server's Own Routes

The gateway also has a route for itself:

```json
{
  "predicate": "Paths: [/GATEWAY-SERVER/**]",
  "uri": "lb://GATEWAY-SERVER"
}
```

This means if you expose any APIs from the gateway server itself (like custom endpoints), external clients can access them through the same gateway with the prefix `GATEWAY-SERVER`.

---

## The Security Question

You might wonder: *"What stops clients from bypassing the gateway and calling microservices directly?"*

Right now — nothing. Clients *can* still call `localhost:8080/api/create` directly. But in later sections, we'll enforce **security** on the gateway that requires authentication. At that point, microservices won't accept unauthenticated requests, and the only way to authenticate is through the gateway.

---

## ✅ Key Takeaways

- Default routing uses the **uppercase service name** as the path prefix (e.g., `/ACCOUNTS/...`)
- The `RewritePath` filter automatically strips the prefix before forwarding to the actual microservice
- `lb://` in the URI means load-balanced routing via Eureka
- All external traffic goes to port `8072` (gateway), not to individual service ports
- The gateway actuator endpoint (`/actuator/gateway/routes`) shows all active routes
- Currently, clients can bypass the gateway — security enforcement comes later

## ⚠️ Common Mistakes

- Using wrong case for the service name — by default, Eureka registers services in **ALL CAPS**, so the path must be `/ACCOUNTS/...` not `/accounts/...`
- Forgetting the trailing path after the service name — `/ACCOUNTS` alone won't work, you need `/ACCOUNTS/api/...`
- Using the wrong mobile number when testing fetch — each microservice uses its own H2 database, so data must be created first

## 💡 Pro Tip

Install a JSON viewer browser extension (like "JSON View" for Chrome) to see formatted JSON responses when accessing actuator endpoints directly in the browser. Raw JSON is hard to read.
