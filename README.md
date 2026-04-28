# TicketRush 🎟️

TicketRush là nền tảng phân phối vé điện tử phục vụ các sự kiện âm nhạc và giải trí, tập trung vào việc xử lý lưu lượng truy cập lớn trong thời gian ngắn (Flash Sale), đảm bảo trải nghiệm chọn ghế mượt mà theo thời gian thực và ngăn chặn tuyệt đối tình trạng bán trùng ghế.

## 🛠 Ngăn xếp công nghệ (Tech Stack)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand.
- **Backend:** Java 17, Spring Boot 3, Hibernate (JPA), Maven.
- **Database & Auth:** PostgreSQL & Supabase Auth.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án (Local Development)

### 1. Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en) (phiên bản 18.x trở lên)
- [Java Development Kit (JDK) 17](https://adoptium.net/temurin/releases/) trở lên.
- IDE khuyên dùng: **VS Code** (Cần cài đặt *Extension Pack for Java* & *Spring Boot Extension Pack*) hoặc **IntelliJ IDEA**.

---

### 2. Khởi chạy Backend (Spring Boot)

Backend được tích hợp sẵn Maven Wrapper (`mvnw`), nên bạn **không cần** cài đặt công cụ Maven thủ công trên máy.

**Cách 1: Chạy bằng Terminal/Command Prompt (Dễ nhất)**
Mở Terminal ở thư mục gốc của project và gõ:
```bash
# Chuyển vào thư mục backend
cd backend

# Chạy ứng dụng (trên Windows)
.\mvnw spring-boot:run

# (Nếu bạn dùng MacOS/Linux thì dùng lệnh: ./mvnw spring-boot:run)
```

**Cách 2: Chạy bằng VS Code / IntelliJ**
- Mở thư mục dự án bằng IDE của bạn.
- Mở file `backend/src/main/java/com/ticketrush/TicketRushApplication.java`.
- Nhấn nút **Run** (mũi tên xanh) xuất hiện ngay trên dòng `public static void main`.

*Lưu ý: Ứng dụng Backend mặc định sẽ khởi chạy ở cổng `http://localhost:8081`.*

---

### 3. Khởi chạy Frontend (React + Vite)

Bạn cần mở một cửa sổ Terminal **hoàn toàn mới** (để không tắt Backend đang chạy):

```bash
# Chuyển vào thư mục frontend
cd frontend

# Cài đặt các gói thư viện (chỉ cần chạy 1 lần ngay sau khi clone code về)
npm install

# Khởi chạy server giao diện
npm run dev
```

Sau khi Terminal báo thành công, hãy mở trình duyệt và truy cập: **`http://localhost:5173`**

---

### 4. Thiết lập Database (Supabase)
Dự án sử dụng Supabase làm CSDL chính. Để hệ thống hoạt động đầy đủ tính năng:
1. Tạo project trên [Supabase](https://supabase.com).
2. Lấy thông tin chuỗi kết nối **PostgreSQL** điền vào `application.yml` của Backend.
3. Lấy **Project URL** và **Anon Key** điền vào file `.env` của Frontend (dùng cho xác thực Auth).

---

## 📂 Cấu trúc thư mục cốt lõi
- `backend/`: Chứa mã nguồn API Java Spring Boot, chia theo kiến trúc Controller-Service-Repository. Có tách biệt rõ ràng APIs cho `admin` và `customer`.
- `frontend/`: Chứa mã nguồn UI ReactJS, tái sử dụng các components chung và sử dụng Zustand để quản lý State (VD: hàng chờ, giỏ hàng).