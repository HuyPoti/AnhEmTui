# Anh Em Tui - Backend Engine 🚀

Hệ thống API cốt lõi cho ứng dụng Quản lý Gia Phả "Anh Em Tui", được xây dựng trên nền tảng NestJS.

## 🛠️ Công nghệ sử dụng

- **Framework:** [NestJS](https://nestjs.com/) (v11)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Xác thực:** Passport JWT & Bcrypt
- **Lưu trữ hình ảnh:** [Cloudinary](https://cloudinary.com/)
- **Email Service:** Nodemailer
- **Validation:** class-validator & class-transformer

## ⚙️ Cấu hình môi trường (.env)

Tạo file `.env` tại thư mục gốc của backend và cấu hình các biến sau:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/anhemtui"
JWT_SECRET="your_secret_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_app_password"
```

## 🚀 Triển khai nhanh

### Cài đặt
```bash
$ npm install
```

### Khởi tạo Database (Prisma)
```bash
$ npx prisma generate
$ npx prisma db push # Hoặc dùng migration nếu cần
```

### Chạy ứng dụng
```bash
# Chế độ phát triển (watch mode)
$ npm run start:dev

# Chế độ Production
$ npm run build
$ npm run start:prod
```

## 🐳 Docker

Dự án đã có cấu hình `Dockerfile` tối ưu hóa cho môi trường Production.

```bash
# Build image
docker build -t anhemtui-backend .

# Run container
docker run -p 3000:3000 --env-file .env anhemtui-backend
```

## 📜 Giấy phép

Project này thuộc quyền sở hữu riêng tư (Private).
