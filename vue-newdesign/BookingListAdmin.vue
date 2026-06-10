<!-- ============================================================
  BookingListAdmin.vue — NEW DESIGN (single iStar theme)
  Drop-in replacement for src/components/center/BookingListAdmin.vue
  • TEMPLATE + STYLE = new design (time-grouped roster of student pills,
    click a pill -> quick menu: check-in / undo / edit).
  • SCRIPT = UNCHANGED from the original (same props, emits, API calls):
      props: classdate, bookingHeaders, bookingData, loadingBooking
      emits: student-clicked, onLoading, onUpdateDataSuccess,
             onErrorHandler, onClickChangeState
      check-in:  POST /checkinByAdmin   /  /undoCheckinByAdmin
  • Only NEW bit of script = `columns` computed + small pill helpers that
    pivot the existing bookingData/bookingHeaders into the roster layout.
  Requires: src/assets/istar-design.css imported once globally.
  ============================================================ -->
<template>
  <div class="id-scope booking-roster">
    <!-- date band -->
    <div class="roster-head">
      <div class="col" style="gap:2px">
        <h3 class="t-h3">{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('th-TH', options) }}</h3>
        <span class="t-cap">{{ classdate.toLocaleDateString('en-GB') }} · {{ totalCount }} {{ $t('bookingMgmt.bookings') || 'รายการ' }}</span>
      </div>
      <!-- legend -->
      <div class="row gap3 wrap" style="font-size:12.5px">
        <span class="t-cap strong">{{ $t('bookingList.legend') || 'สัญลักษณ์' }}:</span>
        <span class="row" style="gap:5px"><span class="dot" style="background:var(--c-text-muted)"></span><span class="muted">{{ $t('bookingList.legendNormal') || 'ปกติ' }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#3b82f6">mdi-circle-slice-8</v-icon><span class="muted">{{ $t('bookingList.legendTrial') }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#ec4899">mdi-circle-slice-8</v-icon><span class="muted">{{ $t('bookingList.legendPerSession') }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#10b981">mdi-check-circle</v-icon><span class="muted">{{ $t('bookingList.legendChecked') || 'เช็คอินแล้ว' }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#f59e0b">mdi-bell-ring</v-icon><span class="muted">{{ $t('bookingList.legendPayment') }}</span></span>
      </div>
    </div>

    <!-- loading skeleton -->
    <div v-if="loadingBooking" class="tt-row" style="overflow:hidden">
      <div v-for="i in 4" :key="i" style="min-width:188px;flex:0 0 188px">
        <div class="id-skel" style="height:48px;margin-bottom:6px"></div>
        <div v-for="j in 3" :key="j" class="id-skel" style="height:48px;margin-bottom:6px"></div>
      </div>
    </div>

    <!-- empty -->
    <div v-else-if="columns.length === 0" class="id-empty">
      <div class="mdi mdi-calendar-blank-outline"></div>
      <div style="margin-top:8px">{{ $t('bookingMgmt.noBooking') }}</div>
    </div>

    <!-- roster -->
    <div v-else class="tt-grid-wrap">
      <div class="tt-row">
        <div v-for="col in columns" :key="col.key" class="tt-col">
          <div class="tt-colhead">
            <div class="row" style="justify-content:space-between">
              <span class="strong row" style="gap:5px"><v-icon size="15">mdi-clock-outline</v-icon> {{ col.time }}</span>
              <span class="badge badge-neutral" style="height:20px;font-size:11px">{{ col.items.length }}</span>
            </div>
            <div class="t-cap nowrap" style="overflow:hidden;text-overflow:ellipsis">{{ col.courses }}</div>
            <div v-if="col.checkedN > 0" class="t-cap" style="color:var(--c-success-tx)">
              <v-icon size="12" color="#047857">mdi-check</v-icon> {{ col.checkedN }}/{{ col.items.length }} {{ $t('bookingList.legendChecked') || 'เช็คอินแล้ว' }}
            </div>
          </div>
          <div class="tt-cell">
            <div v-for="(s, i) in col.items" :key="i" class="tt-pill" :class="pillClass(s)" @click="onPillClick($event, s, col.key)">
              <span class="tt-avatar" :style="{ background: avatarColor(s) }">{{ avatarInitial(s) }}</span>
              <div class="col" style="gap:0;flex:1;min-width:0">
                <span class="strong nowrap" style="font-size:13.5px;overflow:hidden;text-overflow:ellipsis">{{ displayName(s) }}</span>
                <span v-if="warningText(s)" class="t-cap nowrap" style="font-size:11px">{{ warningText(s) }}</span>
              </div>
              <div class="row" style="gap:3px">
                <v-icon v-if="needPay(s)" size="15" color="#f59e0b">mdi-bell-ring</v-icon>
                <v-icon v-if="isCellChecked(s)" size="16" color="#10b981">mdi-check-circle</v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- quick action menu (anchored at click point) -->
    <div v-if="menuOpen" class="popmenu" :style="menuStyle" @click.stop>
      <div class="popmenu-head">
        <span class="popmenu-name">{{ selectedStudentName || '—' }}</span>
        <span v-if="isCheckedIn" class="badge badge-success" style="height:20px;font-size:11px">
          <v-icon size="12">mdi-check-decagram</v-icon>{{ $t('bookingList.menuCheckedInBadge') }}
        </span>
      </div>
      <button class="popmenu-item" @click="onChooseCheckin">
        <span class="pm-ico"><v-icon size="18" :color="isCheckedIn ? '#b45309' : '#047857'">{{ isCheckedIn ? 'mdi-undo-variant' : 'mdi-check-bold' }}</v-icon></span>
        {{ isCheckedIn ? $t('bookingList.menuUndoCheckin') : $t('bookingList.menuCheckin') }}
      </button>
      <div class="popmenu-divider"></div>
      <button class="popmenu-item" @click="onChooseEdit">
        <span class="pm-ico"><v-icon size="18" color="#6366f1">mdi-account-edit</v-icon></span>
        {{ $t('bookingList.menuEdit') }}
      </button>
    </div>

    <!-- check-in / undo confirmation -->
    <v-dialog v-model="checkinConfirmDialog" persistent width="auto">
      <div class="id-card id-card-pad" style="max-width:420px">
        <div class="row" style="gap:12px;margin-bottom:14px">
          <v-icon size="34" :color="isCheckedIn ? '#f59e0b' : '#10b981'">{{ isCheckedIn ? 'mdi-undo-variant' : 'mdi-check-circle' }}</v-icon>
          <div class="id-h2">{{ isCheckedIn ? ($t('bookingList.menuUndoCheckin')) : ($t('bookingList.menuCheckin')) }}</div>
        </div>
        <div style="color:var(--c-text-body);margin-bottom:18px">
          {{ isCheckedIn
            ? $t('bookingMgmt.confirmUndoCheckin', { name: selectedStudentName })
            : $t('bookingMgmt.confirmCheckin', { name: selectedStudentName }) }}
        </div>
        <div class="row" style="justify-content:flex-end;gap:8px">
          <button class="id-btn id-btn-ghost id-btn-sm" @click="checkinConfirmDialog = false">{{ $t('btn.cancel') }}</button>
          <button class="id-btn id-btn-primary id-btn-sm" @click="confirmCheckin">{{ $t('btn.ok') }}</button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      options: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      menuOpen: false,
      menuPos: { x: 0, y: 0 },
      checkinConfirmDialog: false,
      selectedStudent: null,
      selectedSlotKey: '',
    }
  },
  props: {
    classdate: { type: Date, required: true },
    bookingHeaders: { type: Array, required: false },
    bookingData: { type: Array, required: false },
    loadingBooking: { type: Boolean, required: false },
  },
  mounted() {
    document.addEventListener('mousedown', this.onDocumentMousedown, true);
    document.addEventListener('keydown', this.onDocumentKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMousedown, true);
    document.removeEventListener('keydown', this.onDocumentKeydown);
  },
  computed: {
    ...mapGetters({ token: 'getToken' }),
    /* NEW: pivot bookingData (rows) + bookingHeaders (time columns) into
       roster columns of student pills — same source data, new layout. */
    columns() {
      const cols = [];
      (this.bookingHeaders || []).forEach(h => {
        if (h.key === 'idx') return;
        const items = [];
        (this.bookingData || []).forEach(row => {
          const v = row[h.key];
          if (v && typeof v === 'object') items.push(v);
        });
        const checkedN = items.filter(s => this.isCellChecked(s)).length;
        cols.push({ key: h.key, time: h.title, items, checkedN, courses: this.courseSummary(items) });
      });
      return cols;
    },
    totalCount() {
      return this.columns.reduce((n, c) => n + c.items.length, 0);
    },
    menuStyle() {
      return { position: 'fixed', left: this.menuPos.x + 'px', top: this.menuPos.y + 'px', zIndex: 'var(--z-menu)' };
    },
    selectedStudentName() {
      const s = this.selectedStudent;
      if (!s) return '';
      if (typeof s === 'string') return this.stripMarkers(s);
      if (typeof s === 'object' && s.name) return this.stripMarkers(s.name);
      return '';
    },
    isCheckedIn() {
      const s = this.selectedStudent;
      if (!s || typeof s !== 'object') return false;
      if (s.checkedin !== undefined && s.checkedin !== null) return parseInt(s.checkedin) === 1;
      if (typeof s.name === 'string' && s.name.includes('(1)')) return true;
      return false;
    },
  },
  methods: {
    /* ---- click a pill -> open quick menu anchored at the cursor ---- */
    onPillClick(event, value, key) {
      if (!value || typeof value !== 'object') return;
      const pad = 8;
      const menuW = 210, menuH = 150;
      let x = event.clientX, y = event.clientY;
      if (x + menuW > window.innerWidth - pad) x = window.innerWidth - menuW - pad;
      if (y + menuH > window.innerHeight - pad) y = window.innerHeight - menuH - pad;
      this.menuPos = { x, y };
      this.selectedStudent = value;
      this.selectedSlotKey = key;
      this.menuOpen = true;
    },
    onDocumentMousedown(event) {
      if (!this.menuOpen) return;
      const t = event.target;
      if (t && t.closest && (t.closest('.popmenu') || t.closest('.tt-pill'))) return;
      this.menuOpen = false;
    },
    onDocumentKeydown(event) {
      if (event.key === 'Escape' && this.menuOpen) this.menuOpen = false;
    },
    onChooseEdit() {
      const value = this.selectedStudent;
      const key = this.selectedSlotKey;
      this.menuOpen = false;
      this.$nextTick(() => { this.$emit('student-clicked', value, key); });
    },
    onChooseCheckin() {
      this.menuOpen = false;
      this.$nextTick(() => { this.checkinConfirmDialog = true; });
    },
    async confirmCheckin() {
      const wasCheckedIn = this.isCheckedIn;
      const endpoint = wasCheckedIn ? '/undoCheckinByAdmin' : '/checkinByAdmin';
      this.checkinConfirmDialog = false;
      this.$emit('onLoading', true);
      try {
        const response = await axios.post(this.baseURL + endpoint, {
          reservationid: this.selectedStudent.reservationid,
          studentid: this.selectedStudent.studentid,
        }, { headers: { Authorization: `Bearer ${this.token}` } });
        if (response.data && response.data.success) {
          this.$emit('onUpdateDataSuccess');
        } else {
          this.$emit('onErrorHandler',
            (response.data && response.data.message) ||
            (wasCheckedIn ? this.$t('bookingList.undoCheckinFail') : this.$t('bookingList.checkinFail')));
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$emit('onErrorHandler', error.response.data.message);
          this.$emit('onClickChangeState', 'login');
        } else {
          this.$emit('onErrorHandler', error.message);
        }
      } finally {
        this.$emit('onLoading', false);
      }
    },
    /* ---- pill display helpers (read the same marker conventions) ---- */
    stripMarkers(name) {
      if (typeof name !== 'string') return '';
      return name.replace('(1)', '').replace('(red)', '').replace('(green)', '')
        .replace('(blue)', '').replace('(yellow)', '').replace('(pink)', '').replace('(pay)', '').trim();
    },
    displayName(s) { return s && typeof s === 'object' ? this.stripMarkers(s.name) : ''; },
    warningText(s) { return s && typeof s === 'object' && s.msg ? s.msg : ''; },
    isCellChecked(s) {
      if (!s || typeof s !== 'object') return false;
      if (s.checkedin !== undefined && s.checkedin !== null) return parseInt(s.checkedin) === 1;
      return typeof s.name === 'string' && s.name.includes('(1)');
    },
    needPay(s) { return s && typeof s === 'object' && typeof s.name === 'string' && s.name.includes('(pay)'); },
    pillClass(s) {
      const c = [];
      if (this.isCellChecked(s)) c.push('checked');
      if (s && typeof s.name === 'string') {
        if (s.name.includes('(blue)')) c.push('trial');
        else if (s.name.includes('(pink)')) c.push('session');
      }
      return c;
    },
    avatarInitial(s) {
      const n = this.displayName(s);
      return n ? n.replace('น้อง', '').charAt(0) : '?';
    },
    avatarColor(s) {
      const palette = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
      const n = this.displayName(s);
      let h = 0; for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % palette.length;
      return palette[h];
    },
    courseSummary(items) {
      const set = [...new Set(items.map(s => (s && s.coursename) || (s && s.courseinfo) || '').filter(Boolean))];
      return set.join(', ');
    },
    SQLDate(date) { return moment(date).format('YYYY-MM-DD') },
  },
};
</script>

<style scoped>
.booking-roster { padding: 4px; }
.roster-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  padding: 4px 4px 14px; }
.booking-roster :deep(.v-overlay__content) { box-shadow: none; }
</style>
