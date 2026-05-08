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

## Booking & tickets

- Required header: `X-User-Id` (UUID) for customer endpoints.
- Orders expose `expiresAt` for the 10-minute countdown.
- QR code is returned as a Base64 PNG in ticket detail.

### Core endpoints

- `POST /api/orders`
- `GET /api/orders/{orderId}`
- `POST /api/orders/{orderId}/pay`
- `GET /api/users/me/tickets`
- `GET /api/tickets/{ticketId}`
- `POST /api/tickets/{ticketId}/cancel`
- `POST /api/tickets/check-in`

## Environment

- `SUPABASE_DB_URL`
- `SUPABASE_DB_USERNAME`
- `SUPABASE_DB_PASSWORD`

## Tests

```cmd
mvn -q -DskipTests=false test
```
