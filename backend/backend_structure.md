# Cấu trúc thư mục Backend (TicketRush)

Dự án Backend của TicketRush được xây dựng bằng **Spring Boot** và tuân theo kiến trúc phân tầng (Layered Architecture). Dưới đây là giải thích chi tiết về cấu trúc thư mục hiện tại:

```text
backend/
├── .env                  # Chứa các biến môi trường (credentials, secret keys, v.v.)
├── pom.xml               # File cấu hình Maven, quản lý các dependencies của dự án
├── src/
│   ├── main/
│   │   ├── java/com/ticketrush/
│   │   │   ├── config/       # Các lớp cấu hình của Spring Boot (VD: SecurityConfig, Swagger, CORS...)
│   │   │   ├── controller/   # Lớp Giao tiếp (API Layer) - Tiếp nhận request từ client và trả về response
│   │   │   ├── dto/          # Data Transfer Object - Chứa các object mang dữ liệu giữa client và server (Request/Response)
│   │   │   ├── entity/       # Lớp Thực thể (Domain/Model) - Ánh xạ trực tiếp với các bảng trong DB
│   │   │   ├── repository/   # Lớp Truy cập dữ liệu (Data Access Layer) - Các interface JPA thao tác DB
│   │   │   ├── service/      # Lớp Nghiệp vụ (Business Layer) - Chứa logic xử lý chính của ứng dụng
│   │   │   └── TicketRushApplication.java # Class chính để khởi chạy ứng dụng Spring Boot
│   │   └── resources/
│   │       └── application.yml # File cấu hình chính của Spring Boot (Database, Server Port, JWT...)
```

## Chi tiết các tầng (Layers)

1. **Controller Layer (`controller`)**: 
   - Nhận các HTTP requests (GET, POST, PUT, DELETE).
   - Gọi Service tương ứng để xử lý nghiệp vụ.
   - Trả về HTTP response (thường dưới dạng JSON).

2. **Service Layer (`service`)**:
   - Chứa logic nghiệp vụ của ứng dụng (Business Logic).
   - Thực hiện kiểm tra quy tắc nghiệp vụ, tính toán.
   - Thường bao gồm Interface (`EventService`) và Implementation (`EventServiceImpl` nằm trong package `impl`).

3. **Repository Layer (`repository`)**:
   - Giao tiếp trực tiếp với cơ sở dữ liệu.
   - Sử dụng Spring Data JPA để thực hiện các thao tác CRUD (Create, Read, Update, Delete) mà không cần viết nhiều code SQL.

4. **Data Transfer Objects (`dto`)**:
   - Chứa các class mang dữ liệu:
     - **Request DTOs**: Dữ liệu do client gửi lên (vd: `EventCreateRequest`).
     - **Response DTOs**: Dữ liệu hệ thống trả về cho client (vd: `EventCreateResponse`).
   - Giúp ẩn đi cấu trúc Entity thực sự và chỉ trả về/nhận những dữ liệu cần thiết.

5. **Entity / Model (`entity`)**:
   - Đại diện cho các bảng trong cơ sở dữ liệu.
   - Chứa các mapping (như `@Entity`, `@Table`) và các mối quan hệ (`@OneToMany`, `@ManyToOne`...).

6. **Configuration (`config`)**:
   - Định nghĩa các cấu hình của ứng dụng, ví dụ như:
     - `SecurityConfig`: Cấu hình Spring Security, phân quyền, bảo mật JWT.
     - Cấu hình cho Swagger API documentation.
     - Các Bean khởi tạo thủ công khác.
