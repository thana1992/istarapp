<template>
  <div class="text-center">
    <v-row>
      <v-col cols="12" sm="12" md="12" xl="12">
        <div class="booking-admin-wrap">
          <div class="header-card">
            <div class="booking-date-title">{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('en-US', options) }}</div>
            <div class="booking-date-sub">{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('th-TH', options) }}</div>
          </div>
          <div class="header-cell">
            <div class="description-cell">
              <div><v-icon class="blue-icon">mdi-circle-slice-8</v-icon> {{ $t('bookingList.legendTrial') }}</div>
              <div><v-icon class="pink-icon">mdi-circle-slice-8</v-icon> {{ $t('bookingList.legendPerSession') }}</div>
              <div><v-icon class="bell-icon">mdi-bell-ring</v-icon> {{ $t('bookingList.legendPayment') }}</div>
            </div>
          </div>
          <v-data-table :loading="loadingBooking" :headers="bookingHeaders" :items="bookingData" items-per-page="20" class="elevation-1">
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@20"></v-skeleton-loader>
            </template>
            <template v-slot:no-data>
              {{ $t('bookingMgmt.noBooking') }}
            </template>
            <template v-for="(header, index) in bookingHeaders" :key="`booking-col-${index}`" v-slot:[`item.${header.key}`]="{ item }" >
              <td :class="[getClass(item[header.key]), { 'cell-clickable': isClickableCell(item[header.key]) }]"
                @click="handleCellClick($event, item[header.key], header.key)">

                <label :class="[getClass(item[header.key]), { 'no-hover': !item[header.key] || typeof item[header.key] ==='number' }]"
                name="col-center">
                {{
                  typeof item[header.key] === 'object' && item[header.key] !== null
                    ? parseName(item[header.key])
                    : item[header.key]
                }}
                </label>
                <label class="tooltip">
                  <v-icon v-if="typeof item[header.key] === 'object' && item[header.key] !== null && item[header.key].name.includes('(pay)')" class="bell-icon">mdi-bell-ring</v-icon>
                  <v-span class="tooltiptext">
                    {{
                      typeof item[header.key] === 'object' && item[header.key] !== null
                        ? parseWarningText(item[header.key])
                        : item[header.key]
                    }}
                  </v-span>
                </label>
              </td>
            </template>
          </v-data-table>

        </div>
      </v-col>
    </v-row>

    <!-- Quick action menu: anchored to the clicked name -->
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
      <div class="quick-menu" :class="{ 'is-checked': isCheckedIn }">
        <div class="quick-menu__header">
          <span class="quick-menu__name">{{ selectedStudentName || '—' }}</span>
          <span class="quick-menu__status" v-if="isCheckedIn">
            <v-icon size="12">mdi-check-decagram</v-icon>{{ $t('bookingList.menuCheckedInBadge') }}
          </span>
        </div>

        <button class="quick-menu__item quick-menu__item--checkin" @click="onChooseCheckin">
          <span class="quick-menu__dot"></span>
          <v-icon size="18">{{ isCheckedIn ? 'mdi-undo-variant' : 'mdi-check-bold' }}</v-icon>
          <span class="quick-menu__label">{{ isCheckedIn ? $t('bookingList.menuUndoCheckin') : $t('bookingList.menuCheckin') }}</span>
        </button>

        <button class="quick-menu__item quick-menu__item--edit" @click="onChooseEdit">
          <span class="quick-menu__dot"></span>
          <v-icon size="18">mdi-account-edit</v-icon>
          <span class="quick-menu__label">{{ $t('bookingList.menuEdit') }}</span>
        </button>
      </div>
    </v-menu>

    <!-- Check-in / Undo check-in confirmation -->
    <v-dialog v-model="checkinConfirmDialog" persistent width="auto">
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text>
          {{ isCheckedIn
            ? $t('bookingMgmt.confirmUndoCheckin', { name: selectedStudentName })
            : $t('bookingMgmt.confirmCheckin', { name: selectedStudentName }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#4CAF50" variant="tonal" @click="confirmCheckin">{{ $t('btn.ok') }}</v-btn>
          <v-btn color="#F44336" variant="tonal" @click="checkinConfirmDialog = false">{{ $t('btn.cancel') }}</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
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
      options: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',

      },
      classdate: new Date(),
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
        return moment(String(value)).format('DD/MM/YYYY')
      }
    },
    highlightCell(item, header) {
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
          
        } else {
          classes.push('cell-nickname hover-cell');
        }
      }

      return classes;
    }
  },
};

