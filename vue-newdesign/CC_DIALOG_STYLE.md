# CC — ปรับ Style ของ Dialog เป็น `IdModal` (เฉพาะหน้าตา ไม่แตะ logic)

> ธีมรวม + 2 CSS (`istar-design.css`, `istar-pages.css`) ลงระบบไปแล้ว
> ไฟล์นี้สั่งงาน **เรื่องเดียว**: เปลี่ยน `v-dialog` หน้าตา default ของ Vuetify → ดีไซน์ใหม่ `IdModal`
> ทุก dialog (เพิ่ม/แก้ไข, ยืนยันลบ, ตัวเลือกแบบมีตาราง) ต้องหน้าตาเหมือนกันหมด

ดูตัวอย่างทำงานจริงในพรีวิว `iStar Full Preview (new design).html` → เข้าเป็น **แอดมิน** → เมนู **นักเรียน** (ปุ่ม "เพิ่มนักเรียน") และ **คอร์ส** (ปุ่ม "เพิ่มคอร์ส")

---

## กฎเหล็ก
1. **แตะเฉพาะ `<template>` + ปุ่ม/คลาส** — `<script>`/data/method/API/validation/ฟิลด์เดิม **คงทุกบรรทัด**
2. **ฟิลด์ครบเท่าเดิม** — แค่เปลี่ยนหน้าตา input/ปุ่ม/หัวข้อ ไม่ตัด/เพิ่มฟิลด์ (เว้นแต่สั่งเป็นพิเศษ)
3. CSS ทั้งหมดมีใน `istar-design.css` แล้ว (`.id-modal*`, `.modal-sec`, `.form-grid-3/4`, `.id-upload`, `.id-check`, `.idsw`, `.dlg-avatar`) — **ไม่ต้องเขียน CSS ใหม่**
4. ปุ่ม footer: ซ้าย `ghost ยกเลิก` · ขวา `primary บันทึก` — **เลิกใช้** ปุ่มน้ำเงิน/แดงของ Vuetify

---

## ขั้นที่ 1 — สร้างคอมโพเนนต์กลาง `src/components/common/IdModal.vue`
ก๊อปจากตัวแปร `IdModal` ใน `full-preview.js` (โครงเดียวกัน เปลี่ยนเป็น SFC):

```vue
<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="id-modal-scrim" @mousedown.self="close">
        <div class="id-modal" :class="size" role="dialog" aria-modal="true">
          <div class="id-modal-head">
            <div v-if="icon" class="id-modal-ico"><span class="mdi" :class="icon"></span></div>
            <div class="id-modal-titles">
              <div class="id-modal-title">{{ title }}</div>
              <div v-if="subtitle" class="id-modal-sub">{{ subtitle }}</div>
            </div>
            <button class="id-modal-x" @click="close" aria-label="ปิด"><span class="mdi mdi-close"></span></button>
          </div>
          <div class="id-modal-body"><slot></slot></div>
          <div v-if="!noFooter" class="id-modal-foot"><slot name="footer"></slot></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'IdModal',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },       // mdi class เช่น 'mdi-account-plus'
    size: { type: String, default: 'md' },      // sm | md | lg | xl
    noFooter: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'close'],
  methods: {
    close() { this.$emit('update:modelValue', false); this.$emit('close'); },
    onKey(e) { if (e.key === 'Escape' && this.modelValue) this.close(); },
  },
  watch: { modelValue(v) { document.body.style.overflow = v ? 'hidden' : ''; } },
  mounted() { document.addEventListener('keydown', this.onKey); },
  beforeUnmount() { document.removeEventListener('keydown', this.onKey); document.body.style.overflow = ''; },
};
</script>
```
ลงทะเบียน global ใน `main.js`: `app.component('IdModal', IdModal)` (หรือ import รายหน้า)

> **กันไดอะล็อกค้างซ้อน:** ถ้าหน้าไหนเปลี่ยน route/แท็บได้ขณะเปิด dialog ให้ปิด dialog เมื่อออกจากหน้า (watch route แล้วเซ็ต `dialog = false`)

