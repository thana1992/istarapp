<template>
    <div class="container">
        <div class="container-header dashboard-header">
            <div class="dashboard-header-left">
                <div class="dashboard-header-icon">
                    <span class="mdi mdi-view-dashboard"></span>
                </div>
                <div class="dashboard-header-text">
                    <h1 class="dashboard-title">{{ $t('dashboard.title') }}</h1>
                    <p class="dashboard-subtitle">{{ $t('dashboard.subtitle') }}</p>
                </div>
            </div>
            <div class="dashboard-header-actions">
                <button type="button" class="qa-btn qa-btn-pink" @click="callChildMethodAddNewStudent">
                    <span class="mdi mdi-emoticon-plus-outline"></span>
                    <span class="qa-label">{{ $t('btn.newStudent') }}</span>
                </button>
                <button type="button" class="qa-btn qa-btn-amber" @click="callChildMethodAddNewCustomerCourse">
                    <span class="mdi mdi-book-plus-outline"></span>
                    <span class="qa-label">{{ $t('btn.newCourse') }}</span>
                </button>
                <button type="button" class="qa-btn qa-btn-cyan" @click="callChildMethodAddNewBooking">
                    <span class="mdi mdi-calendar-plus-outline"></span>
                    <span class="qa-label">{{ $t('btn.newBooking') }}</span>
                </button>
                <button type="button" class="qa-btn qa-btn-orange" @click="callChildMethodAddNewHoliday">
                    <span class="mdi mdi-door-sliding-lock"></span>
                    <span class="qa-label">{{ $t('btn.newHoliday') }}</span>
                </button>
            </div>
        </div>
        <div class="container-content">
            <v-row class="stat-row" dense>
                <v-col cols="12" sm="4" md="3" lg="3" xl="3">
                    <v-card class="stat-card" link @click="onClickCardTotalStudent" elevation="0">
                        <div class="stat-accent stat-accent-blue"></div>
                        <div class="stat-body">
                            <div class="stat-label">{{ $t('dashboard.totalGymnasts') }}</div>
                            <div class="stat-value">
                                <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalStudents'
                                    :duration='2.5' separator=',' :autoinit='true' />
                            </div>
                            <div class="stat-meta">
                                <span>{{ $t('dashboard.studentsUnit') }}</span>
                                <span class="stat-icons">
                                    <span class="mdi mdi-face-man-shimmer"></span>
                                    <span class="mdi mdi-face-woman-shimmer"></span>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" md="3" lg="3" xl="3">
                    <v-card class="stat-card stat-card-active" link @click="onClickCardTotalActiveStudent" elevation="0">
                        <div class="stat-accent stat-accent-green"></div>
                        <div class="stat-body">
                            <div class="stat-label">{{ $t('dashboard.activeGymnasts') }}</div>
                            <div class="stat-value">
                                <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalActiveStudents'
                                    :duration='2.5' separator=',' :autoinit='true' />
                            </div>
                            <div class="stat-meta">
                                <span>{{ $t('dashboard.studentsUnit') }}</span>
                                <span class="stat-icons">
                                    <span class="mdi mdi-face-man-shimmer"></span>
                                    <span class="mdi mdi-face-woman-shimmer"></span>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" md="2" lg="2" xl="2">
                    <v-card class="stat-card stat-card-dynamic" :style="getBookingCardColor(totalBookingToday)" link
                        @click="onClickCardToday" elevation="0">
                        <div class="stat-body">
                            <div class="stat-label">{{ $t('dashboard.todayBooking') }}</div>
                            <div class="stat-value">
                                <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingToday'
                                    :duration='1.5' separator=',' :autoinit='true' />
                            </div>
                            <div class="stat-meta">
                                <span>{{ $t('dashboard.bookingsUnit') }}</span>
                                <span class="stat-icons">
                                    <span class="mdi mdi-gymnastics"></span>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" md="2" lg="2" xl="2">
                    <v-card class="stat-card stat-card-dynamic" :style="getBookingCardColor(totalBookingTomorrow)" link
                        @click="oncClickCardTomorrow" elevation="0">
                        <div class="stat-body">
                            <div class="stat-label">{{ $t('dashboard.tomorrowBooking') }}</div>
                            <div class="stat-value">
                                <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingTomorrow'
                                    :duration='1.5' separator=',' :autoinit='true' />
                            </div>
                            <div class="stat-meta">
                                <span>{{ $t('dashboard.bookingsUnit') }}</span>
                                <span class="stat-icons">
                                    <span class="mdi mdi-gymnastics"></span>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="4" md="2" lg="2" xl="2">
                    <v-card :class="['stat-card', pulse]" link @click="onClickCardNewStudent" elevation="0">
                        <div class="stat-accent stat-accent-amber"></div>
                        <div class="stat-body">
                            <div class="stat-label">{{ $t('approve.title') }}</div>
                            <div class="stat-value">
                                <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalWaitingNewStudents'
                                    :duration='1.5' separator=',' :autoinit='true' />
                            </div>
                            <div class="stat-meta">
                                <span>{{ $t('dashboard.studentsUnit') }}</span>
                                <span class="stat-icons">
                                    <span class="mdi mdi-account-multiple-check"></span>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="content-row">
                <v-col cols="12" sm="12" md="4" xl="3">
                    <v-card class="content-card" elevation="0" height="470">
                        <div class="content-card-header">
                            <span class="mdi mdi-calendar-month-outline"></span>
                            {{ $t('bookingMgmt.viewByDate') }}
                        </div>
                        <div class="datepicker-wrap">
                            <v-date-picker class="datepick" v-model="datepick"
                                @update:model-value="selectDate"></v-date-picker>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="12" md="8" xl="9">
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'studentlist'">
                            <Student @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)" ref="StudentComponent">
                            </Student>
                        </v-card>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'approvenewstudent'">
                            <ApproveNewStudent @onErrorHandler="onError($event)"
                                @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)">
                            </ApproveNewStudent>
                        </v-card>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'bookinglist'">
                            <BookingListAdmin @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders"
                                @student-clicked="onStudentClicked($event)"
                                :bookingData="bookingList" :classdate="datepick" :loadingBooking="loadingBooking">
                            </BookingListAdmin>
                        </v-card>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'customercourse'">
                            <CustomerCourse @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)"
                                ref="CustomerCourseComponent">
                            </CustomerCourse>
                        </v-card>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'customercourse'">
                            <BookingManagement @onErrorHandler="onError($event)"
                                @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)"
                                ref="BookingManagementComponent">
                            </BookingManagement>
                        </v-card>
                    </Transition>
                    <Transition name="fade" mode="out-in">
                        <v-card class="content-card" elevation="0" v-show="state == 'holidaymanagment'">
                            <HolidayManagment @onErrorHandler="onError($event)"
                                @onInfoHandler="onShowInfoDialog($event)"
                                @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                                @onLoading="onLoading($event)"
                                ref="HolidayManagmentComponent">
                            </HolidayManagment>
                        </v-card>
                    </Transition>
                </v-col>
            </v-row>
        </div>

        <v-dialog width="500" v-model="errorDialog">
            <v-card :title="$t('dialog.error')" color="#F44336">
                <v-card-text>
                    {{ errorMsg }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" variant="tonal" block @click="errorDialog = false">{{ $t('btn.close') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog width="500" v-model="infoDialog">
            <v-card :title="$t('dialog.success')" color="#98FB98">
                <v-card-text>
                    {{ infoMsg }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" variant="tonal" block @click="infoDialog = false">{{ $t('btn.ok') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
            this.$emit('onErrorHandler', this.$t('dashboard.btnPlaceholder'))
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
            const theme = localStorage.getItem('uiTheme') || 'neumorphic';
            // Dark themes handle color via CSS — return nothing so inline style doesn't conflict
            if (theme === 'halloween' || theme === 'christmas') return {};
            if (count <= 0) return { backgroundColor: '#fff', color: '#222' };
            if (count >= 120) return { backgroundColor: '#d50000', color: '#fff' };
            const t = Math.min(count / 120, 1);
            const r = Math.round(255 + (213 - 255) * t);
            const g = Math.round(255 + (0 - 255) * t);
            const b = Math.round(255 + (0 - 255) * t);
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
/* ===== Dashboard Header ===== */
.dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.dashboard-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}

.dashboard-header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* ===== Quick Action Buttons (header right) — Neumorphic ===== */
.qa-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 18px;
    border-radius: 14px;
    background: linear-gradient(145deg, #ffffff, #e8ebf1);
    border: none;
    box-shadow:
        5px 5px 12px rgba(163, 177, 198, 0.5),
        -5px -5px 12px rgba(255, 255, 255, 0.95);
    font-size: 13px;
    font-weight: 600;
    font-family: 'Kodchasan', sans-serif;
    cursor: pointer;
    transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease, color 0.2s ease;
    color: #1f2937;
    white-space: nowrap;
}

.qa-btn:hover {
    transform: translateY(-1px);
    box-shadow:
        7px 7px 16px rgba(163, 177, 198, 0.55),
        -7px -7px 16px rgba(255, 255, 255, 1);
}

.qa-btn:active {
    transform: translateY(0);
    box-shadow:
        inset 4px 4px 8px rgba(163, 177, 198, 0.45),
        inset -4px -4px 8px rgba(255, 255, 255, 0.95);
}

.qa-btn .mdi {
    font-size: 18px;
}

.qa-btn-pink { color: #be185d; }
.qa-btn-pink .mdi { color: #ec4899; }
.qa-btn-pink:hover { color: #9d174d; }

.qa-btn-amber { color: #b45309; }
.qa-btn-amber .mdi { color: #f59e0b; }
.qa-btn-amber:hover { color: #92400e; }

.qa-btn-cyan { color: #0e7490; }
.qa-btn-cyan .mdi { color: #06b6d4; }
.qa-btn-cyan:hover { color: #155e75; }

.qa-btn-orange { color: #c2410c; }
.qa-btn-orange .mdi { color: #f97316; }
.qa-btn-orange:hover { color: #9a3412; }

/* On narrow screens: stack icon + label vertically, always visible */
@media (max-width: 768px) {
    .qa-label {
        display: block;
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 0.3px;
    }
    .qa-btn {
        flex-direction: column;
        padding: 8px 6px;
        gap: 3px;
        min-width: 56px;
    }
    .qa-btn .mdi {
        font-size: 20px;
    }
}

.dashboard-header-icon {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 18px;
    background: linear-gradient(145deg, #7c83fb 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow:
        6px 6px 14px rgba(99, 102, 241, 0.45),
        -4px -4px 10px rgba(255, 255, 255, 0.7),
        inset 1px 1px 2px rgba(255, 255, 255, 0.3),
        inset -1px -1px 2px rgba(0, 0, 0, 0.1);
}

.dashboard-header-icon .mdi {
    font-size: 30px;
}

.dashboard-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
    background: linear-gradient(135deg, #1e293b, #475569);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.dashboard-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 2px 0 0;
    font-family: 'Mali', sans-serif;
}

/* ===== Stat Cards ===== */
.stat-row {
    margin-top: 8px !important;
}

/* md+ : flex equal-fill ให้ stat 5 cards กระจายเท่ากัน เต็มแถวพอดี
   (ไม่ใช้ gap เพราะจะรวมกับ Vuetify v-col padding แล้วเกิน 100% ทำให้ wrap) */
@media (min-width: 960px) {
    .stat-row > .v-col {
        flex: 1 1 0 !important;
        max-width: none !important;
        min-width: 160px;
    }
}

.stat-card {
    position: relative;
    border-radius: 22px !important;
    background: linear-gradient(145deg, #ffffff, #e8ebf1) !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: hidden !important;
    border: none !important;
    box-shadow:
        9px 9px 22px rgba(163, 177, 198, 0.5),
        -9px -9px 22px rgba(255, 255, 255, 0.95) !important;
    min-height: 140px;
    cursor: pointer;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow:
        12px 12px 28px rgba(163, 177, 198, 0.55),
        -12px -12px 28px rgba(255, 255, 255, 1) !important;
}

.stat-card:active {
    transform: translateY(0);
    box-shadow:
        inset 5px 5px 12px rgba(163, 177, 198, 0.45),
        inset -5px -5px 12px rgba(255, 255, 255, 0.95) !important;
}

.stat-card-active {
    background: linear-gradient(145deg, #f0fdf4, #d1fae5) !important;
    box-shadow:
        9px 9px 22px rgba(16, 185, 129, 0.25),
        -9px -9px 22px rgba(255, 255, 255, 0.95),
        inset 0 0 0 1px rgba(16, 185, 129, 0.1) !important;
}

.stat-card-active:hover {
    box-shadow:
        12px 12px 28px rgba(16, 185, 129, 0.32),
        -12px -12px 28px rgba(255, 255, 255, 1),
        inset 0 0 0 1px rgba(16, 185, 129, 0.15) !important;
}

.stat-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    z-index: 1;
    border-radius: 22px 22px 0 0;
    opacity: 0.9;
}

.stat-accent-blue {
    background: linear-gradient(90deg, #3b82f6, #06b6d4);
}

.stat-accent-green {
    background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-accent-amber {
    background: linear-gradient(90deg, #f59e0b, #f97316);
}

.stat-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 18px 18px 16px;
}

.stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #6b7280;
    font-family: 'Kodchasan', sans-serif;
}

.stat-value {
    font-size: 30px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
    font-family: 'Kodchasan', sans-serif;
    margin: 8px 0 6px;
}

.stat-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

.stat-icons .mdi {
    font-size: 18px;
    margin-left: 4px;
    opacity: 0.75;
}

/* Today/Tomorrow cards: dynamic background → children inherit color */
.stat-card-dynamic .stat-label,
.stat-card-dynamic .stat-value,
.stat-card-dynamic .stat-meta {
    color: inherit !important;
}

.stat-card-dynamic .stat-icons .mdi {
    opacity: 0.85;
}

/* ===== Action Cards ===== */
.action-row {
    margin-top: 4px !important;
}

.action-card {
    border-radius: 12px !important;
    height: 80px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
    cursor: pointer;
    color: #1f2937;
    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease !important;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08) !important;
    border: none !important;
}

.action-card:hover {
    transform: translateY(-3px);
    filter: brightness(1.06);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14) !important;
}

.action-icon {
    font-size: 26px !important;
    margin-right: 0 !important;
    line-height: 1;
}

.action-label {
    font-size: 13px;
    font-weight: 600;
    font-family: 'Kodchasan', sans-serif;
}

.action-pink {
    background: linear-gradient(135deg, #fda4af, #fb7185) !important;
    color: #4c0519;
}

.action-amber {
    background: linear-gradient(135deg, #fcd34d, #f59e0b) !important;
    color: #451a03;
}

.action-cyan {
    background: linear-gradient(135deg, #67e8f9, #22d3ee) !important;
    color: #083344;
}

.action-orange {
    background: linear-gradient(135deg, #fed7aa, #fb923c) !important;
    color: #431407;
}

/* ===== Content Cards ===== */
.content-row {
    margin-top: 8px;
}

.content-card {
    border-radius: 22px !important;
    background: linear-gradient(145deg, #ffffff, #e8ebf1) !important;
    border: none !important;
    box-shadow:
        9px 9px 22px rgba(163, 177, 198, 0.45),
        -9px -9px 22px rgba(255, 255, 255, 0.95) !important;
    overflow: hidden !important;
}

.content-card-header {
    background: linear-gradient(145deg, #eef0f5, #dde2eb);
    padding: 16px 20px;
    font-weight: 600;
    color: #334155;
    box-shadow: inset 0 -1px 2px rgba(163, 177, 198, 0.15);
    font-family: 'Kodchasan', sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.content-card-header .mdi {
    font-size: 18px;
    color: #6366f1;
}

.datepicker-wrap {
    padding: 12px;
    display: flex;
    justify-content: center;
}

/* Date picker — blend into neumorphic content-card */
.datepick,
:deep(.datepick),
:deep(.datepick .v-picker),
:deep(.datepick .v-picker__body),
:deep(.datepick .v-card),
:deep(.datepick .v-sheet),
:deep(.datepick > *),
:deep(.v-date-picker),
:deep(.v-date-picker > *),
:deep(.v-date-picker-month),
:deep(.v-date-picker-controls),
:deep(.v-date-picker-header) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
}

/* ===== Pulse animation (Approve New Students card) — Neumorphic glow ===== */
.pulse {
    animation: pulse 2.4s ease-in-out infinite;
}

.pulse:hover {
    animation: none;
}

@keyframes pulse {
    0%, 100% {
        box-shadow:
            9px 9px 22px rgba(245, 158, 11, 0.35),
            -9px -9px 22px rgba(255, 255, 255, 0.95);
    }
    50% {
        box-shadow:
            10px 10px 28px rgba(245, 158, 11, 0.6),
            -10px -10px 28px rgba(255, 255, 255, 1),
            0 0 0 4px rgba(245, 158, 11, 0.08);
    }
}

/* ===== Fade transition for content area ===== */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* ================================================================
   HALLOWEEN THEME — Dashboard overrides
   Scoped selectors compile to html.theme-halloween .xxx[data-v-*]
   which beats the base .xxx[data-v-*] in specificity.
   ================================================================ */

html.theme-halloween .stat-card {
  background: linear-gradient(145deg, #1e0a38, #150824) !important;
  box-shadow:
    9px 9px 22px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 140, 0, 0.18) !important;
}
html.theme-halloween .stat-card:hover {
  box-shadow:
    12px 12px 28px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(255, 140, 0, 0.3),
    0 0 16px rgba(255, 140, 0, 0.12) !important;
}
html.theme-halloween .stat-card:active {
  box-shadow:
    inset 5px 5px 12px rgba(0, 0, 0, 0.5),
    inset -5px -5px 12px rgba(255, 140, 0, 0.04) !important;
}
html.theme-halloween .stat-card-active {
  background: linear-gradient(145deg, #1a1432, #110a24) !important;
  box-shadow:
    9px 9px 22px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 140, 0, 0.18) !important;
}
/* dynamic booking cards — drop inline color, use theme bg */
html.theme-halloween .stat-card-dynamic {
  background: linear-gradient(145deg, #1e0a38, #150824) !important;
}
html.theme-halloween .stat-card-dynamic .stat-label,
html.theme-halloween .stat-card-dynamic .stat-value,
html.theme-halloween .stat-card-dynamic .stat-meta { color: inherit !important; }

html.theme-halloween .stat-label  { color: #c4a8e8 !important; }
html.theme-halloween .stat-value  { color: #f0e6ff !important; }
html.theme-halloween .stat-meta   { color: #c4a8e8 !important; }
html.theme-halloween .stat-icons .mdi { color: rgba(255, 140, 0, 0.6) !important; opacity: 1 !important; }

html.theme-halloween .content-card {
  background: linear-gradient(145deg, #1e0a38, #150824) !important;
  box-shadow:
    9px 9px 22px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(255, 140, 0, 0.13) !important;
}
html.theme-halloween .content-card-header {
  background: linear-gradient(to right, #2d0a50, #3d1200) !important;
  color: #ff8c00 !important;
  box-shadow: inset 0 -1px 0 rgba(255, 140, 0, 0.2) !important;
}
html.theme-halloween .content-card-header .mdi { color: #ff8c00 !important; }

html.theme-halloween .qa-btn {
  background: linear-gradient(145deg, #1e0a38, #150824) !important;
  box-shadow:
    5px 5px 12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 140, 0, 0.15) !important;
  color: #f0e6ff !important;
}
html.theme-halloween .qa-btn:hover {
  box-shadow:
    7px 7px 16px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 140, 0, 0.28),
    0 0 10px rgba(255, 140, 0, 0.1) !important;
}
html.theme-halloween .qa-btn .mdi { color: #ff8c00 !important; }
html.theme-halloween .qa-btn-pink,
html.theme-halloween .qa-btn-amber,
html.theme-halloween .qa-btn-cyan,
html.theme-halloween .qa-btn-orange { color: #f0e6ff !important; }

html.theme-halloween .dashboard-title {
  -webkit-background-clip: text;
  background-clip: text;
}
html.theme-halloween .dashboard-subtitle { color: #c4a8e8 !important; }
html.theme-halloween .dashboard-header-icon {
  background: linear-gradient(145deg, #ff8c00, #e65c00) !important;
  box-shadow:
    6px 6px 14px rgba(255, 140, 0, 0.4),
    -4px -4px 10px rgba(0, 0, 0, 0.45) !important;
}

/* Date picker inside content-card — Halloween */
html.theme-halloween :deep(.v-picker-title)                       { color: rgba(255, 140, 0, 0.65) !important; }
html.theme-halloween :deep(.v-date-picker-header__content)         { color: #f0e6ff !important; }
html.theme-halloween :deep(.v-date-picker-controls .v-btn)         { color: #ffb347 !important; }
html.theme-halloween :deep(.v-date-picker-month__weekday)          { color: rgba(255, 140, 0, 0.6) !important; }
html.theme-halloween :deep(.v-date-picker-month__day .v-btn) {
  background: rgba(255, 140, 0, 0.1) !important;
  color: #f0e6ff !important;
  box-shadow: none !important;
}
html.theme-halloween :deep(.v-date-picker-month__day--selected .v-btn),
html.theme-halloween :deep(.v-date-picker-month__day .v-btn.v-btn--active) {
  background: #ff8c00 !important;
  color: #fff !important;
}
html.theme-halloween :deep(.v-date-picker-month__day--disabled .v-btn) {
  background: transparent !important;
  color: rgba(240, 230, 255, 0.2) !important;
}

/* ================================================================
   CHRISTMAS THEME — Dashboard overrides
   ================================================================ */

/* Snow-white stat cards floating on dark green background */
html.theme-christmas .stat-card {
  background: rgba(242, 255, 245, 0.93) !important;
  box-shadow:
    8px 8px 24px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 215, 0, 0.25) !important;
  color: #0d3a0d !important;
}
html.theme-christmas .stat-card:hover {
  box-shadow:
    12px 12px 30px rgba(0, 0, 0, 0.6),
    0 0 0 1.5px rgba(255, 215, 0, 0.4),
    0 0 18px rgba(255, 215, 0, 0.12) !important;
}
html.theme-christmas .stat-card-active {
  background: rgba(220, 252, 231, 0.93) !important;
}
html.theme-christmas .stat-card-dynamic {
  background: rgba(242, 255, 245, 0.93) !important;
}
html.theme-christmas .stat-label  { color: #166534 !important; }
html.theme-christmas .stat-value  { color: #0d3a0d !important; }
html.theme-christmas .stat-meta   { color: #15803d !important; }
html.theme-christmas .stat-icons .mdi { color: #16a34a !important; opacity: 1 !important; }

/* Snow-white content cards (booking table area) */
html.theme-christmas .content-card {
  background: rgba(242, 255, 245, 0.93) !important;
  box-shadow:
    8px 8px 24px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 215, 0, 0.22) !important;
}
html.theme-christmas .content-card-header {
  background: linear-gradient(to right, #15803d, #22c55e) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}
html.theme-christmas .content-card-header .mdi { color: rgba(255, 255, 255, 0.85) !important; }

/* Quick-action buttons — solid green on dark bar */
html.theme-christmas .qa-btn {
  background: linear-gradient(145deg, #16a34a, #15803d) !important;
  box-shadow:
    4px 4px 10px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 215, 0, 0.15) !important;
  color: #ffffff !important;
}
html.theme-christmas .qa-btn .mdi { color: rgba(255, 255, 255, 0.9) !important; }
html.theme-christmas .qa-btn-pink,
html.theme-christmas .qa-btn-amber,
html.theme-christmas .qa-btn-cyan,
html.theme-christmas .qa-btn-orange { color: #ffffff !important; }

html.theme-christmas .dashboard-title {
  background: linear-gradient(135deg, #ffd700, #22c55e) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  color: transparent !important;
}
html.theme-christmas .dashboard-subtitle { color: #a7f3d0 !important; }
html.theme-christmas .dashboard-header-icon {
  background: linear-gradient(145deg, #22c55e, #16a34a) !important;
  box-shadow:
    6px 6px 14px rgba(34, 197, 94, 0.38),
    -4px -4px 10px rgba(0, 0, 0, 0.4) !important;
}

/* Date picker inside snow-white card */
html.theme-christmas :deep(.v-picker-title)                       { color: rgba(21, 128, 61, 0.75) !important; }
html.theme-christmas :deep(.v-date-picker-header__content)         { color: #0d3a0d !important; }
html.theme-christmas :deep(.v-date-picker-controls .v-btn)         { color: #15803d !important; }
html.theme-christmas :deep(.v-date-picker-month__weekday)          { color: rgba(21, 128, 61, 0.65) !important; }
html.theme-christmas :deep(.v-date-picker-month__day .v-btn) {
  background: rgba(34, 197, 94, 0.10) !important;
  color: #0d3a0d !important;
  box-shadow: none !important;
}
html.theme-christmas :deep(.v-date-picker-month__day--selected .v-btn),
html.theme-christmas :deep(.v-date-picker-month__day .v-btn.v-btn--active) {
  background: #16a34a !important;
  color: #fff !important;
}
html.theme-christmas :deep(.v-date-picker-month__day--disabled .v-btn) {
  background: transparent !important;
  color: rgba(13, 58, 13, 0.25) !important;
}

/* ===== Dark theme adjustments ===== */
:deep(.v-theme--dark) .stat-card,
:deep(.v-theme--dark) .content-card {
    background: linear-gradient(145deg, #2a3447, #1e2536) !important;
    border: none !important;
    box-shadow:
        9px 9px 22px rgba(0, 0, 0, 0.45),
        -9px -9px 22px rgba(60, 72, 95, 0.4) !important;
}

:deep(.v-theme--dark) .stat-card:hover,
:deep(.v-theme--dark) .content-card:hover {
    box-shadow:
        12px 12px 28px rgba(0, 0, 0, 0.5),
        -12px -12px 28px rgba(60, 72, 95, 0.45) !important;
}

:deep(.v-theme--dark) .stat-card-active {
    background: linear-gradient(145deg, #1a3d2e, #14523c) !important;
    box-shadow:
        9px 9px 22px rgba(0, 0, 0, 0.45),
        -9px -9px 22px rgba(34, 197, 94, 0.15) !important;
}

:deep(.v-theme--dark) .qa-btn {
    background: linear-gradient(145deg, #2a3447, #1e2536);
    box-shadow:
        5px 5px 12px rgba(0, 0, 0, 0.45),
        -5px -5px 12px rgba(60, 72, 95, 0.4);
    color: #e2e8f0;
}

:deep(.v-theme--dark) .qa-btn:hover {
    box-shadow:
        7px 7px 16px rgba(0, 0, 0, 0.5),
        -7px -7px 16px rgba(60, 72, 95, 0.45);
}

:deep(.v-theme--dark) .qa-btn:active {
    box-shadow:
        inset 4px 4px 8px rgba(0, 0, 0, 0.4),
        inset -4px -4px 8px rgba(60, 72, 95, 0.35);
}

:deep(.v-theme--dark) .stat-label,
:deep(.v-theme--dark) .stat-meta {
    color: #94a3b8;
}

:deep(.v-theme--dark) .stat-value {
    color: #f1f5f9;
}

:deep(.v-theme--dark) .dashboard-title {
    background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

:deep(.v-theme--dark) .dashboard-subtitle {
    color: #94a3b8;
}

:deep(.v-theme--dark) .content-card-header {
    background: linear-gradient(145deg, #1e2536, #2a3447);
    color: #cbd5e1;
    box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.3);
}
</style>