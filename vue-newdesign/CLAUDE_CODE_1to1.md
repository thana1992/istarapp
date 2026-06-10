# iStar — ทำ Vue ให้ตรง Prototype แบบ 1:1 (คู่มือสั่งงาน Claude Code)

> **เป้าหมายเดียว:** ให้ทุกหน้าใน `istarapp_dev` (Vue 3 + Vuetify 3) ออกมา **หน้าตาเป๊ะตาม prototype** ไม่ใช่แค่ "รีสกินสี" — ต้อง **เปลี่ยนโครง markup ของแต่ละหน้าให้เหมือน prototype 1:1** แล้ว **ผูกเข้ากับ data/method/API เดิมของ component** โดยไม่แตะ logic
>
> **แหล่งความจริงของหน้าตา (source of truth):** `iStar Full Preview (new design).html` — แต่ละบล็อก `<div v-if="screen==='...'">` คือ "หน้าตาเป้าหมาย" ของแต่ละหน้าจริง เปิดไฟล์นี้ในเบราว์เซอร์เพื่อดูภาพปลายทางได้เลย

---

## ทำไมชุดก่อนหน้ายังไม่ 1:1
ไฟล์ `.vue` เวอร์ชันก่อน (เช่น `Courses.vue`) ใช้วิธี **"รีสกินทับ"** = คง `<template>` Vuetify เดิม + แปะ `<style scoped>` override สี/มุมโค้ง โครง DOM จึงยังเป็น `v-data-table`/`v-card` แบบเดิม **ไม่ใช่** markup ของ prototype (`.scard`, `.idt`, `.tt-pill`, `.id-btn`…) → หน้าตาเลย "คล้าย" แต่ไม่ "เป๊ะ"

**งานรอบนี้ = ยกระดับทุกหน้าเป็น "รื้อเต็ม":** ก๊อป markup จาก prototype มาวางเป็น `<template>` ใหม่ แล้ว rewire ตัวแปร mock → ฟิลด์จริงของ component

---

## ติดตั้งพื้นฐาน (ทำครั้งเดียว)
1. ก๊อป **ทั้งสองไฟล์** ไป `src/assets/` แล้ว import ใน `src/main.js` (ลำดับสำคัญ):
   ```js
   import './assets/istar-design.css'   // tokens + .id-btn .badge .tt-* .popmenu
   import './assets/istar-pages.css'    // .scard .idt .stat-grid .grid2 .cards3 .quick-* .cal-* shell/login
   ```
   > ⚠️ ถ้าขาด `istar-pages.css` คลาส layout ของ prototype จะไม่ทำงาน — หน้าจะพัง ต้องมีทั้งคู่
2. โหลดฟอนต์ + ไอคอน (ถ้ายังไม่มีใน `index.html`):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
   <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" />
   ```
3. ตั้ง Vuetify theme `primary = #ec4899` (สำหรับ v-component ที่ยังใช้อยู่ เช่น `v-text-field`, `v-progress-linear`, `v-switch`, `v-snackbar`)

---

## กติกาเหล็ก (ห้ามพลาด)
1. **`<script>` / การเรียก API / store / props / emits = คงเดิมทุกบรรทัด** ห้ามแก้ชื่อ method, endpoint, payload, validation
2. **เปลี่ยนเฉพาะ `<template>`** ให้เป็น markup ของ prototype (ดูบล็อกที่ตรงกันใน Full Preview)
3. **อย่าใช้ mock data ของ preview** — ใน prototype ใช้ตัวแปรเดโม (`students`, `courses`, `roster`…) ให้ **แทนที่ด้วยตัวแปร/getter จริง** ของ component (เช่น `courselist`, `studentlist`, response ที่มาจาก axios)
4. **อย่าตัดคอลัมน์/ฟิลด์ทิ้ง** ตารางต้องโชว์ครบเท่าของเดิม (prototype เป็นแค่ตัวอย่างจำนวนคอลัมน์ — ของจริงมีกี่คอลัมน์ให้คงไว้ครบ ใส่ในสไตล์ `.idt`)
5. **ปุ่ม action ที่เคยเปิด dialog/เรียก method เดิม** ต้องผูก `@click` ไปยัง method เดิม (ไม่ใช่ `toast()` แบบ preview)
6. ใช้ token/คลาสจากสองสไตล์ชีตเท่านั้น **ห้าม hardcode สีใหม่**
7. เก็บ i18n เดิม: ที่ prototype เขียนข้อความไทยตรง ๆ ของจริงให้คงใช้ `{{ $t('...') }}` ตามเดิม

