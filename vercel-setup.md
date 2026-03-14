# Vercel Postgres Setup

## 1. สร้าง Database ใน Neon
1. ไปที่ https://neon.tech/console
2. คลิก "New Project"
3. ตั้งชื่อ Project: `qr-restaurant`
4. รอสักครู่ให้สร้างเสร็จ

## 2. ดู Connection Details
1. ใน Neon Dashboard คลิกที่ Project ที่สร้าง
2. ไปที่แถบ "Connection Details"
3. คัดลอก "Connection String"
4. ตัวอย่าง: `postgresql://username:password@host:port/database?sslmode=require`

## 3. ตั้งค่าใน Vercel
1. ไปที่ Vercel Dashboard → qr-restaurant → Settings → Environment Variables
2. คลิก "Add Variable"
3. กรอกข้อมูล:
   ```
   Variable Name: POSTGRES_URL
   Value: [คัดลอก Connection String จาก Neon]
   Environments: All Environments (Development, Preview, Production)
   Sensitive: ✅ (เปิด)
   ```
4. คลิก "Save"

## 4. ตั้งค่าเพิ่มเติม (ถ้าต้องการ)
เพิ่ม Environment Variables อื่นๆ:
```
DB_HOST=[host จาก Neon]
DB_PORT=5432
DB_NAME=[database จาก Neon]
DB_USER=[username จาก Neon]
DB_PASSWORD=[password จาก Neon]
```

## 5. Deploy ใหม่
```
git add .
git commit -m "Configure Neon PostgreSQL connection"
git push
```

## 6. ทดสอบการเชื่อมต่อ
1. รอ 2-3 นาทีให้ deploy เสร็จ
2. เปิดเว็บ: https://qr-restaurant.vercel.app
3. ลองสั่งอาหาร
4. ตรวจสอบหน้า Admin
5. ดู Logs ใน Vercel Dashboard ถ้ามีปัญหา
