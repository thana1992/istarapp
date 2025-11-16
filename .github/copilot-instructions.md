# iStar Gymnastics App - คู่มือสำหรับ AI Coding Agents

## ภาพรวมโปรเจค
แอปพลิเคชัน Vue 3 + Vuetify 3 SPA สำหรับจัดการคลาสยิมนาสติก มีระบบควบคุมการเข้าถึงตามบทบาท (หัวหน้า/แอดมิน/โค้ช/ลูกค้า) UI เป็นภาษาไทย โค้ดเป็นภาษาอังกฤษ

## รูปแบบสถาปัตยกรรม

### การจัดการ State ผ่าน App-Level State Transitions
- **ไม่ใช้ Vue Router สำหรับ views**: ใช้ property `state` ใน `App.vue` แทน ด้วย conditional rendering (`v-if="state == 'login'"`)
- States ต่างๆ: `login`, `register`, `home`, `dashboard`, `familylist`, `reservation`, `bookingmanager`, ฯลฯ
- การนำทาง: `this.$emit('onClickChangeState', 'newstate')` จาก component ลูก → `App.vue` อัปเดต `state`
- ตัวอย่าง: `src/App.vue` บรรทัด 91-154 แสดงการ render component ทั้งหมดตาม state

### การควบคุมการเข้าถึงตามบทบาท (Role-Based Access Control)
ประเภทผู้ใช้เก็บใน `userdata.usertype` (localStorage + Vuex):
- `0` = head (ผู้จัดการ) → เข้าถึง Dashboard
- `1` = admin → Dashboard + ฟีเจอร์การจัดการ
- `2` = coach → ดูคลาสเรียนอย่างเดียว
- `3+` = customer → หน้า Home, ครอบครัว, การจอง

Flags: `managerflag`, `adminflag`, `coachflag`, `customerflag` ควบคุมการแสดง UI (ดูที่ method `AffterLogin` ใน `App.vue`)

### การสื่อสารแบบ Event-Driven
การสื่อสารระหว่าง Parent-Child ผ่าน custom events (ไม่ใช้ event bus):
```javascript
// Component ลูก emit
this.$emit('onErrorHandler', 'error message')
this.$emit('onInfoHandler', 'info message')
this.$emit('onLoading', true)
this.$emit('onClickChangeState', 'newstate')

// Parent จัดการใน App.vue
@onErrorHandler="onError($event)"
@onLoading="onLoading($event)"
```

Events ที่ใช้บ่อย: `onErrorHandler`, `onSuccessHandler`, `onInfoHandler`, `onLoading`, `initBack`, `collectData`

## หลักการสำคัญ

### การเชื่อมต่อ API
- Base URL: `this.baseURL` (inject แบบ global ผ่าน `main.js` จาก `env.SERVER_URL`)
- การยืนยันตัวตน: Bearer token จาก `this.$store.getters.getToken` ใน Authorization header
- การเข้ารหัสรหัสผ่าน: SHA256 ผ่าน CryptoJS ก่อนส่ง (ดู `encryptPassword` ใน `Login.vue`)
- การตรวจสอบ token ใน `created()` hook ของแต่ละ component ด้วย endpoint `/verifyToken`

### การจัดการ Loading State
Loading overlay แบบรวมศูนย์ผ่าน component `LoadingDialog`:
```javascript
this.$emit('onLoading', true)  // เริ่ม
// ... เรียก API
this.$emit('onLoading', false) // จบ
```
ตั้งค่า `isLoading` ใน parent, ส่งไปที่ `<LoadingDialog :isLoading="isLoading" />`

### Dialog แสดงข้อผิดพลาด/ความสำเร็จ
รวมศูนย์ใน `App.vue`:
- `errorDialog`/`errorMsg` สำหรับข้อผิดพลาด (card สีแดง)
- `successDialog`/`infoMsg` สำหรับความสำเร็จ (card สีเขียว)
- Emit `onErrorHandler(msg)` หรือ `onSuccessHandler(msg)` จาก component ใดก็ได้

### รูปแบบตารางข้อมูล (Data Table)
ตารางการจองแบบไดนามิกที่มีเซลล์แบ่งสีตามโค้ด:
- ตัวระบุสีในข้อความ: `(red)`, `(green)`, `(blue)`, `(yellow)`, `(pink)` จะถูกตัดออกตอนแสดงผล
- ตัวระบุพิเศษ `(1)` สำหรับไฮไลท์ด้วย class `highlighted-blackground`
- ดูตัวอย่างใน template slot ของ `BookingList.vue`

### ระบบธีมตามฤดูกาล
การเปิดใช้ธีมตามเดือน (อัตโนมัติ):
- **State ของธีม** ใน `App.vue`: `isHalloweenOn`, `isChristmasOn`, `currentTheme`, `haveThemeToggle`
- **ธีม Halloween** (เดือนตุลาคม = 10): 
  - Overlay: `HalloweenOverlay.vue` มีค้างคาว, ฟักทอง, ใยแมงมุม
  - CSS class: `theme-halloween`
- **ธีมคริสมาสต์** (เดือนพฤศจิกายน-ธันวาคม = 11-12):
  - Overlay: `ChristmasOverlay.vue` มีหิมะตก, ไฟประดับ, ซานตาคลอส, ต้นคริสมาสต์
  - พื้นหลังโทนสีขาว-ฟ้าอ่อน
  - หิมะตกช้าและนุ่มนวล (speedY: 0.3-0.8)
  - ต้นคริสมาสต์กระจายตำแหน่ง 3-5 ต้น
  - CSS class: `theme-christmas`
