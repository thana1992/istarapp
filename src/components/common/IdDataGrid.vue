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
    perPage      Number initial rows per page (default 10; user can change it
                        via the footer's items-per-page select)
    loading      Boolean show skeleton rows instead of data while a fetch runs
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
      <id-select v-for="f in filters" :key="f.key" class="grid-filter" v-model="fvals[f.key]"
        :placeholder="f.label" :options="[{ value: '', label: f.label }, ...f.options]"
        @update:model-value="page = 1"></id-select>
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
              <th v-for="col in columns" :key="col.key"
                :class="{ 'idt-action': isActionCol(col.key), 'idt-sortable': sortableCol(col), 'idt-sorted': sortKey === col.key }"
                :style="{ textAlign: col.align || 'left' }" @click="toggleSort(col)">
                {{ col.label || col.title }}
                <span v-if="sortKey === col.key" class="mdi idt-sort-ico" :class="sortDir === 'desc' ? 'mdi-arrow-down' : 'mdi-arrow-up'"></span>
              </th>
            </tr>
          </thead>
          <tbody v-if="loading || paging" class="id-fade-in" key="sk">
            <tr v-for="i in skelRows" :key="'sk' + i">
              <td v-for="col in columns" :key="col.key"><div class="id-skel" style="height:18px"></div></td>
            </tr>
          </tbody>
          <tbody v-else class="id-fade-in" :key="page + '-' + filtered.length + '-' + sortKey + sortDir">
            <tr v-for="(row, ri) in paged" :key="ri">
              <td v-for="col in columns" :key="col.key" :class="{ 'idt-action': isActionCol(col.key) }" :style="{ textAlign: col.align || 'left' }">
                <slot :name="'cell-' + col.key" :row="row">{{ row[col.key] }}</slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && !paging && !filtered.length" class="grid-empty"><span class="mdi mdi-magnify-close"></span>ไม่พบข้อมูลที่ค้นหา</div>
      <id-grid-footer v-if="!loading && filtered.length" :page="page" :page-count="pageCount" :per-page="pp" :total="filtered.length"
        @update:page="goPage" @update:per-page="setPerPage" />
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
    perPage: { type: Number, default: 10 },
    loading: { type: Boolean, default: false },
  },
  emits: ['add'],
  data() {
    return { q: '', fvals: {}, page: 1, pp: this.perPage, paging: false, sortKey: '', sortDir: '' };
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
    sorted() {
      if (!this.sortKey || !this.sortDir) return this.filtered;
      const k = this.sortKey;
      const dir = this.sortDir === 'desc' ? -1 : 1;
      // numeric-aware: if BOTH values parse as numbers, compare numerically; else Thai locale string compare.
      return this.filtered.slice().sort((a, b) => {
        const av = a[k], bv = b[k];
        const an = parseFloat(av), bn = parseFloat(bv);
        let c;
        if (!isNaN(an) && !isNaN(bn) && String(av).trim() !== '' && String(bv).trim() !== '') c = an - bn;
        else c = String(av ?? '').localeCompare(String(bv ?? ''), 'th');
        return c * dir;
      });
    },
    pageCount() { return Math.max(1, Math.ceil(this.filtered.length / this.pp)); },
    paged() { const s = (this.page - 1) * this.pp; return this.sorted.slice(s, s + this.pp); },
    skelRows() { return Math.min(this.pp, 8); },
  },
  watch: {
    filtered() { if (this.page > this.pageCount) this.page = 1; },
    perPage(v) { this.pp = v; },
  },
  methods: {
    // client-side grids slice instantly, but to match the server-tables UX every
    // page / per-page change shows the skeleton for the standard ≥1s before the
    // new rows fade in (so "changing page" always reads as a load, not a flash).
    async runPaging() {
      this.paging = true;
      const t0 = Date.now();
      await this.$minLoad(t0);
      this.paging = false;
    },
    goPage(p) { if (p === this.page) return; this.page = p; this.runPaging(); },
    setPerPage(n) { this.pp = n; this.page = 1; this.runPaging(); },
    isActionCol(key) {
      return ['actions', 'action', 'edit', 'delete', 'finish', 'enable', 'view', 'checkin', 'manage', 'approve', 'reject'].includes(key);
    },
    // a column is sortable unless it's an action column or explicitly opts out (sortable:false).
    sortableCol(col) { return col.sortable !== false && !this.isActionCol(col.key); },
    // header click cycles asc → desc → none, resets to page 1.
    toggleSort(col) {
      if (!this.sortableCol(col)) return;
      if (this.sortKey !== col.key) { this.sortKey = col.key; this.sortDir = 'asc'; }
      else if (this.sortDir === 'asc') this.sortDir = 'desc';
      else { this.sortKey = ''; this.sortDir = ''; }
      this.page = 1;
    },
  },
};
</script>
