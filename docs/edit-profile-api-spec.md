# API Spec — หน้า "แก้ไขข้อมูลผู้ใช้" (Edit Profile)

Frontend file: `src/components/EditProfile.vue`
Total endpoints: 4

---

## 📋 ตาราง `tuser` ที่มีอยู่

```sql
CREATE TABLE "tuser" (
  "username" varchar(20) NOT NULL,
  "userpassword" varchar(100) NOT NULL,
  "firstname" varchar(100) DEFAULT NULL,
  "middlename" varchar(100) DEFAULT NULL,
  "lastname" varchar(100) DEFAULT NULL,
  "address" varchar(200) DEFAULT NULL,
  "email" varchar(50) DEFAULT NULL,
  "mobileno" varchar(20) DEFAULT NULL,
  "familyid" int NOT NULL AUTO_INCREMENT,
  "usertype" int DEFAULT '0',
  "acceptPrivacyPolicy" tinyint(1) DEFAULT '0',
  "createdate" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "editdate" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("username"),
  UNIQUE KEY "familyid_UNIQUE" ("familyid")
);
```

**Primary Key**: `username` (varchar 20) — เป็น identifier หลักของ user
**Mapped fields used by EditProfile**:
- `email` ← form field "อีเมล"
- `mobileno` ← form field "เบอร์โทรศัพท์" (frontend ใช้คำว่า phone)
- `address` ← form field "ที่อยู่"
- `userpassword` ← เก็บ SHA256 hash

