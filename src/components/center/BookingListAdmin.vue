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
              <div><v-icon class="blue-icon">mdi-circle-slice-8</v-icon> ทดลองเรียน</div>
              <div><v-icon class="pink-icon">mdi-circle-slice-8</v-icon> รายครั้ง</div>
              <div><v-icon class="bell-icon">mdi-bell-ring</v-icon> ต้องชำระเงิน / คอร์สหมด</div>
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
              <td :class="getClass(item[header.key])">

                <label :class="[getClass(item[header.key]), { 'no-hover': !item[header.key] || typeof item[header.key] ==='number' }]"
                name="col-center"
                @click="handleCellClick(item[header.key], header.key)">
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
  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
  },
  methods: {
    handleCellClick(value, key) {
      
      //console.log('Cell clicked [' + key + '] : ' +value);
      if (typeof value === "number") {
          return;
      }
      //console.log("studentid = ", value.studentid);
      this.$emit('student-clicked', value, key);
      // เพิ่ม logic ที่คุณต้องการเมื่อคลิก cell
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