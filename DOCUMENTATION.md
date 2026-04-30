# เอกสารประกอบระบบ iStar Gymnastics App

> เวอร์ชัน: เมษายน 2026  
> เทคโนโลยี: Vue 3 + Vuetify 3 (SPA)

---

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [สถาปัตยกรรมและโครงสร้างโปรเจค](#2-สถาปัตยกรรมและโครงสร้างโปรเจค)
3. [การจัดการ State (Navigation)](#3-การจัดการ-state-navigation)
4. [ระบบผู้ใช้และสิทธิ์การเข้าถึง](#4-ระบบผู้ใช้และสิทธิ์การเข้าถึง)
5. [รายละเอียด Components](#5-รายละเอียด-components)
6. [Vuex Store](#6-vuex-store)
7. [การสื่อสารระหว่าง Components (Event System)](#7-การสื่อสารระหว่าง-components-event-system)
8. [การเชื่อมต่อ API](#8-การเชื่อมต่อ-api)
9. [ระบบธีมตามฤดูกาล](#9-ระบบธีมตามฤดูกาล)
10. [ระบบตารางการจอง (BookingList)](#10-ระบบตารางการจอง-bookinglist)
11. [Styling และ UI Guidelines](#11-styling-และ-ui-guidelines)
12. [การ Build และ Deploy](#12-การ-build-และ-deploy)

---

## 1. ภาพรวมระบบ

iStar Gymnastics App คือแอปพลิเคชัน Single Page Application (SPA) สำหรับจัดการคลาสยิมนาสติก ครอบคลุมตั้งแต่การลงทะเบียนผู้ปกครอง การจองคลาสเรียน ไปจนถึงการบริหารจัดการสำหรับผู้ดูแลระบบ

**ฟีเจอร์หลัก:**
- ระบบล็อกอิน / สมัครสมาชิก / ลืมรหัสผ่าน
- จัดการข้อมูลสมาชิกในครอบครัว (นักเรียน)
- จองคลาสเรียนยิมนาสติก
- แดชบอร์ดสำหรับแอดมิน/หัวหน้า
- จัดการการจอง, คอร์ส, คลาสเรียน, วันหยุด
- ดูรายชื่อนักเรียนและตารางการจอง
- ธีมตามฤดูกาล (Halloween / Christmas)

---

## 2. สถาปัตยกรรมและโครงสร้างโปรเจค

```
src/
├── App.vue               ← Root component, จัดการ state และ navigation ทั้งหมด
├── main.js               ← Bootstrap app, ตั้งค่า Vuetify, Vuex, global properties
├── assets/               ← รูปภาพ, โลโก้, ธีม
├── components/
│   ├── Login.vue         ← หน้าล็อกอิน
│   ├── Register.vue      ← หน้าสมัครสมาชิก
│   ├── ForgotPassword.vue← หน้าลืมรหัสผ่าน (OTP)
│   ├── Home.vue          ← หน้าหลักของลูกค้า (แสดงข้อมูลครอบครัว)
│   ├── FamilyList.vue    ← จัดการรายชื่อสมาชิกในครอบครัว
│   ├── AddFamily.vue     ← เพิ่มสมาชิกในครอบครัว (นักเรียนใหม่)
│   ├── Reservation.vue   ← จองคลาสเรียน
│   ├── ViewClasses.vue   ← ดูตารางคลาสเรียนตามวันที่
│   ├── LoadingDialog.vue ← Loading overlay กลาง
│   ├── DatePicker.vue    ← Reusable date picker component
│   ├── admin/
│   │   ├── Dashboard.vue           ← แดชบอร์ดสรุปข้อมูล
│   │   ├── BookingManagement.vue   ← จัดการข้อมูลการจอง
│   │   ├── GymnastManagement.vue   ← จัดการรายชื่อนักเรียน
│   │   ├── CustomerCourse.vue      ← จัดการคอร์สของลูกค้า
│   │   ├── CustomerCourseFinished.vue ← ประวัติคอร์สที่จบแล้ว
│   │   ├── Courses.vue             ← จัดการคอร์สเรียน (Master)
│   │   ├── Classes.vue             ← จัดการคลาสเรียน (ตารางเวลา)
│   │   ├── HolidayManagment.vue    ← จัดการวันหยุด
│   │   └── ApproveNewStudent.vue   ← อนุมัตินักเรียนใหม่
│   ├── center/
│   │   ├── BookingList.vue         ← ตารางการจอง (shared)
│   │   ├── BookingListAdmin.vue    ← ตารางการจองฝั่งแอดมิน
│   │   └── Student.vue             ← ตารางรายชื่อนักเรียน (shared)
│   └── theme/
│       ├── HalloweenOverlay.vue    ← ธีม Halloween (ค้างคาว, ฟักทอง)
│       └── ChristmasOverlay.vue    ← ธีม Christmas (หิมะ, ซานตา)
├── store/index.js        ← Vuex store (auth token)
├── router/index.js       ← Vue Router (ไม่ได้ใช้งานหลัก)
├── plugins/vuetify.js    ← Vuetify plugin config
└── styles/global-style.css ← Global CSS
```

**Dependencies หลัก:**
| Package | วัตถุประสงค์ |
|---|---|
| Vue 3 | Front-end framework |
| Vuetify 3 | UI component library (Material Design) |
| Vuex 4 | State management (token) |
| Axios | HTTP client |
| CryptoJS | SHA256 password hashing |
| Moment.js | Date formatting |
| vue3-autocounter | Counter animation (Dashboard) |
| @vuepic/vue-datepicker | Date picker component |

---

## 3. การจัดการ State (Navigation)

แอปนี้ **ไม่ใช้ Vue Router** สำหรับการแสดง views แต่ใช้ property `state` ใน `App.vue` แทน

### State ที่มีในระบบ

| state | หน้าที่แสดง | สิทธิ์ที่เข้าถึงได้ |
|---|---|---|
| `login` | หน้าล็อกอิน | ทุกคน |
| `register` | หน้าสมัครสมาชิก | ทุกคน |
| `forgotpassword` | หน้าลืมรหัสผ่าน | ทุกคน |
| `home` | หน้าหลัก (ข้อมูลครอบครัว) | customer, manager |
| `familylist` | รายชื่อสมาชิกครอบครัว | customer, manager |
| `addfamilymember` | เพิ่มสมาชิก | customer, manager |
| `reservation` | จองคลาสเรียน | customer, manager |
| `viewclasses` | ดูตารางคลาส | customer, coach, manager |
| `dashboard` | แดชบอร์ด | admin, manager |
| `bookingmanager` | จัดการการจอง | admin, manager |
| `gymnastmanager` | จัดการนักเรียน | admin, manager |
| `customercourse` | คอร์สของลูกค้า | admin, manager |
| `customercoursefinished` | ประวัติคอร์ส | admin, manager |
| `course` | จัดการคอร์ส (Master) | manager |
| `classes` | จัดการคลาสเรียน | manager |
| `holidaymanager` | จัดการวันหยุด | admin, manager |

### การเปลี่ยน State

```
Component ลูก → $emit('onClickChangeState', 'newstate') → App.vue → state = 'newstate'
```

### ปุ่มย้อนกลับ (Back Button)

หน้าที่มีปุ่ม Back จะ emit `initBack` เพื่อบอก App.vue ว่าจะกลับไปหน้าไหน:
```javascript
// Component ลูก
this.$emit('initBack', 'home') // บอกว่ากลับไป home

// App.vue จะแสดงลูกศรย้อนกลับแทนปุ่ม menu
// เมื่อกด Back: state = recentState
```

---

## 4. ระบบผู้ใช้และสิทธิ์การเข้าถึง

### ประเภทผู้ใช้ (usertype)

| usertype | บทบาท | หน้าแรกหลังล็อกอิน | Flag |
|---|---|---|---|
| `0` | head (ผู้จัดการ) | dashboard | `managerflag = true` |
| `1` | admin | dashboard | `adminflag = true` |
| `2` | coach (โค้ช) | viewclasses | `coachflag = true` |
| `3+` | customer (ลูกค้า/ผู้ปกครอง) | home | `customerflag = true` |

### การเก็บข้อมูล Session

```javascript
localStorage.setItem('token', token)
localStorage.setItem('userdata', JSON.stringify(userdata))

// Vuex store
this.$store.getters.getToken      // อ่าน token
this.$store.getters.isLoggedIn    // ตรวจสอบว่า login อยู่หรือเปล่า
this.$store.dispatch('logout')    // logout และล้าง state
```

### การตรวจสอบ Token

ทุก component ที่ต้องการ authentication จะตรวจสอบ token ใน `created()`:

```javascript
async created() {
  const token = this.$store.getters.getToken
  if (!token) {
    this.$emit('onClickChangeState', 'login')
    return
  }
  await axios.post(this.baseURL + '/verifyToken', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {
    this.$emit('onClickChangeState', 'login')
  })
}
```

---

## 5. รายละเอียด Components

### 5.1 Auth Components

#### `Login.vue`
- **หน้าที่:** แสดงฟอร์มล็อกอิน
- **ฟีเจอร์:** validation username/password, เข้ารหัส password ด้วย SHA256
- **Emits:** `onAffterLogin`, `onErrorHandler`, `onResigterHandler`, `onLoading`
- **API:** `POST /login` → ได้ token และ userdata กลับมา

#### `Register.vue`
- **หน้าที่:** สมัครสมาชิกใหม่ (ผู้ปกครอง)
- **ฟีเจอร์:** ต้องกรอก register code, ต้องยินยอม Privacy Policy
- **ข้อมูล:** username, password, firstname, lastname, email, mobile, address
- **Emits:** `onSuccessHandler`, `onErrorHandler`, `onCancelHandler`, `onLoading`

#### `ForgotPassword.vue`
- **หน้าที่:** รีเซ็ตรหัสผ่านผ่าน OTP (SMS)
- **ขั้นตอน:** 1) verify username + เบอร์โทร → 2) request OTP → 3) ยืนยัน OTP → 4) ตั้งรหัสผ่านใหม่
- **Emits:** `onSuccessHandler`, `onErrorHandler`, `onForgotHandler`, `onLoading`

---

### 5.2 Customer Components

#### `Home.vue`
- **หน้าที่:** หน้าหลักของลูกค้า แสดงรายชื่อสมาชิกในครอบครัวและข้อมูลคอร์ส
- **ฟีเจอร์:** เลือกนักเรียน → ดูข้อมูลคอร์ส, วันหมดอายุ, จำนวนครั้งคงเหลือ
- **Props:** `student` (ข้อมูลนักเรียนที่เลือก)
- **Emits:** `collectData` (ส่งข้อมูล student ขึ้น App.vue), `onClickChangeState`

#### `FamilyList.vue`
- **หน้าที่:** จัดการรายชื่อสมาชิกในครอบครัว
- **ฟีเจอร์:** ดูรายชื่อ, เพิ่มสมาชิก (ฝัง AddFamily), ลบสมาชิก (flag journal=1)
- **Emits:** `onClickChangeState`, `onErrorHandler`, `onInfoHandler`, `onLoading`

#### `AddFamily.vue`
- **หน้าที่:** เพิ่มสมาชิกใหม่ในครอบครัว (นักเรียน)
- **ข้อมูล:** ชื่อ-นามสกุล, ชื่อเล่น, โรงเรียน, เพศ, วันเกิด
- **Emits:** `onClickChangeState`, `onErrorHandler`, `onInfoHandler`, `onLoading`

#### `Reservation.vue`
- **หน้าที่:** จองคลาสเรียนสำหรับนักเรียน
- **ฟีเจอร์:** เลือกวันที่ (ปิดกั้นวันหยุด/วันที่ไม่มีคลาส), เลือกเวลา, ยืนยัน
- **Props:** `student` (นักเรียนที่จะจอง) - required
- **Emits:** `onSuccessHandler`, `onErrorHandler`, `onInfoHandler`, `onLoading`

#### `ViewClasses.vue`
- **หน้าที่:** ดูตารางการจองตามวันที่ (ลูกค้า/โค้ช/แอดมิน)
- **Child:** `BookingList` component
- **ฟีเจอร์:** เลือกวันที่ → โหลดตารางการจอง

---

### 5.3 Admin Components

#### `Dashboard.vue`
- **หน้าที่:** แดชบอร์ดสรุปข้อมูลภาพรวม
- **ข้อมูลที่แสดง:**
  - จำนวนนักเรียนทั้งหมด / นักเรียน Active
  - การจองวันนี้ / พรุ่งนี้
  - นักเรียนรอการอนุมัติ (pulse animation เมื่อมีรายการรอ)
- **Child:** `ApproveNewStudent` (embedded)
- **ใช้:** `vue3-autocounter` สำหรับ animation ตัวเลข

#### `BookingManagement.vue`
- **หน้าที่:** จัดการข้อมูลการจองคลาสเรียน
- **ฟีเจอร์:**
  - เลือกวันที่ด้วย calendar
  - ดู/เพิ่ม/แก้ไข/ลบการจอง
  - ค้นหาการจอง
- **Child:** `BookingListAdmin` (ตาราง)

#### `GymnastManagement.vue`
- **หน้าที่:** จัดการรายชื่อนักเรียนทั้งหมด
- **Child:** `Student` component (shared)
- **ฟีเจอร์:** เพิ่ม/แก้ไข/จบคอร์ส/ลบนักเรียน

#### `CustomerCourse.vue`
- **หน้าที่:** จัดการคอร์สที่กำหนดให้ลูกค้าแต่ละราย
- **ฟีเจอร์:** สร้างคอร์สใหม่, กำหนดประเภท (Monthly/จำนวนครั้ง), ค้นหา
- **ข้อมูล:** courserefer, ชื่อคอร์ส, ประเภท, จำนวนครั้ง, วันหมดอายุ

#### `CustomerCourseFinished.vue`
- **หน้าที่:** ดูประวัติคอร์สที่จบแล้ว (read-only)

#### `Courses.vue`
- **หน้าที่:** Master data ของคอร์สเรียน
- **ฟีเจอร์:** เพิ่ม/แก้ไข/ลบ คอร์ส (coursename, course_shortname)

#### `Classes.vue`
- **หน้าที่:** Master data ของคลาสเรียน (ตารางเวลา)
- **ฟีเจอร์:** เพิ่ม/แก้ไข/ลบ คลาส (คอร์ส, วันเรียน, เวลา, จำนวนที่นั่ง, adminflag)

#### `HolidayManagment.vue`
- **หน้าที่:** จัดการวันหยุด
- **ผล:** วันที่กำหนดเป็นวันหยุดจะไม่สามารถจองคลาสได้
- **ฟีเจอร์:** เพิ่ม/ลบวันหยุด พร้อม description

#### `ApproveNewStudent.vue`
- **หน้าที่:** อนุมัติรายชื่อนักเรียนใหม่ (ฝังใน Dashboard)
- **ฟีเจอร์:** เลือกหลายรายการ → Approve ทีเดียว / ลบรายการ

---

### 5.4 Center (Shared) Components

#### `BookingList.vue`
- **หน้าที่:** ตารางแสดงการจองคลาส (shared ระหว่าง ViewClasses และ BookingManagement)
- **Props:** `bookingHeaders`, `bookingData`, `classdate`, `loadingBooking`
- **ฟีเจอร์พิเศษ:** color-coded cells ด้วย tag ในข้อมูล (ดูหัวข้อ 10)

#### `Student.vue`
- **หน้าที่:** ตารางรายชื่อนักเรียน (shared ใน GymnastManagement)
- **ฟีเจอร์:** เพิ่ม/แก้ไข/จบคอร์ส นักเรียน, ค้นหา, skeleton loader

#### `BookingListAdmin.vue`
- **หน้าที่:** ตารางการจองสำหรับแอดมิน (มีฟีเจอร์แก้ไขเพิ่มเติม)

---

### 5.5 Utility Components

#### `LoadingDialog.vue`
- **หน้าที่:** แสดง loading overlay ตลอดทั้งแอป
- **Props:** `isLoading` (boolean)
- **ใช้งาน:** `this.$emit('onLoading', true/false)` จาก component ใดก็ได้

#### `DatePicker.vue`
- **หน้าที่:** Reusable date picker สำหรับฟอร์มต่างๆ
- **ใช้:** `@vuepic/vue-datepicker` เป็น base

---

## 6. Vuex Store

ไฟล์: `src/store/index.js`

Store ใช้งานน้อยที่สุด เก็บเฉพาะ authentication state:

### State
```javascript
{
  user: null,     // ข้อมูลผู้ใช้
  token: null,    // JWT token
  userdata: null  // ข้อมูลผู้ใช้ (เหมือน user)
}
```

### Getters
| getter | คืนค่า |
|---|---|
| `isLoggedIn` | `true` ถ้ามี token |
| `getToken` | JWT token string |
| `getUser` | ข้อมูลผู้ใช้ |
| `getUserdata` | ข้อมูลผู้ใช้ |

### Actions
| action | ผล |
|---|---|
| `setToken({ token, userdata })` | เก็บ token และ userdata |
| `logout()` | ล้าง token และ userdata |

> **หมายเหตุ:** ข้อมูลผู้ใช้ถูกเก็บซ้ำใน `localStorage` เพื่อรองรับการ refresh หน้า

---

## 7. การสื่อสารระหว่าง Components (Event System)

### Pattern หลัก: Child → Parent via $emit

```
[Component ลูก] --$emit('eventName', data)--> [App.vue หรือ Parent]
```

### Events มาตรฐาน

| Event | ทิศทาง | วัตถุประสงค์ |
|---|---|---|
| `onClickChangeState` | Child → App.vue | เปลี่ยนหน้า (state) |
| `onErrorHandler` | Child → App.vue | แสดง error dialog (สีแดง) |
| `onSuccessHandler` | Child → App.vue | แสดง success dialog (สีเขียว) + กลับ login |
| `onInfoHandler` | Child → App.vue | แสดง info dialog (สีเขียว) |
| `onLoading` | Child → App.vue | เปิด/ปิด Loading overlay |
| `initBack` | Child → App.vue | เปิดปุ่ม Back พร้อมระบุ state ที่จะกลับ |
| `collectData` | Child → App.vue | ส่ง student data ขึ้น App.vue |
| `onInvalidToken` | Child → App.vue | Token หมดอายุ → redirect login |
| `onAffterLogin` | Login → App.vue | ล็อกอินสำเร็จ |

### ตัวอย่างการใช้งาน

```javascript
// Component ลูก - เปลี่ยนหน้า
this.$emit('onClickChangeState', 'familylist')

// Component ลูก - แสดง error
this.$emit('onErrorHandler', 'เกิดข้อผิดพลาด กรุณาลองใหม่')

// Component ลูก - loading
this.$emit('onLoading', true)
// ... ทำงาน ...
this.$emit('onLoading', false)

// Component ลูก - เปิดปุ่ม back
this.$emit('initBack', 'home') // กดแล้วกลับ home
```

---

## 8. การเชื่อมต่อ API

### Base URL
```javascript
this.baseURL  // ถูก inject ใน main.js จาก env.SERVER_URL
```

### Authentication Header
```javascript
headers: {
  Authorization: `Bearer ${this.$store.getters.getToken}`
}
```

### การเข้ารหัสรหัสผ่าน
```javascript
// SHA256 ผ่าน CryptoJS ก่อนส่ง (ทำใน Login.vue และ ForgotPassword.vue)
const hash = CryptoJS.SHA256(password)
const encryptedPassword = hash.toString(CryptoJS.enc.Hex)
```

### API Endpoints ที่ใช้งาน

| Method | Endpoint | Component | วัตถุประสงค์ |
|---|---|---|---|
| POST | `/login` | Login.vue | ล็อกอิน |
| POST | `/logout` | App.vue | ออกจากระบบ |
| POST | `/verifyToken` | ทุก Component | ตรวจสอบ token |
| POST | `/register` | Register.vue | สมัครสมาชิก |
| POST | `/forgotpassword/verify` | ForgotPassword.vue | ตรวจสอบ username+เบอร์ |
| POST | `/forgotpassword/requestotp` | ForgotPassword.vue | ขอ OTP |
| POST | `/forgotpassword/getotp` | ForgotPassword.vue | ยืนยัน OTP |
| POST | `/forgotpassword/changepassword` | ForgotPassword.vue | เปลี่ยนรหัสผ่าน |
| GET | `/family` | Home.vue, FamilyList.vue | ดึงข้อมูลครอบครัว |
| POST | `/addfamily` | AddFamily.vue | เพิ่มสมาชิก |
| DELETE | `/family/:id` | FamilyList.vue | ลบสมาชิก |
| GET | `/booking` | ViewClasses.vue, BookingManagement.vue | ดึงข้อมูลการจอง |
| POST | `/reservation` | Reservation.vue | จองคลาส |
| GET/POST/DELETE | `/courses` | Courses.vue, CustomerCourse.vue | จัดการคอร์ส |
| GET/POST/DELETE | `/classes` | Classes.vue | จัดการคลาส |
| GET/POST/DELETE | `/holidays` | HolidayManagment.vue | จัดการวันหยุด |
| GET | `/dashboard` | Dashboard.vue | ข้อมูล dashboard |
| GET/POST | `/students` | Student.vue | จัดการนักเรียน |

---

## 9. ระบบธีมตามฤดูกาล

### การทำงานอัตโนมัติ

เมื่อแอปโหลด (`mounted()` ของ App.vue) จะตรวจสอบเดือนปัจจุบัน:

| เดือน | ธีม | Component |
|---|---|---|
| 10 (ตุลาคม) | Halloween | `HalloweenOverlay.vue` |
| 12 (ธันวาคม) | Christmas | `ChristmasOverlay.vue` |
| อื่นๆ | ไม่มีธีม | ปุ่มเปิดธีมถูกซ่อน |

> เดือน 11 (พฤศจิกายน) ยังไม่มีธีม แต่สถาปัตยกรรมรองรับ Christmas ได้

### State ธีมใน App.vue

```javascript
isHalloweenOn: false,    // ธีม Halloween เปิดอยู่หรือเปล่า
isChristmasOn: false,    // ธีม Christmas เปิดอยู่หรือเปล่า
currentTheme: 'none',    // 'none' | 'halloween' | 'christmas'
haveThemeToggle: true,   // แสดงปุ่มเปิด/ปิดธีม
christmasMusicPlaying: false  // สถานะเพลง Christmas
```

### การ Toggle ธีม

```javascript
// เปิด/ปิดธีมตามเดือน
toggleTheme()     // เรียกเมื่อกดปุ่มธีม

// เปิด Halloween
setHalloween(true/false)

// เปิด Christmas
setChristmas(true/false)
```

ธีมทั้งสองไม่สามารถเปิดพร้อมกัน (mutual exclusive)

### CSS Classes

```css
/* เปิดใช้งานด้วย */
document.documentElement.classList.toggle('theme-halloween', v)
document.documentElement.classList.toggle('theme-christmas', v)
```

### z-index ลำดับความสำคัญ

| Layer | z-index | หมายเหตุ |
|---|---|---|
| Dialog | 2400 | สูงสุด อยู่เหนือทุกอย่าง |
| Dialog Overlay | 2000 | |
| Navigation Drawer | 1000 | |
| App Bar | 1000 | |
| Santa Sleigh | 50 | ไม่บล็อกคลิก (pointer-events: none) |
| Cards/Tables | 10 | |
| Christmas Overlay | 5 | พื้นหลัง effect |
| Main Content | 1 | |

### ระบบเพลง (Christmas)

- `ChristmasOverlay.vue` มีเพลง autoplay แบบ muted
- เมื่อเปิดธีม Christmas จะ unmute เพลง
- ปุ่มควบคุมเพลงอยู่ที่ App.vue (ข้างปุ่มธีม)
- `ChristmasOverlay.vue` emit `audioStateChanged(boolean)` เพื่อ sync state

---

## 10. ระบบตารางการจอง (BookingList)

`BookingList.vue` ใช้ระบบ color-coded cells โดยข้อมูลจาก API จะมีตัวระบุสีฝังในข้อความ

### Color Tags

| Tag | CSS Class | สี |
|---|---|---|
| `(red)` | `highlighted-cell-red` | แดง |
| `(green)` | `highlighted-cell-green` | เขียว |
| `(blue)` | `highlighted-cell-blue` | น้ำเงิน |
| `(yellow)` | `highlighted-cell-yellow` | เหลือง |
| `(pink)` | `highlighted-cell-pink` | ชมพู |
| `(1)` | `highlighted-blackground` | highlight พิเศษ |
| `(pay)` | แสดง bell icon | ต้องชำระ |

### การแสดงผล
Tag จะถูกตัดออกก่อนแสดงข้อความ:
```javascript
item[header.key]
  .replace('(1)', '')
  .replace('(red)', '')
  .replace('(green)', '')
  // ... ฯลฯ
```

---

## 11. Styling และ UI Guidelines

### Font
- `Mali` (cursive) - ใช้เป็น font หลัก
- `Kodchasan` - font รอง

### Theme
- Dark theme เป็นค่าเริ่มต้น (Vuetify dark mode)
- สีหลัก: `primary: #BB86FC`, `secondary: #03DAC6`

### CSS Classes ที่ใช้บ่อย

| Class | วัตถุประสงค์ |
|---|---|
| `.card-opacity` | พื้นหลัง card กึ่งโปร่งใส |
| `.container` | wrapper หลักของแต่ละหน้า |
| `.container-header` | ส่วนหัวของหน้า |
| `.container-content` | เนื้อหาหลัก |
| `.group-header` | หัวข้อย่อยในฟอร์ม |
| `.sticky-header` | หัว dialog ที่ติดด้านบนเมื่อ scroll |
| `.scrollable-content` | เนื้อหาใน dialog ที่ scroll ได้ |
| `.pulse-button` | ปุ่มที่มี pulse animation |
| `.highlighted-blackground` | เซลล์ที่ถูก highlight พิเศษ |

### Transition
App.vue มี fade transition ระหว่างการเปลี่ยนหน้า:
```css
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
```

---

## 12. การ Build และ Deploy

### คำสั่ง

```cmd
:: Development server (พร้อม proxy ไปยัง backend)
npm run serve

:: Production build
npm run build

:: Lint ตรวจสอบโค้ด
npm run lint
```

### Environment Variables

| ตัวแปร | วัตถุประสงค์ |
|---|---|
| `SERVER_URL` | URL ของ backend API |

กำหนดใน `.env` หรือในระบบ CI/CD แล้ว inject ผ่าน webpack `DefinePlugin` เป็น `env.SERVER_URL`

### Node Version
- Node.js 20.10.0 (ระบุใน `package.json` engines)

### Proxy Configuration
ตั้งค่าใน `vue.config.js` - proxy request ที่เริ่มต้นด้วย `/api` ไปยัง `SERVER_URL`

---

## ภาคผนวก: Flow การทำงานหลัก

### Flow การล็อกอิน
```
1. ผู้ใช้กรอก username/password ใน Login.vue
2. Login.vue เข้ารหัส password ด้วย SHA256
3. POST /login → ได้ token + userdata
4. เก็บ token ใน localStorage และ Vuex store
5. emit 'onAffterLogin' → App.vue เรียก AffterLogin()
6. AffterLogin() อ่าน userdata จาก localStorage
7. กำหนด role flags และเปลี่ยน state ตาม usertype
```

### Flow การจองคลาส (Customer)
```
1. Home.vue → เลือกนักเรียน → emit 'collectData' (student)
2. App.vue เก็บ student, เปลี่ยน state = 'reservation'
3. Reservation.vue รับ student prop
4. เลือกวันที่ (ตรวจสอบวันหยุดและวันที่มีคลาส)
5. เลือกเวลา
6. กด "Book a class" → แสดง confirm dialog
7. POST /reservation → จองสำเร็จ
8. emit 'onSuccessHandler' → กลับหน้าเดิม
```

### Flow การอนุมัตินักเรียนใหม่ (Admin)
```
1. Dashboard แสดง card "Approve New Students" (pulse เมื่อมีรายการรอ)
2. คลิก card → แสดง ApproveNewStudent component
3. เลือกนักเรียน (checkbox) → กด Approve
4. ยืนยัน → POST /approvestudent
5. รายชื่อถูกย้ายไปยังระบบหลัก
```
