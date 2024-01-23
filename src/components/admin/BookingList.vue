<template>
    <div>
        <v-data-table :headers="computedHeaders" :items="formattedData" class="elevation-1">
            <template v-slot:item.checkin="{ item }">
                <v-icon size="large" @click="checkin(item)">mdi-check-bold</v-icon>
            </template>
            <template v-slot:item.delete="{ item }">
                <v-icon size="large" color="error" @click="deleteBookingItem(item)">mdi-delete-forever</v-icon>
            </template>
            <template v-slot:loadingBooking><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
            <template v-slot:no-data> No booking class </template>
        </v-data-table>
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
      }
    },
    props: {
        classdate: {
          type: String,
          required: true,
        },
    },
    watch: {
        classday: 'fetchBookingList',
        classdate: 'fetchBookingList',
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
      text: key,
      value: key,
    }));
  },
  formattedData() {
    // Transform the bookingList object into an array of objects
    const timeSlots = Object.keys(this.bookingList);

    // Use the time slot as a property in each row
    return timeSlots.map((timeSlot) => {
      const row = { timeSlot };

      // Populate each column with data based on the time slot
      this.bookingList[timeSlot].forEach((student, index) => {
        row[`student${index + 1}`] = student;
      });

      return row;
    });
  },
},


    methods: {
        test() {
            console.log("bookinglist = "+JSON.stringify(this.bookingList))
        },
      async fetchDataBooking() {
        // Call the API and set the bookingList object
        const classday = this.classdate.toLocaleDateString('en-US', { weekday: 'long' });
        const classdate = this.SQLDate(this.classdate);
        console.log('fetchDataBooking ' + classday + ' ' + this.SQLDate(this.classdate))
        const token = this.$store.state.token;
        BookingListAPI.fetchDataBooking({ token, classday, classdate })
            .then(({ success, results, message }) => {
                console.log('fetchDataBooking result',success, results, message);
                if(success) {
                    this.headers = Object.keys(results).map((key) => ({ text: key, value: key }));
                    this.bookingList = results
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
  /* Your component-specific styles go here */
  </style>
  