---

## ขั้นที่ 1.5 — Dropdown + ตัวเลือกวันที่ ให้เข้าธีม (สำคัญ)
> `<select>` และ `input[type=date]` ของ native = หน้าตา/ฟอนต์ของ OS (ไม่เข้าธีม + ป๊อปอัปวันที่หลุดกรอบ)
> ใช้ 2 คอมโพเนนต์นี้แทน (ก๊อปจาก `full-preview.js`): **`IdSelect`** + **`IdDateField`**

**`IdSelect`** (แทน `<select>`/`<v-select>`): trigger สไตล์ `.id-input` + เมนูป๊อปอัป **teleport ไป body** (z-index 200 → ไม่ถูก dialog บัง, ไม่ถูก scroll ตัด) เด้งขึ้น/ลงอัตโนมัติ
```html
<id-select v-model="form.gender" :options="['หญิง','ชาย']" placeholder="— เลือก —"></id-select>
<!-- options เป็น [string] หรือ [{value,label}] ก็ได้ -->

<!-- ★ ฟิลด์ที่ตัวเลือกเยอะ/เพิ่มได้เรื่อยๆ (ชื่อคน, นักเรียน, หมายเลขคอร์ส, userid) -->
<!--   ใส่ prop `searchable` → มีช่องพิมพ์กรองในเมนู (auto-focus, Enter เลือกตัวแรก) -->
<id-select v-model="form.studentId" :options="studentList" searchable
           search-placeholder="พิมพ์ชื่อนักเรียน…" placeholder="— เลือกนักเรียน —"></id-select>
```
> **`searchable`** = combobox พิมพ์เพื่อ filter — ใช้กับทุกฟิลด์ที่ดึงรายการจาก API แล้วโตได้ (นักเรียน/ผู้ปกครอง-userid/หมายเลขคอร์ส/โค้ช ฯลฯ) · รายการสั้นคงที่ (เพศ/Level/ประเภท) ไม่ต้องใส่

**`IdDateField`** (แทน `input[type=date]`/`<v-date-picker>`): เปิด **`IdCalendar` ตัวเดียวกับ Dashboard** เป็นป๊อปอัป → ทั้งระบบใช้ปฏิทินเดียวกัน
```html
<!-- ฟอร์มทั่วไป (วันเกิด/วันเริ่ม/วันหมดอายุ/วันที่ชำระ): เลือกได้ทุกวัน -->
<id-date v-model="form.dob" placeholder="เลือกวันที่"></id-date>
<!-- จองคลาส/วันที่จอง: ใช้กติกาเดียวกับ Dashboard (ปิดวันจันทร์ + วันหยุด) -->
<id-date v-model="form.date" :disable-mondays="true" :holiday-keys="holidayKeys"></id-date>
```
> โค้ดเต็มของ `IdSelect` + `IdDateField` อยู่ใน `full-preview.js` (ก๊อปทั้ง 2 ตัว) · ป๊อปอัป teleport body + z-index 200 = **แก้ปัญหาป๊อปอัปวันที่อยู่หลัง dialog** · ฟิลด์ที่เปิดปฏิทินไม่ปิดวันจันทร์ ให้ `IdCalendar` ซ่อน legend อัตโนมัติเมื่อ `disable-mondays=false`

**ฟอนต์ใน input ทั้งหมด** — บังคับให้ใช้ฟอนต์ระบบ (native control ชอบ fallback เป็นฟอนต์ OS) ใส่ใน global CSS:
```css
input, select, textarea { font-family: var(--font-body); }   /* IBM Plex Sans Thai */
```
หรือถ้ามี scope: `#app input, #app select, #app textarea { font-family: var(--font-body); }`

---

