# Authorization Code Grant Flow in EazyBank Microservices — Theory

## Introduction

We've understood the authorization code flow in the abstract. Now let's map it specifically to our EazyBank microservices architecture. How does this flow work when you have a Gateway server, Keycloak, and individual microservices? Let's trace the entire journey from end-user click to data on screen.

---

## The Architecture Players

| Component | Role |
|-----------|------|
| UI Web App / Mobile App | Client application |
| End User | The human using the app |
| Keycloak | Auth server |
| Spring Cloud Gateway | Resource server (edge server) |
| Accounts / Cards / Loans | Individual microservices |

---

## The Complete Flow — Step by Step

### Phase 1: The Innocent Request

**Step 1:** The client application naively sends a request to the Gateway without any token.

**Response from Gateway:** *"Sorry, I need an access token. Go get one from the auth server."*

### Phase 2: Registration (If Not Already Done)

**Step 2:** The client asks Keycloak for a token.

**Response from Keycloak:** *"I don't know you. Both you and your end user need to register with me first."*

Behind the scenes, the client application and the end user register with Keycloak and get their credentials set up.

### Phase 3: The Authorization Code Dance

**Step 3:** The client redirects the end user to Keycloak's login page, sending only the `client_id` (not the secret).

**Step 4:** The end user enters their credentials and provides consent: *"Yes, allow this client to access my resources."*

**Step 5:** Keycloak validates the credentials and sends back an **authorization code** to the client.

**Step 6:** The client now sends a backend request to Keycloak with:
- Client ID + Client Secret
- The authorization code

**Step 7:** Keycloak validates everything and responds: *"Here's your access token. It belongs to the end user — don't misuse it."*

### Phase 4: Accessing Resources

**Step 8:** The client sends the request to the Gateway with the access token.

**Step 9:** The Gateway validates the token by connecting with Keycloak.

**Step 10:** If valid, the Gateway forwards the request to the appropriate microservice.

**Step 11:** The microservice processes the request and returns the response.

**Step 12:** Gateway forwards the response back to the client.

**Step 13:** The client displays the data in the UI for the end user.

---

## Key Insight: Gateway Doesn't Care About the Grant Type

Here's something powerful — the Gateway server's configuration is **identical** regardless of whether the client used Client Credentials or Authorization Code to obtain the token. 

The Gateway only validates the access token. It doesn't know (or care) *how* the token was obtained. Both flows produce a JWT that gets validated the same way.

This means:
- Zero code changes in the Gateway when switching between flows
- The same `SecurityConfig` handles both scenarios
- The same JWT validation logic works for both

---

## When to Use Which Flow?

| Scenario | Grant Type |
|----------|-----------|
| Backend service calling another service | Client Credentials |
| User browsing a web application | Authorization Code |
| Mobile app with logged-in user | Authorization Code |
| Scheduled batch job accessing APIs | Client Credentials |
| Admin dashboard accessed by employees | Authorization Code |

The simple rule: **end user involved? → Authorization Code. No end user? → Client Credentials.**

---

## ✅ Key Takeaways

- The authorization code flow involves more steps but is designed for security when browsers/users are involved
- The Gateway server acts as a resource server identically for both grant types
- The client never sees the user's credentials — the user interacts directly with Keycloak
- The access token belongs to the end user — the client is just a trusted intermediary
- No changes needed in the Gateway or microservices configuration to support multiple grant types simultaneously
