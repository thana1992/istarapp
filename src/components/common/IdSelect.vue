<!-- ============================================================
  IdSelect.vue — themed dropdown (replaces <select>/<v-select>).
  Trigger styled like .id-input; the menu teleports to <body> so it is
  never clipped by a dialog/scroll. With :searchable it becomes a
  type-to-filter combobox (auto-focus, Enter picks the first match) —
  use it for API-backed growing lists (students, parents, course refs).
  Ported from full-preview.js. Popup z-index sits ABOVE IdModal (2500).

  Props:
    modelValue        the selected value (primitive)
    options           [string] OR [{ value, label }]
    placeholder       trigger text when nothing is selected
    disabled          Boolean
    searchable        Boolean — show the filter box
    searchPlaceholder filter box placeholder
  Emits: update:modelValue
============================================================ -->
<template>
  <div class="id-dd" :class="{ open, disabled }">
    <button ref="trig" type="button" class="id-dd-trigger" :class="{ placeholder: selectedLabel === '' }" @click="toggle">
      <span class="id-dd-val">{{ selectedLabel || placeholder }}</span>
      <span class="mdi mdi-chevron-down id-dd-caret"></span>
    </button>
    <teleport to="body">
      <div v-if="open">
        <div class="id-pop-backdrop" @mousedown="close"></div>
        <transition name="dd-pop" appear>
          <div class="id-dd-menu" :class="{ 'has-search': searchable }" :style="pop">
            <div v-if="searchable" class="id-dd-search">
              <span class="mdi mdi-magnify"></span>
              <input ref="search" v-model="q" :placeholder="searchPlaceholder" @keydown.enter.prevent="shown.length && pick(shown[0])" />
            </div>
            <div class="id-dd-list">
              <button v-for="o in shown" :key="String(o.value)" type="button" class="id-dd-opt" :class="{ on: String(o.value) === String(modelValue) }" @click="pick(o)">
                <span>{{ o.label }}</span><span v-if="String(o.value) === String(modelValue)" class="mdi mdi-check"></span>
              </button>
              <div v-if="!shown.length" class="id-dd-empty">ไม่พบรายการ “{{ q }}”</div>
            </div>
          </div>
        </transition>
      </div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: 'IdSelect',
  props: {
    modelValue: { default: '' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '— เลือก —' },
    disabled: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: 'พิมพ์เพื่อค้นหา…' },
  },
  emits: ['update:modelValue'],
  data() { return { open: false, pop: {}, q: '' }; },
  computed: {
    norm() { return this.options.map((o) => (o && typeof o === 'object') ? o : { value: o, label: String(o) }); },
    shown() { const q = this.q.trim().toLowerCase(); return q ? this.norm.filter((o) => o.label.toLowerCase().includes(q)) : this.norm; },
    selectedLabel() { const f = this.norm.find((o) => String(o.value) === String(this.modelValue)); return f ? f.label : ''; },
  },
  methods: {
    toggle() { if (this.disabled) return; this.open ? this.close() : this.openMenu(); },
    close() { this.open = false; this.q = ''; },
    openMenu() {
      const r = this.$refs.trig.getBoundingClientRect();
      const W = r.width, maxH = 280, gap = 6;
      const below = window.innerHeight - r.bottom, above = r.top;
      const listH = Math.min(maxH, this.norm.length * 40 + (this.searchable ? 52 : 12));
      const up = below < listH + gap && above > below;
      this.pop = { position: 'fixed', left: r.left + 'px', width: W + 'px', zIndex: 2600,
        [up ? 'bottom' : 'top']: (up ? (window.innerHeight - r.top + gap) : (r.bottom + gap)) + 'px',
        maxHeight: maxH + 'px' };
      this.open = true;
      if (this.searchable) this.$nextTick(() => { this.$refs.search && this.$refs.search.focus(); });
    },
    pick(o) { this.$emit('update:modelValue', o.value); this.close(); },
  },
};
</script>
