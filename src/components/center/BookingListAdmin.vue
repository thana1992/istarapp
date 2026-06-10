<template>
  <div class="id-scope booking-roster">
    <!-- date band + legend -->
    <div class="roster-head">
      <div class="col" style="gap:2px">
        <h3 class="t-h3">{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('th-TH', options) }}</h3>
        <span class="t-cap">{{ classdate.toLocaleDateString('en-GB') }}</span>
      </div>
      <!-- legend -->
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

    <!-- roster: one column per time-slot header, one pill per student cell -->
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
                <div v-if="item[header.key] && typeof item[header.key] === 'object' && item[header.key].name"
                  class="tt-pill cell-clickable"
                  :class="{
                    checked: item[header.key].name && item[header.key].name.includes('(1)'),
                    trial: item[header.key].name && item[header.key].name.includes('(blue)'),
                    session: item[header.key].name && item[header.key].name.includes('(pink)'),
                  }"
                  @click="handleCellClick($event, item[header.key], header.key)">
                  <span class="tt-avatar" style="background:var(--c-primary)">
                    {{ (parseName(item[header.key]) || '?').replace('น้อง','').charAt(0) || '?' }}
                  </span>
                  <div class="col" style="gap:0;flex:1;min-width:0">
                    <span class="strong" style="font-size:13.5px;white-space:normal;overflow-wrap:anywhere">{{ parseName(item[header.key]) }}</span>
                    <span v-if="parseWarningText(item[header.key])" class="t-cap" style="font-size:11px;white-space:normal;overflow-wrap:anywhere">{{ parseWarningText(item[header.key]) }}</span>
                  </div>
                  <div class="row" style="gap:3px">
                    <v-icon v-if="item[header.key].name && item[header.key].name.includes('(pay)')" size="15" color="#f59e0b">mdi-bell-ring</v-icon>
                    <v-icon v-if="item[header.key].name && item[header.key].name.includes('(1)')" size="16" color="#10b981">mdi-check-circle</v-icon>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Quick action menu: anchored to the clicked pill -->
    <v-menu
      v-model="menuOpen"
      :target="menuTarget"
      location="bottom start"
      offset="8"
      :close-on-content-click="false"
      :persistent="true"
      transition="scale-transition"
      origin="top left"
    >
      <div class="popmenu quick-menu">
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
    </v-menu>

    <!-- Check-in / Undo check-in confirmation -->
    <id-modal v-model="checkinConfirmDialog" size="sm" persistent
      :icon="isCheckedIn ? 'mdi-undo-variant' : 'mdi-check-circle'"
      :title="isCheckedIn ? $t('bookingList.menuUndoCheckin') : $t('bookingList.menuCheckin')">
      <p style="margin:0">{{ isCheckedIn
        ? $t('bookingMgmt.confirmUndoCheckin', { name: selectedStudentName })
        : $t('bookingMgmt.confirmCheckin', { name: selectedStudentName }) }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="checkinConfirmDialog = false">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" @click="confirmCheckin"><span class="mdi mdi-check"></span> {{ $t('btn.ok') }}</button>
      </template>
    </id-modal>
  </div>
</template>

<script>
import axios from 'axios'
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
      menuOpen: false,
      menuTarget: null,
      checkinConfirmDialog: false,
      selectedStudent: null,
      selectedSlotKey: '',
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
  mounted() {
    document.addEventListener('mousedown', this.onDocumentMousedown, true);
    document.addEventListener('keydown', this.onDocumentKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMousedown, true);
    document.removeEventListener('keydown', this.onDocumentKeydown);
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
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
      if (s.checkedin !== undefined && s.checkedin !== null) {
        return parseInt(s.checkedin) === 1;
      }
      if (typeof s.name === 'string' && s.name.includes('(1)')) return true;
      return false;
    },
  },
  methods: {
    isClickableCell(value) {
      return !!(value && typeof value === 'object');
    },
    onDocumentMousedown(event) {
      if (!this.menuOpen) return;
      const t = event.target;
      if (!t) return;
      if (t.closest && (t.closest('.cell-clickable') || t.closest('.quick-menu'))) return;
      this.menuOpen = false;
    },
    onDocumentKeydown(event) {
      if (event.key === 'Escape' && this.menuOpen) {
        this.menuOpen = false;
      }
    },
    handleCellClick(event, value, key) {
      if (typeof value === "number") return;
      if (!value) return;
      if (typeof value !== 'object') return;

      const td = event.currentTarget;
      const nameLabel = td && td.querySelector
        ? td.querySelector('label[name="col-center"]')
        : null;

      this.selectedStudent = value;
      this.selectedSlotKey = key;
      this.menuTarget = nameLabel || td;
      this.menuOpen = true;
    },
    onChooseEdit() {
      const value = this.selectedStudent;
      const key = this.selectedSlotKey;
      this.menuOpen = false;
      this.$nextTick(() => {
        this.$emit('student-clicked', value, key);
      });
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
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
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
    stripMarkers(name) {
      if (typeof name !== 'string') return '';
      return name
        .replace('(1)', '')
        .replace('(red)', '')
        .replace('(green)', '')
        .replace('(blue)', '')
        .replace('(yellow)', '')
        .replace('(pink)', '')
        .replace('(pay)', '')
        .trim();
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
    parseName(value) {
      //console.log('parseName value :', value);
      if (typeof value === 'object' && value !== null) {
        return value.name
          .replace('(1)', '')
          .replace('(red)', '')
          .replace('(green)', '')
          .replace('(blue)', '')
          .replace('(yellow)', '')
          .replace('(pink)', '')
          .replace('(pay)', '');
      }
      return value;
    },
    parseWarningText(value) {
      //console.log('parseWarningText value :', value);
      if (typeof value === 'object' && value !== null) {
        return value.msg;
      }
      return '';
    },
    getClass(value) {
      //console.log('getClass value :', value);
      const classes = [];
      
      if (typeof value === 'object' && value !== null) {
        const name = value.name;
        classes.push(
          name.includes('(1)') ? 'highlighted-blackground' : '',
          name.includes('(red)') ? 'highlighted-cell-red' : '',
          name.includes('(green)') ? 'highlighted-cell-green' : '',
          name.includes('(blue)') ? 'highlighted-cell-blue' : '',
          name.includes('(yellow)') ? 'highlighted-cell-yellow' : '',
          name.includes('(pink)') ? 'highlighted-cell-pink' : ''
        );
      } else if (value !== null && typeof value === 'number') {
        classes.push('bold-cell');
      }

      if (value !== undefined) {
        if (typeof value === 'number') {
          /* no-op */
        } else {
          classes.push('cell-nickname hover-cell');
        }
      }

      return classes;
    }
  },
};
</script>

<style scoped>
.booking-roster { padding: 4px; }
.roster-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  padding: 4px 4px 14px; }
.booking-roster :deep(.v-overlay__content) { box-shadow: none; }
</style>