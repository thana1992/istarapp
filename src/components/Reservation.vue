<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-account-plus"></span> Reservation</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>

            <div class="d-flex justify-center mb-3">
                <v-form ref="reserveForm">
                    <v-row justify="space-around" class="ma-2 pa-2">
                        <p>การจองคลาสของ {{ student.firstname + ' ' + student.lastname }}</p>
                    </v-row>
                    <v-row justify="space-around" class="ma-2 pa-2">
                        <v-date-picker v-model="date" :min="minDate" :allowed-dates="isDateAllowed" @update:month="handleMonthChange" @click="selectDate"></v-date-picker>
                    </v-row>
                    <v-row justify="space-around" class="ma-2 pa-2">
                        <v-select v-model="classtimeSelect" label="Class time" class="ma-2 pa-2" item-title="text"
                            item-value="classid" :items="classtimesData" variant="outlined" :rules="classTimeRules"
                            no-data-text="No class time available" return-object required></v-select>
                    </v-row>

                    <v-row justify="space-around" class="ma-2 pa-2">
                        <v-btn color="success" class="mt-4" block @click="validate" required>
                            Book a class
                        </v-btn>
                    </v-row>
                </v-form>
            </div>
        </div>
    
        <v-dialog v-model="questionDialog" persistent width="auto">
            <v-card>
                <v-card-title class="text-h5">
                </v-card-title>
                <v-card-text><center>ต้องการจองคลาส {{ student.nickname }} <br> {{ format_date(date) }} <br> เวลา {{ classtimeSelect.classtime }}</center></v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" size="large" variant="tonal" @click="submitReservation">
                        แน่นอน จองเลย!
                    </v-btn>
                    <v-btn color="#F44336" size="large" variant="tonal" @click="questionDialog = false">
                        ยกเลิก
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
            people: '',
            classTimeRules: [
                v => !!v || 'Class time is required',
                v => !v || (v.available > 0) || 'ไม่สามารถจองคลาสที่ท่านเลือก' // ตรวจสอบ available
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
            if (this.people.remaining <= 0) {
                this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ จำนวนคลาสของท่านหมดแล้ว T-T')
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
                        this.$emit('onErrorHandler', 'คุณได้จองคลาสในวันที่ ' + this.format_date(this.date) + ' ไปแล้ว กรุณาเลือกวันอื่น')
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
                            this.$emit('onInfoHandler', 'จองคลาสสำเร็จ แล้วพบกัน :)')
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
                return moment(String(value)).format('YYYYMMDD')
            }
        },
        format_date(value) {
            if (value) {
                const userLocale = navigator.language || 'en'; // ดึง locale จากการตั้งค่าของอุปกรณ์
                return moment(String(value)).locale(userLocale).format('dddd D MMMM YYYY');
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
    }

}
</script>

<style>
.v-picker-title,
.v-date-picker-header__content {
    display: none;
}

.v-date-picker-month__day {
    height: auto !important;
}
</style>