---

## ขั้นตอนมาตรฐานต่อ 1 หน้า (ทำซ้ำทุกไฟล์)
1. เปิด `iStar Full Preview (new design).html` หา `<div v-if="screen==='<key>'">` ของหน้านั้น → นี่คือ markup เป้าหมาย
2. เปิด component จริง อ่าน `<script>`: หา **ชื่อ array/ออบเจกต์จริง** + **ชื่อฟิลด์จริง** (data(), computed, getters, response keys)
3. ก๊อป markup จาก preview มาวางเป็น `<template>` ใหม่ แล้วไล่แก้ binding:
   - `v-for` เปลี่ยนชื่อ collection เป็นของจริง
   - `{{ s.field }}` เปลี่ยน `field` เป็นชื่อฟิลด์จริง
   - `@click="toast(...)"` → method จริง (`editItem`, `deleteItem`, `openDialog`, `checkinByAdmin`…)
4. ย้าย CSS เฉพาะหน้าที่ preview ใส่ inline (ถ้ามี) เข้า `<style scoped>` ของ component (คลาสกลางอยู่ใน 2 สไตล์ชีตแล้ว ไม่ต้องซ้ำ)
5. `npm run serve` → เทียบจอกับ preview ให้ตรง → ตรวจปุ่ม/ฟอร์ม/ตารางทำงานเหมือนเดิม → ไม่มี console error

---

## ตารางจับคู่ หน้าจอ prototype → component จริง → ตัวแปรที่ต้องผูก
> path อิงโครง repo `istarapp_dev` (`src/components/...`). ถ้า path ต่าง ให้จับจาก "หน้าที่" ของหน้านั้น

| Prototype block (`screen===`) | Component จริง | usertype | binding ที่ต้องสลับ (mock → จริง) |
|---|---|---|---|
| `login` (lg-wrap) | `Login.vue` | – | ปุ่ม `login(t)` เดโม → ฟอร์ม login จริง + `submit()`/store action เดิม |
| – (เปลือกเมนู/แถบบน) | `App.vue` | – | `nav`/`go()` เดโม → routing/`<router-link>` + เมนูตาม usertype เดิม |
| `home` | `Home.vue` | 10 | `children`→รายชื่อลูกจริง · `history`→ประวัติเรียนจริง · ปุ่มจอง→route จริง |
| `reserve` | `Reservation.vue` | 10 | `slots`→รอบเวลาจริง · ปุ่มจอง→method จองจริง |
| `classes` (timetable) | `ViewClasses.vue` | 2/10 | `roster`→ตารางคลาสจริง (คอลัมน์ตามเวลา + pill นักเรียน) |
| `family` | `FamilyList.vue` | 10 | `children`→สมาชิกครอบครัวจริง · ปุ่มเพิ่ม→`AddFamily` flow เดิม |
| `profile` | `EditProfile.vue` | ทุก role | `profileRows`→ข้อมูลโปรไฟล์จริง · ปุ่มออก→logout เดิม |
| `dashboard` | `admin/Dashboard.vue` | 0/1 | `stats`/`quick`/`roster`/`pending` → ค่าจริง (รื้อเต็มไว้แล้ว ใช้เป็นแม่แบบ) |
| `students` | `center/Student.vue` | 0/1 | `students`→`studentlist` จริง · ปุ่มแก้/ลบ→method เดิม (รื้อเต็มไว้แล้ว) |
| `booking` | `admin/BookingManagement.vue` + `center/BookingListAdmin.vue` | 0/1 | `roster`→ตารางจองจริง · **คลิก pill → popup เช็คอิน/แก้ไข** (`checkinByAdmin`/`undoCheckinByAdmin`, `student-clicked`) |
| `approve` | `admin/ApproveNewStudent.vue` | 0/1 | `pending`→คิวอนุมัติจริง · ปุ่มอนุมัติ/ปฏิเสธ→method เดิม |
| `packages` | `admin/CustomerCourse.vue` | 0/1 | `packages`→คอร์สลูกค้าจริง (ครบทุกคอลัมน์ + สถานะชำระเงิน) |
| `courses` | `admin/Courses.vue` | 0/1 | `courses`→`courselist` · `name`→`coursename` · `short`→`course_shortname` · action→`editItem`/`deleteItem`/dialog เดิม |
| `classadmin` | `admin/Classes.vue` | 0/1 | `classes`→รายการคลาสจริง |
| `holiday` | `admin/HolidayManagment.vue` | 0/1 | `holidays`→วันหยุดจริง · action→method เดิม |
| (มี script แล้ว ยังไม่มี block) | `Register.vue`, `ForgotPassword.vue`, `AddFamily.vue`, `BookingList.vue`, `CustomerCourseFinished.vue`, `GymnastManagement.vue`, `ApproveNewStudent` | – | ใช้ primitive เดียวกัน: `.pg-head` หัวหน้า · ฟอร์ม `.scard`+`v-text-field` · ตาราง `.idt` · ปุ่ม `.id-btn` |

