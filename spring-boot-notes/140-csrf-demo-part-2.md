# CSRF Protection End-to-End Demo — Part 2

## Introduction

In the previous lecture, we configured CSRF token generation and built the REST API to serve tokens. Now it's time to see it **in action** — testing from Postman, understanding how the client application (React) handles CSRF tokens, and performing end-to-end registration and login through the UI.

---

## The End-to-End CSRF Flow

Here's how the flow works from start to finish:

```
1. Client loads the app → requests CSRF token via GET /api/csrf-token/public/v1.0
    ↓
2. Backend generates CSRF token and returns it:
   - As a COOKIE (XSRF-TOKEN) — browser stores this
   - As RESPONSE BODY — client can read this too
    ↓
3. Client makes a non-safe request (e.g., POST /register):
   - Browser automatically sends the XSRF-TOKEN cookie
   - Client JavaScript reads the cookie value
   - Client places the same value in the X-XSRF-TOKEN header
    ↓
4. Backend (CsrfFilter) validates:
   - Is the token in the cookie? ✅
   - Is the same token in the header? ✅
   - Do they match? ✅ → ACCEPT the request
```

---

## Testing from Postman

### Step 1: Request a CSRF Token

```
GET http://localhost:8080/api/csrf-token/public/v1.0
```

Response body:
```json
{
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "headerName": "X-XSRF-TOKEN",
    "parameterName": "_csrf"
}
```

A cookie named `XSRF-TOKEN` is also set in the browser/Postman.

### Step 2: Send a POST Request WITHOUT the Header

```
POST http://localhost:8080/api/register/public/v1.0
Cookie: XSRF-TOKEN=a1b2c3d4... (auto-attached)
Header: (X-XSRF-TOKEN is MISSING)
```

Result: **401 Unauthorized** ❌

The cookie is present, but the header is missing — exactly the same situation a hacker would face.

### Step 3: Send a POST Request WITH the Header

```
POST http://localhost:8080/api/register/public/v1.0
Cookie: XSRF-TOKEN=a1b2c3d4... (auto-attached)
Header: X-XSRF-TOKEN=a1b2c3d4... (manually added)
```

Result: **201 Created** ✅

Both the cookie and header are present with matching values — request accepted!

### Step 4: Tamper with the Token

If even **one character** of the token is changed in the header:

```
Header: X-XSRF-TOKEN=a1b2c3d4... (one character modified)
```

Result: **401 Unauthorized** ❌

The tokens don't match — Spring Security rejects the request.

---

## How the React Frontend Handles CSRF

### 🧠 The Interceptor Pattern

In the frontend, an **HTTP interceptor** runs before every outgoing request:

```javascript
// httpClient.js — Request Interceptor
axios.interceptors.request.use(async (config) => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    
    if (!safeMethods.includes(config.method.toUpperCase())) {
        // Check if CSRF token already exists in cookies
        let csrfToken = cookies.get('XSRF-TOKEN');
        
        if (!csrfToken) {
            // First non-safe request — fetch CSRF token from backend
            const response = await axios.get('/api/csrf-token/public/v1.0');
            csrfToken = cookies.get('XSRF-TOKEN');
        }
        
        // Attach token to request header
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
});
```

### 🔍 How This Works

1. **Check if it's a non-safe method** — only POST, PUT, DELETE need CSRF tokens.
2. **Look for an existing CSRF cookie** — if found, use it directly.
3. **If no cookie exists** — make a GET request to `/api/csrf-token/public/v1.0` to get one.
4. **Attach the token value to the request header** (`X-XSRF-TOKEN`).

This happens **transparently** — the rest of the frontend code doesn't need to know about CSRF at all.

---

## End-to-End UI Demo

### Login with Demo Accounts

The UI has a "Show Demo Credentials" button that pre-fills login details:

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | john@gmail.com | EazyBytes@1803 |
| Employer | sanjana@gmail.com | EazyBytes@1803 |
| Admin | admin@gmail.com | EazyBytes@1803 |

Each role sees different menu options:

| Role | Menu Items |
|------|-----------|
| Job Seeker | Profile, Applied Jobs, Saved Jobs, Sign Out |
| Employer | Post New Job, Job Postings, Sign Out |
| Admin | Company Management, Employer Management, Contact Messages, Sign Out |

### Registration from the UI

1. Click "Sign Up" → Registration page appears.
2. Fill in: Name, Email, Mobile Number, Password.
3. Click "Create Account" → registration succeeds.
4. User immediately gets `ROLE_JOB_SEEKER` by default.
5. Login works with the newly created account.

---

## Important Configuration: Companies API as Public

The homepage loads company data. If this API isn't public, the homepage breaks:

```java
// In PathsConfig — add to public paths:
"/api/companies/public/**"
```

---

## The Complete CSRF Configuration Summary

### Backend Configuration (SecurityConfig)

```java
http.csrf(csrfConfig -> csrfConfig
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
);
```

### CSRF Token REST API

```java
@RestController
@RequestMapping("/api/csrf-token")
public class CsrfController {
    @GetMapping("/public/v1.0")
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    }
}
```

### Key Spring Security Classes

| Class | Role |
|-------|------|
| `CsrfFilter` | Validates CSRF tokens on non-safe requests |
| `CookieCsrfTokenRepository` | Generates and stores tokens in cookies |
| `CsrfTokenRequestAttributeHandler` | Makes token available as request attribute |
| `DefaultCsrfToken` | The actual token implementation |

---

## ✅ Key Takeaways

- **Both cookie AND header** must contain the CSRF token for non-safe requests to succeed.
- Postman testing proves the concept: with header → works; without header → 401; tampered header → 401.
- Frontend interceptors handle CSRF **transparently** — fetch the token once, attach it to every subsequent request.
- The CSRF token is fetched **lazily** — only when the first non-safe request needs it.
- End-to-end flow (register → login → role-based menus) works completely with CSRF protection enabled.

## ⚠️ Common Mistakes

- **Not adding the CSRF endpoint to public paths** — unauthenticated users can't fetch tokens.
- **Forgetting the companies API path** — homepage breaks because it can't load company data.
- **Manually managing CSRF tokens in every API call** — use an interceptor pattern instead.
- **Not testing with token tampering** — verify that modified tokens are properly rejected.

## 💡 Pro Tips

- Use **browser dev tools** (Network tab) to observe CSRF cookies and headers in real requests — great for debugging.
- The `CsrfFilter` runs in Spring Security's filter chain — if you see 401 errors on POST requests, check CSRF first.
- For Postman testing, always fetch a fresh CSRF token before making POST/PUT/DELETE requests — tokens can expire.
- The React interceptor pattern shown here works with Axios but the concept applies to any HTTP client (Fetch API, Angular's HttpClient, etc.).
