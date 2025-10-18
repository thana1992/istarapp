<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-view-dashboard"></span> Dashboard</h1>
        </div>
        <!--<v-btn color="primary" @click="animateTomorrow">Animate Tomorrow</v-btn>-->
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="4" md="2" xl="2">
                        <v-card class="mx-auto card-opacity" link @click="onClickCardTotalStudent">
                            <v-list-item class="header-card" min-height="60">
                                <div>Total <br>Gymnasts</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalStudents' :duration='2.5' separator=',' :autoinit='true' />
                                    </p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-face-man-shimmer"></span>
                                <span class="mdi mdi-face-woman-shimmer"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="4" md="2" xl="2">
                        <v-card class="mx-auto card-opacity active-student-card" link @click="onClickCardTotalActiveStudent">
                            <v-list-item class="header-card" min-height="60">
                                <div>Total Active<br>Gymnasts</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalActiveStudents' :duration='2.5' separator=',' :autoinit='true' />
                                    </p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-face-man-shimmer"></span>
                                <span class="mdi mdi-face-woman-shimmer"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="4" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" :style="getBookingCardColor(totalBookingToday)" link @click="onClickCardToday">
                            <v-list-item class="header-card" height="60">
                                <div>Today's booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalBookingToday' :duration='1.5' separator=','
                                            :autoinit='true' /></p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="4" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" :style="getBookingCardColor(totalBookingTomorrow)" link @click="oncClickCardTomorrow">
                            <v-list-item class="header-card" height="60">
                                <div>Tomorrow's booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalBookingTomorrow' :duration='1.5' separator=','
                                            :autoinit='true' /></p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="4" md="2" xl="2">
                        <v-card :class="pulse" link @click="onClickCardNewStudent">
                            <v-list-item class="header-card" height="60">
                                <div>Approve New Students <span class=""></span></div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalWaitingNewStudents' :duration='1.5' separator=','
                                            :autoinit='true' /></p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <!-- <v-col cols="12" sm="2" md="2" xl="2">
                        <v-card class="mx-auto" link>
                            <v-list-item class="header-card" height="60">
                                <div>Approve Cancel booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">
                                    <p class="font-card"><vue3-autocounter ref='counter' :startAmount='0'
                                            :endAmount='totalWaitCancelBooking' :duration='1.5' separator=','
                                            :autoinit='true' /></p>
                                </v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col> -->
                    <v-col sm="3" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" link @click="callChildMethodAddNewStudent">
                            <v-list-item class="btn-card-1">
                                <div style="text-align: center;">New Student</div>
                                <div class="btn-card-icon"><span class="mdi mdi-emoticon-plus-outline"></span></div>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col sm="3" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" link @click="callChildMethodAddNewCustomerCourse">
                            <v-list-item class="btn-card-2">
                                <div style="text-align: center;">New Course</div>
                                <div class="btn-card-icon"><span class="mdi mdi-book-plus-outline"></span></div>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    
                    <v-col sm="3" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" link @click="callChildMethodAddNewBooking">
                            <v-list-item class="btn-card-4">
                                <div style="text-align: center;">New Booking</div>
                                <div class="btn-card-icon"><span class="mdi mdi-calendar-plus-outline"></span></div>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col sm="3" md="1" xl="1">
                        <v-card class="mx-auto card-opacity" link @click="callChildMethodAddNewHoliday">
                            <v-list-item class="btn-card-3">
                                <div style="text-align: center;">New Holiday</div>
                                <div class="btn-card-icon"><span class="mdi mdi-door-sliding-lock"></span></div>
                            </v-list-item>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="12" md="4" xl="3">
                        <v-card class="mx-0 card-opacity" height="450">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker class="datepick" v-model="datepick"
                                        @update:model-value="selectDate"></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="8" xl="9">
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'studentlist'">
                                <Student @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)" ref="StudentComponent">
                                </Student>
                            </v-card>
                        </Transition>
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'approvenewstudent'">
                                <ApproveNewStudent @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)">
                                </ApproveNewStudent>
                            </v-card>
                        </Transition>
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'bookinglist'">
                                <BookingListAdmin @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders"
                                    @student-clicked="onStudentClicked($event)"
                                    :bookingData="bookingList" :classdate="datepick" :loadingBooking="loadingBooking">
                                </BookingListAdmin>
                            </v-card>
                        </Transition>
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'customercourse'">
                                <CustomerCourse @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)"
                                    ref="CustomerCourseComponent">
                                </CustomerCourse>
                            </v-card>
                        </Transition>
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'customercourse'">
                                <BookingManagement @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)"
                                    ref="BookingManagementComponent">
                                </BookingManagement>
                            </v-card>
                        </Transition>
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0 card-opacity" v-show="state == 'holidaymanagment'">
                                <HolidayManagment @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                    @onLoading="onLoading($event)"
                                    ref="HolidayManagmentComponent">
                                </HolidayManagment>
                            </v-card>
                        </Transition>
                    </v-col>
                </v-row>
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
</div>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from '../center/Student.vue'
import BookingListAdmin from '../center/BookingListAdmin.vue'
import ApproveNewStudent from './ApproveNewStudent.vue'
import BookingManagement from './BookingManagement.vue'
import CustomerCourse from './CustomerCourse.vue'
import HolidayManagment from './HolidayManagment.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
import Vue3autocounter from 'vue3-autocounter';
import { ref, onMounted, nextTick  } from 'vue';
export default ({
    components: {
        DatePicker,
        Student,
        BookingListAdmin,
        ApproveNewStudent,
        BookingManagement,
        CustomerCourse,
        HolidayManagment,
        'vue3-autocounter': Vue3autocounter
    },
    data() {
        return {
            fetchData: null,
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval: null,
            datepick: new Date(),
            totalStudents: 0,
            totalActiveStudents: 0,
            totalBookingToday: 0,
            totalBookingTomorrow: 0,
            totalWaitingNewStudents: 0,
            totalWaitCancelBooking: 0,
            pulse: '',
            bookingList: [],
            bookingHeaders: [],
            loadingBooking: false,
            state: 'bookinglist',
            notNullRules: [v => !!v || 'This field is required',],

            loadingCourse: false,
            editedBookingIndex: -1,
            dialogNewBooking: false,
            selectBookingDate: null,
            classtimesData: [],
            editedBookingItem: {
                fullname: null,
                reservationid: null,
                studentid: null,
                courseid: null,
                classid: null,
                classdate: null,
                classtime: null,
                courseinfo: null,
                courserefer: null,
            },
            defaultBookingItem: {
                fullname: null,
                reservationid: null,
                studentid: null,
                courseid: null,
                classid: null,
                classdate: null,
                classtime: null,
                courseinfo: null,
                courserefer: null,
            },
        }
    },

    async created() {
        this.datepick = new Date();
        this.$emit('onLoading', true)
        await this.initialize()
        this.$emit('onLoading', false)
        try {
            const token = this.$store.getters.getToken;
            //console.log('token ', token)
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
                //console.dir(response);
                if (response.data.success) {
                    this.initialize()
                }
            })
            .catch(error => {
                //console.error(error);
                this.$emit('onErrorHandler', error.response.data.message)
                this.$emit('onClickChangeState', 'login')
            });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }
    },
    mounted() {
        //console.log('dashboard mounted...' + new Date())
        this.interval = setInterval(() => {
            this.refreshData()
        }, 60000)
    },
    unmounted() {
        //console.log('dashboard unmounted...' + new Date())
        clearInterval(this.interval)
    },
    methods: {
        async initialize() {
            axios.get(this.baseURL+'/checkToken', {})
            .then(response => {
                //console.dir(response);
                if (response.data) {
                    const activeSessions = response.data.activeSessions
                    activeSessions.forEach(item => {
                        let iat = new Date(item.iat * 1000)
                        let exp = new Date(item.exp * 1000)
                        //console.log(item.username + " : " + iat.toLocaleString() + " : " + exp.toLocaleString())
                    });
                }
            })
            
            await this.refreshCardDashboard()
            await this.getBookingListAdmin()
        },
        refreshData() {
            //console.log('refreshData : ' + new Date())
            this.refreshCardDashboard()
            if (this.state == "bookinglist") {
                this.getBookingListAdmin()
            }
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getBookingListAdmin()
        },
        async refreshCardDashboard() {
            const token = this.$store.getters.getToken;
            // //console.log('refreshCardDashboard...'+new Date())
            // //console.log('today : ' + this.SQLDate(this.today()))
            // //console.log('tomorrow : ' + this.SQLDate(this.tomorrow()))
            // //console.log('token : ' + token)
            await axios
                .post(this.baseURL + '/refreshCardDashboard', {
                    today: this.SQLDate(this.today()),
                    tomorrow: this.SQLDate(this.tomorrow()),
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.totalStudents = response.data.datacard.totalStudents
                        this.totalActiveStudents = response.data.datacard.totalActiveStudents
                        this.totalBookingToday = response.data.datacard.totalBookingToday
                        this.totalBookingTomorrow = response.data.datacard.totalBookingTomorrow
                        this.totalWaitingNewStudents = response.data.datacard.totalWaitingNewStudents

                        if (this.totalWaitingNewStudents > 0) {
                            this.pulse = 'pulse card-opacity'
                        } else {
                            this.pulse = 'card-opacity'
                        }
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        onClickCardTotalStudent() {
            this.state = 'studentlist'
            this.refreshData()
            this.callChildMethodRefreshStudent();
        },
        onClickCardTotalActiveStudent() {
            this.state = 'studentlist'
            this.refreshData()
            this.callChildMethodRefreshStudentActive();
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
        onClickCardNewStudent() {
            this.state = 'approvenewstudent'
            this.refreshData();
        },
        addOneDay(date = new Date()) {
            date.setDate(date.getDate() + 1);
            return date;
        },
        async onClickBtn() {
            this.$emit('onErrorHandler', 'มันต้องเป็นปุ่มอะไรสักอย่างแหละ ถ้าคิดออกแล้วจะทำให้ เสนอมาได้นะ ว่าอยากได้อะไร')
        },
        async getBookingListAdmin() {
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
                        if (success) {
                            if (results) {
                                //console.log('results', results)
                                this.bookingHeaders = Object.keys(results).map((key) => ({ title: key, key: key, sortable: false, align: 'right' }));
                                this.bookingHeaders.unshift({ title: 'No.', key: 'idx', sortable: false, align: 'right' })
                                this.bookingList = this.formattedData(results)
                                //console.log('bookingList'+ JSON.stringify(this.bookingList))
                                //console.log('bookingHeaders '+ JSON.stringify(this.bookingHeaders))

                            } else {
                                this.bookingHeaders = []
                                this.bookingList = []
                            }
                        } else {
                            //console.log("message : " + message)
                            this.$emit('onErrorHandler', message || 'Get Bookinglist failed')
                        }
                        if (classdate == this.SQLDate(this.datepick)) {
                            this.loadingBooking = false
                        }

                    })
                    .catch(error => {
                        //console.log('error : ', error)
                        this.loadingBooking = false
                        if (error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        } else {
                            this.$emit('onErrorHandler', error.message)
                        }
                    });

            } catch (error) {
                //console.log('error : ', error)
                this.$emit('onErrorHandler', error.message)
            }
        },
        onStudentClicked(student) {
            //console.log('onStudentClicked : ' + JSON.stringify(student))
            this.cellChildMethodUpdateStudent(student)
        },
        async refreshData() {
            await this.refreshCardDashboard()
            await this.getBookingListAdmin()
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
        onLoading(isLoading) {
            this.$emit('onLoading', isLoading)
        },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        format_date(value) {
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

            const formattedRows = rows.map((row, index) => ({
                idx: index + 1, // Adding 1 to start from 1 instead of 0
                ...row
            }));

            //console.log('formattedData : ' + JSON.stringify(formattedRows))
            return formattedRows;
        },
        tomorrow() {
            const d = new Date()
            d.setDate(d.getDate() + 1)
            return d
        },
        today() {
            return new Date()
        },
        getBookingCardColor(count) {
            if (count <= 0) return { backgroundColor: '#fff', color: '#222' };
            if (count >= 120) return { backgroundColor: '#d50000', color: '#fff' };
            const t = Math.min(count / 120, 1); // ป้องกันเกิน 1
            // ไล่สีจากขาว (#fff) ไปแดง (#d50000)
            const r = Math.round(255 + (213 - 255) * t); // 255 → 213
            const g = Math.round(255 + (0 - 255) * t);   // 255 → 0
            const b = Math.round(255 + (0 - 255) * t);   // 255 → 0

            return { backgroundColor: `rgb(${r},${g},${b})`, color: t > 0.5 ? '#fff' : '#222' };
        },
        animateTomorrow() {
            // รีเซ็ตค่า
            this.totalBookingTomorrow = 0;
            let step = 0;
            const max = 100;
            const interval = 100; // ms
            if (this._animateTimer) clearInterval(this._animateTimer);
            this._animateTimer = setInterval(() => {
                if (step >= max) {
                clearInterval(this._animateTimer);
                this._animateTimer = null;
                } else {
                step++;
                this.totalBookingTomorrow = step;
                }
            }, interval);
        },
    },
    beforeUnmount() {
        if (this._animateTimer) clearInterval(this._animateTimer);
    },
    watch: {
        dialogStudent(val) {
            val || this.closeStudent();
        },
        dialogBooking(val) {
            val || this.closeBooking()
        },
        dialogBookingDelete(val) {
            val || this.clickCancelDeleteBooking()
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        formBookingTitle() {
            return this.editedBookingIndex === -1 ? 'Add a new booking' : 'Edit booking information'
        },
        formStudentTitle() {
            return this.editedStudentIndex === -1
                ? "Add a new student"
                : "Edit student information";
        },
        profileAvatar() {
            return this.editedStudentItem.gender == 'ชาย' ? require("@/assets/avatar/4.png") : require("@/assets/avatar/2.png");
        },
        tomorrow_std() {
            const d = new Date()
            d.setDate(d.getDate() + 1)
            return d
        },
        today_std() {
            return new Date()
        },
        bookingTodayCardColor() {
            return this.getBookingCardColor(this.totalBookingToday);
        },
        bookingTomorrowCardColor() {
            return this.getBookingCardColor(this.totalBookingTomorrow);
        }
    },
    setup() {
        const StudentComponent  = ref(null)
        const callChildMethodRefreshStudent = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (StudentComponent.value) {
                StudentComponent.value.initialize();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };
        const callChildMethodRefreshStudentActive = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (StudentComponent.value) {
                StudentComponent.value.initializeActive();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };
        const callChildMethodAddNewStudent = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (StudentComponent.value) {
                StudentComponent.value.showAddNewStudent();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };
        const cellChildMethodUpdateStudent = async (student) => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (StudentComponent.value) {
                StudentComponent.value.showRetrieveStudent(student);  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };

        const CustomerCourseComponent = ref(null)
        const callChildMethodAddNewCustomerCourse = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (CustomerCourseComponent.value) {
                CustomerCourseComponent.value.showAddNewCustomerCourse();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };
        
        const BookingManagementComponent = ref(null)
        const callChildMethodAddNewBooking = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (BookingManagementComponent.value) {
                BookingManagementComponent.value.showAddNewBooking();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };

        const HolidayManagmentComponent = ref(null)
        const callChildMethodAddNewHoliday = async () => {
            // รอให้ Vue ทำการ update DOM เสร็จสิ้น
            await nextTick();

            if (HolidayManagmentComponent.value) {
                HolidayManagmentComponent.value.showAddNewHoliday();  // เรียก method ของ component ลูกเมื่อมันพร้อม
            } else {
                console.error('Child component is still not available.');
            }
        };

        // ตรวจสอบการ mount ของ component ลูก
        onMounted(() => {
            //console.log('Parent component mounted');
        });
        
        return {
            StudentComponent,
            callChildMethodRefreshStudent,
            callChildMethodRefreshStudentActive,
            callChildMethodAddNewStudent,
            cellChildMethodUpdateStudent,

            CustomerCourseComponent,
            callChildMethodAddNewCustomerCourse,

            BookingManagementComponent,
            callChildMethodAddNewBooking,

            HolidayManagmentComponent,
            callChildMethodAddNewHoliday
        };
    }
})
import { Promise } from 'core-js';
const DashboardAPI = {
    baseURL: env.SERVER_URL,
    fetchDataBooking({ token, classday, classdate }) {
        return new Promise(resolve => {
            //console.log('DashboardAPI : ' + this.baseURL + '/getBookingListAdmin' + ' classday : ' + classday + ' classdate : ' + classdate)
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
                    //console.log('fetchDataBooking result',response);
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

.btn-card-icon {
    font-size: 30px;
    text-align: center;
}
.btn-card-1 {
    background-color: #ff6868;
    color: black;
    height: 150px;
}
.btn-card-2 {
    background-color: #f1ca5d;
    color: black;
    height: 150px;
}
.btn-card-3 {
    background-color: burlywood;
    color: black;
    height: 150px;
}
.btn-card-4 {
    background-color: #8ffbff;
    color: black;
    height: 150px;
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
    box-shadow: 0px 2px 1px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12));
    animation: pulse 2s infinite;
}

.pulse:hover {
    animation: none;
}

.card-opacity{
    opacity: 0.9;
}

@-webkit-keyframes pulse {
    0% {
        -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
    }

    70% {
        -webkit-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }

    100% {
        -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }
}

@keyframes pulse {
    0% {
        -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
        box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
    }

    70% {
        -moz-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
        box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }

    100% {
        -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
        box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }
}
</style>