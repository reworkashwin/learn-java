# Deep Dive and Demo of Cards Microservice

## Introduction

We've already built the Accounts and Loans microservices. Now it's time to complete the trio with the **Cards microservice**. This one follows the exact same architecture and patterns — so think of it as reinforcing everything you've learned, applied one more time with a different domain.

The Cards microservice handles credit/debit card issuance, retrieval, updates, and deletion for bank customers — identified by their mobile number.

---

## Setting Up the Cards Microservice

### Project Configuration (`pom.xml`)

Just like the other two microservices, you start by validating the `pom.xml`:

- **Artifact ID**: `cards`
- **Name**: `cards`
- **Dependencies**: Spring Web, Spring Data JPA, H2 Database, Lombok, etc.

The H2 in-memory database is especially important — it lets us run and test without needing an external DB.

### Application Properties (`application.yml`)

The key configuration here is the **port number**:

| Microservice | Port  |
|-------------|-------|
| Accounts    | 8080  |
| Loans       | 8090  |
| Cards       | 9000  |

Remaining properties handle H2 database configuration — same pattern as the other services.

### Database Schema (`schema.sql`)

A single table called `cards` with:
- `card_id` — Primary key (auto-incremented by Spring Data JPA)
- `mobile_number` — Links the card to a customer
- `card_number` — 12-digit generated number
- `card_type` — e.g., Credit Card, Debit Card
- `total_limit`, `amount_used`, `available_amount`
- Metadata/audit columns

💡 **Pro Tip**: The microservices in this course are intentionally kept simple. The goal is to learn **standards, patterns, and concepts** — not to get bogged down in complex business logic. Business logic differs from project to project, but the architecture stays consistent.

---

## Code Walkthrough

### Entity Layer

- **BaseEntity** — Shared audit fields (created/updated timestamps)
- **Cards Entity** — Maps to the `cards` table. Uses `@GeneratedValue` with `GenerationType.IDENTITY` for auto-incrementing the primary key.

### DTO Layer (Data Transfer Objects)

Following the **DTO pattern** (same as Accounts and Loans):
- `CardsDto` — Includes schema details, validation annotations (`@NotBlank`, `@Size`, etc.), and Swagger `@Schema` example values
- `ErrorResponseDto` — Standardized error responses
- `ResponseDto` — Generic success response wrapper

### Repository Layer

```java
public interface CardsRepository extends JpaRepository<Cards, Long> {
    Optional<Cards> findByMobileNumber(String mobileNumber);
    Optional<Cards> findByCardNumber(String cardNumber);
}
```

Two custom query methods — one to look up by mobile number, another by card number.

### Controller Layer — Four REST APIs

| HTTP Method | Path             | Purpose                      |
|------------|------------------|------------------------------|
| POST       | `/api/create`    | Issue a new card             |
| GET        | `/api/fetch`     | Fetch card details           |
| PUT        | `/api/update`    | Update card details          |
| DELETE     | `/api/delete`    | Delete a card                |

Each endpoint follows the same conventions:
- `@RequestMapping("/api")` at the class level
- Service layer auto-wired via constructor injection
- Proper HTTP status codes: `201` for create, `200` for success, `417` for expectation failed

### Service Layer — Business Logic

**Create Card:**
1. Check if a card already exists for the given mobile number
2. If yes → throw `CardAlreadyExistsException`
3. If no → generate a random 12-digit card number, set defaults (Credit Card, 100K limit, 0 used, 100K available), and save

**Fetch Card:**
1. Look up by mobile number
2. If not found → throw `ResourceNotFoundException`
3. If found → map entity to DTO and return

**Update Card:**
1. Look up by card number (card number doesn't change)
2. If not found → throw `ResourceNotFoundException`
3. If found → map DTO fields to entity, call `save()` (which performs UPDATE since primary key exists)

**Delete Card:**
1. Look up by mobile number
2. If not found → throw exception
3. If found → delete using `deleteById(cardId)`

⚠️ **Common Mistake**: Forgetting that `save()` performs an UPDATE when the entity already has a primary key, vs. an INSERT for new entities.

---

## Testing the APIs

### Create Card
- **POST** to `localhost:9000/api/create` with a mobile number
- Response: `201 Created`

### Fetch Card
- **GET** to `localhost:9000/api/fetch?mobileNumber=...`
- Returns: card number, card type (Credit Card), total limit (100K), amount used (0), available amount (100K)

### Update Card
- Copy the fetch response, modify fields (e.g., change type to Debit Card, amount used to 10K, available to 90K)
- **PUT** to `localhost:9000/api/update`
- Response: `200 OK`

### Validation Testing
- Send invalid data (negative numbers, 13-digit card number) → validation errors returned correctly
- Send non-existent mobile number to delete → `404 Not Found`

### Swagger UI
- Accessible at `localhost:9000/swagger-ui/index.html`
- Shows all four card APIs with schemas for `CardsDto`, `ErrorResponseDto`, and `ResponseDto`

---

## ✅ Key Takeaways

- The Cards microservice follows the **exact same layered architecture** as Accounts and Loans: Entity → DTO → Repository → Service → Controller
- All three microservices are now complete and ready to serve as the foundation for advanced concepts (service discovery, API gateway, etc.)
- Each microservice runs on its own port, has its own database, and operates independently

💡 **Pro Tip**: Take time to set up all three microservices locally. Test every API with the provided Postman collection. These microservices are the **stepping stone** for everything that comes next in the course — configuration management, service discovery, resiliency, observability, and deployment.

⚠️ **Important**: Make sure everything works with H2 before moving forward. If something is broken here, debugging will only get harder as we add more layers.
