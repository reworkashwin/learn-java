# Securing Gateway Server with Client Credentials Flow — Theory

## Introduction

We've learned the Client Credentials grant type flow in abstract. Now let's map it directly onto our EasyBank microservices architecture. How exactly will we secure our Gateway Server? What changes? What stays the same? And why do we NOT secure individual microservices?

---

## The Architecture

Here's how security fits into our existing microservices network:

```
[External Client App]
        │
        │ Step 1: Request access token (client_id + client_secret)
        ▼
   [Keycloak Auth Server]
        │
        │ Step 2: Return access token
        ▼
[External Client App]
        │
        │ Step 3: Send request + access token
        ▼
   [Gateway Server (Resource Server)]
        │
        │ Step 4: Validate token with Keycloak
        │
        │ Step 5: Forward request to internal services
        ▼
   [Accounts / Loans / Cards Microservices]
```

### Key Design Decision

- **Gateway Server** = Resource Server (the only entry point that requires a valid token)
- **Keycloak** = Authorization Server (handles all authentication)
- **Individual Microservices** = NOT resource servers (they stay behind the firewall)

---

## Why Only Secure the Gateway?

This is a common interview question: *"Why not make every microservice a resource server?"*

### Reason 1: Unnecessary Complexity

If you make accounts, loans, and cards each validate tokens, every internal request between services needs a token. When accounts calls loans to get loan details — that internal call would need a token too. This creates a web of token validation that's hard to manage.

### Reason 2: Performance Impact

Every token validation requires a round-trip to the auth server. If every internal microservice validates tokens for every request (including internal communication), you're multiplying network calls by the number of services involved. That's a serious performance hit.

### Reason 3: The Gateway IS the Perimeter

The Gateway Server is the **edge server** — the single entry point to your microservices network. If you validate the token at the gate, everything inside the gate is trusted.

Think of it like airport security: you go through TSA *once* at the entrance. You don't go through security again at every gate, every shop, and every restaurant inside the airport.

### But Isn't Internal Communication Insecure Then?

Good question! The answer is: individual microservices are deployed **behind a firewall** or inside a private **Docker network**. External clients **cannot** reach them directly — they can only reach the Gateway Server.

The only component inside the firewall that's also accessible from outside is the Gateway. So if the Gateway validates the token, the external world can't bypass it.

⚠️ **Note:** This doesn't mean internal communication should be completely unsecured. There are other approaches for internal security (like mTLS or service mesh policies) that we'll explore when deploying to Kubernetes.

---

## The Complete Flow (Story Mode)

Let's walk through this as a narrative:

1. **Client Application** gets a task: "Fetch account details from EasyBank." Holiday's over.

2. **Client → Gateway:** "Hey, give me account details!" (No token)
   **Gateway → Client:** "Sorry, I need an access token from the auth server first."

3. **Client → Keycloak:** "Give me an access token!"
   **Keycloak → Client:** "Who are you? Register first and get approved by the admin."

4. *Client goes through registration process, gets client_id and client_secret*

5. **Client → Keycloak:** "Here's my client_id and client_secret. Token please!"
   **Keycloak:** *validates credentials*
   **Keycloak → Client:** "Here's your access token. (And ID token if you sent the openid scope.)"

6. **Client → Gateway:** "Here's the request for account details, and here's my access token."

7. **Gateway → Keycloak:** "Did you issue this token? Is it valid?"
   **Keycloak → Gateway:** "Yes, it's valid. Process the request."

8. **Gateway → Accounts Microservice:** *forwards the request internally*
   **Accounts → Gateway → Client:** *response flows back through the chain*

Everyone's happy. Client got its data, Gateway is secure, internal services didn't have to worry about tokens.

---

## ✅ Key Takeaways

- The Gateway Server becomes the **Resource Server** — the only externally-accessible component that validates tokens
- Keycloak acts as the **Authorization Server** — handles client registration, authentication, and token issuance
- Individual microservices (accounts, loans, cards) are **NOT** resource servers — they're behind a firewall
- Making every microservice a resource server causes unnecessary complexity and performance degradation
- External clients **must** go through the Gateway — direct access to internal services is blocked by Docker network/firewall
- Internal service-to-service security is handled separately (mTLS, service mesh) — covered in Kubernetes section
