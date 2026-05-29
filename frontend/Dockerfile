# Stage 1: Build mã nguồn React/Vite
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Hứng biến từ docker-compose.yml
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Ép thành ENV để Vite đọc được lúc npm run build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Nhét Nginx vào để phục vụ web
FROM nginx:alpine
# Xóa file cấu hình mặc định cùi bắp của Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Đưa file nginx.conf xịn sò (ở bước 2) vào thay thế
COPY nginx.conf /etc/nginx/conf.d/
# Bê đống file HTML/JS vừa build ở trên vào kho cho Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]