---

## ⭐ ไฟล์ตัวอย่างที่รื้อเสร็จแล้ว (worked examples — ใช้เป็นแม่แบบ)
สองไฟล์นี้รื้อ `<template>` เป็นดีไซน์ใหม่เสร็จแล้ว โดย **คง `<script>`/API/ไดอะล็อกเดิมทุกบรรทัด** — เปิดดูเป็นแพตเทิร์นได้เลย:
- **`Student.vue`** = หน้า list + **server pagination** (เก็บ `tableOptions.page`/`totalStudents`/`getStudentList` เดิม) → toolbar มาตรฐาน (ค้นหา+รีเฟรช+เพิ่ม แถวเดียว) + ตาราง `.idt` (วนหัวจาก `StudentListHeaders` เดิม → i18n ถูกอัตโนมัติ) + footer pager ที่ขยับ `tableOptions.page` เดิม · ไดอะล็อกฟอร์ม+อัปโหลดรูป คงไว้
- **`BookingManagement.vue`** = ปฏิทิน (ซ้าย, `v-date-picker` เดิม) + ตารางรายชื่อ `.idt` (ขวา) ที่มี **เช็คชื่อแบบกดสลับ** (`clickCheckin`/`clickUndoCheckin` เดิม) + แก้/ลบ · ไดอะล็อกฟอร์มจอง/ยืนยันคงไว้

**เทคนิคสำคัญที่ 2 ไฟล์นี้โชว์ (ทำตามกับหน้าอื่น):**
1. **วนหัวตารางจาก headers computed เดิม** (`<th v-for="h in XxxHeaders">`) แล้ว map cell ด้วย `h.key` → ได้คอลัมน์ + i18n ตรงของเดิมโดยไม่ต้องเดา key
2. **server pagination ห้ามแปลงเป็น client** — ถ้าหน้าเดิมใช้ `v-data-table-server` ให้คง flow เดิม (footer pager เรียก `getXxxList()` ของจริง) อย่ายัด `IdGrid` client-side แทน
3. **ปุ่ม action (รีเฟรช/เพิ่ม) อยู่แถวเดียวกับค้นหา** ตามมาตรฐาน CLAUDE.md
4. แตะเฉพาะ `<template>` ส่วน list — `<script>` + `<v-dialog>` ทั้งหมดคงเดิม

---

## ตัวอย่างจริง: Courses.vue (จาก v-data-table → prototype 1:1)
**markup เป้าหมาย** (บล็อก `screen==='courses'` ใน Full Preview) ใช้ตาราง `.idt` + ปุ่ม `.id-btn`:
```html
<template>
  <div class="page">
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-star-shooting-outline"></span></div>
      <div><div class="id-h1">{{ $t('courses.title') }}</div><div class="pg-sub">ประเภทคอร์สในระบบ</div></div>
      <div style="flex:1"></div>
      <button class="id-btn id-btn-primary id-btn-sm" @click="dialog = true">
        <span class="mdi mdi-plus"></span> {{ $t('courses.newCourse') }}
      </button>
    </div>
    <div class="scard" style="padding:14px">
      <div style="overflow-x:auto">
        <table class="idt">
          <thead><tr><th>{{ $t('table.courseName') }}</th><th>{{ $t('table.courseShortName') }}</th><th style="text-align:center">{{ $t('table.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in courselist" :key="c.courseid">
              <td><b>{{ c.coursename }}</b></td>
              <td>{{ c.course_shortname }}</td>
              <td style="text-align:center;white-space:nowrap">
                <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;padding:0 5px" @click="editItem(c)"></span>
                <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;padding:0 5px" @click="deleteItem(c)"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- คง v-dialog (เพิ่ม/แก้ไข/ลบ) เดิมไว้ทั้งหมด ผูกกับ save/close/deleteItemConfirm เดิม -->
  </div>
</template>
```
**สิ่งที่ทำ:** เปลี่ยนแค่ `<template>` ตารางเป็น `.idt`, ปุ่มเป็น `.id-btn`, ผูก `courselist`/`coursename`/`course_shortname`/`editItem`/`deleteItem` ของจริง — **`<script>` axios เดิมไม่แตะ** · `v-dialog` ฟอร์มยังใช้ของเดิมได้ (จะได้ธีมจาก istar-design.css อยู่แล้ว)

