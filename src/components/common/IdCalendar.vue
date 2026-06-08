<!-- ============================================================
  IdCalendar.vue — full-month date picker used by 3 screens
  (จองคลาส / ตารางเรียน / จัดการการจอง).
  Faithful SFC port of `IdCalendar` from vue-newdesign/full-preview.js,
  using REAL dates (not the prototype's hardcoded 2026).
  Pick ANY date freely, but disable (un-pickable):
    • every Monday (disableMondays, default true) — date.getDay() === 1
    • holiday dates passed via :holiday-keys (key format 'YYYY-M-D')
  Layout comes from global istar-pages.css (.cal-*) — no scoped CSS.

  Props:
    modelValue     String  selected date key 'YYYY-M-D'  (v-model)
    holidayKeys    Array   [string] disabled holiday keys
    markKeys       Array   [string] keys to show a dot under (e.g. days with bookings)
    disableMondays Boolean default true
  Emits: update:modelValue
============================================================ -->
<template>
  <div class="idcal">
    <div class="cal-nav">
      <span class="mdi mdi-chevron-left" @click="prev"></span>
      <span>{{ monthLabel }}</span>
      <span class="mdi mdi-chevron-right" @click="next"></span>
    </div>
    <div class="cal-grid">
      <div v-for="d in dows" :key="d" class="cal-dow">{{ d }}</div>
      <template v-for="(c, i) in cells" :key="i">
        <div v-if="!c" class="cal-cell cal-empty"></div>
        <div
          v-else
          class="cal-cell"
          :class="{ on: c.key === modelValue, disabled: c.disabled, today: c.today }"
          :title="c.disabled ? (c.mon ? 'วันจันทร์ — ปิดทำการ' : 'วันหยุด — ปิดทำการ') : ''"
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
const keyOf = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

export default {
  name: 'IdCalendar',
  props: {
    modelValue: { type: String, default: '' },
    holidayKeys: { type: Array, default: () => [] },
    markKeys: { type: Array, default: () => [] },
    disableMondays: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  data() {
    const init = this.modelValue ? this.parse(this.modelValue) : new Date();
    return { vy: init.getFullYear(), vm: init.getMonth(), dows: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] };
  },
  computed: {
    monthLabel() { return TH_MONTHS[this.vm] + ' ' + (this.vy + 543); },
    todayKey() { return keyOf(new Date()); },
    cells() {
      const offset = new Date(this.vy, this.vm, 1).getDay();
      const days = new Date(this.vy, this.vm + 1, 0).getDate();
      const arr = [];
      for (let i = 0; i < offset; i++) arr.push(null);
      for (let n = 1; n <= days; n++) {
        const d = new Date(this.vy, this.vm, n);
        const k = keyOf(d);
        arr.push({
          n,
          key: k,
          mon: d.getDay() === 1,
          disabled: (this.disableMondays && d.getDay() === 1) || this.holidayKeys.includes(k),
          today: k === this.todayKey,
          mark: this.markKeys.includes(k),
        });
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
</style>
