# Deep Dive and Demo of Loans Microservice

## Introduction

Whether you built the Loans Microservice yourself or not, this lecture walks through every layer of its code — from `pom.xml` to Postman testing. The structure mirrors Accounts Microservice almost exactly, but the business logic and database schema are specific to loans. Let's walk through it together.

---

## Concept 1: Project Setup — pom.xml and application.yml

### ⚙️ The Dependencies

The `pom.xml` is identical to Accounts — same dependencies, same versions:

- `spring-boot-starter-web` — REST API support
- `spring-boot-starter-data-jpa` — database access
- `spring-boot-starter-validation` — input validation
- `spring-boot-starter-actuator` — health and metrics
- `spring-boot-devtools` — hot reload during development
- `h2` — in-memory database
- `lombok` — boilerplate reduction
- `springdoc-openapi-starter-webmvc-ui` — API documentation

Only the `artifactId`, `name`, and `description` change from "accounts" to "loans".

### ⚙️ The Configuration (application.yml)

```yaml
server:
  port: 8090   # Loans runs on 8090, not 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ''
  h2:
    console:
      enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true
```

Everything is copied from Accounts — only the port number changes to `8090`.

---

## Concept 2: Database Schema

### ⚙️ schema.sql

```sql
CREATE TABLE IF NOT EXISTS loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    loan_number VARCHAR(100) NOT NULL,
    loan_type VARCHAR(100) NOT NULL,
    total_loan INT NOT NULL,
    amount_paid INT NOT NULL,
    outstanding_amount INT NOT NULL,
    created_at DATE NOT NULL,
    created_by VARCHAR(20) NOT NULL,
    updated_at DATE DEFAULT NULL,
    updated_by VARCHAR(20) DEFAULT NULL
);
```

### ❓ Why no Customer table?

The customer already exists in the Accounts Microservice. Instead of duplicating it, we use the **mobile number** as the linking field. The same mobile number used to create an account in Accounts Microservice is used here to create a loan. Later, we'll fetch combined data from all microservices using this shared identifier.

---

## Concept 3: Entity Layer

### ⚙️ BaseEntity

Identical to Accounts — four audit columns with JPA auditing annotations:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity {
    @CreatedDate
    private LocalDateTime createdAt;
    @CreatedBy
    private String createdBy;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    @LastModifiedBy
    private String updatedBy;
}
```

### ⚙️ Loans Entity

```java
@Entity
public class Loans extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long loanId;
    
    private String mobileNumber;
    private String loanNumber;
    private String loanType;
    private int totalLoan;
    private int amountPaid;
    private int outstandingAmount;
}
```

Since field names match column names exactly, no `@Column` annotation is needed — JPA handles the mapping automatically.

---

## Concept 4: DTO Layer with Validation and Documentation

### ⚙️ LoansDto

```java
@Schema(name = "Loans", description = "Schema to hold Loan information")
public class LoansDto {

    @NotEmpty(message = "Mobile number cannot be null or empty")
    @Pattern(regexp = "(^$|[0-9]{10})", message = "Mobile number must be 10 digits")
    @Schema(description = "Mobile number of customer", example = "9345432123")
    private String mobileNumber;

    @NotEmpty(message = "Loan number cannot be null or empty")
    @Pattern(regexp = "(^$|[0-9]{12})", message = "Loan number must be 12 digits")
    @Schema(description = "Loan number of the customer", example = "548732457654")
    private String loanNumber;

    @NotEmpty(message = "Loan type cannot be null or empty")
    @Schema(description = "Type of the loan", example = "Home Loan")
    private String loanType;

    @Positive(message = "Total loan amount should be greater than zero")
    @Schema(description = "Total loan amount", example = "100000")
    private int totalLoan;

    @PositiveOrZero(message = "Amount paid should be equal to or greater than zero")
    @Schema(description = "Total amount paid", example = "1000")
    private int amountPaid;

    @PositiveOrZero(message = "Outstanding amount should be equal to or greater than zero")
    @Schema(description = "Total outstanding amount", example = "99000")
    private int outstandingAmount;
}
```

### New Validation Annotations

| Annotation | Rule |
|---|---|
| `@Positive` | Value must be > 0 (zero not allowed) |
| `@PositiveOrZero` | Value must be >= 0 (zero allowed, negatives not) |

These are perfect for financial fields — a total loan must be positive, but amount paid can start at zero.

### 💡 Insight

Notice `loanId` is NOT in the DTO. The primary key is a technical detail — clients don't need to see it. This is the DTO pattern in action: expose business data, hide infrastructure data.

---

## Concept 5: Repository Layer

```java
public interface LoansRepository extends JpaRepository<Loans, Long> {
    Optional<Loans> findByMobileNumber(String mobileNumber);
    Optional<Loans> findByLoanNumber(String loanNumber);
}
```

Since the primary key is `loanId` (auto-generated), we need custom finder methods for business queries:
- `findByMobileNumber` — for fetching and deleting loans
- `findByLoanNumber` — for updating loans (loan number is immutable)

---

## Concept 6: Service Layer — Business Logic

### Create Loan

```java
public void createLoan(String mobileNumber) {
    Optional<Loans> existingLoan = loansRepository.findByMobileNumber(mobileNumber);
    if (existingLoan.isPresent()) {
        throw new LoanAlreadyExistsException("Loan already exists for mobile: " + mobileNumber);
    }
    loansRepository.save(createNewLoan(mobileNumber));
}