---

## ⭐ มาตรฐาน DataGrid — ใช้ "คอมโพเนนต์เดียว" ทุกหน้า list (นักเรียน/แพ็คเกจ/คอร์ส/คลาส/วันหยุด)
> ทุกหน้าที่เป็น "ตารางข้อมูล" ต้องหน้าตา + พฤติกรรม **เหมือนกันเป๊ะ**: toolbar (ค้นหา + ฟิลเตอร์ + จำนวน + ปุ่มเพิ่ม) → ตาราง `.idt` → แถบ pagination ด้านล่าง
> ดูตัวอย่างทำงานจริงได้ในพรีวิว (`iStar Full Preview` → เมนู นักเรียน/แพ็คเกจ/คอร์ส/คลาส/วันหยุด) — โค้ดคอมโพเนนต์ต้นแบบอยู่ใน `full-preview.js` (ตัวแปร `IdGrid`)

**สร้าง 1 คอมโพเนนต์กลาง** `src/components/common/IdDataGrid.vue` แล้วใช้ซ้ำทั้ง 5 หน้า — ห้ามเขียน toolbar/pagination ซ้ำในแต่ละหน้า

### สัญญา (props / slots / events) — คัดลอกจาก IdGrid ใน full-preview.js
```
props:
  columns      Array  [{ key, label, align }]          // align: 'left'(ดีฟอลต์) | 'center'
  rows         Array                                    // = ข้อมูลจริงจาก API (เช่น studentlist)
  filters      Array  [{ key, label, options:[{value,label}] }]   // ดรอปดาวน์ (มีกี่ตัวก็ได้/ไม่มีก็ได้)
  searchKeys   Array  [string]                          // ฟิลด์ที่ช่องค้นหาจะ match
  searchPlaceholder String
  addLabel     String                                   // มีค่า = โชว์ปุ่ม "เพิ่ม…" สีชมพู
  perPage      Number (ดีฟอลต์ 8)
slots:
  #cell-<key>="{ row }"   // เรนเดอร์ cell แบบกำหนดเอง (avatar, badge, สวิตช์, ปุ่ม action)
emits:
  add                     // คลิกปุ่มเพิ่ม → ผูกไปเปิด dialog/route เพิ่มของจริง
```
> ตรรกะภายใน (ก๊อปจาก `IdGrid`): `filtered` = กรองด้วย searchKeys + ทุก filter, `paged`/`pageCount`/`from`/`to` = แบ่งหน้า, รีเซ็ตหน้าเมื่อค้นหา/กรอง/ข้อมูลเปลี่ยน · มาร์กอัป toolbar+table+footer อยู่ในไฟล์พรีวิวแล้ว ยกมาเป็น `<template>` ของ SFC ได้เลย

### รายละเอียด UI ที่ปรับล่าสุด (ต้องทำตามให้ตรง)
- **Toolbar แถวเดียว (มาตรฐานทุกหน้าจัดการข้อมูล):** `[ช่องค้นหา (.id-input)] [ฟิลเตอร์ .id-select] … ⟶ (ดันขวา) [ปุ่ม action]` — **ปุ่มจัดการข้อมูลทั้งหมด (เพิ่ม / รีเฟรช / นำเข้า-ส่งออก ฯลฯ) ต้องอยู่ระดับเดียวกับช่องค้นหา/ฟิลเตอร์เสมอ** ห้ามวางแถวบนแยกหรือลอยที่อื่น (กฎนี้บันทึกไว้ใน `CLAUDE.md` ของโปรเจกต์ด้วย)
  - ปุ่มเดียว (เพิ่ม) → ใช้ prop `add-label` + `@add`
  - หลายปุ่ม (เช่น รีเฟรช + เพิ่ม) → ใช้สล็อต `<template #actions>…</template>` ของ `IdGrid` (เรนเดอร์ขวาของช่องค้นหา)
