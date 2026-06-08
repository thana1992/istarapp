/* iStar — Full Preview app logic (mock data, navigable). Loaded after Vue + Vuetify. */
document.addEventListener('DOMContentLoaded', function () {
  const { createApp } = Vue;
  const vuetify = Vuetify.createVuetify();

  const ROLE = { 0: 'หัวหน้า', 1: 'แอดมิน', 2: 'โค้ช', 10: 'ผู้ปกครอง' };
  const HOME = { 0: 'dashboard', 1: 'dashboard', 2: 'classes', 10: 'home' };
  const TITLES = {
    home: 'หน้าแรก', reserve: 'จองคลาส', classes: 'ตารางเรียน', family: 'ครอบครัวของฉัน', profile: 'โปรไฟล์',
    dashboard: 'แดชบอร์ด', students: 'รายชื่อนักเรียน', booking: 'จัดการการจอง', approve: 'อนุมัตินักเรียนใหม่',
    packages: 'แพ็คเกจคอร์ส', courses: 'คอร์สเรียน', classadmin: 'คลาสเรียน', holiday: 'วันหยุด',
  };
  const KNOWN = Object.keys(TITLES);

  const C = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
  const ci = (n) => { let h = 0; for (let i = 0; i < (n||'').length; i++) h = (h * 31 + n.charCodeAt(i)) % C.length; return C[h]; };

  /* ============================================================
     STANDARD DATA GRID — reusable across every admin list page.
     Same toolbar (search + filters + count + add), table, pagination.
     Props:
       columns     [{ key, label, align }]
       rows        Array
       filters     [{ key, label, options:[{value,label}] }]   (optional)
       searchKeys  [string]  fields the search box matches
       addLabel    string    (optional) shows a primary "เพิ่ม" button
       perPage     number    rows per page (default 8)
     Slots: #cell-<key>="{ row }" for custom cell rendering.
     Emits: add
     ============================================================ */
  const IdGrid = {
    props: {
      columns: { type: Array, required: true },
      rows: { type: Array, default: () => [] },
      filters: { type: Array, default: () => [] },
      searchKeys: { type: Array, default: () => [] },
      searchPlaceholder: { type: String, default: 'ค้นหา...' },
      addLabel: { type: String, default: '' },
      perPage: { type: Number, default: 8 },
    },
    emits: ['add'],
    data() { return { q: '', fvals: {}, page: 1 }; },
    created() { this.filters.forEach(f => { this.fvals[f.key] = ''; }); },
    computed: {
      filtered() {
        let r = this.rows;
        const q = this.q.trim().toLowerCase();
        if (q) r = r.filter(row => this.searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q)));
        this.filters.forEach(f => {
          const v = this.fvals[f.key];
          if (v !== '' && v != null) r = r.filter(row => String(row[f.key]) === String(v));
        });
        return r;
      },
      pageCount() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
      paged() { const s = (this.page - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
      from() { return this.filtered.length ? (this.page - 1) * this.perPage + 1 : 0; },
      to() { return Math.min(this.page * this.perPage, this.filtered.length); },
    },
    watch: { filtered() { if (this.page > this.pageCount) this.page = 1; } },
    template: `
      <div>
        <div class="grid-toolbar">
          <label class="grid-search">
            <span class="mdi mdi-magnify"></span>
            <input class="id-input" v-model="q" :placeholder="searchPlaceholder" @input="page=1" />
          </label>
          <select v-for="f in filters" :key="f.key" class="id-select" v-model="fvals[f.key]" @change="page=1">
            <option value="">{{ f.label }}</option>
            <option v-for="o in f.options" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
          </select>
          <span class="grid-spacer"></span>
          <slot name="actions">
            <button v-if="addLabel" class="id-btn id-btn-primary id-btn-sm" @click="$emit('add')">
              <span class="mdi mdi-plus"></span> {{ addLabel }}
            </button>
          </slot>
        </div>
        <div class="scard" style="padding:14px">
          <div style="overflow-x:auto">
            <table class="idt">
              <thead><tr><th v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">{{ col.label }}</th></tr></thead>
              <tbody>
                <tr v-for="(row,ri) in paged" :key="ri">
                  <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
                    <slot :name="'cell-'+col.key" :row="row">{{ row[col.key] }}</slot>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!filtered.length" class="grid-empty"><span class="mdi mdi-magnify-close"></span>ไม่พบข้อมูลที่ค้นหา</div>
          <div class="grid-foot" v-if="filtered.length">
            <span class="grid-count">แสดง {{ from }}–{{ to }} จาก {{ filtered.length }} รายการ</span>
            <div class="grid-pager" v-if="pageCount > 1">
              <button class="pager-btn" :disabled="page<=1" @click="page--" aria-label="ก่อนหน้า"><span class="mdi mdi-chevron-left"></span></button>
              <span class="pager-now"><b>{{ page }}</b> / {{ pageCount }}</span>
              <button class="pager-btn" :disabled="page>=pageCount" @click="page++" aria-label="ถัดไป"><span class="mdi mdi-chevron-right"></span></button>
            </div>
          </div>
        </div>
      </div>`,
  };

  /* ============================================================
     ID-CALENDAR — full month picker. Pick ANY date freely, but
     disable (un-pickable) every Monday + holidays (from config).
     Props: modelValue(key 'Y-M-D'), holidayKeys[], markKeys[], disableMondays(=true)
     ============================================================ */
  const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const keyOf = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const IdCalendar = {
    props: {
      modelValue: { type: String, default: '' },
      holidayKeys: { type: Array, default: () => [] },
      markKeys: { type: Array, default: () => [] },
      disableMondays: { type: Boolean, default: true },
    },
    emits: ['update:modelValue'],
    data() {
      const init = this.modelValue ? this.parse(this.modelValue) : new Date(2026, 5, 1);
      return { vy: init.getFullYear(), vm: init.getMonth() };
    },
    computed: {
      monthLabel() { return TH_MONTHS[this.vm] + ' ' + (this.vy + 543); },
      todayKey() { return keyOf(new Date(2026, 5, 8)); },
      cells() {
        const offset = new Date(this.vy, this.vm, 1).getDay();
        const days = new Date(this.vy, this.vm + 1, 0).getDate();
        const arr = [];
        for (let i = 0; i < offset; i++) arr.push(null);
        for (let n = 1; n <= days; n++) {
          const d = new Date(this.vy, this.vm, n); const k = keyOf(d);
          arr.push({ n, key: k, mon: d.getDay() === 1, disabled: (this.disableMondays && d.getDay() === 1) || this.holidayKeys.includes(k), today: k === this.todayKey, mark: this.markKeys.includes(k) });
        }
        return arr;
      },
    },
    methods: {
      parse(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
      prev() { if (this.vm === 0) { this.vm = 11; this.vy--; } else this.vm--; },
      next() { if (this.vm === 11) { this.vm = 0; this.vy++; } else this.vm++; },
      pick(c) { if (!c || c.disabled) return; this.$emit('update:modelValue', c.key); },
    },
    template: `
      <div class="idcal">
        <div class="cal-nav"><span class="mdi mdi-chevron-left" @click="prev"></span><span>{{ monthLabel }}</span><span class="mdi mdi-chevron-right" @click="next"></span></div>
        <div class="cal-grid">
          <div v-for="d in ['อา','จ','อ','พ','พฤ','ศ','ส']" :key="d" class="cal-dow">{{ d }}</div>
          <template v-for="(c,i) in cells" :key="i">
            <div v-if="!c" class="cal-cell cal-empty"></div>
            <div v-else class="cal-cell" :class="{ on: c.key===modelValue, disabled: c.disabled, today: c.today }" :title="c.disabled ? (c.mon ? 'วันจันทร์ — ปิดทำการ' : 'วันหยุด — ปิดทำการ') : ''" @click="pick(c)">
              {{ c.n }}<span v-if="c.mark && !c.disabled" class="cal-dot"></span>
            </div>
          </template>
        </div>
        <div class="cal-legend"><span class="cal-legend-x">×</span> วันจันทร์และวันหยุด ปิดให้บริการอัตโนมัติ</div>
      </div>`,
  };

  function rosterCols() {
    return [
      { time: '16:00', course: 'ยิมนาสติก ระดับกลาง', items: [
        { n: 'น้องเฟิร์น', lv: 'Level 2', chk: 1 }, { n: 'น้องเกรซ', lv: 'ทดลองเรียน', trial: 1 },
        { n: 'น้องบีม', lv: 'คอร์สหมดอายุ', pay: 1 }, { n: 'น้องข้าวปุ้น', lv: 'Level 2' } ] },
      { time: '17:00', course: 'ยิมนาสติก เริ่มต้น', items: [
        { n: 'น้องโตโต้', lv: 'Advanced', chk: 1 }, { n: 'น้องพีพี', lv: 'Level 1' }, { n: 'น้องเอม', lv: 'รายครั้ง', session: 1 } ] },
      { time: '18:00', course: 'แอโรบิก', items: [
        { n: 'น้องนาโน', lv: 'Level 3', chk: 1 }, { n: 'น้องริว', lv: 'Level 1' }, { n: 'น้องใบเฟิร์น', lv: 'Level 1' },
        { n: 'น้องมะลิ', lv: 'Level 3' }, { n: 'น้องกัปตัน', lv: 'เหลือ 0 ครั้ง', pay: 1 } ] },
      { time: '19:00', course: 'ตีลังกา', items: [ { n: 'น้องอลิส', lv: 'Level 2' }, { n: 'น้องเจได', lv: 'Level 1' } ] },
    ];
  }

  const app = createApp({
    data() {
      return {
        username: 'demo', password: 'demo1234', loggedIn: false, usertype: 1, drawer: false, collapsed: false, screen: 'dashboard',
        sb: false, sbText: '', knownScreens: KNOWN, selDay: 8, lang: 'th', reserveDate: '', classDate: '', bookDate: '',
        profile: {
          firstName: 'พลอย', lastName: 'ศรีสุข', nick: 'พลอย', phone: '081-234-5678',
          email: 'ploy.s@example.com', gym: 'iStar Gymnastics', photo: '',
        },
        pw: { current: '', next: '', confirm: '' },
        pwShow: { cur: false, next: false, confirm: false },
        dots: [3, 6, 8, 15, 22],
        quick: [
          { label: 'เพิ่มนักเรียน', icon: 'mdi-emoticon-plus-outline', bg: '#fce7f3', fg: '#be185d' },
          { label: 'เพิ่มคอร์ส', icon: 'mdi-cube-outline', bg: '#fef3c7', fg: '#b45309' },
          { label: 'เพิ่มการจอง', icon: 'mdi-calendar-plus-outline', bg: '#dbeafe', fg: '#2563eb' },
          { label: 'เพิ่มวันหยุด', icon: 'mdi-calendar-remove-outline', bg: '#ede9fe', fg: '#7c3aed' },
        ],
        sparks: Array.from({ length: 14 }, (_, i) => ({
          x: [10,26,16,34,8,28,46,60,80,90,70,88,78,92][i], y: [12,28,52,72,86,94,18,8,14,30,44,58,76,88][i],
          sz: 12 + (i % 4) * 5, o: 0.4 + (i % 3) * 0.18, d: ((i * 0.33) % 3).toFixed(2), dur: 2.4 + (i % 4) * 0.5,
        })),
        // customer
        children: [
          { name: 'น้องเฟิร์น', nick: 'ฟ', level: 'Level 2', age: 9, course: 'ยิมนาสติก ระดับกลาง', remaining: 7, total: 12, expire: '30 มิ.ย. 69', status: 'กำลังเรียน' },
          { name: 'น้องพราว', nick: 'พ', level: 'Pre-Level 1', age: 6, course: 'ยิมนาสติก เริ่มต้น', remaining: 1, total: 8, expire: '12 มิ.ย. 69', status: 'ใกล้หมด' },
        ],
        history: [
          { child: 'น้องเฟิร์น', course: 'ยิมนาสติก ระดับกลาง', date: '6 มิ.ย. 69', time: '17:00', status: 'checked' },
          { child: 'น้องเฟิร์น', course: 'ยิมนาสติก ระดับกลาง', date: '4 มิ.ย. 69', time: '17:00', status: 'checked' },
          { child: 'น้องพราว', course: 'ยิมนาสติก เริ่มต้น', date: '3 มิ.ย. 69', time: '16:00', status: 'missed' },
        ],
        slots: [
          { time: '16:00', course: 'ยิมนาสติก ระดับกลาง', max: 6, booked: 4 },
          { time: '17:00', course: 'ยิมนาสติก เริ่มต้น', max: 8, booked: 3 },
          { time: '18:00', course: 'แอโรบิก', max: 8, booked: 5 },
          { time: '19:00', course: 'ตีลังกา', max: 6, booked: 2 },
        ],
        profileRows: [['ชื่อผู้ปกครอง', 'คุณแม่พลอย ศรีสุข'], ['เบอร์โทร', '081-234-5678'], ['ยิม', 'iStar Gymnastics'], ['จำนวนนักเรียน', '2 คน']],
        // admin
        stats: [
          { lbl: 'นักเรียนทั้งหมด', val: '1,305', unit: 'คน', icon: 'mdi-account-group', acc: 'linear-gradient(90deg,#3b82f6,#06b6d4)' },
          { lbl: 'กำลังเรียน', val: '439', unit: 'คน', icon: 'mdi-account-check', acc: 'linear-gradient(90deg,#10b981,#34d399)' },
          { lbl: 'จองวันนี้', val: '71', unit: 'การจอง', icon: 'mdi-calendar-today', acc: 'linear-gradient(90deg,#06b6d4,#0284c7)' },
          { lbl: 'จองพรุ่งนี้', val: '24', unit: 'การจอง', icon: 'mdi-calendar-arrow-right', acc: 'linear-gradient(90deg,#8b5cf6,#6366f1)' },
          { lbl: 'รออนุมัติ', val: '3', unit: 'คน', icon: 'mdi-account-multiple-check', acc: 'linear-gradient(90deg,#f59e0b,#f97316)' },
        ],
        roster: rosterCols(),
        bookingCols: [
          { key: 'name', label: 'ชื่อ' }, { key: 'course', label: 'ชื่อคอร์ส' }, { key: 'time', label: 'เวลา' },
          { key: 'checkin', label: 'เช็คชื่อ', align: 'center' }, { key: 'edit', label: 'แก้ไข', align: 'center' }, { key: 'delete', label: 'ลบ', align: 'center' },
        ],
        bookingRows: [
          { name: 'วสุพล ตรีประสิทธิ์ (ธาม) (ช. 3.7)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'ณวี แจ่มแจ้ง (ฟิวชั่น) (ช. 8.10)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'Nooda Luengthong (นูดา) (ญ. 7)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: true },
          { name: 'Nalin Luengthong (นลิน) (ญ. 8.7)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'Arinrada Posayanukul (ไอลิ) (ญ. 7.1)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: true },
          { name: 'ภัธธริน อรชุนธนโชต (ภราว) (ญ. 8.10)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'ปุณณวิทย์ ศิริเวชวราวุธ (ปุณณ์ปุณณ์) (ช. 3.7)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'ณภัค ด้วงเงิน (อันนา-ณภัค) (ญ. 9.6)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: true },
          { name: 'ปริณดา ศิริเวชวราวุธ (ปั้นปั้น) (ญ. 6.3)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'ดิษย์ธิดา เพิ่มพิพัฒน์สกุล (ออเว่ย์) (ญ. 8)', course: 'Gymnastics Activity', time: '09:00-10:30', chk: false },
          { name: 'กันต์ธีร์ วงศ์สถาพร (กันต์) (ช. 5.2)', course: 'Gymnastics Activity', time: '11:00-12:30', chk: false },
          { name: 'พิมพ์มาดา เรืองศรี (พิม) (ญ. 7.4)', course: 'Gymnastics Activity', time: '11:00-12:30', chk: true },
        ],
        pending: [
          { name: 'น้องข้าวปุ้น', note: 'สมัครคอร์สยิมนาสติก ระดับกลาง · ผู้ปกครอง: คุณวิภา · 6 มิ.ย. 69' },
          { name: 'น้องโฟกัส', note: 'สมัครคอร์สแอโรบิก · ผู้ปกครอง: คุณสมชาย · 6 มิ.ย. 69' },
          { name: 'น้องปริม', note: 'สมัครคอร์สยิมนาสติก เริ่มต้น · ผู้ปกครอง: คุณนภา · 5 มิ.ย. 69' },
        ],
        // ===== STANDARD GRID configs (columns + filters) =====
        studentCols: [
          { key: 'name', label: 'ชื่อ' }, { key: 'nick', label: 'ชื่อเล่น' }, { key: 'gender', label: 'เพศ' },
          { key: 'age', label: 'อายุ', align: 'center' }, { key: 'level', label: 'Level', align: 'center' },
          { key: 'course', label: 'คอร์ส' }, { key: 'remaining', label: 'คงเหลือ', align: 'center' },
          { key: 'expire', label: 'วันหมดอายุ' }, { key: 'phone', label: 'เบอร์โทร', align: 'center' },
          { key: 'actions', label: 'จัดการ', align: 'center' },
        ],
        studentFilters: [
          { key: 'level', label: 'ทุก Level', options: [ { value: 1, label: 'Level 1' }, { value: 2, label: 'Level 2' }, { value: 3, label: 'Level 3' } ] },
          { key: 'course', label: 'ทุกคอร์ส', options: [
            { value: 'ยิมนาสติก ระดับกลาง', label: 'ยิมนาสติก ระดับกลาง' }, { value: 'ยิมนาสติก เริ่มต้น', label: 'ยิมนาสติก เริ่มต้น' },
            { value: 'แอโรบิก', label: 'แอโรบิก' }, { value: 'ตีลังกา', label: 'ตีลังกา' } ] },
        ],
        students: [
          { name: 'น้องเฟิร์น', nick: 'เฟิร์น', gender: 'หญิง', age: '9.2', level: 2, course: 'ยิมนาสติก ระดับกลาง', remaining: 7, expire: '30/06/2026', phone: '081-234-5678' },
          { name: 'น้องพราว', nick: 'พราว', gender: 'หญิง', age: '6.5', level: 1, course: 'ยิมนาสติก เริ่มต้น', remaining: 1, expire: '12/06/2026', phone: '089-111-2233' },
          { name: 'น้องเกรซ', nick: 'เกรซ', gender: 'หญิง', age: '8.0', level: 2, course: 'ยิมนาสติก ระดับกลาง', remaining: 5, expire: '28/06/2026', phone: '086-555-7788' },
          { name: 'น้องบีม', nick: 'บีม', gender: 'ชาย', age: '7.3', level: 1, course: 'ยิมนาสติก ระดับกลาง', remaining: 9, expire: '15/08/2026', phone: '082-333-4455' },
          { name: 'น้องโอ๊ต', nick: 'โอ๊ต', gender: 'ชาย', age: '5.8', level: 1, course: 'แอโรบิก', remaining: 0, expire: 'หมดอายุ', phone: '083-222-6677' },
          { name: 'น้องนาโน', nick: 'นาโน', gender: 'ชาย', age: '10.1', level: 3, course: 'แอโรบิก', remaining: 4, expire: '20/07/2026', phone: '084-777-1212' },
          { name: 'น้องริว', nick: 'ริว', gender: 'ชาย', age: '6.9', level: 1, course: 'แอโรบิก', remaining: 6, expire: '05/09/2026', phone: '085-909-3434' },
          { name: 'น้องมะลิ', nick: 'มะลิ', gender: 'หญิง', age: '9.8', level: 3, course: 'แอโรบิก', remaining: 2, expire: '18/06/2026', phone: '087-121-5656' },
          { name: 'น้องอลิส', nick: 'อลิส', gender: 'หญิง', age: '8.4', level: 2, course: 'ตีลังกา', remaining: 8, expire: '30/08/2026', phone: '088-454-7878' },
          { name: 'น้องเจได', nick: 'เจได', gender: 'ชาย', age: '7.0', level: 1, course: 'ตีลังกา', remaining: 3, expire: '22/07/2026', phone: '081-656-9090' },
          { name: 'น้องโตโต้', nick: 'โตโต้', gender: 'ชาย', age: '11.2', level: 3, course: 'ยิมนาสติก ระดับกลาง', remaining: 10, expire: '12/10/2026', phone: '082-878-2323' },
          { name: 'น้องพีพี', nick: 'พีพี', gender: 'หญิง', age: '6.2', level: 1, course: 'ยิมนาสติก เริ่มต้น', remaining: 1, expire: '14/06/2026', phone: '089-303-4545' },
          { name: 'น้องใบเฟิร์น', nick: 'ใบเฟิร์น', gender: 'หญิง', age: '7.7', level: 1, course: 'แอโรบิก', remaining: 5, expire: '08/09/2026', phone: '086-535-6767' },
          { name: 'น้องกัปตัน', nick: 'กัปตัน', gender: 'ชาย', age: '9.5', level: 2, course: 'แอโรบิก', remaining: 0, expire: 'หมดอายุ', phone: '083-757-8989' },
        ],
        packageCols: [
          { key: 'course', label: 'หมายเลขคอร์ส' }, { key: 'student', label: 'นักเรียน' }, { key: 'name', label: 'คอร์ส' },
          { key: 'remaining', label: 'คงเหลือ', align: 'center' }, { key: 'expire', label: 'วันหมดอายุ' }, { key: 'paid', label: 'ชำระเงิน', align: 'center' },
        ],
        packageFilters: [
          { key: 'name', label: 'ทุกคอร์ส', options: [
            { value: 'ยิมนาสติก ระดับกลาง', label: 'ยิมนาสติก ระดับกลาง' }, { value: 'ยิมนาสติก เริ่มต้น', label: 'ยิมนาสติก เริ่มต้น' }, { value: 'แอโรบิก', label: 'แอโรบิก' } ] },
          { key: 'paid', label: 'ทุกสถานะ', options: [ { value: true, label: 'จ่ายแล้ว' }, { value: false, label: 'ค้างจ่าย' } ] },
        ],
        packages: [
          { course: 'GA-20260515-0001', student: 'น้องเฟิร์น', name: 'ยิมนาสติก ระดับกลาง', remaining: 7, expire: '30/06/2026', paid: true },
          { course: 'GA-20260515-0002', student: 'น้องพราว', name: 'ยิมนาสติก เริ่มต้น', remaining: 1, expire: '12/06/2026', paid: true },
          { course: 'AE-20260601-0007', student: 'น้องนาโน', name: 'แอโรบิก', remaining: 0, expire: 'หมดอายุ', paid: false },
          { course: 'GA-20260518-0011', student: 'น้องเกรซ', name: 'ยิมนาสติก ระดับกลาง', remaining: 5, expire: '28/06/2026', paid: true },
          { course: 'AE-20260520-0014', student: 'น้องมะลิ', name: 'แอโรบิก', remaining: 2, expire: '18/06/2026', paid: false },
          { course: 'GA-20260522-0019', student: 'น้องบีม', name: 'ยิมนาสติก ระดับกลาง', remaining: 9, expire: '15/08/2026', paid: true },
        ],
        courseCols: [
          { key: 'name', label: 'ชื่อคอร์ส' }, { key: 'short', label: 'ชื่อย่อ' }, { key: 'code', label: 'รหัส', align: 'center' },
          { key: 'enable', label: 'เปิดใช้', align: 'center' }, { key: 'actions', label: 'จัดการ', align: 'center' },
        ],
        courseFilters: [
          { key: 'enable', label: 'ทุกสถานะ', options: [ { value: true, label: 'เปิดใช้' }, { value: false, label: 'ปิด' } ] },
        ],
        courses: [
          { name: 'ยิมนาสติก ระดับกลาง', short: 'GYM-I', code: 'GI', enable: true },
          { name: 'ยิมนาสติก เริ่มต้น', short: 'GYM-B', code: 'GB', enable: true },
          { name: 'แอโรบิก', short: 'AERO', code: 'AE', enable: true },
          { name: 'ตีลังกา (Tumbling)', short: 'TUMB', code: 'TB', enable: false },
        ],
        classCols: [
          { key: 'name', label: 'ชื่อคลาส' }, { key: 'day', label: 'วัน' }, { key: 'time', label: 'เวลา' },
          { key: 'course', label: 'คอร์ส' }, { key: 'actions', label: 'จัดการ', align: 'center' },
        ],
        classFilters: [
          { key: 'course', label: 'ทุกคอร์ส', options: [
            { value: 'GYM-I', label: 'GYM-I' }, { value: 'GYM-B', label: 'GYM-B' }, { value: 'AERO', label: 'AERO' }, { value: 'TUMB', label: 'TUMB' } ] },
        ],
        classes: [
          { name: 'ยิมนาสติก ระดับกลาง', day: 'จันทร์–ศุกร์', time: '16:00–17:00', course: 'GYM-I' },
          { name: 'ยิมนาสติก เริ่มต้น', day: 'จันทร์–ศุกร์', time: '17:00–18:00', course: 'GYM-B' },
          { name: 'แอโรบิก', day: 'อังคาร/พฤหัส', time: '18:00–19:00', course: 'AERO' },
          { name: 'ตีลังกา', day: 'เสาร์–อาทิตย์', time: '10:00–11:30', course: 'TUMB' },
        ],
        holidayCols: [
          { key: 'name', label: 'ชื่อวันหยุด' }, { key: 'start', label: 'วันที่เริ่ม' }, { key: 'end', label: 'วันที่สิ้นสุด' },
          { key: 'actions', label: 'จัดการ', align: 'center' },
        ],
        holidayFilters: [],
        holidays: [
          { name: 'วันสงกรานต์', start: '13/04/2026', end: '15/04/2026' },
          { name: 'วันแรงงาน', start: '01/05/2026', end: '01/05/2026' },
          { name: 'ปิดปรับปรุงยิม', start: '20/06/2026', end: '22/06/2026' },
        ],
      };
    },
    created() {
      const first = this.firstSelectableKey();
      this.classDate = first; this.bookDate = first;
    },
    computed: {
      roleLabel() { return ROLE[this.usertype]; },
      holidayKeys() {
        const out = [];
        const dmy = (s) => { const p = s.split('/'); return new Date(+p[2], +p[1] - 1, +p[0]); };
        this.holidays.forEach(h => {
          for (let d = dmy(h.start); d <= dmy(h.end); d.setDate(d.getDate() + 1)) out.push(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate());
        });
        return out;
      },
      reserveDateLabel() { return this.keyToLabel(this.reserveDate, false); },
      classDateLabel() { return this.keyToLabel(this.classDate, true); },
      bookDateLabel() { return this.keyToLabel(this.bookDate, true); },
      bookMarkKeys() { return [9, 10, 12, 16, 18, 23, 25].map(n => '2026-6-' + n); },
      canChangePw() { return this.pw.current.length > 0 && this.pw.next.length >= 8 && this.pw.next === this.pw.confirm; },
      screenTitle() { return TITLES[this.screen] || this.screen; },
      tabItems() { const a = []; this.nav.forEach(g => g.items.forEach(i => a.push(i))); return a; },
      flags() { const u = this.usertype; return { admin: u === 0 || u === 1, head: u === 0, coach: u === 2, customer: u === 10 }; },
      nav() {
        const f = this.flags, g = [];
        if (f.customer) {
          g.push({ label: 'เมนูหลัก', items: [
            { k: 'home', icon: 'mdi-home-account', label: 'หน้าแรก' },
            { k: 'reserve', icon: 'mdi-calendar-plus', label: 'จองคลาส' },
            { k: 'classes', icon: 'mdi-table-eye', label: 'ตารางเรียน' },
            { k: 'family', icon: 'mdi-account-multiple', label: 'ครอบครัว' } ] });
        }
        if (f.coach) g.push({ label: 'ตาราง', items: [{ k: 'classes', icon: 'mdi-table-eye', label: 'ตารางเรียน' }] });
        if (f.admin) {
          g.push({ label: 'ภาพรวม', items: [{ k: 'dashboard', icon: 'mdi-view-dashboard', label: 'แดชบอร์ด' }] });
          g.push({ label: 'จัดการ', items: [
            { k: 'students', icon: 'mdi-account-group', label: 'นักเรียน' },
            { k: 'booking', icon: 'mdi-calendar-edit', label: 'จัดการการจอง' },
            { k: 'approve', icon: 'mdi-account-clock', label: 'อนุมัตินักเรียนใหม่' } ] });
          g.push({ label: 'คอร์ส/ระบบ', items: [
            { k: 'packages', icon: 'mdi-book-account', label: 'แพ็คเกจคอร์ส' },
            { k: 'courses', icon: 'mdi-star-shooting-outline', label: 'คอร์ส' },
            { k: 'classadmin', icon: 'mdi-view-dashboard-variant-outline', label: 'คลาส' },
            { k: 'holiday', icon: 'mdi-calendar-remove', label: 'วันหยุด' } ] });
        }
        g.push({ label: 'บัญชี', items: [{ k: 'profile', icon: 'mdi-account-edit', label: 'โปรไฟล์' }] });
        return g;
      },
    },
    methods: {
      ci,
      login(t) { this.usertype = t; this.loggedIn = true; this.screen = HOME[t]; this.drawer = false; },
      go(k) { this.screen = k; if (window.innerWidth < 900) this.drawer = false; },
      toggleNav() { if (window.innerWidth <= 900) { this.drawer = !this.drawer; } else { this.collapsed = !this.collapsed; } },
      toast(t) { this.sbText = t; this.sb = true; },
      toggleLang() { this.lang = this.lang === 'th' ? 'en' : 'th'; this.toast(this.lang === 'th' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switched to English'); },
      keyToLabel(key, withDow) {
        if (!key) return '';
        const p = key.split('-'); const d = new Date(+p[0], +p[1] - 1, +p[2]);
        const dowsFull = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const mons = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const head = withDow ? ('วัน' + dowsFull[d.getDay()] + 'ที่ ') : '';
        return head + d.getDate() + ' ' + mons[d.getMonth()] + ' ' + (d.getFullYear() + 543);
      },
      firstSelectableKey() {
        const hk = this.holidayKeys; const d = new Date(2026, 5, 8);
        for (let i = 0; i < 90; i++) {
          const k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
          if (d.getDay() !== 1 && !hk.includes(k)) return k;
          d.setDate(d.getDate() + 1);
        }
        return keyOf(new Date(2026, 5, 9));
      },
      onPhoto(e) { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { this.profile.photo = r.result; }; r.readAsDataURL(f); },
      removePhoto() { this.profile.photo = ''; },
      saveProfile() { this.toast('บันทึกข้อมูลโปรไฟล์แล้ว'); },
      changePassword() {
        if (!this.canChangePw) return;
        this.toast('เปลี่ยนรหัสผ่านสำเร็จ');
        this.pw = { current: '', next: '', confirm: '' };
        this.pwShow = { cur: false, next: false, confirm: false };
      },
    },
  });
  app.component('id-grid', IdGrid);
  app.component('id-calendar', IdCalendar);
  app.use(vuetify).mount('#app');
});
