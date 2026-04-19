# Demo: Profile Changes in Loans & Cards Microservices

## Introduction

This section walks through the implementation of Spring Boot profiles in both the loans and cards microservices. The changes mirror exactly what we did for accounts — same patterns, different property values. If you completed the assignment, use this as a validation checkpoint. If you got stuck, follow along to fill in the gaps.

---

## Loans Microservice Changes

### Controller Updates

The `LoansController` receives the same three additions as `AccountsController`:

```java
// Field injection
@Value("${build.version}")
private String buildVersion;

@Autowired
private Environment environment;

@Autowired
private LoansContactInfoDto loansContactInfoDto;
```

Plus a manual constructor for the service dependency:

```java
public LoansController(ILoansService loansService) {
    this.loansService = loansService;
}
```

Three new REST APIs at the bottom of the controller:
- `GET /build-info` → returns `buildVersion`
- `GET /java-version` → returns `environment.getProperty("JAVA_HOME")`
- `GET /contact-info` → returns the `loansContactInfoDto` object

### The DTO Record

```java
@ConfigurationProperties(prefix = "loans")
public record LoansContactInfoDto(
    String message,
    Map<String, String> contactDetails,
    List<String> onCallSupport
) {}
```

Key difference: the prefix is `loans` instead of `accounts`.

### Main Class

```java
@EnableConfigurationProperties(LoansContactInfoDto.class)
public class LoansApplication { ... }
```

### Profile Files

Three sets of properties under the `loans` prefix, with different values per profile:
- `application.yml` — default/local values
- `application-qa.yml` — QA lead contacts, QA phone numbers
- `application-prod.yml` — product owner contacts, prod phone numbers

### Validation

With QA profile activated (`spring.profiles.active: qa`):
- `GET /build-info` → `2.0` ✅
- `GET /contact-info` → QA lead details ✅

With prod profile via command-line (`--spring.profiles.active=prod`):
- `GET /build-info` → `1.0` ✅
- `GET /contact-info` → Product owner details ✅

---

## Cards Microservice Changes

The cards microservice follows the identical pattern:

### Controller

Same three injection points and three REST APIs, using `CardsContactInfoDto` instead.

### DTO

```java
@ConfigurationProperties(prefix = "cards")
public record CardsContactInfoDto(
    String message,
    Map<String, String> contactDetails,
    List<String> onCallSupport
) {}
```

### Main Class

```java
@EnableConfigurationProperties(CardsContactInfoDto.class)
public class CardsApplication { ... }
```

### Profile Files

Same structure — three YAML files with `cards`-prefixed properties.

### Validation

Same tests, same expected behavior across profiles.

---

## The Repeating Pattern

Notice how consistent this is across all three microservices? That's by design. The setup for reading externalized configuration follows a predictable template:

1. **Define properties** in YAML with a unique prefix per microservice
2. **Create a record/DTO** with `@ConfigurationProperties(prefix = "...")`
3. **Enable it** with `@EnableConfigurationProperties` in the main class
4. **Inject it** wherever needed
5. **Create profile files** for each environment
6. **Activate profiles** via external configuration

This same pattern scales to 100 microservices — each with its own prefix, its own DTO, its own profile files.

---

## YAML Spacing: A Silent Killer

One critical warning that bears repeating:

```yaml
# CORRECT ✅
spring:
  profiles:
    active: qa

# WRONG ❌ (profiles is nested under config, not spring)
spring:
  config:
    profiles:
      active: qa
```

A single extra space in YAML changes the hierarchy entirely. If your profile isn't activating, **check indentation first**. This is the #1 source of silent configuration failures.

---

## ✅ Key Takeaways

- The profile setup pattern is identical across microservices — only prefixes and values change
- Always validate each microservice independently after making changes
- YAML indentation errors are the most common cause of profiles not activating
- The same command-line, JVM, and environment variable approaches work for all microservices
- If using the IDE, test with externalized profile activation to confirm end-to-end integration

⚠️ **Common Mistake:** Forgetting to add `@EnableConfigurationProperties` in the main class — the DTO won't become a Spring bean, and injection will fail.
