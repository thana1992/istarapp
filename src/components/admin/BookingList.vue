<template>
    <div class="text-center">
      <v-row>
        <v-col cols="12" sm="12" md="12" xl="12">
          <v-card class="mx-auto">
            <v-card-title>Booking class on {{ classdate.toLocaleDateString('en-US', options) }} </v-card-title>
            <v-card-text>การจองคลาส{{ classdate.toLocaleDateString('th-TH', options) }} </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12" xl="12">
          <v-card v-if="loadingBooking" class="mx-auto">
            <v-progress-circular
              :size="70"
              :width="7"
              color="purple"
              indeterminate
              centered
            ></v-progress-circular>
            </v-card>
            <v-card v-else class="mx-auto">
              <v-data-table :headers="computedHeaders" :items="formattedData" class="elevation-1">
                <template v-slot:item.checkin="{ item }">
                    <v-icon size="large" @click="checkin(item)">mdi-check-bold</v-icon>
                </template>
                <template v-slot:item.delete="{ item }">
                    <v-icon size="large" color="error" @click="deleteBookingItem(item)">mdi-delete-forever</v-icon>
                </template>
                <template v-slot:no-data> No booking class </template>
            </v-data-table>
          </v-card>
        </v-col></v-row>
    </div>
  </template>
  
  <script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';

  export default {
    data() {
      return {
        bookingList: {},
        headers: [],
        loadingBooking: false,
        options: {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      }
    },
    props: {
        classdate: {
          type: String,
          required: true,
        },
    },
    watch: {
        classdate: 'fetchDataBooking',
    },
    mounted() {
        // Fetch the initial booking list when the component is mounted
        this.fetchDataBooking();
    },
    computed: {
  ...mapGetters({
    token: 'getToken',
  }),
  computedHeaders() {  // Change the name to avoid conflicts
    // Use the keys of bookingList as headers
    return Object.keys(this.bookingList).map((key) => ({
      title: key,
      key: key,
      align: 'center',
    }));
  },
  formattedData() {
    // Transform the bookingData object into an array of objects
    const timeSlots = Object.keys(this.bookingList);
    console.log('formattedData', timeSlots);
    // Create an array with an empty object for each time slot
    const rows = Array.from({ length: Math.max(...timeSlots.map(slot => this.bookingList[slot].length)) }, () => ({}));

    // Populate each column with data based on the time slot
    timeSlots.forEach((timeSlot) => {
      this.bookingList[timeSlot].forEach((student, index) => {
        rows[index][timeSlot] = student;
        
      });
    });
    
    return rows;
  },
},


    methods: {
      async fetchDataBooking() {
        // Call the API and set the bookingList object
        this.loadingBooking = true
        const classday = this.classdate.toLocaleDateString('en-US', { weekday: 'long' });
        const classdate = this.SQLDate(this.classdate);
        console.log('fetchDataBooking ' + classday + ' ' + this.SQLDate(this.classdate))
        const token = this.$store.state.token;
        BookingListAPI.fetchDataBooking({ token, classday, classdate })
            .then(({ success, results, message }) => {
                console.log('fetchDataBooking result',success, results, message);
                if(success) {
                  if(results) {
                    this.headers = Object.keys(results).map((key) => ({ text: key, value: key }));
                    this.bookingList = results
                  }else{
                    this.bookingList = {}
                    this.headers = []
                  }
                  this.loadingBooking = false
                }else{ 
                    this.$emit('onErrorHandler', message || 'Get Reservation failed')
                    this.loadingBooking = false
                }
            })
            .catch(error => {
                if(error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
      },
      SQLDate(date) {
          return moment(date).format('YYYY-MM-DD')
      },
      format_date(value){
          if (value) {
              return moment(String(value)).format('DD/MM/YYYY')
          }
      },
    },
  };

import { Promise } from 'core-js';
const BookingListAPI = {
    baseURL: 'https://wild-rose-pigeon-tutu.cyclic.app',
    //baseURL: 'http://localhost:3000',
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
  </style>
  