import { Promise } from 'core-js';
const BookingListAPI = {
  baseURL: process.env.SERVER_URL,
  fetchDataBooking({ token, classday, classdate }) {
    return new Promise(resolve => {
      //console.log('DashboardAPI : ' + this.baseURL + '/getBookingList' + ' classday : ' + classday + ' classdate : ' + classdate)
      axios
        .post(this.baseURL + '/getBookingListAdmin', {
          classday: classday,
          classdate: classdate
        },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
        .then(response => {
          //console.log('fetchDataBooking result', response);
          if (response.data.success) {
            resolve({ success: true, results: response.data.bookinglist })
          } else {
            resolve({ success: true, results: [] })
          }
        })
        .catch(error => {
          resolve({ success: false, error: error })
        });
    });
  },
}
</script>

<style scoped>
/* ===== Neumorphic theme integration — blend with parent content-card ===== */
/* Outer wrap — transparent, inherits parent card styling */
.booking-admin-wrap {
  background: transparent;
}

/* Header date band */
.header-card {
  background: linear-gradient(145deg, #eef0f5, #dde2eb);
  color: #334155;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(163, 177, 198, 0.18);
}

.booking-date-title {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.booking-date-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

/* Legend row */
.header-cell {
  background: linear-gradient(180deg, rgba(255,255,255,0.4), rgba(238,240,245,0.3));
  font-weight: bold;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(163, 177, 198, 0.1);
}

:deep(.v-data-table),
:deep(.v-data-table__wrapper),
:deep(.v-table) {
  background: transparent !important;
  box-shadow: none !important;
}

/* RULE: thead tr MUST stay transparent — any background creates a floating "card on card" look */
:deep(.v-table > .v-table__wrapper > table > thead > tr) {
  background: transparent !important;
}

:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  background: transparent !important;
  background-color: transparent !important;
  color: #334155 !important;
  font: bold 13px 'Kodchasan', sans-serif;
  border-bottom: 2px solid rgba(163, 177, 198, 0.4) !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td) {
  background: transparent !important;
}

:deep(.v-data-table-footer) {
  background: transparent !important;
  box-shadow: inset 0 1px 2px rgba(163, 177, 198, 0.1);
}

.v-progress-circular {
  margin: 1rem;
}

.bold-cell {
  font-weight: bold;
  min-width: 10px !important;
}

.highlighted-blackground {
  font-weight: bold;
  background-color: rgb(128, 233, 128);

}

.highlighted-cell-green {
  color: green
}

.highlighted-cell-red {
  color: red;
}

.highlighted-cell-blue {
  color: blue;
}

.highlighted-cell-yellow {
  color: yellow
}

.highlighted-cell-pink {
  color: #eb697f;
}

.cell-nickname {
  white-space: normal;
  padding: 0.75em 0.25em;
  border-radius: 0.25em 0.75em;
  min-width: 150px;
}

.hover-cell {
  transition: background-color 0.5s, color 0.5s;
}

.hover-cell:hover {
  color: red; /* เปลี่ยนสีพื้นหลังให้สว่างขึ้น */
  cursor: pointer; /* เปลี่ยน cursor เมื่อ hover */
}

.no-hover {
  cursor: default; /* ไม่เปลี่ยน cursor เมื่อ hover */
}

/* Whole-cell click target — extends clickable area beyond the name text */
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td.cell-clickable) {
  cursor: pointer;
  transition: background-color 0.18s ease;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td.cell-clickable:hover) {
  background: rgba(99, 102, 241, 0.06) !important;
}

.bell-icon {
  color: gold;
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  padding-left: 5px;
}

.header-cell {
  font-weight: bold;
}

.description-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.description-cell div {
  margin-right: 20px; /* กำหนดระยะห่างระหว่างไอคอน */
}

.description-cell div:last-child {
  margin-right: 0; /* ลบระยะห่างของไอคอนสุดท้าย */
}
.blue-icon {
  color: blue;
}

.pink-icon {
  color: #eb697f;
}

.v-data-table
  /deep/
  tbody
  /deep/
  tr:hover:not(.v-data-table__expanded__content) {
  background: #ffffff !important;
}
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: auto;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  bottom: 100%;
  left: 50%;
  margin-left: -5vw;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  white-space: nowrap;
  padding: 3px 10px;
}

@keyframes swing {
  0% { transform: rotate(15deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}

/* ============================================================
   Quick action dropdown — anchored next to the clicked name
   ============================================================ */
.quick-menu {
  min-width: 200px;
  background: linear-gradient(155deg, #ffffff 0%, #eef2f8 100%);
  border-radius: 14px;
  padding: 6px;
  box-shadow:
    0 14px 36px -10px rgba(15, 23, 42, 0.28),
    0 4px 10px -6px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(163, 177, 198, 0.2);
  color: #1e293b;
  font-family: inherit;
}

.quick-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px 8px;
  border-bottom: 1px dashed rgba(100, 116, 139, 0.22);
  margin-bottom: 4px;
}

.quick-menu__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.quick-menu__status {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #047857;
  background: rgba(16, 185, 129, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

.quick-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.88rem;
  color: #1e293b;
  text-align: left;
  position: relative;
  transition: background 0.15s ease, transform 0.1s ease;
}

.quick-menu__item:hover {
  background: rgba(99, 102, 241, 0.08);
}

.quick-menu__item:active {
  transform: scale(0.98);
}

.quick-menu__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.quick-menu__item--checkin .quick-menu__dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
}

.quick-menu.is-checked .quick-menu__item--checkin .quick-menu__dot {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

.quick-menu__item--checkin :deep(.v-icon),
.quick-menu__item--checkin .v-icon {
  color: #047857;
}

.quick-menu.is-checked .quick-menu__item--checkin :deep(.v-icon),
.quick-menu.is-checked .quick-menu__item--checkin .v-icon {
  color: #b45309;
}

.quick-menu__item--edit .quick-menu__dot {
  background: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.quick-menu__item--edit :deep(.v-icon),
.quick-menu__item--edit .v-icon {
  color: #4338ca;
}

.quick-menu__label {
  font-weight: 600;
  letter-spacing: 0.01em;
}

</style>

<style lang="scss">
  tbody {
     tr:hover {
        background-color: transparent !important;
     }
  }
</style>

<style lang="scss">  
  tbody {
     tr:hover {
        background-color: transparent !important;
     }
  }
</style>