- **Footer** = ซ้าย: `แสดง {from}–{to} จาก {total} รายการ` · ขวา: เพจเจอร์มินิมอล `‹  หน้า / ทั้งหมด  ›` (`.pager-btn` + `.pager-now`) — **เลิกใช้** ปุ่มเลขหน้าหลายปุ่มแบบเดิม · เพจเจอร์ซ่อนเมื่อมีหน้าเดียว
- **คอลัมน์ที่เป็นสวิตช์เปิด/ปิด** (เช่น คอร์ส `enable`) ใช้ **CSS toggle `.idsw`** ไม่ใช่ `v-switch` ของ Vuetify — เพราะ `v-switch` สูงกว่าทำให้ความสูงแถวไม่เท่ากริดอื่น:
  ```html
  <span class="idsw" :class="{ on: row.enable }" @click="toggleEnable(row)"><span class="track"></span><span class="thumb"></span></span>
  ```
  (ผูก `@click` ไปยัง method อัปเดตสถานะจริงของหน้า ไม่ใช่แค่สลับค่า local)

### วิธีใช้ต่อหน้า (เหมือนกันหมด — ต่างแค่ config + slot)
```html
<!-- ตัวอย่าง: Student.vue (center) -->
<id-data-grid
  :columns="gridCols" :rows="studentlist" :filters="gridFilters"
  :search-keys="['fullname','nickname','coursename','phone']"
  search-placeholder="ค้นหาชื่อ / ชื่อเล่น / คอร์ส / เบอร์"
  :add-label="$t('btn.addStudent')" @add="openAddDialog">
  <template #cell-fullname="{ row }">
    <div class="row" style="gap:8px"><span class="tt-avatar">{{ initial(row.fullname) }}</span><b>{{ row.fullname }}</b></div>
  </template>
  <template #cell-remaining="{ row }"><span class="badge" :class="row.remaining<=2?'badge-warning':'badge-primary'">{{ row.remaining }}</span></template>
  <template #cell-actions="{ row }">
    <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;padding:0 5px" @click="editItem(row)"></span>
    <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;padding:0 5px" @click="deleteItem(row)"></span>
  </template>
</id-data-grid>
```

### config มาตรฐานต่อหน้า (เปลี่ยน `key`/`label`/ฟิลด์ ให้ตรง field จริงของ API)
| หน้า (component) | columns (key) | filters | searchKeys |
|---|---|---|---|
| **นักเรียน** `Student.vue` | name·nick·gender·age·level·course·remaining·expire·phone·**actions** | Level, คอร์ส | ชื่อ, ชื่อเล่น, คอร์ส, เบอร์ |
| **แพ็คเกจคอร์ส** `CustomerCourse.vue` | course(เลข)·student·name·remaining·expire·**paid** | คอร์ส, สถานะชำระ(จ่าย/ค้าง) | เลขคอร์ส, นักเรียน, คอร์ส |
| **คอร์สเรียน** `Courses.vue` | name·short·code·**enable**·**actions** | สถานะเปิดใช้(เปิด/ปิด) | ชื่อ, ชื่อย่อ, รหัส |
| **คลาสเรียน** `Classes.vue` | name·day·time·course·**actions** | คอร์ส | ชื่อคลาส, คอร์ส |
| **วันหยุด** `HolidayManagment.vue` | name·start·end·**actions** | — (ไม่มี) | ชื่อวันหยุด |

### หน้าอื่นที่ปรับเพิ่ม (นอกกริด)
- **ตัวเลือกวันที่มาตรฐาน `IdCalendar` (ใช้ 3 หน้า): จองคลาส / ตารางเรียน / จัดการการจอง** — ปฏิทินเต็มเดือน เลือกได้ **ทุกวันอิสระ** + เปลี่ยนเดือนไป–กลับได้ แต่ต้อง **ปิด (เลือกไม่ได้)** สำหรับ:
  - **ทุกวันจันทร์** (ถาวร) — `date.getDay() === 1`
  - **วันหยุดจาก config** — อ่านจากตาราง holiday เดิม (ขยายช่วง start–end เป็นรายวัน) แล้วส่งเป็น `:holiday-keys`
  วันที่ปิดให้แสดงจาง + ขีดฆ่า + คลิกไม่ได้ พร้อม legend "วันจันทร์และวันหยุด ปิดให้บริการอัตโนมัติ" · ค่าวันที่เป็น key `'YYYY-M-D'` ผูกด้วย `v-model`
  ```html
  <id-calendar v-model="selectedDate" :holiday-keys="holidayKeys" :mark-keys="daysWithBookings"></id-calendar>
  ```
  (โค้ดต้นแบบคอมโพเนนต์อยู่ใน `full-preview.js` ตัวแปร `IdCalendar` — ของจริงให้ดึง config วันหยุด + ตรวจวันจันทร์จาก backend)
