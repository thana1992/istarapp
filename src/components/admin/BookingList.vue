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
              <v-data-table :headers="bookingHeaders" :items="bookingData" class="elevation-1">
                <template v-slot:no-data> No booking class </template>
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
      /*
      async fetchDataBooking() {
        // Call the API and set the bookingData object
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
                    this.bookingData = results
                  }else{
                    this.bookingData = {}
                    this.headers = []
                  }
                  this.loadingBooking = false
                }else{ 
                    this.$emit('onErrorHandler', message || 'Get Reservation failed')
                    this.loadingBooking = false
                }
            })
            .catch(error => {
              if(error.response.status){
                if(error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
              }else{
                this.$emit('onErrorHandler', error.message)
              }
            });
      },*/
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
    baseURL: 'https://istarserver.vercel.app',
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
  