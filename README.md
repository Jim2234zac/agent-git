# 🍽️ ระบบสั่งอาหารออนไลน์ (Food Ordering System)

ระบบสั่งอาหารผ่าน QR Code ที่มีขีดความสามารถเต็มรูปแบบพร้อมแดชบอร์ด Admin

## 🎯 ฟีเจอร์หลัก

✅ **QR Code สำหรับแต่ละโต๊ะ** - สแกน QR Code เพื่อเข้าถึงเมนูอาหาร
✅ **เมนูอาหารแบบจัดหมวดหมู่** - ดูเมนูแบบจัดหมวดหมู่ (อาหารจานเล็ก, เส้น, ข้าว, แกง, น้ำซุป, เครื่องดื่ม)
✅ **ตะกร้าสินค้า** - เพิ่ม ลด ลบ อาหารจากตะกร้า
✅ **Admin Dashboard** - จัดการคำสั่ง สถิติ การขาย
✅ **สถานะคำสั่ง** - รอรับ → กำลังเตรียม → เสร็จแล้ว

## 📋 เนื้อหา

```
.
├── server.js              # Express server หลัก
├── package.json           # Dependencies
├── data/
│   ├── menu.json          # ข้อมูลเมนูอาหาร
│   └── orders.json        # ข้อมูลคำสั่งซื้อ
├── public/
│   ├── menu.html          # หน้าเมนูอาหาร
│   ├── cart.html          # หน้าตะกร้า
│   ├── admin.html         # Admin Dashboard
│   ├── css/
│   │   └── style.css      # Stylesheet
│   └── js/
│       ├── menu.js        # Menu functionality
│       ├── cart.js        # Cart functionality
│       └── admin.js       # Admin functionality
└── README.md              # This file
```

## 🚀 การเริ่มต้น

### ข้อกำหนดเบื้องต้น
- Node.js (v14 หรือสูงกว่า)
- npm

### วิธีติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

### การรัน

**โหมดพัฒนา** (มีการรีโหลดอัตโนมัติ):
```bash
npm run dev
```

**โหมดปกติ**:
```bash
npm start
```

แอปพลิเคชันจะทำงานที่ `http://localhost:3000`

## 📱 วิธีใช้งาน

### 👤 ลูกค้า
1. **สแกน QR Code** ที่โต๊ะของคุณ
2. **เลือกอาหาร** จากเมนูและเพิ่มลงตะกร้า
3. **ไปที่หน้าตะกร้า** และปรับแต่งจำนวนอาหาร
4. **ป้อนหมายเลขโต๊ะ** และหนึ่งในข้อมูลเพิ่มเติม
5. **ยืนยันการสั่งซื้อ** - เรียบร้อยแล้ว!

### ⚙️ Admin
1. เข้าไป `http://localhost:3000/admin`
2. **ดูสถิติ** - คำสั่งทั้งหมด, อยู่ระหว่างเตรียม, เสร็จแล้ว, ยอดขาย
3. **จัดการคำสั่ง** - อัปเดตสถานะ หรือลบคำสั่ง
4. **สร้าง QR Code** - สำหรับโต๊ะใหม่ ๆ

## 🔌 API Endpoints

### เมนู
- `GET /api/menu` - รับเมนูทั้งหมด
- `GET /api/menu/category/:category` - รับเมนูตามหมวดหมู่

### คำสั่ง
- `GET /api/orders` - รับคำสั่งทั้งหมด (Admin)
- `POST /api/orders` - สร้างคำสั่งใหม่
- `PUT /api/orders/:id` - อัปเดตสถานะคำสั่ง
- `DELETE /api/orders/:id` - ลบคำสั่ง

### QR Code
- `GET /generate-qr/:tableNumber` - สร้าง QR Code สำหรับโต๊ะ

## 📊 สถานะคำสั่ง

| สถานะ | คำอธิบาย |
|------|----------|
| pending | รอรับคำสั่ง |
| preparing | กำลังเตรียมอาหาร |
| completed | เสร็จแล้ว |

## 🎨 ออกแบบ

- **Responsive Design** - เหมาะสมกับมือถือและเดสก์ท็อป
- **Color Scheme** - สีสันที่สดใส (Red, Teal)
- **User-friendly** - ติดต่อง่ายและสวยงาม

## 🛠️ เทคโนโลยี

- **Backend**: Express.js, Node.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **QR Code**: qrcode library
- **ที่เก็บข้อมูล**: JSON files

## 📝 License

ISC

## 👨‍💻 Development

สร้างโดย Jim2234zac

## 🎓 แนวทางการพัฒนาต่อ

- [ ] เพิ่มฐานข้อมูล (MongoDB/PostgreSQL)
- [ ] ตรวจสอบสิทธิ์ (Authentication)
- [ ] ติดตามคำสั่งแบบเรียลไทม์ (WebSocket)
- [ ] ระบบการจ่ายเงิน (Payment Gateway)
- [ ] Mobile app
- [ ] ประวัติการสั่งซื้อ
- [ ] ระบบอื่นให้น้อยลงจาก Ratings & Reviews