- **จองคลาส `Reservation.vue`** — ขั้น 1 = `IdCalendar`, ขั้น 2 (รอบเวลา) ล็อกจนกว่าจะเลือกวันที่ · เลือกวันแล้วดึงรอบเวลา/โควตาของวันนั้นมาแสดง
- **ตารางเรียน `ViewClasses.vue`** — `IdCalendar` (ดีฟอลต์ = วันแรกที่เลือกได้ ≥ วันนี้) → ตาราง/roster โหลดตามวันที่เลือก
- **จัดการการจอง `BookingManagement.vue`** — เลย์เอาต์อิงระบบเดิม: **ซ้าย** = `IdCalendar` (มีจุดบนวันที่มีการจอง), **ขวา** = หัวข้อ "การจองคลาสทั้งหมด" + ปุ่มรีเฟรช/เพิ่มการจอง + ป้ายวันที่ + ตารางมาตรฐาน `IdDataGrid` คอลัมน์ **ชื่อ · ชื่อคอร์ส · เวลา · เช็คชื่อ · แก้ไข · ลบ** (เช็คชื่อ = ไอคอนกดสลับเช็คอิน, ผูก API เดิม) ดึงรายชื่อตามวันที่ที่เลือก

---

## ⭐ มาตรฐานไดอะล็อก — `IdModal` (ใช้แทน `v-dialog` ทุกที่)
> ทุก dialog ในระบบ (ฟอร์มเพิ่ม/แก้ไข, ยืนยันลบ, ตัวเลือกแบบมีตาราง) ใช้คอมโพเนนต์กลางตัวเดียว — **เลิกใช้ `v-dialog` หน้าตา default**
> ดูตัวอย่างทำงานจริงในพรีวิว: เมนู **นักเรียน** → ปุ่ม "เพิ่มนักเรียน" (ฟอร์ม) และ "ลงทะเบียนเข้าคลาส" (กริดในไดอะล็อก)

**สร้าง 1 คอมโพเนนต์กลาง** `src/components/common/IdModal.vue` (ก๊อปจากตัวแปร `IdModal` ใน `full-preview.js`) แล้วใช้ซ้ำทุกหน้า

### สัญญา (props / slots)
```
props:
  modelValue  Boolean   // v-model เปิด/ปิด
  title       String
  subtitle    String    // (optional)
  icon        String    // mdi class เช่น 'mdi-account-plus'
  size        String    // 'sm' | 'md'(default) | 'lg' | 'xl'
  noFooter    Boolean   // ซ่อน footer
slots:
  default     // เนื้อหา body
  footer      // ปุ่ม action (ghost ยกเลิก + primary บันทึก)
behaviour:    teleport to body · ปิดด้วย ESC / คลิกฉากหลัง · ล็อก scroll body · transition fade+rise · มือถือ = sheet เด้งจากล่าง
```

### แบบที่ 1 — ฟอร์มกรอกข้อมูล (เพิ่ม/แก้ไข)
```html
<id-modal v-model="dialog" size="lg" icon="mdi-account-plus"
          :title="mode==='add' ? 'เพิ่มนักเรียนใหม่' : 'แก้ไขข้อมูลนักเรียน'"
          :subtitle="mode==='add' ? 'กรอกข้อมูลเพื่อสร้างบัญชีนักเรียน' : form.name">
  <div class="form-grid">
    <div class="field"><label>ชื่อ–นามสกุล <span class="req">*</span></label><input class="id-input" v-model="form.name" /></div>
    <div class="field"><label>เพศ</label><select class="id-select" v-model="form.gender"><option>หญิง</option><option>ชาย</option></select></div>
    <div class="field full"><label>หมายเหตุ</label><textarea class="id-input id-textarea" v-model="form.note"></textarea></div>
  </div>
  <template #footer>
    <button class="id-btn id-btn-ghost" @click="dialog=false">ยกเลิก</button>
    <button class="id-btn id-btn-primary" :disabled="!form.name" @click="save">บันทึก</button>
  </template>
</id-modal>
```
> ผูก `@click="save"` ไปยัง **method บันทึกจริง** (API เดิม) · ปุ่มบันทึก `:disabled` จนฟิลด์บังคับ (`*`) ครบ · ของจริงเอา dialog เดิม (`dialogStudent` + ฟอร์ม + `submitStudent()`) มาห่อด้วย `IdModal` — **ไม่แตะ logic**

