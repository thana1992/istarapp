> 🎯 **ต้องการให้ทุกหน้าเป๊ะตาม prototype 1:1?** → อ่าน **`CLAUDE_CODE_1to1.md`** (คู่มือสั่ง Claude Code รื้อ `<template>` ทุกหน้าให้ตรง prototype + ผูก API เดิม) และติดตั้ง **`istar-pages.css`** เพิ่มจาก `istar-design.css`
> README ด้านล่างนี้คือวิธี "รีสกินทับ" (เร็ว/ปลอดภัย แต่ยังไม่ 1:1) — ใช้เป็นข้อมูลประกอบ

---

# iStar — รีสกิน Frontend เป็นดีไซน์ใหม่ (Vue 3 + Vuetify 3) — ชุดครบทุกหน้า

> **โค้ด Vue จริง** สำหรับวางลง repo `istarapp_dev` — ทุกไฟล์ `.vue` **คง `<script>` / การเรียก API เดิมไว้ครบทุกบรรทัด** เปลี่ยนเฉพาะหน้าตา (ธีมเดียว: iStar ชมพู)

---

## วิธีทำงาน
1. **ธีมเดียว** — ทิ้งหลายธีมเดิม (playful/halloween/neumorphic) เหลือ iStar ชมพูอันเดียว
2. **คง logic 100%** — ผลิตโดย copy `<template>`+`<script>` ของจริงมาทั้งดุ้น → ไม่มีทาง API/ฟีเจอร์หาย
3. **2 ระดับการรื้อ:**
   - **รื้อเต็ม (custom markup):** `BookingListAdmin`, `Dashboard`, `Student`, `Login` — หน้า/ฟีเจอร์เด่น
   - **รีสกินทับ (layered override):** ที่เหลือ — คง template/style เดิม + เพิ่มชั้น `<style>` ดีไซน์ใหม่ทับ (เร็ว ปลอดภัย คง validation/อัปโหลด/ตารางเดิม)

## ติดตั้ง (4 ขั้น — ทำครั้งเดียว)
1. ก๊อป `istar-design.css` → `src/assets/` แล้ว import ใน `src/main.js`:
   ```js
   import './assets/istar-design.css'
   ```
2. ตั้ง Vuetify theme primary = `#ec4899` ใน `src/vuetify.js` (ดูชุดสีเต็มใน `istar-design.css` → `:root`)
3. ก๊อปไฟล์ `.vue` ทั้งหมดทับของเดิมตามตารางด้านล่าง (ชื่อไฟล์ → path ปลายทาง)
4. `npm run serve` → ทดสอบ login ทุก usertype → ไล่ทุกหน้า

## ตารางวางไฟล์ (ทั้งหมด)
| ไฟล์ในชุดนี้ | วางแทน (path ใน repo) | ระดับ |
|---|---|---|
| `istar-design.css` | `src/assets/istar-design.css` (+ import) | รากฐาน |
| `App.vue` | `src/App.vue` | shell (เมนู+แถบบน) |
| `Login.vue` | `src/components/Login.vue` | รื้อเต็ม |
| `Dashboard.vue` | `src/components/admin/Dashboard.vue` | รื้อเต็ม |
| `BookingListAdmin.vue` | `src/components/center/BookingListAdmin.vue` | รื้อเต็ม (roster+popup) |
| `Student.vue` | `src/components/center/Student.vue` | รื้อ form |
| `Home.vue` | `src/components/Home.vue` | รีสกิน |
| `ViewClasses.vue` | `src/components/ViewClasses.vue` | รีสกิน |
| `Reservation.vue` | `src/components/Reservation.vue` | รีสกิน |
| `FamilyList.vue` | `src/components/FamilyList.vue` | รีสกิน |
| `AddFamily.vue` | `src/components/AddFamily.vue` | รีสกิน |
| `EditProfile.vue` | `src/components/EditProfile.vue` | รีสกิน |
| `ForgotPassword.vue` | `src/components/ForgotPassword.vue` | รีสกิน |
| `Register.vue` | `src/components/Register.vue` | รีสกิน |
| `BookingList.vue` | `src/components/center/BookingList.vue` | รีสกิน |
| `ApproveNewStudent.vue` | `src/components/admin/ApproveNewStudent.vue` | รีสกิน |
| `BookingManagement.vue` | `src/components/admin/BookingManagement.vue` | รีสกิน |
| `CustomerCourse.vue` | `src/components/admin/CustomerCourse.vue` | รีสกิน |
| `CustomerCourseFinished.vue` | `src/components/admin/CustomerCourseFinished.vue` | รีสกิน |
| `Courses.vue` | `src/components/admin/Courses.vue` | รีสกิน |
| `Classes.vue` | `src/components/admin/Classes.vue` | รีสกิน |
| `HolidayManagment.vue` | `src/components/admin/HolidayManagment.vue` | รีสกิน |
| `GymnastManagement.vue` | `src/components/admin/GymnastManagement.vue` | รีสกิน |

