# System Requirements Document (SRD)
## iStar Gymnastics Management System

| รายการ | รายละเอียด |
|---|---|
| เวอร์ชันเอกสาร | 1.0 |
| วันที่จัดทำ | เมษายน 2026 |
| ระบบ | iStar Gymnastics App |
| ประเภท | Web Application (SPA) |

---

## สารบัญ

1. [บทนำ](#1-บทนำ)
2. [ผู้ใช้งานระบบ (User Roles)](#2-ผู้ใช้งานระบบ-user-roles)
3. [ความต้องการเชิงฟังก์ชัน (Functional Requirements)](#3-ความต้องการเชิงฟังก์ชัน-functional-requirements)  
   3.1 [ระบบยืนยันตัวตน (Authentication)](#31-ระบบยืนยันตัวตน-authentication)  
   3.2 [ระบบจัดการสมาชิกในครอบครัว (Family Management)](#32-ระบบจัดการสมาชิกในครอบครัว-family-management)  
   3.3 [ระบบจองคลาสเรียน (Reservation)](#33-ระบบจองคลาสเรียน-reservation)  
   3.4 [ระบบดูตารางคลาสเรียน (View Classes)](#34-ระบบดูตารางคลาสเรียน-view-classes)  
   3.5 [ระบบแดชบอร์ด (Dashboard)](#35-ระบบแดชบอร์ด-dashboard)  
   3.6 [ระบบจัดการนักเรียน (Gymnast Management)](#36-ระบบจัดการนักเรียน-gymnast-management)  
   3.7 [ระบบจัดการคอร์สของลูกค้า (Customer Course)](#37-ระบบจัดการคอร์สของลูกค้า-customer-course)  
   3.8 [ระบบจัดการการจอง (Booking Management)](#38-ระบบจัดการการจอง-booking-management)  
   3.9 [ระบบจัดการคอร์สเรียน Master Data (Courses)](#39-ระบบจัดการคอร์สเรียน-master-data-courses)  
   3.10 [ระบบจัดการคลาสเรียน Master Data (Classes)](#310-ระบบจัดการคลาสเรียน-master-data-classes)  
   3.11 [ระบบจัดการวันหยุด (Holiday Management)](#311-ระบบจัดการวันหยุด-holiday-management)  
   3.12 [ระบบธีมตามฤดูกาล (Seasonal Theme)](#312-ระบบธีมตามฤดูกาล-seasonal-theme)
4. [ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)](#4-ความต้องการที่ไม่ใช่เชิงฟังก์ชัน-non-functional-requirements)
5. [กฎทางธุรกิจ (Business Rules)](#5-กฎทางธุรกิจ-business-rules)
6. [ข้อจำกัดของระบบ (System Constraints)](#6-ข้อจำกัดของระบบ-system-constraints)
7. [ข้อกำหนดด้านข้อมูล (Data Requirements)](#7-ข้อกำหนดด้านข้อมูล-data-requirements)
8. [ข้อกำหนดด้าน Interface](#8-ข้อกำหนดด้าน-interface)

---

## 1. บทนำ

### 1.1 วัตถุประสงค์
เอกสารนี้กำหนดความต้องการของระบบ **iStar Gymnastics Management System** ซึ่งเป็นแอปพลิเคชันสำหรับบริหารจัดการศูนย์ยิมนาสติก ครอบคลุมทั้งฝั่งผู้ปกครอง (ลูกค้า) และฝั่งผู้ดูแลระบบ

### 1.2 ขอบเขตระบบ

ระบบให้บริการผู้ใช้ 4 กลุ่มหลัก ได้แก่ ผู้ปกครอง โค้ช แอดมิน และหัวหน้า โดยมีฟีเจอร์ครอบคลุม:
- จัดการบัญชีผู้ใช้และการยืนยันตัวตน
- จัดการข้อมูลนักเรียน (นักยิมนาสติก) และครอบครัว
- จองและจัดการคลาสเรียน
- บริหารคอร์สและตารางเรียน
- แสดงผลข้อมูลภาพรวมผ่านแดชบอร์ด

### 1.3 คำจำกัดความ

| คำศัพท์ | ความหมาย |
|---|---|
| **นักเรียน / Gymnast** | เด็กที่เรียนยิมนาสติก (ลูกหลานของลูกค้า) |
| **ครอบครัว / Family** | กลุ่มนักเรียนที่อยู่ในบัญชีผู้ปกครองเดียวกัน |
| **คอร์ส / Course** | ประเภทคอร์สเรียน (เช่น คอร์สพื้นฐาน, คอร์สก้าวหน้า) |
| **คลาส / Class** | ตารางเรียนที่ระบุวัน เวลา และจำนวนที่นั่งสูงสุด |
| **คอร์สของลูกค้า / Customer Course** | คอร์สที่กำหนดให้กับนักเรียนแต่ละคนโดยเฉพาะ มีวันหมดอายุและจำนวนครั้ง |
| **การจอง / Booking** | การลงทะเบียนเข้าเรียนในคลาสที่ระบุ |
| **Register Code** | รหัสที่ศูนย์ออกให้ เพื่อยืนยันก่อนสมัครสมาชิก |

---

## 2. ผู้ใช้งานระบบ (User Roles)

### 2.1 ตารางสรุป

| Role | usertype | คำอธิบาย | หน้าแรกหลังล็อกอิน |
|---|---|---|---|
| **Head (หัวหน้า)** | 0 | ผู้บริหารสูงสุด เข้าถึงได้ทุกฟีเจอร์ | Dashboard |
| **Admin (แอดมิน)** | 1 | เจ้าหน้าที่ดูแลระบบ จัดการข้อมูลการจอง คอร์ส นักเรียน | Dashboard |
| **Coach (โค้ช)** | 2 | โค้ชยิมนาสติก ดูตารางคลาสอย่างเดียว | View Classes |
| **Customer (ลูกค้า)** | 3+ | ผู้ปกครอง ลงทะเบียนและจองคลาสให้บุตรหลาน | Home |

### 2.2 สิทธิ์การเข้าถึงเมนู

| เมนู | Head | Admin | Coach | Customer |
|---|---|---|---|---|
| Home | ✓ | - | - | ✓ |
| Family | ✓ | - | - | ✓ |
| View Classes | ✓ | - | ✓ | ✓ |
| Dashboard | ✓ | ✓ | - | - |
| Gymnast Management | ✓ | ✓ | - | - |
| Booking Management | ✓ | ✓ | - | - |
| Customer's Course | ✓ | ✓ | - | - |
| Course History | ✓ | ✓ | - | - |
| Courses (Master) | ✓ | - | - | - |
| Classes (Master) | ✓ | - | - | - |
| Holiday Management | ✓ | ✓ | - | - |

---

## 3. ความต้องการเชิงฟังก์ชัน (Functional Requirements)

---

### 3.1 ระบบยืนยันตัวตน (Authentication)

#### FR-AUTH-01: เข้าสู่ระบบ (Login)
- **ผู้ใช้:** ทุก Role
- **คำอธิบาย:** ผู้ใช้สามารถล็อกอินด้วย username และ password
- **เงื่อนไข:**
  - Username ต้องเป็นตัวอักษรภาษาอังกฤษ/ตัวเลข/อักขระพิเศษเท่านั้น ห้ามมีเว้นวรรค
  - Password ถูกเข้ารหัสด้วย SHA256 ก่อนส่งไป Backend
  - เมื่อล็อกอินสำเร็จ ระบบเก็บ token ใน localStorage และ Vuex store
  - ระบบนำทางไปยังหน้าที่เหมาะสมตาม usertype อัตโนมัติ

#### FR-AUTH-02: สมัครสมาชิก (Register)
- **ผู้ใช้:** บุคคลทั่วไป (สมัครเป็น Customer)
- **ข้อมูลที่ต้องกรอก:** username, password, ชื่อ, นามสกุล, ที่อยู่, อีเมล, เบอร์โทร, register code
- **เงื่อนไข:**
  - Username: ภาษาอังกฤษเท่านั้น ห้ามมีเว้นวรรค
  - Email: ต้องเป็นรูปแบบ email ที่ถูกต้อง
  - ต้องมี **Register Code** ที่ออกโดยศูนย์
  - ผู้สมัครต้องยินยอม **Privacy Policy** ก่อนส่งฟอร์ม
  - Password เข้ารหัสด้วย SHA256 ก่อนส่ง

#### FR-AUTH-03: รีเซ็ตรหัสผ่าน (Forgot Password)
- **ผู้ใช้:** ทุก Role
- **ขั้นตอน:**
  1. กรอก username และเบอร์โทรศัพท์
  2. ระบบตรวจสอบว่า username และเบอร์โทรตรงกับข้อมูลในระบบ
  3. ขอ OTP ผ่าน SMS
  4. กรอก OTP 6 หลัก
  5. ตั้งรหัสผ่านใหม่

#### FR-AUTH-04: ออกจากระบบ (Logout)
- ระบบแสดง confirmation dialog ก่อน logout
- เมื่อ logout สำเร็จ ล้าง token จาก localStorage, Vuex store และนำทางกลับหน้า Login
- หาก API logout ล้มเหลว ระบบยังล้าง session ฝั่ง Client และนำทางกลับหน้า Login

#### FR-AUTH-05: ตรวจสอบ Token
- ทุก component ที่ต้องการ authentication จะตรวจสอบ token ผ่าน `POST /verifyToken` ใน `created()` hook
- หาก token ไม่ถูกต้องหรือหมดอายุ ระบบนำทางกลับหน้า Login อัตโนมัติ

---

### 3.2 ระบบจัดการสมาชิกในครอบครัว (Family Management)

#### FR-FAM-01: ดูรายชื่อสมาชิก
- **ผู้ใช้:** Customer, Head
- ผู้ปกครองสามารถดูรายชื่อนักเรียนทุกคนในครอบครัวของตน
- แสดงรูปโปรไฟล์ตามเพศ (ชาย/หญิง) เมื่อไม่มีรูป

#### FR-FAM-02: เพิ่มสมาชิก (Add Family Member)
- **ผู้ใช้:** Customer, Head
- **ข้อมูลที่ต้องกรอก:** ชื่อ, ชื่อกลาง (ไม่บังคับ), นามสกุล, ชื่อเล่น, โรงเรียน (ไม่บังคับ), เพศ, วันเกิด
- ผู้ปกครองสามารถเพิ่มนักเรียนใหม่ โดยรายชื่อจะไปอยู่ในคิว "รออนุมัติ" (Pending Approval) ก่อน

#### FR-FAM-03: ลบสมาชิก
- **ผู้ใช้:** Customer, Head
- สามารถลบสมาชิกที่มี flag `journal = 1` (สมาชิกที่อยู่ในคิวรออนุมัติ) เท่านั้น
- ระบบแสดง confirmation dialog ก่อนลบ

#### FR-FAM-04: ดูข้อมูลนักเรียน (Home)
- **ผู้ใช้:** Customer, Head
- แสดงรายชื่อสมาชิกและเมื่อเลือกนักเรียนจะแสดง:
  - ชื่อ, เพศ, อายุ (คำนวณจากวันเกิด)
  - หมายเลขคอร์ส, ชื่อคอร์ส
  - ประเภทคอร์ส (Monthly / Limited)
  - จำนวนครั้งคงเหลือ
  - วันหมดอายุ (แสดงเตือนหากหมดอายุแล้ว)

---

### 3.3 ระบบจองคลาสเรียน (Reservation)

#### FR-RES-01: จองคลาสเรียน
- **ผู้ใช้:** Customer, Head
- **ขั้นตอน:**
  1. เลือกนักเรียนจากหน้า Home
  2. ระบบนำไปหน้า Reservation
  3. เลือกวันที่จาก date picker
  4. เลือกเวลาคลาส (dropdown แสดงเฉพาะคลาสที่ว่างและตรงกับคอร์สของนักเรียน)
  5. ยืนยันการจอง

#### FR-RES-02: กฎการเลือกวันที่
- ปิดกั้นวันจันทร์ (วันหยุดของระบบ)
- ปิดกั้นวันที่กำหนดเป็น **วันหยุด** ในระบบ
- วันที่ย้อนหลังไม่สามารถเลือกได้ (minDate = วันพรุ่งนี้)

#### FR-RES-03: กฎการเลือกเวลา
- แสดงเฉพาะเวลาคลาสที่ตรงกับคอร์สของนักเรียน และวันที่เลือก
- ถ้าคลาสเต็ม (`available = 0`) ไม่สามารถเลือกได้

#### FR-RES-04: กฎการตัดครั้งเรียน
- ก่อนจองสำเร็จ ระบบตรวจสอบ `remaining > 0` สำหรับคอร์สแบบ Limited
- คอร์สแบบ Monthly ไม่ถูกหักจำนวนครั้ง

---

### 3.4 ระบบดูตารางคลาสเรียน (View Classes)

#### FR-VIEW-01: ดูตารางการจองตามวันที่
- **ผู้ใช้:** Customer, Coach, Head, Admin
- เลือกวันที่จาก date picker
- ระบบโหลดและแสดงตารางการจองของวันที่เลือก
- ตารางแสดงแบบ dynamic โดย headers และสีเซลล์มาจาก API

#### FR-VIEW-02: Color-coded Table
- เซลล์ในตารางสามารถระบุสีได้ผ่าน tag ในข้อมูล: `(red)`, `(green)`, `(blue)`, `(yellow)`, `(pink)`
- เซลล์ที่มี `(1)` จะถูก highlight พิเศษ
- เซลล์ที่มี `(pay)` จะแสดงไอคอนกระดิ่ง (ต้องชำระเงิน)
- tag ถูกตัดออกก่อนแสดงข้อความ

---

### 3.5 ระบบแดชบอร์ด (Dashboard)

#### FR-DASH-01: แสดงสรุปข้อมูลภาพรวม
- **ผู้ใช้:** Admin, Head
- **ข้อมูลที่แสดง:**
  - จำนวนนักเรียนทั้งหมด
  - จำนวนนักเรียน Active
  - จำนวนการจองวันนี้ (พร้อมแสดงสีตามปริมาณ)
  - จำนวนการจองพรุ่งนี้
  - จำนวนนักเรียนรอการอนุมัติ (แสดง pulse animation เมื่อมีรายการรอ)
- ตัวเลขทุกค่าแสดงด้วย counter animation

#### FR-DASH-02: Quick Action Buttons
- **New Student** — เปิดฟอร์มเพิ่มนักเรียนใหม่โดยตรง
- **New Course** — เปิดฟอร์มสร้างคอร์สใหม่
- **New Booking** — เปิดฟอร์มเพิ่มการจองใหม่
- **New Holiday** — เปิดฟอร์มเพิ่มวันหยุด

#### FR-DASH-03: ดูตารางการจองจาก Dashboard
- เลือกวันที่จาก date picker ใน dashboard
- แสดงตารางการจองแบบ BookingListAdmin พร้อมฟีเจอร์แก้ไข

#### FR-DASH-04: อนุมัตินักเรียนใหม่ (จาก Dashboard)
- คลิก card "Approve New Students" เพื่อดูรายการรออนุมัติ
- เลือกหลายรายการพร้อมกันได้
- กด Approve → ยืนยัน → รายชื่อถูกย้ายเข้าระบบหลัก
- สามารถลบรายการรออนุมัติได้

---

### 3.6 ระบบจัดการนักเรียน (Gymnast Management)

#### FR-STD-01: ดูรายชื่อนักเรียนทั้งหมด
- **ผู้ใช้:** Admin, Head
- แสดงตารางนักเรียนทั้งหมดในระบบ พร้อมค้นหาได้

#### FR-STD-02: เพิ่มนักเรียนใหม่
- **ข้อมูลที่ต้องกรอก:** ชื่อ-นามสกุล, ชื่อเล่น, เพศ, วันเกิด
- **ข้อมูลเพิ่มเติม (ไม่บังคับ):** ชื่อกลาง, level, short note
- เชื่อม parent: เลือก Parent's Username จาก autocomplete
- อัปโหลดรูปโปรไฟล์ได้
- กำหนด Course Refer (คอร์สปัจจุบัน) และ Continue Course Refer (คอร์สถัดไป)

#### FR-STD-03: แก้ไขข้อมูลนักเรียน
- แก้ไขข้อมูลส่วนตัวและคอร์ส
- ดูประวัติการใช้คอร์ส (Course Usage History) ในฟอร์มเดียวกัน

#### FR-STD-04: จบคอร์ส (Finish Course)
- กด "จบคอร์ส" → ยืนยัน → ระบบเก็บประวัติคอร์สที่จบ และย้ายนักเรียนไปคอร์สถัดไป (ถ้ากำหนดไว้)

---

### 3.7 ระบบจัดการคอร์สของลูกค้า (Customer Course)

#### FR-CC-01: ดูคอร์สทั้งหมดของลูกค้า
- **ผู้ใช้:** Admin, Head
- แสดงตาราง customer courses ทั้งหมด พร้อมค้นหาได้

#### FR-CC-02: สร้างคอร์สใหม่ให้ลูกค้า
- **ข้อมูลที่ต้องกรอก:**

| ฟิลด์ | รายละเอียด |
|---|---|
| Course Name | เลือกจาก Master Courses |
| ประเภทคอร์ส | Monthly (รายเดือน) หรือ Limited (จำนวนครั้ง) |
| ระยะเวลา | 1, 2, 3, 6 หรือ 12 เดือน |
| จำนวนครั้งคงเหลือ | (สำหรับ Limited) |
| วันเริ่มต้น | วันที่เริ่มคอร์ส |
| วันหมดอายุ | ต้องไม่ก่อนวันเริ่มต้น |
| Short Note | บันทึกย่อ (ไม่บังคับ) |

- สามารถเปิดใช้ **Double Booking** (เรียนได้มากกว่า 1 รอบ/วัน)

#### FR-CC-03: บันทึกการชำระเงิน
- กำหนดสถานะการชำระ: "จ่ายแล้ว" / "ยังไม่จ่าย"
- บันทึกวันที่ชำระ
- อัปโหลดสลิปการชำระเงิน (รูปภาพ)
- ดูสลิปที่อัปโหลดแล้วได้

#### FR-CC-04: ดูประวัติการใช้คอร์ส
- ในฟอร์มแก้ไขคอร์ส แสดงตารางวันที่เข้าเรียนทั้งหมดของคอร์สนั้น

#### FR-CC-05: ดูประวัติคอร์สที่จบแล้ว (CustomerCourseFinished)
- แสดงเฉพาะคอร์สที่ถูก finish แล้ว (read-only)

---

### 3.8 ระบบจัดการการจอง (Booking Management)

#### FR-BK-01: ดูการจองตามวันที่
- **ผู้ใช้:** Admin, Head
- เลือกวันที่ → โหลดรายการจองของวันนั้น
- ค้นหาในตาราง

#### FR-BK-02: เพิ่มการจองด้วยตนเอง (Admin)
- Admin / Head สามารถเพิ่มการจองแทนลูกค้าได้

#### FR-BK-03: แก้ไขการจอง
- แก้ไขข้อมูลการจองที่มีอยู่แล้ว

#### FR-BK-04: ลบการจอง
- ลบการจองพร้อม confirmation dialog

---

### 3.9 ระบบจัดการคอร์สเรียน Master Data (Courses)

#### FR-CRS-01: ดูรายการคอร์ส
- **ผู้ใช้:** Head
- แสดงตาราง Master Courses ทั้งหมด เรียงตามชื่อ

#### FR-CRS-02: เพิ่มคอร์สใหม่
- ข้อมูล: Course Name, Course Short Name

#### FR-CRS-03: แก้ไขคอร์ส
- แก้ไข Course Name และ Course Short Name

#### FR-CRS-04: ลบคอร์ส
- ลบพร้อม confirmation dialog

---

### 3.10 ระบบจัดการคลาสเรียน Master Data (Classes)

#### FR-CLS-01: ดูรายการคลาส
- **ผู้ใช้:** Head
- แสดงตาราง Master Classes ทั้งหมด เรียงตามชื่อคอร์ส

#### FR-CLS-02: เพิ่มคลาส
- **ข้อมูลที่ต้องกำหนด:**

| ฟิลด์ | รายละเอียด |
|---|---|
| Course Name | เลือกจาก Master Courses |
| วันเรียน (Class Day) | วันในสัปดาห์ที่เปิดเรียน |
| เวลา (Class Time) | เวลาเริ่ม-สิ้นสุดคลาส |
| จำนวนที่นั่งสูงสุด (Max Student) | จำนวนนักเรียนสูงสุดต่อคลาส |
| Admin Flag | flag สำหรับคลาสพิเศษของแอดมิน |

#### FR-CLS-03: แก้ไข/ลบคลาส
- แก้ไขหรือลบคลาส พร้อม confirmation

---

### 3.11 ระบบจัดการวันหยุด (Holiday Management)

#### FR-HOL-01: ดูรายการวันหยุด
- **ผู้ใช้:** Admin, Head
- แสดงตารางวันหยุดทั้งหมด

#### FR-HOL-02: เพิ่มวันหยุด
- เลือกวันที่จาก date picker
- กรอก Description (คำอธิบายวันหยุด)
- เมื่อเพิ่มแล้ว ลูกค้าจะไม่สามารถจองคลาสในวันหยุดนั้นได้

#### FR-HOL-03: ลบวันหยุด
- ลบพร้อม confirmation dialog ที่แสดงวันที่จะถูกลบ

---

### 3.12 ระบบธีมตามฤดูกาล (Seasonal Theme)

#### FR-THEME-01: ธีมอัตโนมัติตามเดือน
- เดือนตุลาคม (10): เปิด **ธีม Halloween** อัตโนมัติ (ค้างคาว, ฟักทอง, ใยแมงมุม)
- เดือนธันวาคม (12): เปิด **ธีม Christmas** อัตโนมัติ (หิมะ, ซานตา, ต้นคริสมาส)
- เดือนอื่น: ปุ่มควบคุมธีมถูกซ่อน

#### FR-THEME-02: เปิด/ปิดธีมด้วยตนเอง
- ปุ่มธีมลอยที่มุมล่างซ้าย ให้ Toggle เปิด/ปิดธีมได้
- ธีมมีได้ทีละ 1 เท่านั้น (mutual exclusive)

#### FR-THEME-03: ระบบเพลงคริสมาส
- ธีม Christmas มีเพลงประกอบ
- ปุ่มควบคุมเพลงแสดงข้างปุ่มธีม (เฉพาะเมื่อธีมปัจจุบันมีเพลง)
- เพลงบันทึกสถานะให้ sync กับ App.vue ผ่าน event `audioStateChanged`

---

## 4. ความต้องการที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)

### 4.1 ความปลอดภัย (Security)

| รหัส | ข้อกำหนด |
|---|---|
| NFR-SEC-01 | Password ต้องผ่านการเข้ารหัส SHA256 ก่อนส่งทาง Backend ทุกครั้ง (ไม่ส่ง plain text) |
| NFR-SEC-02 | ทุก API request ที่ต้องการ authentication ต้องส่ง Bearer token ใน Authorization header |
| NFR-SEC-03 | Token ต้องถูกตรวจสอบใน `created()` ของทุก component ที่ต้องการการยืนยันตัวตน |
| NFR-SEC-04 | เมื่อ token หมดอายุหรือไม่ถูกต้อง ระบบต้อง redirect กลับหน้า Login ทันที |
| NFR-SEC-05 | ระบบต้องไม่สามารถเข้าถึง views ที่ต้องการสิทธิ์โดยตรง (ผ่าน URL) โดยไม่ได้ล็อกอิน |
| NFR-SEC-06 | ต้องมีการยืนยันก่อนทำการลบข้อมูล (Confirmation Dialog) ทุกกรณี |
| NFR-SEC-07 | Register Code ต้องเป็นกุญแจ Access Control ป้องกันการสมัครสมาชิกโดยไม่ได้รับอนุญาต |

### 4.2 ประสิทธิภาพ (Performance)

| รหัส | ข้อกำหนด |
|---|---|
| NFR-PERF-01 | Loading overlay ต้องแสดงระหว่าง API call เพื่อป้องกันการกดซ้ำ |
| NFR-PERF-02 | ตารางข้อมูลต้องใช้ skeleton loader ระหว่างโหลด |
| NFR-PERF-03 | ตารางที่มีข้อมูลมากต้องรองรับการค้นหา (search/filter) ฝั่ง client |
| NFR-PERF-04 | ธีม overlay ต้องใช้ `pointer-events: none` เพื่อไม่กระทบ UI interaction |

### 4.3 ความสามารถในการใช้งาน (Usability)

| รหัส | ข้อกำหนด |
|---|---|
| NFR-UX-01 | UI ภาษาไทยเป็นหลัก (ป้ายกำกับ, ข้อความแจ้งเตือน) |
| NFR-UX-02 | Error feedback แสดงผ่าน dialog สีแดงทันทีเมื่อเกิดข้อผิดพลาด |
| NFR-UX-03 | Success feedback แสดงผ่าน dialog สีเขียวเมื่อดำเนินการสำเร็จ |
| NFR-UX-04 | Transition animation ระหว่างการเปลี่ยนหน้า (fade) |
| NFR-UX-05 | วันที่แสดงในรูปแบบปฏิทินไทย (พุทธศักราช) |
| NFR-UX-06 | Responsive Design รองรับทั้ง Mobile และ Desktop (Vuetify grid system) |

### 4.4 ความน่าเชื่อถือ (Reliability)

| รหัส | ข้อกำหนด |
|---|---|
| NFR-REL-01 | Session ต้องคงอยู่หลัง refresh browser (เก็บ token ใน localStorage) |
| NFR-REL-02 | ระบบต้องจัดการ API error อย่างเหมาะสม ไม่ให้ crash และแสดง error message ที่มีความหมาย |
| NFR-REL-03 | Logout ต้องสำเร็จแม้ API call ล้มเหลว (ล้าง session ฝั่ง client เสมอ) |

### 4.5 การบำรุงรักษา (Maintainability)

| รหัส | ข้อกำหนด |
|---|---|
| NFR-MAINT-01 | Loading state บริหารจาก App.vue (centralized) ผ่าน event `onLoading` |
| NFR-MAINT-02 | Error/Success dialog บริหารจาก App.vue (centralized) |
| NFR-MAINT-03 | โค้ดเขียนเป็นภาษาอังกฤษ, UI แสดงเป็นภาษาไทย |
| NFR-MAINT-04 | Color theme สามารถขยายเพิ่มธีมใหม่ได้ โดยไม่ต้องเปลี่ยนโครงสร้างหลัก |

---

## 5. กฎทางธุรกิจ (Business Rules)

### BR-01: วันที่จองคลาส
- ไม่สามารถจองย้อนหลัง (minDate = พรุ่งนี้เป็นต้นไป)
- วันจันทร์ปิดทำการเสมอ (hardcoded)
- วันที่กำหนดเป็น Holiday ในระบบ ไม่สามารถจองได้

### BR-02: ประเภทคอร์ส
- **Monthly**: ไม่มีการหักจำนวนครั้ง เรียนได้ตลอดตามช่วงอายุคอร์ส
- **Limited**: มีจำนวนครั้งจำกัด (`remaining`) เมื่อ remaining = 0 ไม่สามารถจองได้

### BR-03: Double Booking
- โดยปกติ นักเรียน 1 คนจองได้ 1 รอบ/วัน
- ถ้าคอร์สเปิด `enable_double_booking = 1` สามารถจองได้มากกว่า 1 รอบ/วัน

### BR-04: การอนุมัตินักเรียนใหม่ (Approval Workflow)
- นักเรียนที่ผู้ปกครองเพิ่มผ่านหน้า Add Family Member จะอยู่ในสถานะรออนุมัติ
- Admin/Head ต้องอนุมัติก่อนนักเรียนจะอยู่ในระบบหลัก

### BR-05: ที่นั่งในคลาส
- แต่ละคลาสมีจำนวนที่นั่งสูงสุด (`maxperson`)
- เมื่อที่นั่งเต็ม (`available = 0`) ผู้ปกครองไม่สามารถเลือกคลาสนั้นได้

### BR-06: ประวัติคอร์ส
- เมื่อนักเรียน "จบคอร์ส" ข้อมูลคอร์สนั้นถูกเก็บใน Customer Course History
- หากกำหนด Continue Course ไว้ ระบบจะย้ายไปคอร์สถัดไปอัตโนมัติ

### BR-07: Register Code
- การสมัครสมาชิกต้องใช้ Register Code ที่ออกโดยศูนย์เท่านั้น
- ป้องกันการสมัครโดยไม่ได้รับการชักชวนจากศูนย์

### BR-08: ธีมตามฤดูกาล
- ธีมเปิดอัตโนมัติตามเดือนปัจจุบัน (ตุลาคม = Halloween, ธันวาคม = Christmas)
- ธีมทั้งสองไม่สามารถเปิดพร้อมกันได้

---

## 6. ข้อจำกัดของระบบ (System Constraints)

### 6.1 เทคนิค

| รายการ | รายละเอียด |
|---|---|
| Platform | Web Application (SPA) - ทำงานบน Browser |
| Framework | Vue 3 + Vuetify 3 |
| Node.js Version | 20.10.0 |
| Browser Support | > 1% market share, last 2 versions, ไม่รองรับ IE 11 |
| Navigation | ไม่ใช้ Vue Router (ใช้ state-based navigation แทน) |
| State Management | Vuex 4 (เฉพาะ auth token เท่านั้น) |
| API Communication | REST API ผ่าน Axios (Bearer Token) |
| Password Hashing | SHA256 ฝั่ง Client (CryptoJS) |

### 6.2 โครงสร้าง

- แอปเป็น Single Page Application โหลดจาก `index.html` เดียว
- Base URL ของ API ต้องกำหนดผ่าน environment variable `SERVER_URL`
- ข้อมูล session เก็บใน `localStorage` (ไม่ใช่ sessionStorage)

### 6.3 ข้อจำกัด Business

- วันปิดทำการ (วันจันทร์) hardcoded ในระบบ หากต้องการเปลี่ยนต้องแก้โค้ด
- ระบบ OTP ใช้ SMS (ต้องพึ่ง SMS Gateway ของ Backend)

---

## 7. ข้อกำหนดด้านข้อมูล (Data Requirements)

### 7.1 ข้อมูลผู้ใช้ (User / Family)

| ฟิลด์ | ประเภท | บังคับ | หมายเหตุ |
|---|---|---|---|
| username | String | ✓ | ภาษาอังกฤษ/ตัวเลข/อักขระพิเศษ ห้ามเว้นวรรค |
| password | String | ✓ | เก็บแบบ SHA256 hashed |
| firstname | String | ✓ | |
| middlename | String | - | |
| lastname | String | ✓ | |
| address | String | ✓ | |
| email | String | ✓ | รูปแบบ email ถูกต้อง |
| mobileno | String | ✓ | รูปแบบ xxx-xxx-xxxx |
| registercode | String | ✓ | ต้องตรงกับที่ศูนย์กำหนด |
| usertype | Integer | ✓ | 0=head, 1=admin, 2=coach, 3+=customer |

### 7.2 ข้อมูลนักเรียน (Student)

| ฟิลด์ | ประเภท | บังคับ | หมายเหตุ |
|---|---|---|---|
| firstname | String | ✓ | |
| middlename | String | - | |
| lastname | String | ✓ | |
| nickname | String | ✓ | |
| gender | Enum | ✓ | ชาย / หญิง |
| dateofbirth | Date | ✓ | ไม่เกินวันปัจจุบัน |
| school | String | - | |
| level | Integer | - | |
| shortnote | String | - | |
| familyid | Integer | ✓ | อ้างอิง Parent |
| courserefer | String | - | คอร์สปัจจุบัน |
| courserefer2 | String | - | คอร์สถัดไป |
| profile_image | Image | - | รูปโปรไฟล์ |

### 7.3 ข้อมูลคอร์สของลูกค้า (Customer Course)

| ฟิลด์ | ประเภท | บังคับ | หมายเหตุ |
|---|---|---|---|
| courserefer | String | Auto | รหัสอ้างอิงคอร์ส (สร้างอัตโนมัติ) |
| courseid | Integer | ✓ | อ้างอิง Master Course |
| coursetype | Enum | ✓ | Monthly / Limited |
| period | Integer | ✓ | 1, 2, 3, 6, 12 เดือน |
| remaining | Integer | - | จำนวนครั้งคงเหลือ (สำหรับ Limited) |
| startdate | Date | ✓ | วันเริ่มต้น |
| expiredate | Date | ✓ | ≥ startdate |
| enable_double_booking | Boolean | - | 0=ไม่อนุญาต, 1=อนุญาต |
| paid | Boolean | - | 0=ยังไม่จ่าย, 1=จ่ายแล้ว |
| paydate | Date | - | วันที่ชำระ |
| slip_image | Image | - | สลิปการชำระเงิน |
| shortnote | String | - | |

### 7.4 ข้อมูล Master Courses

| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| courseid | Integer | Auto |
| coursename | String | ✓ |
| course_shortname | String | ✓ |

### 7.5 ข้อมูล Master Classes

| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| classid | Integer | Auto |
| courseid | Integer | ✓ (FK → Courses) |
| classday | String | ✓ (เช่น Tuesday, Thursday) |
| classtime | String | ✓ (เช่น 09:00-10:00) |
| maxperson | Integer | ✓ |
| adminflag | Integer | - |

### 7.6 ข้อมูลวันหยุด

| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| holidayid | Integer | Auto |
| holidaydate | Date | ✓ |
| description | String | ✓ |

---

## 8. ข้อกำหนดด้าน Interface

### 8.1 User Interface

- **Framework:** Vuetify 3 (Material Design)
- **Default Theme:** Dark Mode
- **Primary Color:** `#BB86FC`
- **Secondary Color:** `#03DAC6`
- **Font:** Mali (cursive) — ภาษาไทย/อังกฤษ

#### Layout หลัก
- **App Bar** (fixed top): แสดงเมื่อ login — ปุ่ม menu / back + ปุ่ม logout
- **Navigation Drawer** (temporary, left): เมนูตามสิทธิ์ของ role
- **Main Content**: แสดง view ตาม state
- **Theme Toggle** (fixed bottom-left): ปุ่มเปิด/ปิดธีม + ปุ่มเพลง (ถ้ามี)
- **Loading Overlay**: แสดงทับทุกอย่างระหว่าง API call
- **Error Dialog**: card สีแดง — ปิดได้เอง
- **Success/Info Dialog**: card สีเขียว — ปิดได้เอง

### 8.2 API Interface

- **Protocol:** REST API over HTTPS
- **Authentication:** Bearer Token (JWT) ใน `Authorization` header
- **Request Format:** JSON
- **Response Format:** JSON
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": { ... }
  }
  ```

### 8.3 Storage Interface

| Storage | ข้อมูล | หมายเหตุ |
|---|---|---|
| `localStorage.token` | JWT access token | ใช้สำหรับ auth header |
| `localStorage.userdata` | JSON ข้อมูล user | ใช้สำหรับกำหนด role |
| `localStorage.currentTheme` | 'none' / 'halloween' / 'christmas' | เก็บสถานะธีม |

---

*เอกสารนี้สร้างจากการวิเคราะห์ source code ของระบบ iStar Gymnastics App เดือนเมษายน 2026*
