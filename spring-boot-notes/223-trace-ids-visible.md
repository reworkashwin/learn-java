# Making Trace IDs Visible to Clients

## Introduction

Observability is working beautifully — logs, traces, and metrics all flowing into Grafana. But here's a real-world scenario: **a runtime exception occurs** in your application. The client team reports the error but has no context for the backend team to debug with. The backend developer has to dig through logs, match timestamps, and find the right trace ID. That takes time.

What if the **trace ID was sent back to the client** in the error response? The client team could hand it directly to the backend team, and debugging would start instantly.

---

## The Problem

### Current Flow (Slow Debugging)

1. Client app gets a 500 error
2. Client team tells backend team: "We got an error at 3:15 PM doing X"
3. Backend developer opens Grafana, filters logs by time, searches for the error
4. Eventually finds the trace ID — 5 to 10 minutes lost

### Better Flow (Instant Debugging)

1. Client app gets a 500 error **with a trace ID** in the response
2. Client team shares the trace ID with backend team
3. Backend developer pastes the trace ID in Grafana → immediately sees the full trace and logs

---

## Step 1: Add Trace ID to the Error Response DTO

Add a `traceId` field to your `ErrorResponseDto`:

```java
public class ErrorResponseDto {
    private String apiPath;
    private int errorCode;
    private String errorMessage;
    private LocalDateTime errorTime;
    private String traceId;  // NEW FIELD
}
```

---

## Step 2: Inject the Tracer in the Global Exception Handler

Use Micrometer's `Tracer` to access the current trace context:

```java
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final Tracer tracer;

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDto> handleRuntimeException(
            RuntimeException ex, WebRequest request) {

        String traceId = "";
        TraceContext context = tracer.currentTraceContext().context();
        if (context != null) {
            traceId = context.traceId();
        }

        ErrorResponseDto error = new ErrorResponseDto(
            request.getDescription(false),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ex.getMessage(),
            LocalDateTime.now(),
            traceId  // Include trace ID
        );

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### What's Happening Here:

1. **`Tracer`** — injected from the Micrometer library, provides access to tracing context
2. **`currentTraceContext().context()`** — gets the `TraceContext` for the current request
3. **`context.traceId()`** — extracts the unique trace ID assigned by Micrometer
4. The null check ensures we handle cases where tracing context might not be available

Apply the same pattern to **every exception handler method** in your class (e.g., `NullPointerException`, custom exceptions).

---

## Step 3: Test It

### Simulate an Error

Temporarily throw a runtime exception in a controller:

```java
@GetMapping("/api/companies/public")
public ResponseEntity<List<Company>> getAllCompanies() {
    throw new RuntimeException("Exception occurred");
    // return ResponseEntity.ok(companyService.getAll());
}
```

### The Response

```json
{
    "apiPath": "/api/companies/public",
    "errorCode": 500,
    "errorMessage": "Exception occurred",
    "errorTime": "2024-01-15T10:30:45",
    "traceId": "abc123def456ghi789"
}
```

The client now has the trace ID!

---

## Step 4: Debug Using the Trace ID

1. Go to **Grafana → Drill Down → Traces**
2. Paste the trace ID from the error response
3. Immediately see:
   - The complete request path
   - Which controller received the request
   - Which service method processed it
   - Where the exception was thrown

4. Click the **logs icon** to see all logs for that request:

```
→ Entering method: CompanyController.getAllCompanies
→ Entering method: CompanyServiceImpl.getAll
→ Entering method: CompanyRepository.findAll
→ Exiting method: CompanyRepository.findAll
→ Exiting method: CompanyServiceImpl.getAll
→ Exception occurred: RuntimeException - "Exception occurred"
   at CompanyController.getAllCompanies
```

The entire request journey is visible — from entry to exception.

---

## The Complete Debugging Workflow

```
Client → Gets error with traceId → Shares traceId with backend team
                                            ↓
                                  Backend developer opens Grafana
                                            ↓
                                  Pastes traceId in Traces search
                                            ↓
                                  Sees complete request path + timing
                                            ↓
                                  Clicks logs → sees all related logs
                                            ↓
                                  Identifies exact error location
```

**Total debugging time: seconds, not minutes.**

---

## ✅ Key Takeaways

- Include the **trace ID** in error responses so clients can share it with backend teams
- Use Micrometer's **`Tracer`** to access the trace context: `tracer.currentTraceContext().context().traceId()`
- Always check for **null** before accessing the trace context
- Apply this pattern to **every exception handler** in your `@RestControllerAdvice` class
- With the trace ID, backend developers can jump **directly** to the relevant trace and logs in Grafana
- This eliminates the 5–10 minute search process and enables **instant debugging**

---

## ⚠️ Common Mistakes

- Forgetting to add `@RequiredArgsConstructor` when injecting `Tracer` via constructor injection
- Not null-checking the `TraceContext` — it can be null if tracing isn't active for that request
- Only adding trace ID to one exception handler — apply it to all methods in the `GlobalExceptionHandler`
- Leaving test exceptions (like `throw new RuntimeException`) in production code

---

## 💡 Pro Tips

- Consider adding trace IDs to **all** API responses (not just errors) via a response filter — this helps with general debugging too
- In microservices, the same trace ID propagates across service calls, so the client only needs one ID to debug the entire chain
- Store trace IDs in your error logging database — correlate support tickets with traces
- This pattern transforms your team's debugging culture from "let me check the logs" to "give me the trace ID"
