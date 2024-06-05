<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-table-eye"></span> View Classes</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="12" md="3" xl="3">
                        <v-card class="mx-0" height="450">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker
                                        class="datepick"
                                        v-model="datepick"
                                        @update:model-value="selectDate"
                                    ></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="9" xl="9">
                        <BookingList
                            @onErrorHandler="onError($event)"
                            @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)"
                            @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)"
                            :bookingHeaders="bookingHeaders"
                            :bookingData="bookingList"
                            :classdate="datepick"
                            :loadingBooking="loadingBooking"
                            >
                        </BookingList>
                    </v-col>
                </v-row>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import BookingList from '@/components/center/BookingList.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
export default ({
    components: {
        BookingList,
    },
    data() {
        return {
            fetchData: null,
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval:null,
            datepick: new Date(),
            bookingList: [],
            bookingHeaders: [],
            loadingBooking: false,
            state: 'bookinglist',
        }
    },
    async created() {
        this.datepick = new Date();
        this.$emit('onLoading', true)
        await this.initialize()
        this.$emit('onLoading', false)
    },
    methods: {
        async initialize() {
            await this.getBookingList()
        },
        refreshData() {
            console.log('refreshData : '+new Date())
            if(this.state == "bookinglist") {
                this.getBookingList()
            }
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getBookingList()
        },
        async getBookingList() {
            // Call the API and set the bookingList object
            this.loadingBooking = true
            try {
                    const classdate = this.SQLDate(this.datepick);
                    //console.log("datepick : "+classdate)
                    const classday = new Date(this.datepick).toLocaleDateString('en-US', { weekday: 'long' });
                    //console.log('fetchDataBooking parameters ' + classday + ' ' + this.SQLDate(this.datepick))
                    const token = this.$store.state.token;
                    await DashboardAPI.fetchDataBooking({ token, classday, classdate })
                    .then(({ success, results, message }) => {
                        //console.log('fetchDataBooking result',success, results, message);
                        if(success) {
                            if(results) {
                                //console.log('results', results)
                                this.bookingHeaders = Object.keys(results).map((key) => ({ title: key, key: key, sortable: false, align: 'center'}));
                                this.bookingList = this.formattedData(results)
                                //console.log('bookingList'+ JSON.stringify(this.bookingList))
                                //console.log('bookingHeaders'+ JSON.stringify(this.bookingHeaders))

                            }else{
                                this.bookingHeaders = []
                                this.bookingList = []
                            }
                        }else{ 
                            console.log("message : "+message)
                            this.$emit('onErrorHandler', message || 'Get Bookinglist failed')
                        }
                        if(classdate == this.SQLDate(this.datepick)) {
                            this.loadingBooking = false
                        }
                        
                    })
                    .catch(error => {
                        console.log('error : ', error)
                        this.loadingBooking = false
                        if(error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        }else{
                            this.$emit('onErrorHandler', error.message)
                        }
                    });
                
            }catch(error) {
                console.log('error : ', error)
                this.$emit('onErrorHandler', error.message)
            }
        },
        onError(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onShowInfoDialog(msg) {
            this.infoMsg = msg
            this.infoDialog = true
        },
        onLoading(isLoading) {
            this.$emit('onLoading', isLoading)
        },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        formattedData(results) {
            // Transform the bookingData object into an array of objects
            const timeClass = Object.keys(results);
            // Create an array with an empty object for each time slot
            const rows = Array.from({ length: Math.max(...timeClass.map(slot => results[slot].length)) }, () => ({}));

            // Populate each column with data based on the time slot
            timeClass.forEach((ts) => {
                results[ts].forEach((student, index) => {
                    rows[index][ts] = student;
                });
            });
            
            return rows;
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        })
        
    }
})
import { Promise } from 'core-js';
const DashboardAPI = {
    baseURL: env.SERVER_URL,
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
                //console.log('fetchDataBooking result',response);
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
.font-card {
  font-size: 20px;
  font-weight: bold;
}
button span.mdi,
.dashboard-card span.mdi {
  font-size: 22px;
  margin-right: 5px;
}
.dashboard-card:hover {
  background-color: rgba(187, 187, 187, 0.342);
  cursor: pointer;
}
.header-card {
  background-color: #eeeeee;
  color: black;
}
</style>