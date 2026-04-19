# UPDATE API Inside Accounts Microservice

## Introduction

We can create and read accounts. Now let's build the **Update API** — an endpoint where clients can modify customer details (name, email, mobile number) and account details (account type, branch address). The critical rule: **account numbers cannot be changed** once created. We'll use the PUT HTTP method and see how JPA's `save()` intelligently handles both inserts and updates.

---

## The Update Endpoint

```java
@PutMapping("/update")
public ResponseEntity<ResponseDto> updateAccountDetails(@RequestBody CustomerDto customerDto) {
    boolean isUpdated = iAccountsService.updateAccount(customerDto);
    if (isUpdated) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ResponseDto(AccountsConstants.STATUS_200, AccountsConstants.MESSAGE_200));
    } else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseDto(AccountsConstants.STATUS_500, AccountsConstants.MESSAGE_500));
    }
}
```

- **`@PutMapping`** — Update operations use HTTP PUT
- Returns `boolean` from service: `true` = success response, `false` = error response
- The client sends the **same structure** as the fetch response (customer + account details)

---

## The Update Logic — Step by Step

```java
@Override
public boolean updateAccount(CustomerDto customerDto) {
    boolean isUpdated = false;
    AccountsDto accountsDto = customerDto.getAccountsDto();
    
    if (accountsDto != null) {
        // Step 1: Find existing account by account number
        Accounts accounts = accountsRepository.findById(accountsDto.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Account", "AccountNumber", accountsDto.getAccountNumber().toString()
                ));

        // Step 2: Map updated DTO fields into the entity
        AccountsMapper.mapToAccounts(accountsDto, accounts);
        accountsRepository.save(accounts);

        // Step 3: Find and update customer details
        Long customerId = accounts.getCustomerId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Customer", "CustomerID", customerId.toString()
                ));
        CustomerMapper.mapToCustomer(customerDto, customer);
        customerRepository.save(customer);
        
        isUpdated = true;
    }
    return isUpdated;
}
```

### Why Use `accountNumber` as the Search Key?

The account number is **immutable** — once assigned, it never changes. This makes it the perfect anchor for updates. Even if the client changes their mobile number, name, or email, the account number stays the same and uniquely identifies the record.

### How `save()` Knows to Update (Not Insert)

Here's the clever part of JPA's `save()` method:
- If the entity has a **primary key value that exists in the database** → it performs an **UPDATE**
- If the entity has **no primary key** or the key doesn't exist → it performs an **INSERT**

Since we load the existing entity with `findById()` first, then modify its fields, the entity already has its primary key. So `save()` knows to update.

---

## The Update Flow Visualized

```
Client sends: { name, email, mobileNumber, accountsDto: { accountNumber, accountType, branchAddress } }
        │
        ▼
1. Extract accountNumber from accountsDto
2. findById(accountNumber) → Load existing Accounts entity
3. Map DTO fields → Accounts entity → save() [UPDATE]
4. Get customerId from Accounts entity  
5. findById(customerId) → Load existing Customer entity
6. Map DTO fields → Customer entity → save() [UPDATE]
        │
        ▼
Response: 200 "Request processed successfully"
```

---

## Testing

**Success case:**
```json
PUT /api/update
{
    "name": "Madan Mohan",
    "email": "madan@eazybytes.com",
    "mobileNumber": "9876543288",
    "accountsDto": {
        "accountNumber": 1743892056,
        "accountType": "Current",
        "branchAddress": "124 Main Street, New York"
    }
}
// Response: 200 - "Request processed successfully"
```

**Invalid account number:**
```json
PUT /api/update
{
    "accountsDto": { "accountNumber": 9999999999, ... }
}
// Response: 404 - "Account not found with the given input data AccountNumber : '9999999999'"
```

---

## Known Bug: Audit Columns Not Updating

At this point, `updatedAt` and `updatedBy` remain `null` after updates because we're not populating them manually. This will be fixed later with **Spring Data JPA auditing** — an automated mechanism that fills audit fields on insert and update.

---

## ✅ Key Takeaways

- Use **`@PutMapping`** for update operations
- Use an **immutable field** (like account number) as the search key for updates
- JPA's `save()` is smart — it **inserts** when no PK exists, **updates** when PK is found in the database
- Always **load the existing entity first**, then map updated fields over it — don't create a new entity
- Return **boolean** from the service to let the controller decide the response format

⚠️ **Common Mistakes**
- Creating a new entity object and saving it with the same primary key — this works but skips any existing data in columns you didn't set (they become null)
- Allowing clients to modify the primary key — this leads to data integrity issues
- Not validating that the referenced record exists before updating — leads to cryptic JPA errors
