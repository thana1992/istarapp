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
                    <p>{{ person.firstname + ' ' + person.lastname }}</p>
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
                    item-title="classtime"
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
</template>

<script>
import axios from 'axios'
import moment from 'moment'
  export default {
    props: {
        person: {
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
            weekday:['Sunday','Monday','Tuesday','Wednesday','Thrusady','Friday','Saturday']
        }
    },
    mounted() {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate()+1)
        this.date = tomorrow
    },
    methods: {
        selectDate() {
            console.log(this.weekday[this.date.getDay()])
            this.class_time = null
            this.getClassTime()
        },
        async validate() {
            const { valid } = await this.$refs.reserveForm.validate()
            if(!valid) return;
            await this.submitReservation()
            this.$emit('onClickChangeState', this.person)
            
        },
        getClassTime() {
            console.log(this.person.courseid + ', ' +this.weekday[this.date.getDay()])
            axios.post('http://localhost:3000/getClassTime', {
                courseid: this.person.courseid,
                classday: this.weekday[this.date.getDay()]
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
        async submitReservation () {
            let reservaObj = {
                childid: this.person.childid,
                classdate: this.SQLDate(this.date),
                classtime: this.classtimeSelect.classtime,
                classid: this.classtimeSelect.classid,
                courseid: this.person.courseid,
                classday: this.weekday[this.date.getDay()]
            }
            // console.log(obj)
            await axios.post('http://localhost:3000/addReservation', reservaObj)
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Reservation successful')
                    this.$emit('onClickBack', 'reservation')
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Reservation failed')
                }
            })
            .catch(error => {
                console.error(error);
                this.$emit('onErrorHandler', error.message || 'Reservation failed')
            });
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

</style>