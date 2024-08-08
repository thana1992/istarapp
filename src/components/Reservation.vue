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
                        <v-date-picker v-model="date" :min="tomorrow" :allowed-dates="isDateAllowed" @click="selectDate"></v-date-picker>
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
                <v-card-text>ต้องการจองคลาสสำหรับ {{ student.nickname }} <br> วันที่ {{ format_date(date) }} เวลา {{
                                classtimeSelect.classtime }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="submitReservation">
                        แน่นอน จองเลย!
                    </v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="questionDialog = false">
                        เดี๋ยว! ขอคิดก่อน
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
            date: new Date(),
            tomorrow: new Date(),
            classtimeSelect: null,
            classtimesData: [],
            people: '',
            classTimeRules: [
                v => !!v || 'Class time is required',
            ],
            //weekday:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            questionDialog: false,
            holidays: [],
        }
    },
    async created() {
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
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.dir(response);
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
    async mounted() {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate() + 1)
        this.date = tomorrow
        await this.fetchHolidays();
        this.getClassTime()
    },
    methods: {
        selectDate() {
            //console.log(new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' }))
            this.classtimeSelect = null
            this.getClassTime()
        },
        isDateAllowed(date) {
            const isMonday = moment(date).day() === 1;  // ตรวจสอบว่าวันที่นั้นเป็นวันจันทร์หรือไม่
        const isHoliday = this.holidays.some(holiday => moment(date).isSame(holiday, 'day')); // ตรวจสอบว่าวันที่เป็นวันหยุดหรือไม่

        return !isMonday && !isHoliday;
        },
        async fetchHolidays() {
            try {
                const token = this.$store.getters.getToken;
                const response = await axios.get(this.baseURL + '/getHolidays', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                console.dir(response);
                if (response.data.success) {
                    this.holidays = response.data.holidays.map(date => moment(date).startOf('day'));
                    
                } else {
                    //console.error('Failed to fetch holidays:', response.data.message);
                    this.$emit('onErrorHandler', response.data.message)
                }
            } catch (error) {
                //console.error('Error fetching holidays:', error);
                this.$emit('onErrorHandler', error.message)
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
        getClassTime() {
            let req = {
                classdate: this.SQLDate(this.date),
                //classday: this.weekday[this.date.getDay()],
                classday: new Date(this.date).toLocaleDateString('en-US', { weekday: 'long' }),
                courseid: this.student.courseid
            }
            //console.log("request", req)
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL + '/getClassTime', req, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        const data = response.data.results
                        if (data.length == 0) {
                            this.classtimesData = []
                        } else {
                            this.classtimesData = data;
                        }
                    } else {
                        this.classtimesData = []
                    }
                })
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
            console.log('checkDuplicateReservation : ', reservaObj)
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/checkDuplicateReservation', reservaObj, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    console.dir(response);
                    if (!response.data.success) {
                        this.$emit('onErrorHandler', 'คุณได้จองคลาสในวันที่ ' + this.format_date(this.date) + ' ไปแล้ว กรุณาเลือกวันอื่น')
                        isDuplicate = true;
                    }
                });

            if (!isDuplicate) {
                const token = this.$store.getters.getToken;
                await axios.post(this.baseURL + '/createReservation', reservaObj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(response => {
                        console.dir(response);
                        if (response.data.success) {
                            this.$emit('onInfoHandler', 'จองคลาสสำเร็จ แล้วพบกัน :)')
                            this.$emit('onSuccessHandler', 'home')
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'Reservation failed')
                        }
                    })
                    .catch(error => {
                        console.error(error);
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
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
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