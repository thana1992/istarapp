<template>
  <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-account-plus"></span> Reservation</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            
            <div class="d-flex justify-center mb-3">
            <v-form ref="reserveForm">
                <v-row justify="space-around" class="ma-2 pa-2">
                    <p>การจองคลาสของ {{ student.firstname + ' ' + student.lastname }}</p>
                </v-row>
                <v-row justify="space-around" class="ma-2 pa-2">
                        <v-date-picker
                            v-model="date"
                            :min="tomorrow"
                            @click="selectDate"
                        ></v-date-picker>
                </v-row>
                <v-row justify="space-around" class="ma-2 pa-2">
                    <v-select
                    v-model="classtimeSelect"
                    label="Class time"
                    class="ma-2 pa-2"
                    item-title="text"
                    item-value="classid"
                    :items="classtimesData"
                    variant="outlined"
                    :rules="classTimeRules"
                    no-data-text="No class time available"
                    return-object
                    required
                    ></v-select>
                </v-row>
                
                <v-row justify="space-around" class="ma-2 pa-2">
                    <v-btn
                        color="success"
                        class="mt-4"
                        block
                        @click="validate"
                        required
                    >
                        Reserve
                    </v-btn>
                </v-row>
            </v-form>
            </div>
        </div>
    </div>

    <v-dialog
      v-model="questionDialog"
      persistent
      width="auto"
    >
      <v-card>
        <v-card-title class="text-h5">
        </v-card-title>
        <v-card-text>ต้องการจองคลาสสำหรับ {{ student.nickname }} <br> วันที่ {{ format_date(date) }} เวลา {{ classtimeSelect.classtime }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#4CAF50"
            variant="tonal"
            @click="submitReservation"
          >
            แน่นอน จองเลย!
          </v-btn>
          <v-btn
            color="#F44336"
            variant="tonal"
            @click="questionDialog = false"
          >
            เดี๋ยว! ขอคิดก่อน
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import axios from 'axios'
import moment from 'moment'
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
            weekday:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            questionDialog: false,
        }
    },
    mounted() {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate()+1)
        this.date = tomorrow
        this.getClassTime()
    },
    methods: {
        selectDate() {
            console.log(this.weekday[this.date.getDay()])
            this.classtimeSelect = null
            this.getClassTime()
        },
        async validate() {
            let { valid } = await this.$refs.reserveForm.validate()
            if(!valid) return;
            if(this.people.remaining <= 0) {
                this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ จำนวนคลาสของท่านหมดแล้ว T-T')
                return;
            }
            this.questionDialog = true
            //await this.submitReservation()
        },
        getClassTime() {
            let req = {
                classdate: this.SQLDate(this.date),
                classday: this.weekday[this.date.getDay()],
                courseid: this.student.courseid
            }
            console.log("request", req)
            axios.post('http://localhost:3000/getClassTime', req)
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
        async submitReservation () {
            this.questionDialog = false;
            let isDuplicate = false;
            const reservaObj = {
                childid: this.student.childid,
                classdate: this.SQLDate(this.date),
                classtime: this.classtimeSelect.classtime,
                classid: this.classtimeSelect.classid,
                courseid: this.student.courseid,
                classday: this.weekday[this.date.getDay()]
            }
            console.log('checkDuplicateReservation : ' ,reservaObj)

            await axios.post('http://localhost:3000/checkDuplicateReservation', reservaObj)
            .then(response => {
                console.dir(response);
                if (!response.data.success) {
                    this.$emit('onErrorHandler', 'คุณได้จองคลาสในวันที่ '+this.format_date(this.date)+' ไปแล้ว กรุณาเลือกวันอื่น')
                    isDuplicate = true;
                }
            });

            if(!isDuplicate) {
                await axios.post('http://localhost:3000/createReservation', reservaObj)
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
        },
        SQLDate(value){
         if (value) {
           return moment(String(value)).format('YYYYMMDD')
          }
        },
        format_date(value){
         if (value) {
           return moment(String(value)).format('DD/MM/YYYY')
          }
        },
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