<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-calendar-plus"></span></div>
            <div>
                <div class="id-h1">{{ $t('reservation.title') }}</div>
                <div class="pg-sub">เลือกวันที่ก่อน แล้วจึงเลือกรอบเวลา</div>
            </div>
        </div>

        <v-form ref="reserveForm">
            <div class="grid2 grid2-booking">
                <!-- STEP 1 — pick a date -->
                <div class="scard" style="padding:18px;max-width:340px;width:100%;align-self:start">
                    <div class="step-head"><span class="step-num">1</span> เลือกวันที่</div>
                    <id-calendar
                        :model-value="date ? (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()) : ''"
                        :holiday-keys="holidays.map(h => h.year() + '-' + (h.month() + 1) + '-' + h.date())"
                        :min-date="minBookDate"
                        @update:model-value="key => { const p = key.split('-'); date = new Date(+p[0], +p[1] - 1, +p[2]); selectDate(); }">
                    </id-calendar>
                </div>

                <!-- STEP 2 — pick a time slot -->
                <div class="scard" style="padding:18px;align-self:start">
                    <div class="step-head" :class="{ 'is-muted': !date }"><span class="step-num">2</span> เลือกรอบเวลา</div>

                    <div class="reserve-datebar" style="margin-top:-2px">
                        <span class="mdi mdi-account-child-circle"></span>
                        <b>{{ $t('reservation.bookingFor', { name: student.firstname + ' ' + student.lastname }) }}</b>
                    </div>

                    <div v-if="!date" class="reserve-empty">
                        <span class="mdi mdi-calendar-cursor"></span>
                        <div>กรุณาเลือกวันที่ทางซ้ายก่อน<br />จึงจะเลือกรอบเวลาเรียนได้</div>
                    </div>
                    <div v-else>
                        <div class="reserve-datebar">
                            <span class="mdi mdi-calendar-check"></span> รอบเวลาของ <b>{{ format_date(date) }}</b>
                            <v-progress-circular v-if="loadingSlots" indeterminate size="16" width="2" color="primary" style="margin-left:8px"></v-progress-circular>
                        </div>
                        <!-- loading: skeleton placeholders so the user sees data being re-fetched -->
                        <div v-if="loadingSlots" class="cards3" style="grid-template-columns:1fr">
                            <div v-for="i in 2" :key="'sk' + i" class="scard" style="padding:16px">
                                <div class="id-skel" style="height:22px;width:52%;margin-bottom:14px"></div>
                                <div class="id-skel" style="height:13px;width:38%;margin-bottom:16px"></div>
                                <div class="id-skel" style="height:42px"></div>
                            </div>
                        </div>
                        <div v-else-if="!classtimesData.length" class="reserve-empty">
                            <span class="mdi mdi-clock-alert-outline"></span>
                            <div>{{ $t('reservation.noClassTime') }}</div>
                        </div>
                        <div v-else class="cards3 id-fade-in" :key="SQLDate(date)" style="grid-template-columns:1fr">
                            <div v-for="s in classtimesData" :key="s.classid" class="scard" style="padding:16px">
                                <div class="row" style="gap:8px;margin-bottom:8px">
                                    <span class="mdi mdi-clock-outline" style="color:var(--c-primary);font-size:20px"></span>
                                    <span class="strong" style="font-size:18px">{{ s.classtime }}</span>
                                    <div style="flex:1"></div>
                                    <span class="badge" :class="s.available <= 0 ? 'badge-error' : 'badge-success'">{{ s.available <= 0 ? 'เต็มแล้ว' : ('ว่าง ' + s.available) }}</span>
                                </div>
                                <div class="t-cap" style="margin-bottom:14px">{{ s.text }}</div>
                                <button type="button" class="id-btn" :class="s.available <= 0 ? 'id-btn-ghost' : 'id-btn-primary'"
                                    style="width:100%" :disabled="s.available <= 0"
                                    @click="classtimeSelect = s; validate()">
                                    <span class="mdi" :class="s.available <= 0 ? 'mdi-calendar-remove' : 'mdi-star-shooting'"></span>
                                    {{ s.available <= 0 ? 'เต็มแล้ว' : 'จองรอบนี้' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </v-form>

        <id-modal v-model="questionDialog" size="sm" icon="mdi-calendar-check" :title="$t('reservation.title')" persistent>
            <p style="margin:0;text-align:center">{{ $t('reservation.confirmBooking', { name: student.nickname, date: format_date(date), time: classtimeSelect.classtime }) }}</p>
            <template #footer>
                <button class="id-btn id-btn-ghost" @click="questionDialog = false">{{ $t('btn.cancel') }}</button>
                <button class="id-btn id-btn-primary" @click="submitReservation">
                    <span class="mdi mdi-check"></span> {{ $t('reservation.confirmBtn') }}</button>
            </template>
        </id-modal>
    </div>

</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';
export default {
    props: {
        student: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            date: null,
            minDate: null,
            previousMonth: new Date().getMonth(),
            previousYear: new Date().getFullYear(),
            classtimeSelect: null,
            classtimesData: [],
            loadingSlots: false,
            people: '',
            classTimeRules: [
                v => !!v || this.$t('common.required'),
                v => !v || (v.available > 0) || this.$t('home.errorNoRemaining')
            ],
            //weekday:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            questionDialog: false,
            holidays: [],
        }
    },
    async created() {
        await this.fetchHolidays();
        this.date = new Date();
        this.date.setDate(this.date.getDate() + 1);
        this.minDate = new Date();        
        await this.getHolidayInformation();
        await this.getClassTime();
    },
    methods: {
        async selectDate() {
            this.classtimeSelect = null;
            await this.getClassTime();
        },
        handleMonthChange(newDate) {
            //console.log("handleMonthChange", newDate);
            const newMonth = new Date(newDate).getMonth();
            const newYear = new Date(newDate).getFullYear();

            // ตรวจสอบเดือนและปีที่เลือกใหม่
            if (newMonth !== this.previousMonth || newYear !== this.previousYear) {
                // หากเดือนหรือปีเปลี่ยนแปลง ให้เรียก API
                this.getHolidayInformation();
                
                // อัปเดตค่าของเดือนและปี
                this.previousMonth = newMonth;
                this.previousYear = newYear;
            }
        },
        isDateAllowed(date) {
            const isMonday = moment(date).day() === 1;  // ตรวจสอบว่าวันที่นั้นเป็นวันจันทร์หรือไม่
            const isHoliday = this.holidays.some(holiday => moment(date).isSame(holiday, 'day')); // ตรวจสอบว่าวันที่เป็นวันหยุดหรือไม่
            //console.log('Checking date:', moment(date).format('YYYY-MM-DD'), 'isMonday:', isMonday, 'isHoliday:', isHoliday);
            return !isMonday && !isHoliday;
        },
        async fetchHolidays() {
            try {
                const token = this.$store.getters.getToken;
                const response = await axios.get(this.baseURL + '/holidaysList', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    this.holidays = response.data.holidays.map(date => moment(date).startOf('day'));
                } else {
                    this.$emit('onErrorHandler', response.data.message);
                }
            } catch (error) {
                this.$emit('onErrorHandler', error.message);
            }
        },
        async validate() {
            let { valid } = await this.$refs.reserveForm.validate()
            if (!valid) return;
            // hard guard: customers cannot book the past or today (calendar already
            // disables those, but block here too in case date is set another way)
            if (!this.date || this.date < this.minBookDate) {
                this.$emit('onErrorHandler', 'จองได้ตั้งแต่พรุ่งนี้เป็นต้นไป')
                return;
            }
            if (this.people.remaining <= 0) {
                this.$emit('onErrorHandler', this.$t('msg.noRemaining'))
                return;
            }
            this.questionDialog = true
            //await this.submitReservation()
        },
        async getClassTime() {
            const req = {
                classdate: this.SQLDate(this.date),
                classday: new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' }),
                courseid: this.student.courseid
            };

            this.loadingSlots = true;
            const t0 = Date.now();
            const token = this.$store.getters.getToken;
            try {
                const response = await axios.post(this.baseURL + '/getClassTime', req, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    this.classtimesData = response.data.results.length ? response.data.results : [];
                } else {
                    this.classtimesData = [];
                }
            } catch (error) {
                this.$emit('onErrorHandler', error.message);
            } finally {
                await this.$minLoad(t0);
                this.loadingSlots = false;
            }
        },
        async getHolidayInformation() {
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/getHolidayInformation', {
                selectdate: this.SQLDate(this.date),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                })
                .then(response => {
                    console.dir(response);
                    
                })
        },
        getNextAvailableDate(date) {
            let nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1); // เริ่มจากวันพรุ่งนี้
            while (this.isHoliday(nextDate) || moment(nextDate).day() === 1) { // ตรวจสอบวันหยุดและวันจันทร์
                nextDate.setDate(nextDate.getDate() + 1);
            }
            return nextDate;
        },
        isHoliday(date) {
            return this.holidays.some(holiday => moment(date).isSame(holiday, 'day'));
        },
        async submitReservation() {
            this.$emit('onLoading', true)
            this.questionDialog = false;
            let isDuplicate = false;
            const reservaObj = {
                studentid: this.student.studentid,
                classdate: this.SQLDate(this.date),
                classtime: this.classtimeSelect.classtime,
                classid: this.classtimeSelect.classid,
                courseid: this.student.courseid,
                classday: new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' }),
                studentname: this.student.firstname + ' ' + this.student.lastname,
                studentnickname: this.student.nickname,
            }
            //console.log('checkDuplicateReservation : ', reservaObj)
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/checkDuplicateReservation', reservaObj, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    //console.dir(response);
                    if (!response.data.success) {
                        this.$emit('onErrorHandler', this.$t('msg.bookingDuplicate', { date: this.format_date(this.date) }))
                        isDuplicate = true;
                    }
                });

            if (!isDuplicate) {
                const token = this.$store.getters.getToken;
                await axios.post(this.baseURL + '/addBookingByCustomer', reservaObj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(response => {
                        //console.dir(response);
                        if (response.data.success) {
                            this.$emit('onInfoHandler', this.$t('msg.bookingSuccess'))
                            this.$emit('onSuccessHandler', 'home')
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'Reservation failed')
                        }
                    })
                    .catch(error => {
                        //console.error(error);
                        this.$emit('onErrorHandler', error.message || 'Reservation failed')
                    });
            }
            this.$emit('onClickChangeState', this.student)
            this.$emit('onLoading', false)
        },
        SQLDate(value) {
            if (value) {
                return moment(value).format('YYYYMMDD')
            }
        },
        format_date(value) {
            if (value) {
                const userLocale = navigator.language || 'en'; // ดึง locale จากการตั้งค่าของอุปกรณ์
                return moment(value).locale(userLocale).format('dddd D MMMM YYYY');
            }
        },
        
    },
    watch: {
        date(newDate) {
            if (this.isHoliday(newDate) || moment(newDate).day() === 1) {
                this.date = this.getNextAvailableDate(newDate);
            }
        }
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        // customers may only book from TOMORROW onward — the past and today are blocked
        minBookDate() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(0, 0, 0, 0);
            return d;
        },
    }

}
</script>