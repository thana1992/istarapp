<template>
  <div class="text-center">
    <v-row>
      <v-col cols="12" sm="12" md="12" xl="12">
        <v-card class="mx-auto">
          <v-list-item class="header-card">
            <v-card-title>Booking class on {{ classdate.toLocaleDateString('en-US', options) }} </v-card-title>
            <v-card-text>การจองคลาส{{ classdate.toLocaleDateString('th-TH', options) }} </v-card-text>
          </v-list-item>
          <v-data-table :loading="loadingBooking" :headers="bookingHeaders" :items="bookingData" items-per-page="20" class="elevation-1">
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@20"></v-skeleton-loader>
            </template>
            <template v-slot:no-data>
              No booking class
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
    style="white-space: normal; padding: 0.75em 0.25em; border-radius: 1.3em 0.5em; min-width: 140px;" name="col-center"
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
        : item[header.key] 
    }}
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

.header-card {
  background-color: #eeeeee;
  color: black;
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

</style>