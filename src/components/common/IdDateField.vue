<!-- ============================================================
  IdDateField.vue (<id-date>) — date field that opens the SAME
  IdCalendar as the Dashboard in a popover, so the whole app shares
  one date picker. Replaces <v-date-picker> / <input type=date> /
  the old custom DatePicker.

  Robust value handling (drop-in for fields that store a Date object
  on edit and run through moment()/new Date()):
    • accepts modelValue as '', 'YYYY-MM-DD', 'YYYY-M-D', a Date, or an
      ISO datetime — normalised internally for the calendar + label
    • EMITS a zero-padded 'YYYY-MM-DD' string (valid ISO → safe for
      moment() and new Date())
  Popover teleports to <body> at z-index 2600 (above IdModal's 2500).

  Props: modelValue, placeholder, disableMondays, holidayKeys, mindate, disabled
  Emits: update:modelValue ('YYYY-MM-DD')
============================================================ -->
<template>
  <div class="id-dd" :class="{ open, disabled }">
    <button ref="trig" type="button" class="id-dd-trigger" :class="{ placeholder: !label }" @click="toggle">
      <span class="id-dd-val">{{ label || placeholder }}</span>
      <span class="mdi mdi-calendar-month-outline id-dd-caret" style="font-size:18px"></span>
    </button>
    <teleport to="body">
      <div v-if="open">
        <div class="id-pop-backdrop" @mousedown="open = false"></div>
        <transition name="dd-pop" appear>
          <div class="id-pop" :style="pop">
            <id-calendar :model-value="calKey" :disable-mondays="disableMondays" :holiday-keys="holidayKeys"
              :min-date="minAsDate" @update:model-value="pick"></id-calendar>
          </div>
        </transition>
      </div>
    </teleport>
  </div>
</template>

<script>
const MONS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// any input → non-padded 'Y-M-D' (the key format IdCalendar uses), or ''
function toKey(v) {
  if (!v) return '';
  if (v instanceof Date) return !isNaN(v) ? v.getFullYear() + '-' + (v.getMonth() + 1) + '-' + v.getDate() : '';
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return +m[1] + '-' + +m[2] + '-' + +m[3];
  const d = new Date(s);
  return !isNaN(d) ? d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() : '';
}

export default {
  name: 'IdDateField',
  props: {
    modelValue: { default: '' },
    placeholder: { type: String, default: 'เลือกวันที่' },
    disableMondays: { type: Boolean, default: false },
    holidayKeys: { type: Array, default: () => [] },
    mindate: { default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  data() { return { open: false, pop: {} }; },
  computed: {
    calKey() { return toKey(this.modelValue); },
    label() {
      const k = this.calKey;
      if (!k) return '';
      const p = k.split('-');
      return +p[2] + ' ' + MONS_TH[+p[1] - 1] + ' ' + (+p[0] + 543);
    },
    minAsDate() {
      const k = toKey(this.mindate);
      if (!k) return null;
      const p = k.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]);
    },
  },
  methods: {
    toggle() { if (this.disabled) return; this.open ? (this.open = false) : this.openPop(); },
    openPop() {
      const r = this.$refs.trig.getBoundingClientRect();
      const W = 312, H = 360, gap = 8, vw = window.innerWidth;
      let left = r.left; if (left + W > vw - 8) left = vw - 8 - W; left = Math.max(8, left);
      const up = (r.bottom + gap + H > window.innerHeight - 8) && (r.top - gap - H > 0);
      this.pop = { position: 'fixed', left: left + 'px', width: W + 'px', zIndex: 2600,
        [up ? 'bottom' : 'top']: (up ? (window.innerHeight - r.top + gap) : (r.bottom + gap)) + 'px' };
      this.open = true;
    },
    pick(k) {
      const p = k.split('-');
      const padded = p[0] + '-' + String(+p[1]).padStart(2, '0') + '-' + String(+p[2]).padStart(2, '0');
      this.$emit('update:modelValue', padded);
      this.open = false;
    },
  },
};
</script>