### แบบที่ 2 — กริดในไดอะล็อก (ตัวเลือกแบบมีตาราง / เลือกหลายรายการ)
```html
<id-modal v-model="dialog" size="lg" icon="mdi-account-multiple-plus" title="ลงทะเบียนเข้าคลาส">
  <div class="grid-toolbar" style="margin-bottom:12px">
    <label class="grid-search"><span class="mdi mdi-magnify"></span><input class="id-input" v-model="q" /></label>
    <span class="grid-spacer"></span>
    <span class="badge badge-primary" style="height:34px">เลือกแล้ว {{ picked.length }} คน</span>
  </div>
  <div class="id-modal-grid"><div class="id-modal-grid-scroll">
    <table class="idt">
      <thead><tr><th style="width:46px"></th><th>ชื่อ</th>…</tr></thead>
      <tbody>
        <tr v-for="s in filtered" :key="s.id" @click="toggle(s.id)" style="cursor:pointer">
          <td style="text-align:center"><span class="id-check" :class="{ on: picked.includes(s.id) }"><span class="mdi mdi-check"></span></span></td>
          <td><b>{{ s.name }}</b></td>…
        </tr>
      </tbody>
    </table>
  </div></div>
  <template #footer>
    <button class="id-btn id-btn-ghost" @click="dialog=false">ยกเลิก</button>
    <button class="id-btn id-btn-primary" :disabled="!picked.length" @click="confirm">เพิ่ม {{ picked.length }} คน</button>
  </template>
</id-modal>
```
> `.id-modal-grid > .id-modal-grid-scroll` = ตารางเลื่อนในกรอบ หัวตารางติดบน · `.id-check` = เช็คบ็อกซ์เลือก · footer แสดงตัวนับ + ปุ่มยืนยัน disabled เมื่อยังไม่เลือก
> สไตล์ทั้งหมดอยู่ใน **`istar-design.css`** (`.id-modal*`, `.id-check`, `.id-textarea`) — ก๊อปไฟล์เดียวพอ

---

### หน้าโปรไฟล์ ฯลฯ
- **โปรไฟล์ `EditProfile.vue`** — ทำเป็นฟอร์มแก้ไขได้จริง: การ์ดซ้าย = อวตาร + ปุ่ม "อัปโหลดรูปใหม่/ลบรูป" (`<input type="file" accept="image/*">` → preview ด้วย FileReader, ส่งขึ้น API อัปโหลดเดิม) · การ์ดขวา = ฟิลด์ `.id-input` ใน `.form-grid` (ชื่อ/นามสกุล/ชื่อเล่น/เบอร์/อีเมล/ยิม) + ปุ่ม **บันทึก** (เรียก API อัปเดตโปรไฟล์เดิม) · **ไม่ต้องมีปุ่มออกจากระบบในหน้านี้** (logout อยู่ที่เมนูซ้ายล่างสุดแล้ว) · คงฟิลด์/validation จริงของระบบเก่าให้ครบ · ทุกการ์ดต้อง responsive (ใช้ `.grid2-profile`/`.form-grid` ห้ามตั้ง grid-template เป็น inline) ยุบคอลัมน์เดียวบนมือถือ
- **เปลี่ยนรหัสผ่าน (ในหน้าโปรไฟล์)** — การ์ดแยกใต้ข้อมูลส่วนตัว: 3 ฟิลด์ (รหัสปัจจุบัน / รหัสใหม่ / ยืนยันรหัสใหม่) มีปุ่มสลับ show/hide (`.pw-eye`) ทุกช่อง · ปุ่ม "เปลี่ยนรหัสผ่าน" เปิดใช้เมื่อ: กรอกรหัสเดิม + รหัสใหม่ ≥ 8 ตัว + ใหม่ตรงกับยืนยัน (ขึ้นข้อความ "รหัสผ่านใหม่ไม่ตรงกัน" เมื่อไม่ตรง) · ผูกกับ API เปลี่ยนรหัสผ่านเดิมของระบบ
- **แถบบน (topbar)** — มีปุ่มสลับภาษา `.lang-btn` (ไอคอน translate + `ไทย/EN`) ผูกกับ i18n เดิม (`this.$i18n.locale`) · อย่าลบทิ้ง
- **เมนูซ้าย (App.vue)** — ปุ่ม **ออกจากระบบ** ปักไว้ **ล่างสุด** (ใต้ปุ่มย่อเมนู คั่นด้วย `.side-divider`) · ตอนเมนูย่อ (collapsed) ต้องโชว์ **tooltip ชื่อเมนู** ตอน hover (มี `:data-label` ทุก nav-item + `.side` ต้อง `overflow:visible` ตอน collapsed ไม่งั้น tooltip ถูกตัด)

