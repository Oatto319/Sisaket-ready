# Docker Setup สำหรับ Sisaket-Ready

## ข้อกำหนดเบื้องต้น
- Docker Desktop หรือ Docker Engine ติดตั้งแล้ว
- Docker Compose (มักจะมาพร้อม Docker Desktop)

## การติดตั้งและรัน

### 1. เตรียมไฟล์ Environment Variables
```bash
# คัดลอกไฟล์ .env.example เป็น .env
cp .env.example .env

# แก้ไขค่าใน .env ตามต้องการ
nano .env
```

### 2. ปรับแต่ง next.config.js
ต้องเพิ่ม `output: 'standalone'` ใน next.config.js:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... config อื่นๆ
}

module.exports = nextConfig
```

### 3. Build และรัน Docker Containers
```bash
# Build และรัน services ทั้งหมด
docker-compose up -d

# หรือถ้าต้องการเห็น logs
docker-compose up
```

### 4. เข้าถึง Application
- **Next.js App**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Mongo Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin`

## คำสั่งที่เป็นประโยชน์

```bash
# ดู logs ของ containers
docker-compose logs -f

# ดู logs ของ service เดียว
docker-compose logs -f nextjs

# หยุด services
docker-compose down

# หยุดและลบ volumes (ลบข้อมูลใน database)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# เข้าไปใน container
docker exec -it sisaket-ready-app sh

# ดูสถานะ containers
docker-compose ps
```

## โครงสร้างไฟล์

```
.
├── Dockerfile              # สำหรับ build Next.js app
├── docker-compose.yml      # กำหนด services ทั้งหมด
├── .dockerignore          # ไฟล์ที่ไม่ต้องการใน Docker image
├── .env.example           # ตัวอย่าง environment variables
└── .env                   # Environment variables (ต้องสร้างเอง)
```

## Services ใน Docker Compose

1. **nextjs** - Next.js application
   - Port: 3000
   - เชื่อมต่อกับ MongoDB

2. **mongodb** - MongoDB database
   - Port: 27017
   - ข้อมูลถูกเก็บใน Docker volume

3. **mongo-express** - Web UI สำหรับจัดการ MongoDB
   - Port: 8081
   - Optional: สามารถลบออกได้ถ้าไม่ต้องการ

## การตั้งค่า MongoDB Authentication (ถ้าต้องการ)

แก้ไขใน `docker-compose.yml`:

```yaml
mongodb:
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=secure-password

nextjs:
  environment:
    - MONGODB_URI=mongodb://admin:secure-password@mongodb:27017/sisaket-ready?authSource=admin
```

## Troubleshooting

### Problem: Container ไม่ start
```bash
# ตรวจสอบ logs
docker-compose logs

# ตรวจสอบว่า ports ไม่ถูกใช้งานอยู่
lsof -i :3000
lsof -i :27017
```

### Problem: Next.js build ล้มเหลว
```bash
# ตรวจสอบว่ามี output: 'standalone' ใน next.config.js
# และ rebuild
docker-compose up -d --build
```

### Problem: MongoDB connection error
```bash
# ตรวจสอบว่า MongoDB container รันอยู่
docker-compose ps

# ตรวจสอบ network
docker network ls
docker network inspect sisaket-ready_app-network
```

## การ Deploy ไปยัง Production

1. เปลี่ยน environment variables ให้เหมาะสม
2. ตั้งค่า MongoDB authentication
3. ใช้ reverse proxy (nginx) สำหรับ SSL
4. Setup backup สำหรับ MongoDB volume
5. ตั้งค่า monitoring และ logging

## หมายเหตุ

- ข้อมูลใน MongoDB จะถูกเก็บใน Docker volume ชื่อ `mongodb_data`
- หากต้องการลบข้อมูลทั้งหมด ใช้คำสั่ง: `docker-compose down -v`
- สำหรับ production ควรใช้ secrets management แทนการใส่ password ใน docker-compose.yml