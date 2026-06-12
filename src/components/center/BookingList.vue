<template>
  <div class="id-scope booking-roster scard" style="padding:16px">
    <!-- date band + legend (same look as BookingListAdmin, read-only) -->
    <div class="roster-head">
      <div class="col" style="gap:2px">
        <h3 class="t-h3">{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('th-TH', options) }}</h3>
        <span class="t-cap">{{ classdate.toLocaleDateString('en-GB') }}</span>
      </div>
      <div class="row gap3 wrap" style="font-size:12.5px">
        <span class="row" style="gap:5px"><v-icon size="14" color="#3b82f6">mdi-circle-slice-8</v-icon><span class="muted">{{ $t('bookingList.legendTrial') }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#ec4899">mdi-circle-slice-8</v-icon><span class="muted">{{ $t('bookingList.legendPerSession') }}</span></span>
        <span class="row" style="gap:5px"><v-icon size="14" color="#10b981">mdi-check-circle</v-icon><span class="muted">{{ $t('bookingList.menuCheckedInBadge') }}</span></span>
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
    <div v-else-if="!bookingData || bookingData.length === 0" class="id-empty">
      <div class="mdi mdi-calendar-blank-outline"></div>
      <div style="margin-top:8px">{{ $t('bookingMgmt.noBooking') }}</div>
    </div>

    <!-- roster: one column per time-slot, one read-only pill per student cell (string markers) -->
    <div v-else class="tt-grid-wrap id-fade-in" :key="classdate.getTime()">
      <div class="tt-row">
        <template v-for="(header, index) in bookingHeaders" :key="`booking-col-${index}`">
          <div v-if="header.key !== 'idx'" class="tt-col">
            <div class="tt-colhead">
              <div class="row" style="justify-content:space-between">
                <span class="strong row" style="gap:5px"><v-icon size="15">mdi-clock-outline</v-icon> {{ header.title }}</span>
              </div>
            </div>
            <div class="tt-cell">
              <template v-for="(item, rowIndex) in bookingData" :key="`${header.key}-${rowIndex}`">
                <!-- handle cells that are either a marker string or an object with .name (read-only) -->
                <template v-for="raw in [item[header.key] && typeof item[header.key] === 'object' ? (item[header.key].name || '') : (typeof item[header.key] === 'string' ? item[header.key] : '')]" :key="String(raw) + rowIndex">
                  <div v-if="raw"
                    class="tt-pill readonly"
                    :class="{
                      checked: raw.includes('(1)'),
                      trial: raw.includes('(blue)'),
                      session: raw.includes('(pink)'),
                    }">
                    <template v-for="name in [raw.replace('(1)','').replace('(red)','').replace('(green)','').replace('(blue)','').replace('(yellow)','').replace('(pink)','').replace('(pay)','').trim()]" :key="name">
                      <span class="tt-avatar" style="background:var(--c-primary)">{{ cellSeq(header.key, rowIndex) }}</span>
                      <div class="col" style="gap:0;flex:1;min-width:0">
                        <span class="strong" style="font-size:13.5px;white-space:normal;overflow-wrap:anywhere">{{ name }}</span>
                        <span v-if="item[header.key] && typeof item[header.key] === 'object' && item[header.key].msg" class="t-cap" style="font-size:11px;white-space:normal;overflow-wrap:anywhere">{{ item[header.key].msg }}</span>
                      </div>
                    </template>
                    <div class="row" style="gap:3px">
                      <v-icon v-if="raw.includes('(pay)')" size="15" color="#f59e0b">mdi-bell-ring</v-icon>
                      <v-icon v-if="raw.includes('(1)')" size="16" color="#10b981">mdi-check-circle</v-icon>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      options: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',

      },
    }
  },
  props: {
    classdate: {
      type: Date,
      required: true,
    },
    bookingHeaders: {
      type: Array,
      required: false,
    },
    bookingData: {
      type: Array,
      required: false,
    },
    loadingBooking: {
      type: Boolean,
      required: false,
    }
  },
  watch: {
    //classdate: 'fetchDataBooking',
  },
  mounted() {
    // Fetch the initial booking list when the component is mounted
    //this.fetchDataBooking();
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
  },
  methods: {
    handleCellClick(value, key) {
      console.log('Cell clicked:', value, key);
      // เพิ่ม logic ที่คุณต้องการเมื่อคลิก cell
    },
    SQLDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    format_date(value) {
      if (value) {
        return moment(value).format('DD/MM/YYYY')
      }
    },
    highlightCell() {
      return 'highlighted-cell';
    },
    // ค่าในแต่ละ cell เป็น object (มี .name) หรือ string marker — ดึง raw ออกมา
    rawCellValue(cell) {
      if (cell && typeof cell === 'object') return cell.name || ''
      if (typeof cell === 'string') return cell
      return ''
    },
    // เลขลำดับของ cell ที่มีข้อมูล นับเฉพาะแถวที่ไม่ว่างในคอลัมน์เดียวกัน (เริ่มที่ 1)
    cellSeq(headerKey, rowIndex) {
      let n = 0
      for (let i = 0; i <= rowIndex; i++) {
        const row = this.bookingData[i]
        if (row && this.rawCellValue(row[headerKey])) n++
      }
      return n
    },
  },
};
</script>

<style scoped>
/* customer read-only roster — same look as BookingListAdmin, no actions */
.booking-roster { padding: 4px; }
.roster-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 4px 4px 14px; }
.tt-pill.readonly { cursor: default; }
.tt-pill.readonly:hover { border-color: var(--c-border); box-shadow: none; }
</style>

<style scoped>
/* ============================================================
   iStar NEW DESIGN reskin (single theme) — layered overrides.
   Appended on top of the original styles so layout is preserved
   while colours / radius / shadow / fonts adopt the new design.
   Pulls tokens from the global src/assets/istar-design.css.
   ============================================================ */
:deep(.v-card){ border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm) !important; border: 1px solid var(--c-border) !important; }
:deep(.v-btn){ border-radius: var(--radius-md) !important; text-transform: none !important; letter-spacing: normal !important; font-weight: 700 !important; }
:deep(.v-btn.bg-primary), :deep(.v-btn--variant-elevated){ box-shadow: var(--shadow-sm) !important; }
:deep(.v-field){ border-radius: 14px !important; }
:deep(.v-field--variant-solo-filled){ background: var(--c-surface-2) !important; box-shadow: none !important; }
:deep(.v-toolbar){ background: transparent !important; }
:deep(.v-toolbar-title){ font-family: var(--font-head) !important; font-weight: 800 !important; color: var(--c-text-heading) !important; }
:deep(.v-table){ background: transparent !important; }
:deep(.v-table > .v-table__wrapper > table > thead > tr > th){ background: var(--c-surface-2) !important; color: var(--c-text-heading) !important; font-family: var(--font-head) !important; font-weight: 700 !important; border-bottom: 2px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td){ border-bottom: 1px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover > td){ background: var(--c-surface-3) !important; }
:deep(.v-chip){ font-weight: 600; }
:deep(.v-tab){ text-transform: none !important; font-weight: 700 !important; }
:deep(.v-list){ background: transparent !important; }
:deep(.group-header){ font-family: var(--font-head) !important; font-weight: 700 !important; color: var(--c-text-heading) !important; }
</style>