## ขั้นที่ 2 — สูตรแปลง `v-dialog` → `IdModal`
| Vuetify เดิม | เปลี่ยนเป็น |
|---|---|
| `<v-dialog v-model="dialogX" max-width="1080">` | `<id-modal v-model="dialogX" size="xl">` (sm≤430 · md≤560 · lg≤760 · xl≤980) |
| `<v-card>` + `<v-card-title>` | prop `title` + `icon` + `subtitle` (หัวชมพูมาเอง) |
| `<v-card-text>` เนื้อหา | วางใน slot default |
| `<v-card-actions>` ปุ่ม | `<template #footer>` |
| `<v-btn color="primary">บันทึก` | `<button class="id-btn id-btn-primary">บันทึก</button>` |
| `<v-btn color="error/grey">ยกเลิก` | `<button class="id-btn id-btn-ghost">ยกเลิก</button>` |
| `<v-text-field>` | `<div class="field"><label>…</label><input class="id-input" v-model="…" /></div>` |
| `<v-select>` | `<div class="field"><label>…</label><id-select v-model="…" :options="opts" placeholder="— เลือก —"></id-select></div>` |
| `<v-textarea>` | `<textarea class="id-input id-textarea" v-model="…"></textarea>` |
| `<v-switch>` | `<span class="idsw" :class="{on:val}" @click="val=!val"><span class="track"></span><span class="thumb"></span></span>` |
| `<v-checkbox>` | `<label class="id-cbx" @click="val=!val"><span class="id-check" :class="{on:val}"><span class="mdi mdi-check"></span></span> ข้อความ</label>` |
| `<v-date-picker>` / `input[type=date]` "Enter date" | `<id-date v-model="…" placeholder="เลือกวันที่"></id-date>` — เปิด **ปฏิทินตัวเดียวกับ Dashboard (IdCalendar)** เป็นป๊อปอัป |
| หัวข้อ section (เส้นเขียว/น้ำเงิน) | `<div class="modal-sec"><span class="mdi mdi-…"></span> ข้อความ</div>` (section ถัดไปเติม class `mt`) |
| รูปอัปโหลด (อวตาร) | `.dlg-avatar` (ดูตัวอย่างนักเรียน) |
| อัปโหลดสลิป/ไฟล์ | `<label class="id-upload"><span class="mdi mdi-camera-outline"></span> อัปโหลด<input type="file" hidden></label>` |

**เลย์เอาต์ฟอร์ม:** `.form-grid` = 2 คอลัมน์ · `.form-grid-3` = 3 · `.form-grid-4` = 4 (ยุบเองบนมือถือ) · `.field.full` = เต็มแถว
**ปุ่มบันทึก** ใส่ `:disabled="ฟิลด์บังคับยังไม่ครบ"` (เช่น `!form.name`)

---

## ตัวอย่าง A — ฟอร์มเพิ่ม/แก้ไขนักเรียน (อวตาร + ฟอร์ม + กริดประวัติ)
> ของจริง: เอา `dialogStudent` + ฟอร์ม + `submitStudent()`/`showRetrieveStudent()` เดิมมาห่อ — ฟิลด์ตามของเดิม (ชื่อ/ชื่อกลาง/นามสกุล/ชื่อเล่น/เพศ/วันเกิด/อายุ/Level/Username ผปค./หมายเหตุ/หมายเลขคอร์ส→ต่อเนื่อง + ตารางประวัติการใช้คอร์ส)

