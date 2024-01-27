<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-calendar-edit"></span> Booking Management</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="12" md="3" xl="3">
                        <v-card class="mx-0" height="400">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker
                                        v-model="date"
                                        @click="selectDate"
                                    ></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="9" xl="9">
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0" v-if="state=='bookinglist'" min-height="400">
                                <v-data-table
                                    fixed-header
                                    height="580"
                                    :loading="loadingBooking"
                                    loading-text="Loading... Please wait"
                                    :headers="BookingListHeaders"
                                    :items="BookingList"
                                    :sort-by="[{ key: 'classtime', order: 'asc' }]"
                                    >
                                    <template v-slot:top>
                                        <v-toolbar flat>
                                            <v-toolbar-title>All class bookings today</v-toolbar-title>
                                            <v-dialog v-model="dialogBooking" max-width="800px">
                                                <template v-slot:activator="{ props }">
                                                    <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-emoticon-plus-outline"></span> New Booking</v-btn>
                                                </template>
                                                <v-card>
                                                    <v-card-title>
                                                        <span v-if="editedBookingIndex==-1" class="mdi mdi-emoticon-plus-outline"></span>
                                                        <span v-if="editedBookingIndex!=-1" class="mdi mdi-human-edit"></span>
                                                        <span>{{ formBookingTitle }}</span>
                                                    </v-card-title>
                                                    <v-card-text>
                                                        <v-container>
                                                            <v-form ref="newstdform">
                                                                <v-row>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select
                                                                            v-model="editedBookingItem.courseid"
                                                                            label="Name"
                                                                            item-title="fullname"
                                                                            item-value="childid"
                                                                            :items="studentLookup"
                                                                            variant="solo-filled"
                                                                            no-data-text="No student data"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select
                                                                            v-model="editedBookingItem.courseid"
                                                                            label="Course Name"
                                                                            item-title="coursename"
                                                                            item-value="courseid"
                                                                            :items="courseLookup"
                                                                            variant="solo-filled"
                                                                            no-data-text="No course data"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <DatePicker 
                                                                        label="Class date"
                                                                        v-model="selectedDate"
                                                                        variant="solo-filled"
                                                                        ></DatePicker>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-select
                                                                            v-model="editedBookingItem.classtime"
                                                                            label="Class time"
                                                                            item-title="classtime"
                                                                            item-value="classid"
                                                                            :items="classtimesData"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            no-data-text="No class data"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-form>
                                                        </v-container>
                                                    </v-card-text>
                                        
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn
                                                        color="blue-darken-1"
                                                        variant="text"
                                                        @click="closeBooking"
                                                        >
                                                        Cancel
                                                        </v-btn>
                                                        <v-btn
                                                        color="blue-darken-1"
                                                        variant="text"
                                                        @click="doSaveNewBooking"
                                                        >
                                                        Save
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogBookingDelete" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>ต้องการลบการจองนี้ ?</v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteBooking">ใช่! ลบเลย</v-btn>
                                                    <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteBooking">ไม่ลบละ เปลี่ยนใจ</v-btn>
                                                    
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                        </v-toolbar>
                                    </template>
                                    <template v-slot:item.edit="{ item }">
                                        <v-icon size="large" color="info" @click="clickEditBooking(item)">mdi-pencil</v-icon>
                                    </template>
                                    <template v-slot:item.checkin="{ item }">
                                        <v-icon size="large" @click="checkin(item)">mdi-check-bold</v-icon>
                                    </template>
                                    <template v-slot:item.delete="{ item }">
                                        <v-icon size="large" color="error" @click="deleteBookingItem(item)">mdi-delete-forever</v-icon>
                                    </template>
                                    <template v-slot:loading><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
                                    <template v-slot:no-data> No booking class </template>
                                </v-data-table>
                            </v-card>

                            <v-card class="mx-0" v-else-if="state=='studentlist'">
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
                            <v-card v-else-if="state=='bookinglist2'">
                                <BookingList
                                    @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)"
                                    @onUpdateDataSuccess="refreshData"
                                    :classdate="date"
                                    >
                                </BookingList>
                            </v-card>
                        </Transition>
                    </v-col>
                </v-row>
                <v-row>
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
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval:null,
            date: new Date(),
            classday: '',
            pulse: '',
            classtimesData: [],

            BookingList: [],
            BookingListHeaders: [
            { title: 'Name', key: 'fullname' },
            { title: 'Course', key: 'coursename' },
            { title: 'Class Time', key: 'classtime' },
            { title: 'Check-in', key: 'checkin', align: 'center', sortable: false },
            { title: 'Edit', key: 'edit', align: 'center', sortable: false },
            { title: 'Delete', key: 'delete', align: 'center', sortable: false },
            ],
            editedBookingItem: {
                reservationid: null,
                childid: null,
                fullname: null,
                coursename: null,
                courseid: null,
                classdate: null,
                classtime: null,
            },
            defaultBookingItem: {
                reservationid: null,
                childid: null,
                fullname: null,
                coursename: null,
                courseid: null,
                classdate: null,
                classtime: null,
            },
            selectedDate: null,
            editedBookingIndex: -1,
            dialogBooking: false,
            dialogBookingDelete: false,
            loadingBooking: false,
            state: 'bookinglist',
            
            notNullRules: [ v => !!v || 'This field is required', ]
        }
    },
    
    async created() {
        console.log('created...'+new Date())
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
        console.log('mounted...'+new Date())
        this.interval = setInterval(() =>{
        this.refreshData() }, 60000)
    },
    unmounted() {
        console.log('unmounted...'+new Date())
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
            this.getReservationList()
            this.getCourseLookup()
            this.getFamilyLookup()
        },
        refreshData() {
            console.log('refreshData...'+new Date())
            this.getReservationList()
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getReservationList()
        },
        getClassTime() {
            let req = {
                classdate: this.SQLDate(this.date),
                classday: new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' }),
                courseid: this.editedBookingItem.courseid
            }
            console.log("request", req)
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL+'/getClassTime', req, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    const data = response.data.results
                    if(data.length == 0) {
                        this.classtimesData = []
                    }else{
                        this.classtimesData = data;
                    }
                } else {
                    this.classtimesData = []
                }
            })
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
        getStudentLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/studentLookup', { headers:{ Authorization: `Bearer ${token}`, } })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.studentLookup = response.data.results
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
        
        editBookingItem (item) {
          this.editedBookingIndex = this.BookingList.indexOf(item)
          this.editedBookingItem = Object.assign({}, item)
          this.dialogBooking = true
        },
        deleteBookingItem (item) {
          this.editedBookingIndex = this.BookingList.indexOf(item)
          this.editedBookingItem = Object.assign({}, item)
          this.dialogBookingDelete = true
        },
        async clickConfirmDeleteBooking() {
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL+'/deleteReservationByAdmin', {
                reservationid: this.editedBookingItem.reservationid,
                childid: this.editedBookingItem.childid,
            },
            { headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Delete Reservation Successful');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Delete Reservation failed');
                }
                this.dialogBookingDelete = false
                this.getReservationList()
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
        closeBooking () {
          this.dialogBooking = false
          this.$nextTick(() => {
            this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
            this.selectedDate = null
            this.editedBookingIndex = -1
          })
        },
        clickEditBooking (item) {
          this.editedBookingIndex = this.BookingList.indexOf(item)
          this.editedBookingItem = Object.assign({}, item)
          this.selectedDate = new Date(this.editedBookingItem.classdate)
          this.dialogBooking = true
        },
        clickCancelDeleteBooking () {
          this.dialogBookingDelete = false
          this.$nextTick(() => {
            this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
            this.editedBookingIndex = -1
          })
        },
        addOneDay(date = new Date()) {
            date.setDate(date.getDate() + 1);
            return date;
        },
        getReservationList() {
            const reservedate = this.SQLDate(this.date)
            this.loadingBooking = true
            const token = this.$store.getters.getToken;
            DashboardAPI.fetchDataBooking({ token, reservedate })
            .then(({ success, results, message }) => {
                if(success) {
                    this.BookingList = results
                    if(reservedate == this.SQLDate(this.date)) {
                        this.loadingBooking = false
                    }
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
        onClickChangeState(state) {
            this.state = state
            this.$emit('onClickChangeState', state)
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
    baseURL: 'https://istarserver.vercel.app',
    //baseURL: 'http://localhost:3000',
    fetchDataBooking ({ token, reservedate }) {
        return new Promise(resolve => {
            //console.log('DashboardAPI : ' + this.baseURL+'/getReservationList')
            axios
            .post(this.baseURL+'/getReservationList', {
                classdate: reservedate
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                //console.log('fetchDataBooking result',response);
                if (response.data.success) {
                    const datalist = response.data.results
                    resolve({ success: true, results: datalist })
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