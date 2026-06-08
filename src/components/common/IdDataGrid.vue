<!-- ============================================================
  IdDataGrid.vue — standard data grid for every admin list page
  (นักเรียน / แพ็คเกจคอร์ส / คอร์สเรียน / คลาสเรียน / วันหยุด).
  Faithful SFC port of `IdGrid` from vue-newdesign/full-preview.js.
  Layout comes entirely from the global istar-pages.css classes
  (.grid-toolbar / .idt / .scard / .grid-foot / .pager-*) — no scoped CSS.

  Props:
    columns      Array  [{ key, label, align }]   align: 'left'(default) | 'center'
    rows         Array  the real data array from the page (client-side paginated)
    filters      Array  [{ key, label, options:[{value,label}] }]   (optional)
    searchKeys   Array  [string]  fields the search box matches
    addLabel     String (optional) shows a primary "+ Add" button on the right
    perPage      Number rows per page (default 8)
  Slots:
    #cell-<key>="{ row }"   custom cell rendering (avatar, badge, toggle, actions)
    #actions                custom toolbar buttons on the right (refresh + add, etc.)
  Emits:
    add
============================================================ -->
<template>
  <div>
    <div class="grid-toolbar">
      <label class="grid-search">
        <span class="mdi mdi-magnify"></span>
        <input class="id-input" v-model="q" :placeholder="searchPlaceholder" @input="page = 1" />
      </label>
      <select v-for="f in filters" :key="f.key" class="id-select" v-model="fvals[f.key]" @change="page = 1">
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
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" :class="{ 'idt-action': isActionCol(col.key) }" :style="{ textAlign: col.align || 'left' }">{{ col.label || col.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in paged" :key="ri">
              <td v-for="col in columns" :key="col.key" :class="{ 'idt-action': isActionCol(col.key) }" :style="{ textAlign: col.align || 'left' }">
                <slot :name="'cell-' + col.key" :row="row">{{ row[col.key] }}</slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filtered.length" class="grid-empty"><span class="mdi mdi-magnify-close"></span>ไม่พบข้อมูลที่ค้นหา</div>
      <div class="grid-foot" v-if="filtered.length">
        <span class="grid-count">แสดง {{ from }}–{{ to }} จาก {{ filtered.length }} รายการ</span>
        <div class="grid-pager" v-if="pageCount > 1">
          <button class="pager-btn" :disabled="page <= 1" @click="page--" aria-label="ก่อนหน้า"><span class="mdi mdi-chevron-left"></span></button>
          <span class="pager-now"><b>{{ page }}</b> / {{ pageCount }}</span>
          <button class="pager-btn" :disabled="page >= pageCount" @click="page++" aria-label="ถัดไป"><span class="mdi mdi-chevron-right"></span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdDataGrid',
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
  data() {
    return { q: '', fvals: {}, page: 1 };
  },
  created() {
    this.filters.forEach((f) => { this.fvals[f.key] = ''; });
  },
  computed: {
    filtered() {
      let r = this.rows;
      const q = this.q.trim().toLowerCase();
      if (q) r = r.filter((row) => this.searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
      this.filters.forEach((f) => {
        const v = this.fvals[f.key];
        if (v !== '' && v != null) r = r.filter((row) => String(row[f.key]) === String(v));
      });
      return r;
    },
    pageCount() { return Math.max(1, Math.ceil(this.filtered.length / this.perPage)); },
    paged() { const s = (this.page - 1) * this.perPage; return this.filtered.slice(s, s + this.perPage); },
    from() { return this.filtered.length ? (this.page - 1) * this.perPage + 1 : 0; },
    to() { return Math.min(this.page * this.perPage, this.filtered.length); },
  },
  watch: {
    filtered() { if (this.page > this.pageCount) this.page = 1; },
  },
  methods: {
    isActionCol(key) {
      return ['actions', 'action', 'edit', 'delete', 'finish', 'enable', 'view', 'checkin', 'manage', 'approve', 'reject'].includes(key);
    },
  },
};
</script>
