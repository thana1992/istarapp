<!-- ============================================================
  Dashboard.vue — NEW DESIGN (single iStar theme)
  Drop-in replacement for src/components/admin/Dashboard.vue
  • <script> = UNCHANGED from the original (kept byte-for-byte): same
    data, API calls (refreshCardDashboard, getBookingListAdmin), child
    component refs (Student / BookingListAdmin / ApproveNewStudent /
    BookingManagement / CustomerCourse / HolidayManagment), quick-action
    methods, stat-card click handlers, vue3-autocounter, v-date-picker.
  • <template> + <style> = new design. Child components keep identical
    refs / props / events so all logic still works.
  Requires: src/assets/istar-design.css imported once globally.
  ============================================================ -->
<template>
  <div class="id-scope dash">
    <!-- header -->
    <div class="dash-head">
      <div class="row" style="gap:14px;min-width:0">
        <div class="dash-ico"><span class="mdi mdi-view-dashboard"></span></div>
        <div>
          <h1 class="id-h1">{{ $t('dashboard.title') }}</h1>
          <p class="dash-sub">{{ $t('dashboard.subtitle') }}</p>
        </div>
      </div>
      <div class="dash-actions">
        <button type="button" class="id-btn id-btn-soft id-btn-sm qa qa-pink" @click="callChildMethodAddNewStudent">
          <span class="mdi mdi-emoticon-plus-outline"></span><span class="qa-label">{{ $t('btn.newStudent') }}</span>
        </button>
        <button type="button" class="id-btn id-btn-soft id-btn-sm qa qa-amber" @click="callChildMethodAddNewCustomerCourse">
          <span class="mdi mdi-book-plus-outline"></span><span class="qa-label">{{ $t('btn.newCourse') }}</span>
        </button>
        <button type="button" class="id-btn id-btn-soft id-btn-sm qa qa-cyan" @click="callChildMethodAddNewBooking">
          <span class="mdi mdi-calendar-plus-outline"></span><span class="qa-label">{{ $t('btn.newBooking') }}</span>
        </button>
        <button type="button" class="id-btn id-btn-soft id-btn-sm qa qa-orange" @click="callChildMethodAddNewHoliday">
          <span class="mdi mdi-door-sliding-lock"></span><span class="qa-label">{{ $t('btn.newHoliday') }}</span>
        </button>
      </div>
    </div>

    <!-- clickable stat cards -->
    <div class="stat-grid">
      <div class="stat-card" @click="onClickCardTotalStudent">
        <div class="stat-accent" style="background:linear-gradient(90deg,#3b82f6,#06b6d4)"></div>
        <div class="stat-top">
          <span class="stat-label">{{ $t('dashboard.totalGymnasts') }}</span>
          <span class="stat-ico" style="background:#dbeafe;color:#2563eb"><span class="mdi mdi-account-group"></span></span>
        </div>
        <div class="stat-value"><vue3-autocounter ref="counter" :startAmount="0" :endAmount="totalStudents" :duration="2" separator="," :autoinit="true" /></div>
        <div class="stat-meta">{{ $t('dashboard.studentsUnit') }}</div>
      </div>

      <div class="stat-card" @click="onClickCardTotalActiveStudent">
        <div class="stat-accent" style="background:linear-gradient(90deg,#10b981,#34d399)"></div>
        <div class="stat-top">
          <span class="stat-label">{{ $t('dashboard.activeGymnasts') }}</span>
          <span class="stat-ico" style="background:#d1fae5;color:#047857"><span class="mdi mdi-account-check"></span></span>
        </div>
        <div class="stat-value"><vue3-autocounter ref="counter" :startAmount="0" :endAmount="totalActiveStudents" :duration="2" separator="," :autoinit="true" /></div>
        <div class="stat-meta">{{ $t('dashboard.studentsUnit') }}</div>
      </div>

      <div class="stat-card" :style="getBookingCardColor(totalBookingToday)" @click="onClickCardToday">
        <div class="stat-accent" style="background:linear-gradient(90deg,#06b6d4,#0284c7)"></div>
        <div class="stat-top">
          <span class="stat-label">{{ $t('dashboard.todayBooking') }}</span>
          <span class="stat-ico" style="background:#cffafe;color:#0e7490"><span class="mdi mdi-calendar-today"></span></span>
        </div>
        <div class="stat-value"><vue3-autocounter ref="counter" :startAmount="0" :endAmount="totalBookingToday" :duration="1.5" separator="," :autoinit="true" /></div>
        <div class="stat-meta">{{ $t('dashboard.bookingsUnit') }}</div>
        <div class="stat-progress" :title="bookingProgressTitle(totalBookingToday, today())"><div class="stat-progress-fill" :style="bookingProgressStyle(totalBookingToday, today())"></div></div>
      </div>

      <div class="stat-card" :style="getBookingCardColor(totalBookingTomorrow)" @click="oncClickCardTomorrow">
        <div class="stat-accent" style="background:linear-gradient(90deg,#8b5cf6,#6366f1)"></div>
        <div class="stat-top">
          <span class="stat-label">{{ $t('dashboard.tomorrowBooking') }}</span>
          <span class="stat-ico" style="background:#ede9fe;color:#7c3aed"><span class="mdi mdi-calendar-arrow-right"></span></span>
        </div>
        <div class="stat-value"><vue3-autocounter ref="counter" :startAmount="0" :endAmount="totalBookingTomorrow" :duration="1.5" separator="," :autoinit="true" /></div>
        <div class="stat-meta">{{ $t('dashboard.bookingsUnit') }}</div>
        <div class="stat-progress" :title="bookingProgressTitle(totalBookingTomorrow, tomorrow())"><div class="stat-progress-fill" :style="bookingProgressStyle(totalBookingTomorrow, tomorrow())"></div></div>
      </div>

      <div class="stat-card" :class="pulse" @click="onClickCardNewStudent">
        <div class="stat-accent" style="background:linear-gradient(90deg,#f59e0b,#f97316)"></div>
        <div class="stat-top">
          <span class="stat-label">{{ $t('approve.title') }}</span>
          <span class="stat-ico" style="background:#fef3c7;color:#b45309"><span class="mdi mdi-account-multiple-check"></span></span>
        </div>
        <div class="stat-value"><vue3-autocounter ref="counter" :startAmount="0" :endAmount="totalWaitingNewStudents" :duration="1.5" separator="," :autoinit="true" /></div>
        <div class="stat-meta">{{ $t('dashboard.studentsUnit') }}</div>
      </div>
    </div>

    <!-- calendar + content -->
    <div class="dash-content">
      <div class="id-card cal-card">
        <div class="cal-head"><span class="mdi mdi-calendar-month-outline"></span> {{ $t('bookingMgmt.viewByDate') }}</div>
        <v-date-picker class="datepick" v-model="datepick" @update:model-value="selectDate" width="100%"></v-date-picker>
      </div>

      <div class="id-card content-card">
        <Transition name="fade" mode="out-in">
          <div v-show="state == 'studentlist'">
            <Student @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
              @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
              @onLoading="onLoading($event)" ref="StudentComponent"></Student>
          </div>
        </Transition>
        <Transition name="fade" mode="out-in">
          <div v-show="state == 'approvenewstudent'">
            <ApproveNewStudent @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
              @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
              @onLoading="onLoading($event)"></ApproveNewStudent>
          </div>
        </Transition>
        <Transition name="fade" mode="out-in">
          <div v-show="state == 'bookinglist'">
            <BookingListAdmin @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
              @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
              @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders"
              @student-clicked="onStudentClicked($event)"
              :bookingData="bookingList" :classdate="datepick" :loadingBooking="loadingBooking"></BookingListAdmin>
          </div>
        </Transition>
        <Transition name="fade" mode="out-in">
          <div v-show="state == 'customercourse'">
            <CustomerCourse @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
              @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
              @onLoading="onLoading($event)" ref="CustomerCourseComponent"></CustomerCourse>
          </div>
        </Transition>
        <Transition name="fade" mode="out-in">
          <div v-show="state == 'holidaymanagment'">
            <HolidayManagment @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
              @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
              @onLoading="onLoading($event)" ref="HolidayManagmentComponent"></HolidayManagment>
          </div>
        </Transition>
        <BookingManagement v-show="false" @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
          @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
          @onLoading="onLoading($event)" ref="BookingManagementComponent"></BookingManagement>
      </div>
    </div>

    <!-- dialogs -->
    <v-dialog width="460" v-model="errorDialog">
      <div class="id-card id-card-pad">
        <div class="row" style="gap:10px;margin-bottom:10px"><span class="mdi mdi-alert-circle" style="font-size:28px;color:var(--c-error)"></span><div class="id-h2">{{ $t('dialog.error') }}</div></div>
        <div style="color:var(--c-text-body);margin-bottom:16px">{{ errorMsg }}</div>
        <button class="id-btn id-btn-primary id-btn-sm" style="width:100%" @click="errorDialog = false">{{ $t('btn.close') }}</button>
      </div>
    </v-dialog>
    <v-dialog width="460" v-model="infoDialog">
      <div class="id-card id-card-pad">
        <div class="row" style="gap:10px;margin-bottom:10px"><span class="mdi mdi-check-circle" style="font-size:28px;color:var(--c-success)"></span><div class="id-h2">{{ $t('dialog.success') }}</div></div>
        <div style="color:var(--c-text-body);margin-bottom:16px">{{ infoMsg }}</div>
        <button class="id-btn id-btn-primary id-btn-sm" style="width:100%" @click="infoDialog = false">{{ $t('btn.ok') }}</button>
      </div>
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
            let days = Math.floor((totalDays % 365.25) % 30.4375);
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
.dash { padding: 4px; }
.dash-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 6px; }
.dash-ico { width: 46px; height: 46px; min-width: 46px; border-radius: 14px; display: grid; place-items: center;
  background: var(--c-primary); color: #fff; box-shadow: var(--shadow-sm); }
.dash-ico .mdi { font-size: 24px; }
.dash-sub { font-size: 13px; color: var(--c-text-muted); margin: 2px 0 0; }
.dash-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.qa .mdi { font-size: 18px; }
.qa-pink { color: #be185d; } .qa-amber { color: #b45309; } .qa-cyan { color: #0e7490; } .qa-orange { color: #c2410c; }

.stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin: 14px 0; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-card { position: relative; overflow: hidden; background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 16px 16px 18px; cursor: pointer; min-height: 120px;
  transition: transform .15s var(--ease), box-shadow .15s var(--ease); }
.stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.stat-accent { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.stat-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.stat-ico { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; }
.stat-ico .mdi { font-size: 20px; }
.stat-label { font-size: 12px; font-weight: 600; color: var(--c-text-muted); }
.stat-value { font-family: var(--font-head); font-weight: 800; font-size: 30px; color: var(--c-text-heading); line-height: 1; margin: 10px 0 6px; }
.stat-meta { font-size: 12px; color: var(--c-text-muted); }
.stat-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: rgba(0,0,0,.08); }
.stat-progress-fill { height: 100%; width: 0; transition: width .7s var(--ease), background .4s ease; }
.pulse { animation: dash-pulse 2.4s ease-in-out infinite; }
.pulse:hover { animation: none; }
@keyframes dash-pulse {
  0%,100% { box-shadow: var(--shadow-sm); }
  50% { box-shadow: 0 0 0 4px rgba(245,158,11,.18), var(--shadow-md); }
}

.dash-content { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }
@media (max-width: 960px) { .dash-content { grid-template-columns: 1fr; } }
.cal-card { padding: 14px; }
.cal-head { display: flex; align-items: center; gap: 8px; font-family: var(--font-head); font-weight: 700;
  color: var(--c-text-heading); margin-bottom: 8px; }
.cal-head .mdi { color: var(--c-primary); font-size: 18px; }
.content-card { padding: 14px; min-height: 520px; }

:deep(.datepick), :deep(.v-date-picker) { background: transparent !important; box-shadow: none !important; width: 100% !important; }
:deep(.v-date-picker__header), :deep(.v-date-picker-controls), :deep(.v-date-picker-month) { background: transparent !important; }

.fade-enter-active, .fade-leave-active { transition: opacity .35s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
