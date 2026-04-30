# TicketRush Backend

JPA entity mappings for the TicketRush schema and Spring Data repositories.

## Quick start

- Configure your database connection in `src/main/resources/application.yml`.
- Run the Spring Boot app using Maven.

```cmd
mvnw.cmd spring-boot:run
```

## Notes

- UUID primary keys use Hibernate's `GenerationType.UUID`.
- Enums are stored as strings for readability.

