# Vercel Postgres Setup

## 1. สร้าง Database
1. ไปที่ Vercel Dashboard
2. เลือก Project นี้
3. ไปที่ Storage → Create Database
4. เลือก Postgres → Create

## 2. ตั้งค่า Environment Variables
ไปที่ Project → Settings → Environment Variables

เพิ่มตัวแปรเหล่านี้:
```
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
DB_HOST=host
DB_PORT=5432
DB_NAME=database
DB_USER=username
DB_PASSWORD=password
```

## 3. Redeploy
หลังตั้งค่าแล้ว:
```
git add .
git commit -m "Add Vercel Postgres connection"
git push
```

## 4. ทดสอบ
1. รอ 2-3 นาทีให้ deploy เสร็จ
2. ลองสั่งอาหาร
3. ตรวจสอบหน้า Admin
