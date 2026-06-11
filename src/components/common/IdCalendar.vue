<!-- ============================================================
  IdCalendar.vue — full-month date picker used by 3 screens
  (จองคลาส / ตารางเรียน / จัดการการจอง).
  Faithful SFC port of `IdCalendar` from vue-newdesign/full-preview.js,
  using REAL dates (not the prototype's hardcoded 2026).
  Pick ANY date freely, but disable (un-pickable):
    • every Monday (disableMondays, default true) — date.getDay() === 1
    • holiday dates passed via :holiday-keys (key format 'YYYY-M-D')
    • any date BEFORE :min-date (optional) — used by customer booking so the
      past AND today can't be booked (pass tomorrow as min-date)
  Layout comes from global istar-pages.css (.cal-*) — no scoped CSS.

  Props:
    modelValue     String  selected date key 'YYYY-M-D'  (v-model)
    holidayKeys    Array   [string] disabled holiday keys
    markKeys       Array   [string] keys to show a dot under (e.g. days with bookings)
    disableMondays Boolean default true
    minDate        Date    optional — dates before this day are disabled (and the
                           calendar can't page back past its month)
  Emits: update:modelValue
============================================================ -->
<template>
  <div class="idcal">
    <div class="cal-nav">
      <span class="mdi mdi-chevron-left" :class="{ 'cal-nav-off': !canPrev }" @click="prev"></span>
      <button type="button" class="cal-nav-label" @click="togglePicker">
        {{ monthLabel }}<span class="mdi" :class="picker ? 'mdi-menu-up' : 'mdi-menu-down'"></span>
      </button>
      <span class="mdi mdi-chevron-right" @click="next"></span>
    </div>
    <!-- quick month/year picker (จิ้มที่ชื่อเดือนเพื่อเลือกเดือน/ปีได้เลย ไม่ต้องกด ‹ › ทีละเดือน) -->
    <div v-if="picker" class="cal-picker">
      <div class="cal-picker-yr">
        <span class="mdi mdi-chevron-left" :class="{ 'cal-nav-off': !canPrevYear }" @click="canPrevYear && pickYear--"></span>
        <span class="cal-picker-yr-lbl">{{ pickYear + 543 }}</span>
        <span class="mdi mdi-chevron-right" @click="pickYear++"></span>
      </div>
      <div class="cal-picker-grid">
        <button v-for="(m, i) in monthsShort" :key="i" type="button" class="cal-mon"
          :class="{ on: i === vm && pickYear === vy, disabled: monthDisabled(i) }"
          :disabled="monthDisabled(i)" @click="chooseMonth(i)">{{ m }}</button>
      </div>
    </div>
    <div class="cal-grid">
      <div v-for="d in dows" :key="d" class="cal-dow">{{ d }}</div>
      <template v-for="(c, i) in cells" :key="i">
        <div v-if="!c" class="cal-cell cal-empty"></div>
        <div
          v-else
          class="cal-cell"
          :class="{ on: c.key === modelValue, disabled: c.disabled, today: c.today }"
          :title="c.disabled ? (c.past ? 'จองได้ตั้งแต่พรุ่งนี้เป็นต้นไป' : c.mon ? 'วันจันทร์ — ปิดทำการ' : 'วันหยุด — ปิดทำการ') : ''"
          @click="pick(c)"
        >
          {{ c.n }}<span v-if="c.mark && !c.disabled" class="cal-dot"></span>
        </div>
      </template>
    </div>
    <div class="cal-legend"><span class="cal-legend-x">×</span> วันจันทร์และวันหยุด ปิดให้บริการอัตโนมัติ</div>
  </div>
</template>

<script>
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const keyOf = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

export default {
  name: 'IdCalendar',
  props: {
    modelValue: { type: String, default: '' },
    holidayKeys: { type: Array, default: () => [] },
    markKeys: { type: Array, default: () => [] },
    disableMondays: { type: Boolean, default: true },
    minDate: { type: Date, default: null },
  },
  emits: ['update:modelValue'],
  data() {
    const init = this.modelValue ? this.parse(this.modelValue) : new Date();
    return {
      vy: init.getFullYear(), vm: init.getMonth(),
      dows: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], monthsShort: TH_MONTHS_SHORT,
      picker: false, pickYear: init.getFullYear(),
    };
  },
  computed: {
    monthLabel() { return TH_MONTHS[this.vm] + ' ' + (this.vy + 543); },
    // lowest selectable year/month from minDate (null = no lower bound)
    minYear() { return this.minTime === null ? null : new Date(this.minTime).getFullYear(); },
    minMonth() { return this.minTime === null ? null : new Date(this.minTime).getMonth(); },
    canPrevYear() { return this.minYear === null || this.pickYear > this.minYear; },
    todayKey() { return keyOf(new Date()); },
    minTime() {
      if (!this.minDate) return null;
      return new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate()).getTime();
    },
    canPrev() {
      if (this.minTime === null) return true;
      const m = new Date(this.minTime);
      return this.vy > m.getFullYear() || (this.vy === m.getFullYear() && this.vm > m.getMonth());
    },
    cells() {
      const offset = new Date(this.vy, this.vm, 1).getDay();
      const days = new Date(this.vy, this.vm + 1, 0).getDate();
      const arr = [];
      for (let i = 0; i < offset; i++) arr.push(null);
      for (let n = 1; n <= days; n++) {
        const d = new Date(this.vy, this.vm, n);
        const k = keyOf(d);
        const past = this.minTime !== null && d.getTime() < this.minTime;
        arr.push({
          n,
          key: k,
          mon: d.getDay() === 1,
          past,
          disabled: (this.disableMondays && d.getDay() === 1) || this.holidayKeys.includes(k) || past,
          today: k === this.todayKey,
          mark: this.markKeys.includes(k),
        });
      }
      return arr;
    },
  },
  methods: {
    parse(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
    prev() { if (!this.canPrev) return; if (this.vm === 0) { this.vm = 11; this.vy--; } else this.vm--; },
    next() { if (this.vm === 11) { this.vm = 0; this.vy++; } else this.vm++; },
    pick(c) { if (!c || c.disabled) return; this.$emit('update:modelValue', c.key); },
    togglePicker() { this.pickYear = this.vy; this.picker = !this.picker; },
    // a month is unreachable when its whole span sits before minDate
    monthDisabled(i) { return this.minYear !== null && (this.pickYear < this.minYear || (this.pickYear === this.minYear && i < this.minMonth)); },
    chooseMonth(i) { if (this.monthDisabled(i)) return; this.vy = this.pickYear; this.vm = i; this.picker = false; },
  },
};
</script>

<style scoped>
/* Cap the calendar width so the aspect-ratio:1 cells stay a comfortable square size
   even when the card is full-width on a single-column layout (otherwise cells balloon).
   The card itself stays full-width; only the calendar grid is centered + capped. */
.idcal {
  max-width: 380px;
  margin: 0 auto;
}
/* prev arrow when the calendar can't page earlier than min-date */
.cal-nav-off { opacity: .28; pointer-events: none; cursor: default; }

/* clickable month/year label that opens the quick picker — text-only affordance
   (no filled chip: on touch screens :hover sticks and looked like a doubled background) */
.cal-nav-label {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 0; cursor: pointer;
  font-family: var(--font-head); font-weight: 700; font-size: inherit; color: inherit;
  padding: 2px 4px; transition: color var(--dur-fast) var(--ease);
}
.cal-nav-label:hover { color: var(--c-primary); }
.cal-nav-label .mdi { font-size: 17px; color: var(--c-primary); }

/* quick month/year picker panel */
.cal-picker {
  margin: 6px auto 4px; padding: 8px;
  background: var(--c-surface-2); border: 1px solid var(--c-border); border-radius: var(--radius);
}
.cal-picker-yr {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  margin-bottom: 8px; font-family: var(--font-head); font-weight: 700; color: var(--c-text-heading);
}
.cal-picker-yr .mdi { cursor: pointer; font-size: 22px; color: var(--c-primary); }
.cal-picker-yr-lbl { min-width: 52px; text-align: center; }
.cal-picker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cal-mon {
  padding: 9px 4px; border: 1px solid var(--c-border); border-radius: var(--radius-sm);
  background: var(--c-surface); color: var(--c-text); font-family: var(--font-body); font-size: 13px;
  cursor: pointer; transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}
.cal-mon:hover:not(.disabled) { border-color: var(--c-primary); color: var(--c-primary); }
.cal-mon.on { background: var(--c-primary); border-color: var(--c-primary); color: #fff; font-weight: 700; }
.cal-mon.disabled { opacity: .35; cursor: default; }
</style>
