<!-- ============================================================
  IdPager.vue — the standard pager for every iStar data grid.
  First / Prev / numbered page buttons (jump to page) / Next / Last,
  with ellipsis windowing for long ranges. Styling comes entirely
  from the global .grid-pager / .pager-* classes in istar-pages.css.

  Works for BOTH client-side grids (IdDataGrid) and server-side
  paginated tables (CustomerCourse, Student, …): it only knows the
  current page + total page count, and emits the requested page.

  Props:
    page       Number  current 1-based page
    pageCount  Number  total number of pages
  Emits:
    update:page  the page the user clicked (parent applies + refetches)
============================================================ -->
<template>
  <div class="grid-pager" v-if="pageCount > 1">
    <button class="pager-btn" :disabled="page <= 1" @click="go(1)" aria-label="หน้าแรก"><span class="mdi mdi-page-first"></span></button>
    <button class="pager-btn" :disabled="page <= 1" @click="go(page - 1)" aria-label="ก่อนหน้า"><span class="mdi mdi-chevron-left"></span></button>
    <template v-for="(p, i) in pageWindow" :key="'pg' + i">
      <span v-if="p === '…'" class="pager-gap">…</span>
      <button v-else class="pager-btn pager-num" :class="{ 'is-active': p === page }" @click="go(p)">{{ p }}</button>
    </template>
    <button class="pager-btn" :disabled="page >= pageCount" @click="go(page + 1)" aria-label="ถัดไป"><span class="mdi mdi-chevron-right"></span></button>
    <button class="pager-btn" :disabled="page >= pageCount" @click="go(pageCount)" aria-label="หน้าสุดท้าย"><span class="mdi mdi-page-last"></span></button>
  </div>
</template>

<script>
export default {
  name: 'IdPager',
  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
  },
  emits: ['update:page'],
  computed: {
    // windowed page numbers with ellipsis sentinels: 1 2 … 4 [5] 6 … 11 12
    pageWindow() {
      const total = this.pageCount, cur = this.page;
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const want = [...new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1])]
        .filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
      const out = [];
      let prev = 0;
      want.forEach((p) => { if (p - prev > 1) out.push('…'); out.push(p); prev = p; });
      return out;
    },
  },
  methods: {
    go(p) {
      const target = Math.max(1, Math.min(this.pageCount, p));
      if (target !== this.page) this.$emit('update:page', target);
    },
  },
};
</script>
