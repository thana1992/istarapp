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
                :class="[getClass(item[header.key]), { 'no-hover': !item[header.key] }]" 
                style="white-space: normal; padding: 0.75em 0.25em; border-radius: 1.3em 0.5em; min-width: 140px;" 
                name="col-center"
                @click="handleCellClick(item[header.key], header.key)"
              >
                {{
                  typeof item[header.key] === 'object' && item[header.key] !== null
                    ? parseName(item[header.key])
                    : item[header.key]
                }}
                <v-icon v-if="typeof item[header.key] === 'object' && item[header.key] !== null && item[header.key].name.includes('(pay)')" class="bell-icon">mdi-bell-ring</v-icon>
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
  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
  },
  methods: {
    handleCellClick(value, key) {
      
      console.log('Cell clicked [' + key + '] : ' +value);
      if (typeof value === "number") {
          return;
      }
      console.log("studentid = ", value.studentid);
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
    getClass(value) {
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
    classes.push('hover-cell');
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
}

@keyframes swing {
  0% { transform: rotate(15deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}

</style>