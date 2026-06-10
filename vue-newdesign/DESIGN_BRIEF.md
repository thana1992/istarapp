# iStar — Design Brief (ดีไซน์ใหม่) สำหรับ Claude Code

> เป้าหมาย: ปรับ frontend `istarapp_dev` (Vue 3 + Vuetify 3) ให้เป็นดีไซน์ใหม่ **ธีมเดียว iStar** ทั้งระบบ โดย **คง logic/API เดิมทุกอย่าง** (เปลี่ยนเฉพาะหน้าตา/เลย์เอาต์)
> ไฟล์อ้างอิงในโฟลเดอร์นี้: `istar-design.css` (โทเคน+คลาส), พรีวิว `Roster Preview…html` / `Admin Dashboard Preview…html`, และไฟล์ `.vue` ที่รีสกินแล้วทุกหน้า

---

## 1. อารมณ์ดีไซน์ (Design language)
- **โทน:** สดใส อบอุ่น เป็นมิตรกับเด็ก/ผู้ปกครอง — ยิมนาสติก iStar
- **สีหลัก:** ชมพู `#ec4899` + ม่วง `#8b5cf6` เป็นแอ็กเซนต์
- **พื้นผิว:** การ์ดขาวมุมโค้งใหญ่ ขอบชมพูจาง เงานุ่มบาง (ไม่ใช่ neumorphic เงาหนา)
- **ทิ้งของเดิม:** เลิกหลายธีม (playful/halloween/neumorphic) และเลิกเงา neumorphic หนา ๆ — เหลือธีม iStar เดียว

## 2. Design Tokens (ค่าจริงทั้งหมดอยู่ใน `istar-design.css` → `:root`)
```
สี:    primary #ec4899 · primary-dark #db2777 · secondary #8b5cf6
       success #10b981 · warning #f59e0b · error #ef4444 · info #3b82f6
       trial #3b82f6 (ทดลอง) · session #ec4899 (รายครั้ง)
ตัวอักษร: heading #831843 · body #57323f · muted #b08299
พื้น:   bg #fdf2f8 · surface #fff · surface-2 #fdf2f8 · border #f6d4e7
มุมโค้ง: sm 12 · md 18 · lg 26 · pill 999
เงา:    sm/md/lg (อิงชมพู, นุ่มบาง)
ฟอนต์:  หัวเรื่อง = Mali (700) · เนื้อหา = IBM Plex Sans Thai
```
> ใช้ `var(--c-*)`, `var(--radius-*)`, `var(--font-*)` เสมอ — ห้าม hardcode สีใหม่

## 3. คอมโพเนนต์/แพทเทิร์นมาตรฐาน
- **ปุ่ม:** มุมโค้ง `md`, ไม่ uppercase, ตัวหนา; primary = พื้นชมพู, soft = พื้นชมพูจาง, ghost = ขอบ
- **การ์ด:** `surface` + ขอบ `border` + มุม `lg` + เงา `sm`
- **Badge/chip:** pill, ใช้สี success/warning/trial/session ตามความหมาย
- **ตาราง (data-table):** หัวตารางพื้น `surface-2` ฟอนต์ Mali, แถว hover = `surface-3`, เส้นคั่น `border` — **โชว์ทุกคอลัมน์ + เต็มความกว้าง + เลื่อนแนวนอนได้บนจอแคบ** (ห้ามตัดคอลัมน์ทิ้ง)
- **Roster (ตารางจองรายวัน):** คอลัมน์ตามช่วงเวลา, การ์ดนักเรียนเป็น "pill" (avatar+ชื่อ+level) — **คลิก→popup เช็คอิน/แก้ไข** (ดู `BookingListAdmin.vue`); สีกรอบซ้าย: ทดลอง=ฟ้า, รายครั้ง=ชมพู; เช็คอินแล้ว=พื้นเขียว+ติ๊ก; ต้องจ่าย=กระดิ่งเหลือง
- **Popmenu/Dialog:** การ์ดขาวมุมโค้ง เงา pop, ปุ่ม action สไตล์ใหม่
- **Nav (App.vue):** ลิ้นชักซ้ายพื้นไล่เฉดชมพู→ม่วง, เมนู active = พื้นโปร่งขาว; แถบบนขาวโปร่ง blur

## 4. หลักเลย์เอาต์ (สำคัญ)
- **จอกว้าง = ใช้พื้นที่ให้คุ้ม** อย่าเว้นขอบซ้ายว่าง — ตาราง/เนื้อหายืดเต็ม container
- **Responsive:** การ์ดสถิติ 5→3→2 คอลัมน์, เนื้อหา 2 คอลัมน์ (ปฏิทิน+ตาราง) ยุบเป็น 1 คอลัมน์บนจอแคบ
- **ความหนาแน่นพอดี** อ่านง่าย ไม่อึดอัด; ปุ่มกดง่าย (≥40px)
- ตัวเลขใหญ่ (stat) ใช้ฟอนต์ Mali ตัวหนา

## 5. แนวทางต่อรายหน้า (ให้ CC รื้อ layout เพิ่มจากที่รีสกินไว้)
หน้าที่ "รื้อเต็มแล้ว" (ทำตามนี้เป๊ะ): **Login · Dashboard · BookingListAdmin · Student**
หน้าที่ "รีสกินไว้ (ได้ธีมแล้ว แต่ layout ยังเดิม)" — ควรยกระดับเป็น layout ใหม่:
- **Home (ลูกค้า):** เฮดเดอร์ทักทาย + การ์ดนักเรียนในครอบครัว (progress คงเหลือ) + **ส่วนประวัติการเรียน** + ปุ่มจองคลาส
- **ViewClasses / Reservation:** ตารางเรียน/จอง สไตล์ roster หรือการ์ดช่วงเวลา
- **FamilyList / AddFamily / EditProfile:** การ์ด + ฟอร์มใหม่ (ฟิลด์มุมโค้ง, group header แถบชมพู)
- **แอดมิน (BookingManagement/CustomerCourse/Courses/Classes/Holiday/Approve):** ส่วนใหญ่เป็นตาราง/ฟอร์ม → ใช้ตารางมาตรฐาน (ข้อ 3) + ปุ่ม/ฟอร์มใหม่; โชว์ข้อมูลครบ เต็มกว้าง

## 6. Do / Don't
✅ ใช้โทเคนจาก `istar-design.css` · ตารางโชว์ครบคอลัมน์ · เต็มความกว้าง · คง `<script>`/API เดิม
❌ อย่าทำเงา neumorphic หนา · อย่าใส่หลายธีม · อย่าตัดคอลัมน์/ข้อมูลทิ้งเพื่อความสวย · อย่า hardcode สีนอกโทเคน

## 7. วิธีติดตั้ง (ย้ำ)
1. `istar-design.css` → `src/assets/` + `import './assets/istar-design.css'` ใน `main.js`
2. ตั้ง Vuetify theme `primary=#ec4899`
3. วางไฟล์ `.vue` ทับตามตารางใน `README.md`
4. `npm run serve` → ทดสอบ login (ทุก usertype) → ไล่ทุกหน้า → คลิกชื่อใน roster ต้องมี popup เช็คอิน/แก้ไข

## 8. เกณฑ์ "ผ่าน" (Definition of done) ต่อหน้า
- หน้าตาตรงดีไซน์ (โทเคน/ฟอนต์/มุมโค้ง/สี) · ข้อมูลครบเท่าของเดิม · เต็มความกว้างบนจอกว้าง · responsive · ทุกปุ่ม/ฟอร์ม/ตารางทำงานเหมือนเดิม · ไม่มี console error
