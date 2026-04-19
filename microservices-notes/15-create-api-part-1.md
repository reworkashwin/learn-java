# CREATE API Inside Accounts Microservice — Part 1

## Introduction

It's time to build actual business logic. In this lecture, we create the **Create Account REST API** — the endpoint that accepts customer information and creates both a new customer record and a new bank account in the database. Along the way, we establish critical patterns: **controller → service → repository** layering, **mapper classes**, **constants management**, and the `ResponseEntity` pattern for rich HTTP responses.

---

## Setting Up the Controller

### Base Path & Media Type

Before writing any endpoint, establish a common prefix for all APIs in this controller:

```java
@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class AccountsController {
    // ...
}
```

- **`@RequestMapping(path = "/api")`** — Every API in this controller will start with `/api`
- **`produces = MediaType.APPLICATION_JSON_VALUE`** — All responses will be JSON

### The Create Endpoint

```java
@PostMapping("/create")
public ResponseEntity<ResponseDto> createAccount(@RequestBody CustomerDto customerDto) {
    iAccountsService.createAccount(customerDto);
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new ResponseDto(AccountsConstants.STATUS_201, AccountsConstants.MESSAGE_201));
}
```

Key decisions here:
- **`@PostMapping`** — CREATE operations always use HTTP POST
- **`@RequestBody`** — Maps the incoming JSON body to a `CustomerDto` object
- **`ResponseEntity`** — Gives full control over the HTTP response (status code, headers, body)
- **`HttpStatus.CREATED` (201)** — The correct HTTP status for "resource created" (not 200 OK!)

---

## Why `ResponseEntity` Over Plain Objects?

If you just return a `ResponseDto`, Spring sends it as the body with a default 200 status. But with `ResponseEntity`, you control:

- **Status code** — `HttpStatus.CREATED`, `HttpStatus.OK`, `HttpStatus.NOT_FOUND`, etc.
- **Headers** — Content-Type, custom headers, etc.
- **Body** — Your DTO object

This is a professional-grade approach. Real APIs need proper HTTP status codes, not just 200 for everything.

---

## Constants Class — No Magic Strings

Never hardcode status codes and messages directly in your business logic:

```java
public final class AccountsConstants {

    private AccountsConstants() {
        // Prevent instantiation
    }

    public static final String SAVINGS = "Savings";
    public static final String ADDRESS = "123 Main Street, New York";
    public static final String STATUS_201 = "201";
    public static final String MESSAGE_201 = "Account created successfully";
    public static final String STATUS_200 = "200";
    public static final String MESSAGE_200 = "Request processed successfully";
    public static final String STATUS_500 = "500";
    public static final String MESSAGE_500 = "An error occurred. Please try again or contact Dev team";
}
```

- **Private constructor** — Prevents anyone from creating an instance of a constants-only class
- **`static final`** — Constants are accessed via `AccountsConstants.STATUS_201`
- **ALL_CAPS with underscores** — Standard Java convention for constants

---

## The Service Layer — Interface + Implementation

### The Interface

```java
public interface IAccountsService {
    void createAccount(CustomerDto customerDto);
}
```

The `I` prefix is a common convention indicating it's an interface (with implementation classes elsewhere).

### The Implementation

```java
@Service
@AllArgsConstructor
public class AccountsServiceImpl implements IAccountsService {

    private AccountsRepository accountsRepository;
    private CustomerRepository customerRepository;

    @Override
    public void createAccount(CustomerDto customerDto) {
        // Business logic here
    }
}
```

**Why `@AllArgsConstructor` instead of `@Autowired`?** Lombok generates a constructor accepting both repositories. When there's only one constructor, Spring auto-wires it — no `@Autowired` needed. This is the **recommended approach** (constructor injection > field injection).

---

## Mapper Classes — Entity ↔ DTO Conversion

The mapper sits between your DTO and entity layers, converting data both ways:

```java
public class AccountsMapper {

    public static AccountsDto mapToAccountsDto(Accounts accounts, AccountsDto accountsDto) {
        accountsDto.setAccountNumber(accounts.getAccountNumber());
        accountsDto.setAccountType(accounts.getAccountType());
        accountsDto.setBranchAddress(accounts.getBranchAddress());
        return accountsDto;
    }

    public static Accounts mapToAccounts(AccountsDto accountsDto, Accounts accounts) {
        accounts.setAccountNumber(accountsDto.getAccountNumber());
        accounts.setAccountType(accountsDto.getAccountType());
        accounts.setBranchAddress(accountsDto.getBranchAddress());
        return accounts;
    }
}
```

### Why Not Use MapStruct or ModelMapper?

Libraries like MapStruct and ModelMapper automate this mapping. However:
- They're **not officially supported** by Spring (not on start.spring.io)
- They add external dependencies your team/client may not approve
- Manual mappers give you **full control** — need to mask a mobile number? Need custom transformation? Easy.

For larger projects, discuss with your team whether automated mapping libraries are acceptable.

---

## ✅ Key Takeaways

- Use **`@PostMapping`** for create operations, return **`HttpStatus.CREATED` (201)**
- **`ResponseEntity`** gives full control over status codes, headers, and body — always use it
- Extract magic strings into a **constants class** with private constructor
- Follow **controller → service → repository** layering religiously
- **Constructor injection** (via `@AllArgsConstructor`) is preferred over `@Autowired` field injection
- Write **manual mapper classes** for entity ↔ DTO conversion until your team approves automated libraries

💡 **Pro Tip**: The `RequestMapping` prefix at the class level keeps your endpoint methods clean. Adding API versioning (`/api/v1`) here makes it trivial to version your APIs later.