```html
<id-modal v-model="dialogStudent" size="xl" icon="mdi-account-plus"
          :title="isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'">
  <div class="dlg-avatar" style="margin-bottom:20px">
    <div class="av-ph"><img v-if="form.photo" :src="form.photo" /><span v-else class="mdi mdi-account"></span></div>
    <label class="av-cam"><span class="mdi mdi-camera"></span><input type="file" accept="image/*" hidden @change="onPhoto"></label>
  </div>

  <div class="modal-sec"><span class="mdi mdi-card-account-details-outline"></span> ข้อมูลนักเรียน</div>
  <div class="form-grid-3">
    <div class="field"><label>ชื่อ <span class="req">*</span></label><input class="id-input" v-model="form.firstname"></div>
    <div class="field"><label>ชื่อกลาง</label><input class="id-input" v-model="form.middlename"></div>
    <div class="field"><label>นามสกุล <span class="req">*</span></label><input class="id-input" v-model="form.lastname"></div>
  </div>
  <div class="form-grid-4" style="margin-top:14px">
    <div class="field"><label>ชื่อเล่น</label><input class="id-input" v-model="form.nickname"></div>
    <div class="field"><label>เพศ</label><select class="id-select" v-model="form.gender"><option>หญิง</option><option>ชาย</option></select></div>
    <div class="field"><label>วันเกิด</label><input class="id-input" type="date" v-model="form.dateofbirth"></div>
    <div class="field"><label>อายุ</label><input class="id-input" :value="form.age" disabled></div>
  </div>
  <div class="form-grid" style="margin-top:14px">
    <div class="field"><label>ระดับ (Level)</label><select class="id-select" v-model="form.level">…</select></div>
    <div class="field"><label>Username ผู้ปกครอง</label><select class="id-select" v-model="form.parentid">…</select></div>
    <div class="field full"><label>หมายเหตุ</label><textarea class="id-input id-textarea" v-model="form.note"></textarea></div>
  </div>
  <div class="course-flow" style="margin-top:14px">
    <div class="field" style="flex:1"><label>หมายเลขคอร์ส</label><select class="id-select" v-model="form.courseid">…</select></div>
    <div class="flow-arrow">คอร์สถัดไป<span class="mdi mdi-arrow-right"></span></div>
    <div class="field" style="flex:1"><label>หมายเลขคอร์สต่อเนื่อง</label><select class="id-select" v-model="form.nextcourseid">…</select></div>
  </div>

  <div class="modal-sec mt"><span class="mdi mdi-history"></span> ประวัติการใช้คอร์ส</div>
  <div class="id-modal-grid"><div class="id-modal-grid-scroll" style="max-height:30vh">
    <table class="idt">
      <thead><tr><th>วันที่</th><th>คอร์ส</th><th>เวลา</th><th style="text-align:center">สถานะ</th></tr></thead>
      <tbody><tr v-for="h in usageHistory" :key="h.id"><td>{{ h.date }}</td><td>{{ h.course }}</td><td>{{ h.time }}</td>
        <td style="text-align:center"><span class="badge" :class="h.ok?'badge-success':'badge-error'">{{ h.ok?'เช็คชื่อแล้ว':'ขาด' }}</span></td></tr></tbody>
    </table>
  </div></div>

  <template #footer>
    <button class="id-btn id-btn-ghost" @click="dialogStudent=false">ยกเลิก</button>
    <button class="id-btn id-btn-primary" :disabled="!form.firstname || !form.lastname" @click="submitStudent">
      <span class="mdi mdi-content-save"></span> บันทึก</button>
  </template>
</id-modal>
```

---

## ตัวอย่าง B — ฟอร์มเพิ่ม/แก้ไขคอร์ส (ข้อมูลคอร์ส + ชำระเงิน)
> ของจริง: ห่อ `dialogCourse` + ฟอร์มเดิม — ฟิลด์: ชื่อคอร์ส/ประเภท/ระยะเวลา(เดือน)/คงเหลือ/วันเริ่ม/วันหมดอายุ + toggle "1 รอบ/วัน" + ส่วนชำระเงิน (ยังไม่จ่าย/วันที่ชำระ/อัปโหลดสลิป/หมายเหตุ)

