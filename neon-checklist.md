# Neon Database Setup Checklist

## ✅ ตรวจสอบ Neon Dashboard

### 1. Project Status
- [ ] มี Project ชื่อ `qr-restaurant`
- [ ] Status: Active
- [ ] Region: เลือกใกล้ (Singapore หรือ Tokyo)

### 2. Connection Details
- [ ] ดู Connection String ได้
- [ ] Connection String มีรูปแบบ: `postgresql://user:pass@host:port/db?sslmode=require`
- [ ] มี Branch: `main`

### 3. Database Tables
- [ ] ตรวจสอบว่ามี Tables:
  - [ ] `menu_items`
  - [ ] `orders`
  - [ ] Indexes ถูกสร้าง

### 4. Vercel Integration
- [ ] Vercel เชื่อมต่อกับ Neon สำเร็จ
- [ ] Environment Variables ถูกตั้งค่า
- [ ] POSTGRES_URL ถูกเพิ่ม

### 5. ทดสอบ Connection
- [ ] ใช้ psql เชื่อมต่อได้
- [ ] ทดสอบ query ง่ายๆ
- [ ] ไม่มี error

## 🔧 ถ้ามีปัญหา

### Connection String ไม่ทำงาน:
1. ตรวจสอบ username/password
2. ตรวจสอบ host/port
3. ตรวจสอบ database name
4. ลองสร้าง Connection String ใหม่

### Vercel ไม่เห็น POSTGRES_URL:
1. รอ 5-10 นาที
2. ลอง Redeploy อีกครั้ง
3. ตรวจสอบ Vercel Logs

### Database ไม่มี Tables:
1. รัน initialization script
2. ตรวจสอบ schema.sql
3. สร้าง tables ด้วยตนเอง