private Loans createNewLoan(String mobileNumber) {
    Loans newLoan = new Loans();
    long randomLoanNumber = 100_000_000_000L + new Random().nextInt(900_000_000);
    newLoan.setLoanNumber(Long.toString(randomLoanNumber));
    newLoan.setMobileNumber(mobileNumber);
    newLoan.setLoanType("Home Loan");
    newLoan.setTotalLoan(100_000);
    newLoan.setAmountPaid(0);
    newLoan.setOutstandingAmount(100_000);
    return newLoan;
}
```

### Java number formatting trick

Notice `100_000` instead of `100000`. Since Java 7, you can use **underscores in numeric literals** for readability. The compiler ignores them — `100_000` compiles to exactly `100000`.

### Fetch Loan

```java
public LoansDto fetchLoan(String mobileNumber) {
    Loans loans = loansRepository.findByMobileNumber(mobileNumber)
        .orElseThrow(() -> new ResourceNotFoundException("Loan", "mobileNumber", mobileNumber));
    return LoansMapper.mapToLoansDto(loans, new LoansDto());
}
```

### Update Loan

```java
public boolean updateLoan(LoansDto loansDto) {
    Loans loans = loansRepository.findByLoanNumber(loansDto.getLoanNumber())
        .orElseThrow(() -> new ResourceNotFoundException("Loan", "loanNumber", loansDto.getLoanNumber()));
    LoansMapper.mapToLoans(loansDto, loans);
    loansRepository.save(loans);
    return true;
}
```

Uses `findByLoanNumber` (not mobile number) because loan number is the immutable business key used for updates.

### Delete Loan

```java
public boolean deleteLoan(String mobileNumber) {
    Loans loans = loansRepository.findByMobileNumber(mobileNumber)
        .orElseThrow(() -> new ResourceNotFoundException("Loan", "mobileNumber", mobileNumber));
    loansRepository.deleteById(loans.getLoanId());
    return true;
}
```

---

## Concept 7: Controller Layer

The controller follows exactly the same pattern as Accounts:

```java
@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
@Tag(name = "CRUD REST APIs for Loans in EazyBank", description = "...")
public class LoansController {
    
    @PostMapping("/create")
    @Operation(summary = "Create Loan REST API")
    @ApiResponse(responseCode = "201", description = "HTTP Status CREATED")
    public ResponseEntity<ResponseDto> createLoan(@RequestParam @Pattern(...) String mobileNumber) { ... }

    @GetMapping("/fetch")
    @Operation(summary = "Fetch Loan Details REST API")
    public ResponseEntity<LoansDto> fetchLoanDetails(@RequestParam @Pattern(...) String mobileNumber) { ... }

    @PutMapping("/update")
    @Operation(summary = "Update Loan Details REST API")
    @ApiResponses({ ... }) // 200, 417, 500
    public ResponseEntity<ResponseDto> updateLoanDetails(@Valid @RequestBody LoansDto loansDto) { ... }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete Loan Details REST API")
    @ApiResponses({ ... }) // 200, 417, 500
    public ResponseEntity<ResponseDto> deleteLoanDetails(@RequestParam @Pattern(...) String mobileNumber) { ... }
}
```

---

## Concept 8: Testing with Postman

### 🧪 Complete Test Flow

1. **Create Loan** — `POST localhost:8090/api/create?mobileNumber=9345432123` → 201 Created
2. **Fetch Loan** — `GET localhost:8090/api/fetch?mobileNumber=9345432123` → Returns loan details
3. **Update Loan** — `PUT localhost:8090/api/update` with body → 200 OK
4. **Negative Tests:**
   - Negative amounts → Validation errors (`@Positive`, `@PositiveOrZero`)
   - Invalid mobile number → Pattern validation error
   - Non-existent mobile → Resource not found exception
5. **Delete Loan** — `DELETE localhost:8090/api/delete?mobileNumber=9345432123` → 200 OK
6. **Fetch after delete** → Resource not found exception

All negative scenarios, exception handling, and validation work exactly as expected.

---

## ✅ Key Takeaways

- Loans Microservice mirrors Accounts in structure — same patterns, different business data
- Runs on port `8090` — use the same mobile number across all microservices
- Uses `@Positive` and `@PositiveOrZero` for financial field validation
- No Customer table — uses mobile number as the cross-service link
- `loanId` stays out of the DTO — primary keys are infrastructure, not business data
- Java underscores in numbers (`100_000`) improve readability without affecting logic

## ⚠️ Common Mistakes

- Using a different port than 8090 — will break Docker and Kubernetes configs later
- Creating a Customer table in Loans — the customer lives in Accounts only
- Using different mobile numbers for Accounts and Loans — they need to match for later integration
- Confusing `@Positive` with `@PositiveOrZero` — one disallows zero, the other permits it

## 💡 Pro Tips

- The repetition across three microservices is intentional — by the time you've seen accounts, loans, and cards, these patterns are in your muscle memory
- Import the Postman collection from GitHub to save time setting up test requests
- The three-microservice structure sets up the foundation for Spring Cloud concepts: service discovery, API gateway, config server, and more
- Each concept, each configuration appears three times across three microservices — that's how you never forget them