> หมายเหตุ: ไฟล์ "รีสกิน" คง template/script เดิม 100% และแนบชั้น `<style scoped>` ดีไซน์ใหม่ทับ (อิงโทเคนจาก `istar-design.css`).
> ถ้าหน้าไหนอยากได้ดีไซน์ใหม่ "เต็มรูปแบบ" (รื้อ layout เหมือน Dashboard/Home prototype) บอกได้ ผมรื้อ markup ให้ทีละหน้าเพิ่ม.

## พรีวิวเปิดได้จริง (ดับเบิลคลิก ไม่ต้อง build)
- `Roster Preview (new design).html` — roster + คลิกชื่อ→popup เช็คอิน/แก้ไข
- `Admin Dashboard Preview (new design).html` — Dashboard เต็มหน้า (การ์ดสถิติ+ค้นหา+ปฏิทิน+roster)

## ⭐ ฟีเจอร์สำคัญที่คงไว้
- **คลิกชื่อใน roster → popup เช็คอิน/แก้ไข** (`BookingListAdmin` → `checkinByAdmin`/`undoCheckinByAdmin` + `student-clicked` → `Student.showRetrieveStudent`)
- การ์ดสถิติกดได้ + ปฏิทินเลือกวัน + ปุ่มลัด (Dashboard)
- การ์ด "นักเรียนทั้งหมด/กำลังเรียน" → แสดง `Student.vue` (ค้นหา/กรอง active ได้)
- usertype routing เดิม (0 หัวหน้า · 1 แอดมิน · 2 โค้ช · 10 ผู้ปกครอง)

## โทเคนดีไซน์ (istar-design.css `:root`)
```
primary #ec4899 · primary-dark #db2777 · secondary #8b5cf6
success #10b981 · warning #f59e0b · error #ef4444 · info #3b82f6
trial #3b82f6 · session #ec4899 · heading #831843 · body #57323f · muted #b08299
bg #fdf2f8 · surface #fff · border #f6d4e7 · radius sm12/md18/lg26
หัว: Mali · เนื้อหา: IBM Plex Sans Thai
```

## พรอมป์เริ่มงานสำหรับ Claude Code (วางได้เลย)
```
อ่าน vue-newdesign/README.md และเปิดพรีวิว Admin Dashboard / Roster เป็นภาพเป้าหมาย.

งาน: ติดตั้งดีไซน์ใหม่ลง repo istarapp_dev (Vue 3 + Vuetify 3)
1) ก๊อป istar-design.css → src/assets/ แล้ว import ใน main.js
2) ตั้ง Vuetify theme primary=#ec4899
3) ก๊อปไฟล์ .vue ทั้งหมดทับของเดิมตามตารางใน README (ห้ามแก้ <script>/logic)
4) npm run serve แล้วไล่ทดสอบ: login(ทุก usertype) → dashboard → คลิกชื่อใน roster
   → popup เช็คอิน/แก้ไข → ทุกหน้าในเมนู ต้องเปิดได้ไม่ error
รายงานหน้าที่ build ไม่ผ่าน/หน้าตาเพี้ยน เพื่อแก้ทีละจุด
```
