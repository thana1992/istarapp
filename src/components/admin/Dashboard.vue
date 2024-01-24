<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-view-dashboard"></span> Dashboard</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="onClickCardTotalStudent" >
                            <v-list-item class="header-card" min-height="60">
                                <div>Total <br>Students</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1"><p class="font-card"><vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalStudents' :duration='5'  separator=',' :autoinit='true' /></p></v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-face-man-shimmer"></span>
                                <span class="mdi mdi-face-woman-shimmer"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="onClickCardToday" >
                            <v-list-item class="header-card" height="60">
                                <div>Today's booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1"><p class="font-card"><vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingToday' :duration='1.5'  separator=',' :autoinit='true' /></p></v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="oncClickCardTomorrow">
                            <v-list-item class="header-card" height="60">
                                <div>Tomorrow's booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card" >
                                <v-list-item-title class="headline mb-1"><p class="font-card"><vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingTomorrow' :duration='1.5'  separator=',' :autoinit='true' /></p></v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card :class="pulse" link @click="onClickCardNewStudent">
                            <v-list-item class="header-card" height="60">
                                <div>Approve New Students <span class=""></span></div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1"><p class="font-card"><vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalWaitingNewStudents' :duration='1'  separator=',' :autoinit='true' /></p></v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link>
                            <v-list-item class="header-card" height="60">
                                <div>Approve Cancel booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1"><p class="font-card"><vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalWaitCancelBooking' :duration='1'  separator=',' :autoinit='true' /></p></v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="12" md="5" xl="3">
                        <v-card class="mx-0" height="400">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker
                                        v-model="datepick"
                                        @click="selectDate"
                                    ></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="7" xl="9">
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0" v-if="state=='studentlist'">
                                <Student
                                    @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)"
                                    @onUpdateDataSuccess="refreshData"
                                    >
                                </Student>
                            </v-card>
                            <v-card v-else-if="state=='approvenewstudent'">
                                <ApproveNewStudent
                                    @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)"
                                    @onUpdateDataSuccess="refreshData"
                                    >
                                </ApproveNewStudent>
                            </v-card>
                            <v-card v-else-if="state=='bookinglist'">
                                <BookingList
                                    @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)"
                                    @onUpdateDataSuccess="refreshData"
                                    :bookingHeaders="bookingHeaders"
                                    :bookingData="bookingList"
                                    :classdate="datepick"
                                    :loadingBooking="loadingBooking"
                                    >
                                </BookingList>
                            </v-card>
                        </Transition>
                    </v-col>
                </v-row>
            </div>
        </div>
    </div>
    <v-dialog width="500" v-model="errorDialog">
        <template v-slot:default="{ isActive }">
        <v-card title="ผิดพลาด!!" color="#F44336">
            <v-card-text>
            {{ errorMsg }}
            </v-card-text>
            <v-card-actions>
            <v-btn color="primary" variant="tonal" block @click="errorDialog = false">ปิด</v-btn>
            </v-card-actions>
        </v-card>
        </template>
    </v-dialog>

    <v-dialog width="500" v-model="infoDialog">
        <template v-slot:default="{ isActive }">
        <v-card title="สำเร็จ!!" color="#98FB98">
            <v-card-text>
            {{ infoMsg }}
            </v-card-text>
            <v-card-actions>
            <v-btn color="primary" variant="tonal" block @click="infoDialog = false">โอเค</v-btn>
            </v-card-actions>
        </v-card>
        </template>
    </v-dialog>
    <!-- <vue3-autocounter ref='counter' :startAmount='0' :endAmount='3' :duration='1' prefix='$' suffix='USD' separator=',' :autoinit='true' /> -->
    
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from './Student.vue'
import BookingList from './BookingList.vue'
import ApproveNewStudent from './ApproveNewStudent.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
import Vue3autocounter from 'vue3-autocounter';
export default ({
    components: {
        DatePicker,
        Student,
        BookingList,
        ApproveNewStudent,
        'vue3-autocounter': Vue3autocounter
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
            totalStudents: 0,
            totalBookingToday: 0,
            totalBookingTomorrow: 0,
            totalWaitingNewStudents: 0,
            totalWaitCancelBooking: 0,
            pulse: '',

            bookingList: [],
            bookingHeaders: [],
            loadingBooking: false,

            state: 'bookinglist',
            notNullRules: [ v => !!v || 'This field is required', ]
        }
    },
    
    async created() {
        this.datepick = new Date();
        try {
            const token = this.$store.getters.getToken;
            console.log('token ', token)
            if (!token) {
                this.errorMsg = 'Not found token, Please login...'
                this.errorDialog = true
                this.$emit('onClickChangeState', 'login')
                return;
            }

            await axios
            .post(this.baseURL+'/verifyToken', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.initialize()
                }
            })
            .catch(error => {
                console.error(error);
                this.$emit('onErrorHandler', error.response.data.message)
                this.$emit('onClickChangeState', 'login')
            });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }
    },
    mounted() {
        console.log('dashboard mounted...'+new Date())
        this.interval = setInterval(() =>{
        this.refreshData() }, 60000)
    },
    unmounted() {
        console.log('dashboard unmounted...'+new Date())
        clearInterval(this.interval)
    },
    methods: {
        initialize() {
            /*
            axios.get(this.baseURL+'/checkToken', {})
            .then(response => {
                console.dir(response);
                if (response.data) {
                    const activeSessions = response.data.activeSessions
                    activeSessions.forEach(item => {
                        let iat = new Date(item.iat * 1000)
                        let exp = new Date(item.exp * 1000)
                        console.log(item.username + " : " + iat.toLocaleString() + " : " + exp.toLocaleString())
                    });
                }
            })
            */
            this.refreshCardDashboard()
            this.getBookingList()
            this.getCourseLookup()
            this.getFamilyLookup()
        },
        refreshData() {
            console.log('refreshData...'+new Date())
            this.refreshCardDashboard()
            if(this.state == "bookinglist") {
                this.getBookingList()
            }
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getBookingList()
        },
        refreshCardDashboard() {
            const token = this.$store.getters.getToken;
            console.log('refreshCardDashboard...'+new Date())
            console.log('today : ' + this.SQLDate(this.today))
            console.log('tomorrow : ' + this.SQLDate(this.tomorrow))
            console.log('token : ' + token)
            axios
            .post(this.baseURL+'/refreshCardDashboard', {
                today: this.SQLDate(this.today),
                tomorrow: this.SQLDate(this.tomorrow),
            },{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.totalStudents = response.data.datacard.totalStudents
                    this.totalBookingToday = response.data.datacard.totalBookingToday
                    this.totalBookingTomorrow = response.data.datacard.totalBookingTomorrow
                    this.totalWaitingNewStudents = response.data.datacard.totalWaitingNewStudents
                    if (this.totalWaitingNewStudents > 0) {
                        this.pulse = 'pulse'
                    }else{
                        this.pulse = ''
                    }
                    this.totalWaitCancelBooking = response.data.datacard.totalWaitCancelBooking
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
        getApproveNewStudents() {
            axios
            .get(this.baseURL+'/getApproveNewStudents', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
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
        getApproveCancelBookingClass() {
            axios
            .get(this.baseURL+'/getApproveCancelBookingClass', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
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
        getCourseLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/courseLookup', { 
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courseLookup = response.data.results
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
        getFamilyLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/familyLookup', { headers:{ Authorization: `Bearer ${token}`, } })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.familyLookup = response.data.results
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
        onClickCardTotalStudent () {
            this.state = 'studentlist'
            this.refreshData()
        },
        onClickCardToday() {
            this.datepick = new Date()
            this.selectDate()
            this.refreshData()
        },
        oncClickCardTomorrow() {
            this.datepick = this.addOneDay(new Date())
            this.selectDate()
            this.refreshData()
        },
        onClickCardNewStudent () {
            this.state = 'approvenewstudent'
            this.refreshData();
        },
        addOneDay(date = new Date()) {
            date.setDate(date.getDate() + 1);
            return date;
        },
        async getBookingList() {
            // Call the API and set the bookingList object
            this.loadingBooking = true
            try {
                
                    const classdate = this.SQLDate(this.datepick);
                    console.log("datepick : "+classdate)
                    const classday = new Date(this.datepick).toLocaleDateString('en-US', { weekday: 'long' });
                    console.log('fetchDataBooking parameters ' + classday + ' ' + this.SQLDate(this.datepick))
                    const token = this.$store.state.token;
                    DashboardAPI.fetchDataBooking({ token, classday, classdate })
                    .then(({ success, results, message }) => {
                        //console.log('fetchDataBooking result',success, results, message);
                        if(success) {
                            if(results) {
                                console.log('results', results)
                                this.bookingHeaders = Object.keys(results).map((key) => ({ title: key, key: key, sortable: false }));
                                this.bookingList = this.formattedData(results)
                                //console.log('bookingList'+ JSON.stringify(this.bookingList))
                                //console.log('bookingHeaders'+ JSON.stringify(this.bookingHeaders))

                            }else{
                                this.bookingHeaders = []
                                this.bookingList = []
                            }
                        }else{ 
                            this.$emit('onErrorHandler', message || 'Get Reservation failed')
                        }
                        this.loadingBooking = false
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
        onClickChangeState(state) {
            this.state = state
            this.$emit('onClickChangeState', state)
        },
        calculateAge(birthDate) {
          if (!birthDate) return;

          const currentDate = new Date();
          if (new Date(birthDate) > currentDate) {
              this.birthDate = null
              this.years = null;
              this.months = null;
              this.days = null;
              alert('Invalid Date of Birth')
          }

          const diffTime = currentDate - new Date(birthDate);
          const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          let years = Math.floor(totalDays / 365.25);
          let months = Math.floor((totalDays % 365.25) / 30.4375);
          let days = Math.floor((totalDays % 365.25) % 30.4375);
          return years + ' ปี ' + months + ' เดือน '

        },
        onError(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onShowInfoDialog(msg) {
            this.infoMsg = msg
            this.infoDialog = true
        },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        format_date(value){
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
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
    watch: {
        dialogBooking (val) {
          val || this.closeBooking()
        },
        dialogBookingDelete (val) {
            val || this.clickCancelDeleteBooking()
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        tomorrow() {
            const d = new Date()
            d.setDate(d.getDate() +1)
            return d 
        },
        today() {
            return new Date()
        },
        
    }
})
import { Promise } from 'core-js';
const DashboardAPI = {
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pulse {
  cursor: pointer;
  /*box-shadow: 0 0 0 rgba(204,169,44, 0.4);*/
  box-shadow:  0px 2px 1px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12));
  animation: pulse 2s infinite;
}
.pulse:hover {
  animation: none;
}

@-webkit-keyframes pulse {
  0% {
    -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
  }
  70% {
      -webkit-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
  }
  100% {
      -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
    box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
  }
  70% {
      -moz-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
      box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
  }
  100% {
      -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
      box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204,169,44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204,169,44, 0.12));
  }
}
</style>