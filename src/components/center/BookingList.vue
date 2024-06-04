<template>
  <div class="text-center">
    <v-row>
      <v-col cols="12" sm="12" md="12" xl="12">
          <v-card class="mx-auto">
            <v-list-item class="header-card">
              <v-card-title>Booking class on {{ classdate.toLocaleDateString('en-US', options) }} </v-card-title>
              <v-card-text>การจองคลาส{{ classdate.toLocaleDateString('th-TH', options) }} </v-card-text>
            </v-list-item>
            <v-data-table :loading="loadingBooking" :headers="bookingHeaders" :items="bookingData" class="elevation-1">
              <template v-slot:loading><v-skeleton-loader type="table-row@20"></v-skeleton-loader></template>
              <template v-slot:no-data> No booking class </template>
              <template v-for="(header, index) in bookingHeaders" v-slot:[`item.${header.key}`]="{ item }">
                <p :class="{ 'highlighted-cell': item[header.key]!=null && item[header.key].indexOf('(1)') > -1 }">
                  {{ item[header.key]!=null && item[header.key].indexOf('(1)') > -1 ? item[header.key].replace("(1)","") : item[header.key]}}
                </p>
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
        classdate : {
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
      format_date(value){
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
    fetchDataBooking ({ token, classday, classdate }) {
        return new Promise(resolve => {
            console.log('DashboardAPI : ' + this.baseURL+'/getBookingList' + ' classday : ' + classday + ' classdate : ' + classdate)
            axios
            .post(this.baseURL+'/getBookingList', {
                classday: classday,
                classdate: classdate
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                console.log('fetchDataBooking result',response);
                if (response.data.success) {
                    resolve({ success: true, results: response.data.bookinglist })
                }else{
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

.highlighted-cell {
  color: rgb(70, 200, 70);
}
</style>
  