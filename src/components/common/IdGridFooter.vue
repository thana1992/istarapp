<!-- ============================================================
  IdGridFooter.vue — the ONE standard footer for every iStar data grid.
  Layout (matches the agreed design): on the left a numbered <id-pager>
  (First « / Prev ‹ / 1 2 3 … / Next › / Last ») plus an items-per-page
  <select>; on the right the range count "X–Y / N".

  Works for BOTH client-side grids (IdDataGrid) and server-side tables
  (CustomerCourse / CustomerCourseFinished / Student). It is presentational:
  it only knows page / pageCount / perPage / total and emits the user's
  request — the parent applies it (and refetches, for server tables).

  Props:
    page          Number  current 1-based page
    pageCount     Number  total page count
    perPage       Number  current rows-per-page
    total         Number  total row count (across all pages)
    perPageOptions Array   selectable page sizes (default [10,20,50,100])
  Emits:
    update:page     requested page
    update:perPage  requested rows-per-page
============================================================ -->
<template>
  <div class="grid-foot" v-if="total > 0">
    <div class="grid-foot-nav">
      <id-pager :page="page" :page-count="pageCount" @update:page="(p) => $emit('update:page', p)" />
      <label class="grid-pp">
        <select class="id-select grid-pp-sel" :value="perPage"
          @change="$emit('update:perPage', Number($event.target.value))">
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <span class="grid-pp-label">{{ $t('grid.perPage') }}</span>
      </label>
    </div>
    <span class="grid-count">{{ $t('grid.range', { from, to, total }) }}</span>
  </div>
</template>

<script>
export default {
  name: 'IdGridFooter',
  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    perPage: { type: Number, required: true },
    total: { type: Number, required: true },
    perPageOptions: { type: Array, default: () => [10, 20, 50, 100] },
  },
  emits: ['update:page', 'update:perPage'],
  computed: {
    from() { return this.total ? (this.page - 1) * this.perPage + 1 : 0; },
    to() { return Math.min(this.page * this.perPage, this.total); },
  },
};
</script>