**Field ที่ต้องเพิ่ม** (ดูใน [SQL Migration](#-sql-migration-เพิ่ม-column-สำหรับ-profile-image) ด้านล่าง):
- `profile_image_url` (varchar 500) — สำหรับเก็บ URL รูปโปรไฟล์

---

## 🔐 Authentication (ใช้ทั้ง 4 endpoints)

```http
Authorization: Bearer <JWT_TOKEN>
```

Backend ต้อง:

1. Verify JWT
2. Decode token → ดึง `username` จาก payload
3. **เช็คว่า `username` ใน request body ตรงกับ `username` จาก JWT** (ป้องกัน user A แก้ข้อมูล user B)

---

## 1️⃣ `POST /getUserProfile` — ดึงข้อมูลเดิมมาแสดง

เรียกตอนเปิดหน้า EditProfile ครั้งแรก เพื่อ pre-fill form

### Request

```json
{
  "username": "thana123"
}
```

### Response — สำเร็จ

```json
{
  "success": true,
  "user": {
    "username": "thana123",
    "firstname": "ธนา",
    "middlename": null,
    "lastname": "ผโลดม",
    "email": "thana@example.com",
    "mobileno": "0812345678",
    "address": "123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพ 10110",
    "profile_image_url": "https://cdn.example.com/users/thana123.jpg",
    "usertype": 3
  }
}
```

### Response — ไม่สำเร็จ

```json
{
  "success": false,
  "message": "ไม่พบข้อมูลผู้ใช้"
}
```

### SQL

```sql
SELECT username, firstname, middlename, lastname,
       email, mobileno, address, profile_image_url, usertype
FROM tuser
WHERE username = ?
LIMIT 1;
```

### Notes

- `profile_image_url` คืน `null` ได้ ถ้ายังไม่เคยอัพโหลด
- `firstname`/`middlename`/`lastname` แสดงเป็น header (ไม่ให้แก้)
- Field ที่ยังว่าง คืน `null` หรือ `""` ก็ได้ — frontend handle ทั้งคู่

---

## 2️⃣ `POST /updateUserProfile` — บันทึก email / mobileno / address

### Request

```json
{
  "username": "thana123",
  "email": "newemail@example.com",
  "mobileno": "0898765432",
  "address": "456 ซอยทองหล่อ แขวงคลองตันเหนือ ..."
}
```

### Response — สำเร็จ

```json
{
  "success": true,
  "message": "บันทึกข้อมูลสำเร็จ"
}
```

### Response — ไม่สำเร็จ

```json
{
  "success": false,
  "message": "อีเมลนี้ถูกใช้แล้ว"
}
```

### SQL

```sql
UPDATE tuser
SET email = ?, mobileno = ?, address = ?
WHERE username = ?;
```

### Validation ฝั่ง backend

- `email`: รูปแบบถูกต้อง + ความยาว ≤ 50 ตัวอักษร (column limit) + ไม่ซ้ำกับ user อื่น
- `mobileno`: ตัวเลข 8-15 ตัว (รับ `-` `+` space ได้) + ความยาว ≤ 20
- `address`: string ≤ 200 ตัวอักษร (column limit) + trim whitespace

---

## 3️⃣ `POST /changePassword` — เปลี่ยนรหัสผ่าน

Frontend ส่งทั้ง 2 password ที่ **SHA256 hashed แล้ว** (เหมือนหน้า Login เดิม)

### Request

```json
{
  "username": "thana123",
  "currentPassword": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
  "newPassword": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
}
```

### Response — สำเร็จ

```json
{
  "success": true,
  "message": "เปลี่ยนรหัสผ่านสำเร็จ"
}
```

### Response — ไม่สำเร็จ

```json
{
  "success": false,
  "message": "รหัสผ่านปัจจุบันไม่ถูกต้อง"
}
```

### Logic ฝั่ง backend

1. ดึง `userpassword` จาก DB ของ `username`
   ```sql
   SELECT userpassword FROM tuser WHERE username = ?;
   ```
2. เปรียบเทียบ `currentPassword` (hashed) กับ `userpassword` ใน DB — ไม่ตรง → return error
3. ถ้าตรง → UPDATE
   ```sql
   UPDATE tuser SET userpassword = ? WHERE username = ?;
   ```
   (เก็บ `newPassword` ที่ hashed มาแล้วตรงๆ ไม่ต้อง hash ซ้ำ)

### Notes

- Frontend ใช้ `CryptoJS.SHA256(password).toString()` (สอดคล้องกับระบบ Login เดิม)
- Column `userpassword` เป็น `varchar(100)` รองรับ SHA256 (64 chars) ได้สบาย

---

## 4️⃣ `POST /uploadUserProfileImage` — อัพโหลดรูปโปรไฟล์

ใช้ `multipart/form-data` (ไม่ใช่ JSON)

### Request (FormData)

| Field | Type | Value |
|-------|------|-------|
| `profileImage` | File | ไฟล์รูป — frontend rename เป็น `user-{username}.{ext}` |
| `username` | string | "thana123" |

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data   (browser auto-set, อย่ากำหนดเอง)
```

### Response — สำเร็จ

```json
{
  "success": true,
  "url": "https://cdn.example.com/users/thana123.jpg"
}
```

### Response — ไม่สำเร็จ

```json
{
  "success": false,
  "message": "อัพโหลดไฟล์ไม่สำเร็จ"
}
```

### Logic ฝั่ง backend

1. รับไฟล์จาก `profileImage` field
2. Validate:
   - MIME type เป็น image (jpg/png/webp)
   - Size ≤ 4MB (frontend pre-validate แล้ว backend ก็ควรตรวจ)
3. บันทึกไฟล์ไป storage (S3/local) ในชื่อ `user-{username}.{ext}` — override ถ้ามีอยู่แล้ว
4. UPDATE `tuser.profile_image_url`
   ```sql
   UPDATE tuser SET profile_image_url = ? WHERE username = ?;
   ```
5. Return URL กลับมา

### Notes

- ทำงานคล้าย `/uploadProfileImage` (ของนักเรียน) — สามารถ copy โครงสร้างได้ เปลี่ยนแค่ table/folder
- Frontend ตั้งชื่อไฟล์เป็น `user-{username}.{ext}` มาให้แล้ว

---

## 🛠️ SQL Migration — เพิ่ม column สำหรับ profile image

ตาราง `tuser` ปัจจุบัน **ยังไม่มี column `profile_image_url`** ต้อง ALTER ก่อนเริ่ม implement endpoint 4:

```sql
ALTER TABLE tuser
ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL AFTER mobileno;
```

ส่วน column อื่น (`email`, `mobileno`, `address`) มีอยู่แล้ว — ใช้ได้เลย

---

## ⚠️ Error Handling Convention

ทุก endpoint return **HTTP 200** เสมอ (พร้อม `success: false` ใน body)
**ไม่ใช่** 4xx/5xx — เพื่อให้ frontend handle ผ่าน response body ได้สะดวก (สอดคล้องกับ pattern ที่ใช้ในแอป)

ยกเว้น: **401 Unauthorized** (token ไม่ valid) ให้ส่ง 401 ได้ — frontend จะ redirect ไปหน้า login

---

## 🧪 Test Cases ที่ backend ควรเทสต์

1. **getUserProfile**: user มีรูป → คืน url; ไม่มีรูป → คืน null
2. **updateUserProfile**:
   - email ซ้ำกับ user อื่น → return error
   - email format ผิด → return error
   - mobileno เกิน 20 ตัวอักษร → return error
   - address เกิน 200 ตัวอักษร → return error
3. **changePassword**:
   - currentPassword ผิด → return error
   - new = current → อนุญาตได้ (ไม่ต้องห้าม)
4. **uploadUserProfileImage**:
   - ไฟล์ใหญ่กว่า 4MB → return error
   - ไฟล์ไม่ใช่รูป → return error
5. **Security**: ทุก endpoint ทดสอบว่า user A ส่ง `username` ของ user B → return error/401

---

## 📋 Summary — Endpoint Checklist

| # | Endpoint | Method | Body Type | Purpose |
|---|----------|--------|-----------|---------|
| 1 | `/getUserProfile` | POST | JSON | ดึงข้อมูลเดิมมา pre-fill form |
| 2 | `/updateUserProfile` | POST | JSON | บันทึก email / mobileno / address |
| 3 | `/changePassword` | POST | JSON | เปลี่ยนรหัสผ่าน (SHA256 hashed) |
| 4 | `/uploadUserProfileImage` | POST | multipart/form-data | อัพโหลดรูปโปรไฟล์ |

---

## ⚙️ Frontend Code Alignment

⚠️ Frontend `src/components/EditProfile.vue` ปัจจุบันใช้ `userdata.userid` อยู่ — ต้องเปลี่ยนเป็น `userdata.username` ให้ตรงกับ schema และส่ง `mobileno` แทน `phone` ใน body