- **z-index layering** (ลำดับความสำคัญจากสูงสุดไปต่ำสุด):
  - Dialog: 2400 (สูงสุด - อยู่เหนือทุกอย่าง รวมถึง navigation drawer)
  - Dialog Overlay/Backdrop: 2000
  - Navigation Drawer: 1000
  - Navigation Drawer Scrim: 999
  - App bar: 1000
  - Santa Sleigh: 50 (Christmas theme - อยู่เหนือ cards แต่ต่ำกว่า drawer)
  - Cards/Tables: 10
  - Christmas overlay: 5 (effect background ไม่บัง UI)
  - Main content: 1
  - **หมายเหตุ**: 
    - Dialog ต้องอยู่เหนือ Navigation Drawer เสมอ (ใช้ `:z-index="2400"` prop)
    - Santa ใช้ `pointer-events: none` ไม่บล็อกการคลิก
    - Christmas wrapper ใช้ `display: contents` ป้องกัน stacking context
    - ปุ่มควบคุมเพลงอยู่ที่ `App.vue` ข้างปุ่มเปิด/ปิดธีม (ไม่อยู่ใน overlay)
- **การทำงาน**: แต่ละธีมมี method `setVisible()` และใช้ `$refs` เพื่อควบคุม
- **การเก็บข้อมูล**: localStorage เก็บ `currentTheme` ('none', 'halloween', 'christmas')
- **การเปิด/ปิด**: `document.documentElement.classList.toggle('theme-[name]', v)`
- ธีมทั้งสองไม่สามารถเปิดพร้อมกันได้ (ปิดธีมเก่าเมื่อเปิดธีมใหม่)
- **pointer-events: none** บน overlay เพื่อไม่รบกวนการคลิก UI
- **ระบบเพลงธีม**:
  - ใช้ `toggleThemeMusic()` และ `onThemeMusicStateChanged()` เป็น generic methods
  - Property `themeMusicPlaying` เก็บสถานะเพลงของธีมปัจจุบัน
  - Computed `hasThemeMusic` ตรวจสอบว่าธีมมีเพลงหรือไม่
  - Computed `currentThemeMusicColor` กำหนดสีปุ่มตามธีม
  - ChristmasOverlay: เพลง autoplay แบบ muted, unmute เมื่อเปิดธีม
  - Emit event `audioStateChanged` เพื่อ sync state กับ App.vue

## ขั้นตอนการพัฒนา

### Build & Serve
```cmd
npm run serve         :: Dev server พร้อม proxy ไปยัง backend
npm run build         :: Production build
npm run lint          :: ตรวจสอบด้วย ESLint
```

### การตั้งค่า Environment
- Node version: 20.10.0 (ระบุใน `package.json` engines)
- Backend proxy ตั้งค่าใน `vue.config.js` ไปยังตัวแปร env `SERVER_URL`
- Global `env.SERVER_URL` inject ผ่าน webpack DefinePlugin

### โครงสร้าง Component
```
src/components/
  ├── [Auth].vue           :: Login, Register, ForgotPassword
  ├── [Customer].vue       :: Home, FamilyList, Reservation, ViewClasses
  ├── admin/               :: Dashboard, BookingManagement, CustomerCourse, ฯลฯ
  ├── center/              :: BookingList, Student (shared views)
  └── theme/               :: Seasonal overlays (HalloweenOverlay)
```

### รูปแบบ Vuex Store
ใช้ Vuex น้อยที่สุด - เฉพาะ auth token:
```javascript
this.$store.dispatch('setToken', { token, userdata })
this.$store.getters.getToken
this.$store.getters.isLoggedIn
```
ข้อมูลผู้ใช้เก็บซ้ำใน localStorage เพื่อความคงทน

## รูปแบบโค้ด

### การตั้งชื่อ Vue Component
- PascalCase สำหรับ import: `import Login from './components/Login.vue'`
- kebab-case ใน templates: `<booking-management />`

### การจัดรูปแบบวันที่
- ใช้ปฏิทินพุทธศักราชไทย: `.toLocaleDateString('th-TH', options)`
- Moment.js ใช้สำหรับจัดการวันที่
- รูปแบบทั่วไป: `{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }`

### Vuetify Components
- Vuetify 3 พร้อม Material Design Icons (`mdi-*`)
- Dark theme เป็นค่าเริ่มต้น (ตั้งค่าใน `main.js`)
- Card opacity class: `card-opacity` สำหรับพื้นหลังกึ่งโปร่งใส
- Skeleton loaders สำหรับ loading state ของตาราง

## ตัวอย่างการไหลของข้อมูล
1. ผู้ใช้ล็อกอิน → `Login.vue` emit `onAffterLogin`
2. `App.vue` เรียก `AffterLogin()` → โหลด userdata จาก localStorage
3. ตั้งค่า role flags และเปลี่ยน `state` ไปยัง view ที่เหมาะสม
4. Component ลูก emit events สำหรับการเปลี่ยน state, ข้อผิดพลาด, loading
5. การเรียก API รวม token จาก Vuex store
6. Response ทริกเกอร์การอัปเดต loading/dialog ผ่าน events

## ข้อควรระวังในการทดสอบ
- ไม่มี router guards - ตรวจสอบ auth ในแต่ละ component ที่ `created()` hook
- การเก็บ state อาศัย localStorage (คงอยู่หลัง refresh)
- การแสดง component ควบคุมโดย role flags และค่า state
- ปุ่มย้อนกลับใช้รูปแบบ `initBlackButton()` + `onClickBack()` ไม่ใช่ browser history
