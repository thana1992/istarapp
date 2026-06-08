<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-view-dashboard"></span></div>
            <div>
                <div class="id-h1">{{ $t('dashboard.title') }}</div>
                <div class="pg-sub">{{ $t('dashboard.subtitle') }}</div>
            </div>
            <div style="flex:1"></div>
        </div>

        <div class="stat-grid" style="margin-bottom:16px">
            <!-- card1 : total gymnasts -->
            <div class="scard" style="cursor:pointer" @click="onClickCardTotalStudent">
                <div class="acc" :style="{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }"></div>
                <div class="row" style="justify-content:space-between">
                    <span class="lbl">{{ $t('dashboard.totalGymnasts') }}</span>
                    <span class="mdi mdi-face-man-shimmer" style="color:var(--c-primary);font-size:20px"></span>
                </div>
                <div class="val">
                    <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalStudents'
                        :duration='2.5' separator=',' :autoinit='true' />
                </div>
                <div class="t-cap">{{ $t('dashboard.studentsUnit') }}</div>
            </div>

            <!-- card2 : active gymnasts -->
            <div class="scard" style="cursor:pointer" @click="onClickCardTotalActiveStudent">
                <div class="acc" :style="{ background: 'linear-gradient(90deg,#10b981,#34d399)' }"></div>
                <div class="row" style="justify-content:space-between">
                    <span class="lbl">{{ $t('dashboard.activeGymnasts') }}</span>
                    <span class="mdi mdi-face-woman-shimmer" style="color:var(--c-primary);font-size:20px"></span>
                </div>
                <div class="val">
                    <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalActiveStudents'
                        :duration='2.5' separator=',' :autoinit='true' />
                </div>
                <div class="t-cap">{{ $t('dashboard.studentsUnit') }}</div>
            </div>

            <!-- card3 : today's booking -->
            <div class="scard" style="cursor:pointer" :style="getBookingCardColor(totalBookingToday)"
                @click="onClickCardToday">
                <div class="acc" :style="{ background: 'linear-gradient(90deg,#06b6d4,#0284c7)' }"></div>
                <div class="row" style="justify-content:space-between">
                    <span class="lbl">{{ $t('dashboard.todayBooking') }}</span>
                    <span class="mdi mdi-gymnastics" style="color:var(--c-primary);font-size:20px"></span>
                </div>
                <div class="val">
                    <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingToday'
                        :duration='1.5' separator=',' :autoinit='true' />
                </div>
                <div class="t-cap">{{ $t('dashboard.bookingsUnit') }}</div>
                <div class="dash-progress" :title="bookingProgressTitle(totalBookingToday, today())">
                    <div class="dash-progress-fill" :style="bookingProgressStyle(totalBookingToday, today())"></div>
                </div>
            </div>

            <!-- card4 : tomorrow's booking -->
            <div class="scard" style="cursor:pointer" :style="getBookingCardColor(totalBookingTomorrow)"
                @click="oncClickCardTomorrow">
                <div class="acc" :style="{ background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }"></div>
                <div class="row" style="justify-content:space-between">
                    <span class="lbl">{{ $t('dashboard.tomorrowBooking') }}</span>
                    <span class="mdi mdi-gymnastics" style="color:var(--c-primary);font-size:20px"></span>
                </div>
                <div class="val">
                    <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalBookingTomorrow'
                        :duration='1.5' separator=',' :autoinit='true' />
                </div>
                <div class="t-cap">{{ $t('dashboard.bookingsUnit') }}</div>
                <div class="dash-progress" :title="bookingProgressTitle(totalBookingTomorrow, tomorrow())">
                    <div class="dash-progress-fill" :style="bookingProgressStyle(totalBookingTomorrow, tomorrow())"></div>
                </div>
            </div>

            <!-- card5 : approve new students -->
            <div class="scard" :class="pulse" style="cursor:pointer" @click="onClickCardNewStudent">
                <div class="acc" :style="{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }"></div>
                <div class="row" style="justify-content:space-between">
                    <span class="lbl">{{ $t('approve.title') }}</span>
                    <span class="mdi mdi-account-multiple-check" style="color:var(--c-primary);font-size:20px"></span>
                </div>
                <div class="val">
                    <vue3-autocounter ref='counter' :startAmount='0' :endAmount='totalWaitingNewStudents'
                        :duration='1.5' separator=',' :autoinit='true' />
                </div>
                <div class="t-cap">{{ $t('dashboard.studentsUnit') }}</div>
            </div>
        </div>

        <div class="quick-row">
            <div class="scard quick-card" @click="callChildMethodAddNewStudent">
                <span class="q-ico" :style="{ background:'#fce7f3', color:'#be185d' }"><span class="mdi mdi-emoticon-plus-outline"></span></span>
                <span class="strong" style="color:var(--c-text-heading)">{{ $t('btn.newStudent') }}</span>
            </div>
            <div class="scard quick-card" @click="callChildMethodAddNewCustomerCourse">
                <span class="q-ico" :style="{ background:'#fef3c7', color:'#b45309' }"><span class="mdi mdi-book-plus-outline"></span></span>
                <span class="strong" style="color:var(--c-text-heading)">{{ $t('btn.newCourse') }}</span>
            </div>
            <div class="scard quick-card" @click="callChildMethodAddNewBooking">
                <span class="q-ico" :style="{ background:'#dbeafe', color:'#2563eb' }"><span class="mdi mdi-calendar-plus-outline"></span></span>
                <span class="strong" style="color:var(--c-text-heading)">{{ $t('btn.newBooking') }}</span>
            </div>
            <div class="scard quick-card" @click="callChildMethodAddNewHoliday">
                <span class="q-ico" :style="{ background:'#ede9fe', color:'#7c3aed' }"><span class="mdi mdi-door-sliding-lock"></span></span>
                <span class="strong" style="color:var(--c-text-heading)">{{ $t('btn.newHoliday') }}</span>
            </div>
        </div>

        <div class="grid2 grid2-booking">
            <div class="scard" style="padding:16px;align-self:start">
                <div class="step-head">
                    <span class="mdi mdi-calendar-month-outline" style="color:var(--c-primary)"></span>
                    {{ $t('bookingMgmt.viewByDate') }}
                </div>
                <id-calendar
                    :model-value="datepick ? (datepick.getFullYear() + '-' + (datepick.getMonth() + 1) + '-' + datepick.getDate()) : ''"
                    @update:model-value="key => { const p = key.split('-'); datepick = new Date(+p[0], +p[1] - 1, +p[2]); selectDate(); }">
                </id-calendar>
                <button class="id-btn id-btn-soft" style="width:100%;margin-top:14px;justify-content:center"
                    @click="onClickCardNewStudent">
                    <span class="mdi mdi-account-multiple-check"></span>
                    {{ $t('approve.title') }}
                    <span v-if="totalWaitingNewStudents > 0" class="badge badge-error" style="margin-left:6px;height:20px">{{ totalWaitingNewStudents }}</span>
                </button>
            </div>
            <div>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'studentlist'">
                        <Student @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)" ref="StudentComponent">
                        </Student>
                    </div>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'approvenewstudent'">
                        <ApproveNewStudent @onErrorHandler="onError($event)"
                            @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)">
                        </ApproveNewStudent>
                    </div>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'bookinglist'">
                        <BookingListAdmin @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders"
                            @student-clicked="onStudentClicked($event)"
                            :bookingData="bookingList" :classdate="datepick" :loadingBooking="loadingBooking">
                        </BookingListAdmin>
                    </div>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'customercourse'">
                        <CustomerCourse @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)"
                            ref="CustomerCourseComponent">
                        </CustomerCourse>
                    </div>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'customercourse'">
                        <BookingManagement @onErrorHandler="onError($event)"
                            @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)"
                            ref="BookingManagementComponent">
                        </BookingManagement>
                    </div>
                </Transition>
                <Transition name="fade" mode="out-in">
                    <div class="scard" style="padding:14px" v-show="state == 'holidaymanagment'">
                        <HolidayManagment @onErrorHandler="onError($event)"
                            @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)"
                            ref="HolidayManagmentComponent">
                        </HolidayManagment>
                    </div>
                </Transition>
            </div>
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
            notNullRules: [v => !!v || this.$t('common.required'),],

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
            .then(() => {
            })

            await this.refreshCardDashboard()
            await this.getBookingListAdmin()
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
                            this.pulse = 'pulse'
                        } else {
                            this.pulse = ''
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
                            this.$emit('onErrorHandler', message || this.$t('msg.loadFail'))
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
                alert(this.$t('common.invalidDob'))
            }

            const diffTime = currentDate - new Date(birthDate);
            const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let years = Math.floor(totalDays / 365.25);
            let months = Math.floor((totalDays % 365.25) / 30.4375);
            return years + ' ' + this.$t('table.yearAbbr') + ' ' + months + ' ' + this.$t('table.monthAbbr') + ' '

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
                return moment(value).format('DD/MM/YYYY')
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
            if (count <= 0) return {};
            const t = Math.min((count - 1) / (100 - 1), 1);
            // white → pastel green → pastel yellow → pastel red
            let r, g, b;
            if (t <= 0.5) {
                const p = t / 0.5;
                r = Math.round(255 + (134 - 255) * p);  // 255 → 134
                g = Math.round(255 + (239 - 255) * p);  // 255 → 239
                b = Math.round(255 + (172 - 255) * p);  // 255 → 172
            } else if (t <= 0.75) {
                const p = (t - 0.5) / 0.25;
                r = Math.round(134 + (253 - 134) * p);  // 134 → 253
                g = Math.round(239 + (224 - 239) * p);  // 239 → 224
                b = Math.round(172 + (71 - 172) * p);   // 172 → 71
            } else {
                const p = (t - 0.75) / 0.25;
                r = Math.round(253 + (248 - 253) * p);  // 253 → 248
                g = Math.round(224 + (113 - 224) * p);  // 224 → 113
                b = Math.round(71 + (113 - 71) * p);    // 71 → 113
            }
            return { background: `rgb(${r},${g},${b})` };
        },
        // Peak booking capacity: weekdays 100, weekends (Sat/Sun) 120
        bookingPeak(date) {
            const day = new Date(date).getDay(); // 0 = Sun, 6 = Sat
            return (day === 0 || day === 6) ? 120 : 100;
        },
        // Width + colour of the peak progress bar for a booking card
        bookingProgressStyle(count, date) {
            const peak = this.bookingPeak(date);
            const ratio = Math.min(Math.max(count, 0) / peak, 1);
            let color;
            if (ratio < 0.6) color = '#22c55e';       // green — plenty of room
            else if (ratio < 0.85) color = '#f59e0b'; // amber — filling up
            else color = '#ef4444';                   // red — near / at peak
            return { width: (ratio * 100) + '%', background: color };
        },
        bookingProgressTitle(count, date) {
            return `${Math.max(count, 0)} / ${this.bookingPeak(date)}`;
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
/* iStar (pink) design — Dashboard. Layout/colours come from the global
   istar-design.css + istar-pages.css (.scard/.stat-grid/.quick-card/.grid2…).
   This scoped block only adds the few interactive bits the prototype implies. */

/* Stat + quick cards: clickable with a subtle hover lift */
.stat-grid .scard,
.quick-row .quick-card {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-grid .scard:hover,
.quick-row .quick-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

/* Peak booking progress bar — Today/Tomorrow cards only.
   Absolutely positioned at the card bottom so it adds NO flow height; the
   card own overflow:hidden + border-radius clip it to the rounded corner. */
.dash-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 6px;
    background: rgba(0, 0, 0, 0.10);
    overflow: hidden;
}

.dash-progress-fill {
    height: 100%;
    width: 0;
    /* width + background come from the inline bookingProgressStyle() */
    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;
}

/* Pulse glow — Approve New Students card when there are pending students */
.pulse {
    animation: dash-pulse 2.4s ease-in-out infinite;
}

.pulse:hover {
    animation: none;
}

@keyframes dash-pulse {
    0%, 100% {
        box-shadow: var(--shadow-sm);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18), 0 8px 22px rgba(245, 158, 11, 0.30);
    }
}

/* Fade transition for the content/state-machine area */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
