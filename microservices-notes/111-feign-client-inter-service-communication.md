# Feign Client Code Changes to Invoke Other Microservices

## Introduction

We've set up our Feign Client interfaces (`LoansFeignClient` and `CardsFeignClient`) in the accounts microservice. Now comes the exciting part — actually *using* them to fetch data from other microservices, consolidate all the responses, and send a single unified response back to the client.

Why does this matter? In a real banking application, when a customer logs in, they want to see *everything* — their account info, loan details, and card details — all in one place. That means our accounts microservice needs to talk to loans and cards microservices behind the scenes.

---

## Creating the Consolidated DTO

### 🧠 What is CustomerDetailsDto?

Before we can return a consolidated response, we need a data container that holds *all* the pieces together. That's what `CustomerDetailsDto` is — a DTO that combines customer personal info, account details, loan details, and card details.

### ⚙️ How to Build It

Start by copying the fields from `CustomerDto` (name, email, mobile number, account details), then add fields for `LoansDto` and `CardsDto`:

```java
@Data
@Schema(name = "CustomerDetails", description = "Schema to hold Customer, Account, Cards and Loans information")
public class CustomerDetailsDto {
    // Customer fields (name, email, mobileNumber)
    // AccountsDto accountsDto
    // LoansDto loansDto
    // CardsDto cardsDto
}
```

Each field gets its own `@Schema` annotation describing what it holds. Think of this DTO as a "master envelope" that packages everything about a customer.

---

## Building the CustomerController

### 🧠 What Does It Do?

We create a *separate* controller (`CustomerController`) dedicated to cross-service operations. This keeps the accounts-specific CRUD operations in `AccountsController` and the aggregation logic in its own space.

### ⚙️ Key Design Decisions

- **Separate controller** — Cross-service calls deserve their own endpoint rather than being stuffed into an existing controller
- **GET mapping** at `/api/fetchCustomerDetails` — accepts a `mobileNumber` query parameter
- **Validation** — same `@Pattern` regex for 10-digit mobile numbers that we use elsewhere
- **OpenAPI annotations** — for consistent API documentation

```java
@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class CustomerController {

    private final ICustomerService iCustomerService;

    public CustomerController(ICustomerService iCustomerService) {
        this.iCustomerService = iCustomerService;
    }

    @GetMapping("/fetchCustomerDetails")
    public ResponseEntity<CustomerDetailsDto> fetchCustomerDetails(
            @RequestParam @Pattern(regexp = "(^$|[0-9]{10})") String mobileNumber) {
        CustomerDetailsDto customerDetailsDto = iCustomerService.fetchCustomerDetails(mobileNumber);
        return ResponseEntity.status(HttpStatus.OK).body(customerDetailsDto);
    }
}
```

Notice: we use constructor injection with a single constructor — no need for `@Autowired`.

---

## The Service Layer — Where the Magic Happens

### 🧠 What Does CustomerServiceImpl Do?

This is the heart of the inter-service communication. It:
1. Fetches customer and account data from the **local database**
2. Calls the **loans microservice** via Feign Client
3. Calls the **cards microservice** via Feign Client
4. Consolidates everything into `CustomerDetailsDto`

### ⚙️ Dependencies Injected

```java
@Service
@AllArgsConstructor
public class CustomerServiceImpl implements ICustomerService {
    private AccountsRepository accountsRepository;
    private CustomerRepository customerRepository;
    private CardsFeignClient cardsFeignClient;
    private LoansFeignClient loansFeignClient;
}
```

Two are **repositories** (local DB access), two are **Feign Client interfaces** (remote service calls). With `@AllArgsConstructor`, Lombok generates the constructor and Spring autowires everything automatically.

### ⚙️ The fetchCustomerDetails Flow

```java
public CustomerDetailsDto fetchCustomerDetails(String mobileNumber) {
    // Step 1: Fetch customer from local DB
    Customer customer = customerRepository.findByMobileNumber(mobileNumber)
        .orElseThrow(() -> new ResourceNotFoundException("Customer", "mobileNumber", mobileNumber));

    // Step 2: Fetch account from local DB
    Accounts accounts = accountsRepository.findByCustomerId(customer.getCustomerId())
        .orElseThrow(() -> new ResourceNotFoundException("Account", "customerId", customer.getCustomerId().toString()));

    // Step 3: Map to CustomerDetailsDto
    CustomerDetailsDto customerDetailsDto = CustomerMapper.mapToCustomerDetailsDto(customer, new CustomerDetailsDto());
    customerDetailsDto.setAccountsDto(AccountsMapper.mapToAccountsDto(accounts, new AccountsDto()));

    // Step 4: Invoke Loans microservice via Feign
    ResponseEntity<LoansDto> loansDtoResponseEntity = loansFeignClient.fetchLoanDetails(mobileNumber);
    customerDetailsDto.setLoansDto(loansDtoResponseEntity.getBody());

    // Step 5: Invoke Cards microservice via Feign
    ResponseEntity<CardsDto> cardsDtoResponseEntity = cardsFeignClient.fetchCardDetails(mobileNumber);
    customerDetailsDto.setCardsDto(cardsDtoResponseEntity.getBody());

    return customerDetailsDto;
}
```

### 💡 What Happens Behind the Scenes at Step 4 & 5?

When you call `loansFeignClient.fetchLoanDetails(mobileNumber)`, here's what actually happens:

1. Feign Client connects to **Eureka Server**
2. Gets the **instance details** of the loans microservice
3. Spring Cloud Load Balancer picks one instance (if multiple exist)
4. Feign sends the actual HTTP request to that instance
5. Response comes back as `ResponseEntity<LoansDto>`

You never hard-coded any URL, port, or DNS name. You just declared an interface method and Spring did the rest.

---

## Testing the Complete Flow

1. Start **Config Server** → **Eureka Server** → **Accounts, Loans, Cards** microservices
2. Create test data with the **same mobile number** across all three services
3. Call `GET /api/fetchCustomerDetails?mobileNumber=1234567890` on the accounts microservice
4. You get a consolidated JSON with customer info, account details, loan details, and card details — all from one API call

---

## ✅ Key Takeaways

- Create a **dedicated DTO** to hold consolidated data from multiple microservices
- Use a **separate controller and service** for cross-service operations
- Feign Client abstracts away all the service discovery and load balancing — you just call methods on an interface
- Behind the scenes: Feign → Eureka → Load Balancer → Target microservice
- No hard-coded URLs anywhere — everything uses logical service names registered with Eureka

## ⚠️ Common Mistakes

- Forgetting to use the **same mobile number** across all services when testing (each service has its own H2 database)
- Mixing cross-service aggregation logic into existing CRUD controllers instead of keeping it separate
- Not understanding that Feign does the Eureka lookup + load balancing automatically

## 💡 Pro Tip

If you're confused by all the moving parts, remember this simple mental model: **Feign Client = a smart HTTP client that knows how to find services by name**. You write the interface, Spring writes the implementation, and Eureka provides the addresses.
