<!-- ============================================================
  BookingList.vue — NEW DESIGN reskin (single iStar theme)
  Drop-in replacement for src/components/center/BookingList.vue
  • <template> + <script> = UNCHANGED from the original (logic + all API
    calls kept byte-for-byte). A new-design <style scoped> override block
    is appended at the end to adopt the iStar look.
  • Requires global: src/assets/istar-design.css  (+ Vuetify theme primary=#ec4899)
============================================================ -->
<template>
  <div class="text-center">
    <v-row>
      <v-col cols="12" sm="12" md="12" xl="12">
        <v-card class="mx-auto card-opacity">
          <v-list-item class="header-card">
            <v-card-title>{{ $t('bookingList.classBooking') }} {{ classdate.toLocaleDateString('th-TH', options) }}</v-card-title>
          </v-list-item>
          <v-data-table :loading="loadingBooking" :headers="bookingHeaders" :items="bookingData" items-per-page="20" class="elevation-1">
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@20"></v-skeleton-loader>
            </template>
            <template v-slot:no-data>
              {{ $t('bookingMgmt.noBooking') }}
            </template>
            <template v-for="(header, index) in bookingHeaders" v-slot:[`item.${header.key}`]="{ item }" >
  <td 
    :class="[
      typeof item[header.key] === 'string' && item[header.key].includes('(1)') ? 'highlighted-blackground' : '',
      typeof item[header.key] === 'string' && item[header.key].includes('(red)') ? 'highlighted-cell-red' : '',
      typeof item[header.key] === 'string' && item[header.key].includes('(green)') ? 'highlighted-cell-green' : '',
      typeof item[header.key] === 'string' && item[header.key].includes('(blue)') ? 'highlighted-cell-blue' : '',
      typeof item[header.key] === 'string' && item[header.key].includes('(yellow)') ? 'highlighted-cell-yellow' : '',
      typeof item[header.key] === 'string' && item[header.key].includes('(pink)') ? 'highlighted-cell-pink' : '',
      typeof item[header.key] === 'number' ? 'bold-cell' : ''
    ]" 
    style="white-space: normal; 
    padding: 0.75em 0.25em; 
    border-radius: 1.3em 0.5em; 
    min-width: 140px;" 
    name="col-center"
    @click="handleCellClick(item[header.key], header.key)"
  >
    {{ 
      typeof item[header.key] === 'string'
        ? item[header.key]
            .replace('(1)', '')
            .replace('(red)', '')
            .replace('(green)', '')
            .replace('(blue)', '')
            .replace('(yellow)', '')
            .replace('(pink)', '')
            .replace('(pay)', '')
        : item[header.key] 
    }}
    <v-icon v-if="typeof item[header.key] === 'string' && item[header.key].includes('(pay)')" class="bell-icon">mdi-bell-ring</v-icon>
  </td>
</template>
          </v-data-table>

        </v-card>
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
        return moment(String(value)).format('DD/MM/YYYY')
      }
    },
    highlightCell(item, header) {
      return 'highlighted-cell';
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
        .post(this.baseURL + '/getBookingList', {
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

.hover-cell {
  transition: background-color 0.3s;
}

.hover-cell:hover {
  background-color: rgba(0, 0, 0, 0.1); /* เปลี่ยนสีพื้นหลังเมื่อ hover */
}

.bell-icon {
  color: gold;
  animation: swing 2s ease-in-out infinite;
  transform-origin: top center;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
}

@keyframes swing {
  0% { transform: rotate(15deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}

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