> คอลัมน์ที่ต้องเรนเดอร์พิเศษ (ตัวหนาในตาราง) ทำผ่าน slot `#cell-<key>`: **actions**=ไอคอนแก้/ลบ ผูก method เดิม · **paid/enable**=badge/`v-switch` · **remaining**=badge ตามจำนวน
> ฟิลด์/คอลัมน์ของจริงมีมากกว่าตัวอย่างได้ — ใส่ให้ครบตามของเดิม (ห้ามตัดทิ้ง) แค่จัดให้อยู่ในรูปแบบเดียวกัน
> ปุ่ม "เพิ่ม" และไอคอน action ต้อง `@add`/`@click` ไปยัง dialog/method เดิมของแต่ละหน้า (ไม่ใช่ค่า demo)

---

## เกณฑ์ "ผ่าน" ต่อหน้า (Definition of Done)
- [ ] วางจอเทียบ prototype แล้ว **โครงเหมือน** (หัวหน้า `.pg-head` · การ์ด `.scard` · ตาราง `.idt` · pill `.tt-pill` · ปุ่ม `.id-btn` · badge `.badge-*`)
- [ ] **ทุกหน้า list ใช้ `IdDataGrid` ตัวเดียวกัน** — ค้นหา/ฟิลเตอร์/แบ่งหน้า เหมือนกันทุกหน้า
- [ ] ใช้ฟอนต์ Mali (หัว) + IBM Plex Sans Thai (เนื้อหา) · สี/มุมโค้งจาก token
- [ ] ข้อมูล **มาจาก API จริง** ครบทุกฟิลด์/คอลัมน์เท่าของเดิม
- [ ] ทุกปุ่ม/ฟอร์ม/dialog/ตาราง/เช็คอิน ทำงานเหมือนก่อนรีสกิน
- [ ] เต็มความกว้างบนจอกว้าง · responsive (mobile = bottombar สำหรับลูกค้า) · ไม่มี console error

---

## พรอมป์เริ่มงาน (วางให้ Claude Code ได้เลย)
```
อ่าน CLAUDE_CODE_1to1.md และเปิด "iStar Full Preview (new design).html" เป็นภาพเป้าหมาย

งาน: ทำทุกหน้าใน istarapp_dev (Vue 3 + Vuetify 3) ให้หน้าตา "เป๊ะตาม prototype 1:1"
ไม่ใช่แค่รีสกินสี แต่ให้เปลี่ยนโครง <template> ของแต่ละ component เป็น markup ของ prototype
(.scard / .idt / .tt-pill / .id-btn / .badge-* / .stat-grid / .grid2) แล้วผูกกับ data/method/API เดิม

ขั้นตอน:
1) ก๊อป istar-design.css + istar-pages.css -> src/assets/ แล้ว import ทั้งคู่ใน main.js (design ก่อน pages)
2) ตั้ง Vuetify theme primary=#ec4899
3) ไล่ทำทีละหน้าตาม "ตารางจับคู่" ใน CLAUDE_CODE_1to1.md:
   - เปิดบล็อก screen==='<key>' ใน Full Preview = markup เป้าหมาย
   - เปิด component จริง อ่าน <script> หาชื่อ array/ฟิลด์/method จริง
   - แทน <template> เดิมด้วย markup prototype + rewire เป็นตัวแปรจริง (ห้ามแตะ <script>/API)
   - ปุ่มที่เดิมเปิด dialog/เรียก API ให้ผูก @click กลับไป method เดิม (ห้ามเหลือ toast เดโม)
4) npm run serve -> เทียบจอกับ preview ทุกหน้า -> test login ทุก usertype (0/1/2/10)
   -> dashboard -> คลิกชื่อใน roster ต้องมี popup เช็คอิน/แก้ไข -> ทุกฟอร์ม/ตารางทำงานครบ
เริ่มจาก Courses.vue (มีตัวอย่างเต็มในคู่มือ) แล้วทำหน้าที่เหลือตามตาราง
รายงานหน้าที่ binding ไม่ชัด (หาชื่อฟิลด์จริงไม่เจอ) เพื่อยืนยันก่อนเดา
```