```html
<id-modal v-model="dialogCourse" size="lg" icon="mdi-book-plus-multiple-outline"
          :title="isEdit ? 'แก้ไขคอร์ส' : 'คอร์สใหม่'">
  <div class="modal-sec"><span class="mdi mdi-book-open-variant"></span> ข้อมูลคอร์ส</div>
  <div class="t-cap" style="margin-bottom:12px">หมายเลขคอร์ส: <b>{{ form.code || '(สร้างอัตโนมัติ)' }}</b></div>
  <div class="form-grid-3">
    <div class="field"><label>ชื่อคอร์ส <span class="req">*</span></label><select class="id-select" v-model="form.courseName">…</select></div>
    <div class="field"><label>ประเภท</label><select class="id-select" v-model="form.type">…</select></div>
    <div class="field"><label>ระยะเวลา (เดือน)</label><select class="id-select" v-model="form.duration">…</select></div>
  </div>
  <div class="form-grid-3" style="margin-top:14px">
    <div class="field"><label>คงเหลือ (ครั้ง)</label><input class="id-input" v-model="form.remaining"></div>
    <div class="field"><label>วันเริ่มต้น</label><input class="id-input" type="date" v-model="form.start"></div>
    <div class="field"><label>วันหมดอายุ</label><input class="id-input" type="date" v-model="form.end"></div>
  </div>
  <label class="id-cbx" style="margin-top:16px" @click="form.oncePerDay=!form.oncePerDay">
    <span class="idsw" :class="{on:form.oncePerDay}"><span class="track"></span><span class="thumb"></span></span>
    คอร์สเรียนนี้ สามารถเรียนได้ 1 รอบ/วัน
  </label>

  <div class="modal-sec mt"><span class="mdi mdi-cash-multiple"></span> ชำระเงิน</div>
  <div class="form-grid-3" style="align-items:end">
    <label class="id-cbx" style="height:42px" @click="form.unpaid=!form.unpaid">
      <span class="id-check" :class="{on:form.unpaid}"><span class="mdi mdi-check"></span></span> ยังไม่จ่าย
    </label>
    <div class="field"><label>วันที่ชำระ</label><input class="id-input" type="date" v-model="form.payDate" :disabled="form.unpaid"></div>
    <div class="field"><label>สลิปการโอน</label>
      <label class="id-upload"><span class="mdi mdi-camera-outline"></span> {{ form.slip || 'อัปโหลดสลิป' }}<input type="file" accept="image/*" hidden @change="onSlip"></label></div>
  </div>
  <div class="field full" style="margin-top:14px"><label>หมายเหตุ</label><textarea class="id-input id-textarea" v-model="form.note"></textarea></div>

  <template #footer>
    <button class="id-btn id-btn-ghost" @click="dialogCourse=false">ยกเลิก</button>
    <button class="id-btn id-btn-primary" :disabled="!form.courseName" @click="submitCourse">
      <span class="mdi mdi-content-save"></span> บันทึก</button>
  </template>
</id-modal>
```

---

## ตัวอย่าง C — ยืนยันลบ (dialog เล็ก)
```html
<id-modal v-model="dialogDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ">
  <p style="margin:0">ต้องการลบ <b>{{ target.name }}</b> ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้</p>
  <template #footer>
    <button class="id-btn id-btn-ghost" @click="dialogDelete=false">ยกเลิก</button>
    <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="confirmDelete">
      <span class="mdi mdi-delete"></span> ลบ</button>
  </template>
</id-modal>
```

---

## เกณฑ์ "ผ่าน" ต่อ dialog
- [ ] หัวไดอะล็อกเป็นแถบไล่สีชมพู (ไอคอน + ชื่อ + ปุ่ม ×) — ไม่ใช่หัวขาว Vuetify
- [ ] ปุ่ม footer = `ghost ยกเลิก` + `primary บันทึก` ชิดขวา (ไม่มีปุ่มน้ำเงิน/แดง default)
- [ ] หัวข้อ section ใช้ `.modal-sec` (แถบชมพูซ้าย) — ไม่มีเส้นเขียว/น้ำเงิน
- [ ] input/select/textarea/switch/checkbox/อัปโหลด เป็นคลาส `.id-*` ทั้งหมด
- [ ] ปฏิทิน "Enter date" หายไป → ใช้ `input[type=date]`
- [ ] **ฟิลด์ + validation + ปุ่มบันทึก ผูก method/API เดิมครบ** (ไม่แตะ `<script>`)
- [ ] ESC / คลิกฉากหลังปิดได้ · มือถือเด้งเป็น sheet จากล่าง
