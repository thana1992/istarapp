<template>
    <v-data-table
      v-model="confirmStudentList"
      :items="newStudentList"
      return-object
      :headers="newStudentlistHeaders"
      show-select
      >
      <template v-slot:top>
        <v-toolbar flat>
            <v-toolbar-title>New Student Request</v-toolbar-title>
            <v-dialog v-model="dialogConfirmApprove" persistent width="auto">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-emoticon-plus-outline"></span> Approve</v-btn>
                </template>
                <v-card>
                    <v-card-title></v-card-title>
                    <v-card-text>ยอมรับการเพิ่มเด็กทั้งหมด {{ confirmStudentList.length }} คน ?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmApprove">ตกลง</v-btn>
                  <v-btn color="#F44336" variant="tonal" @click="clickCancelApprove">ยกเลิก</v-btn>
                  <v-spacer></v-spacer>
              </v-card-actions>
              </v-card>
          </v-dialog>
        </v-toolbar>
    </template>
    <template v-slot:no-data> No New Student waiting for approve </template>
    </v-data-table>
  </template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';

  export default {
    data () {
      return {
        confirmStudentList: [],
        newStudentList: [],
        dialogConfirmApprove: false,

        newStudentlistHeaders: [
          { title: 'Firstname', key: 'fullname', },
          { title: 'Gender', key: 'gender', align: 'center' },
          { title: 'Date of birth', key: 'dateofbirthshow', align: 'center' },
          { title: 'Username', key: 'familyid', align: 'center' },
          { title: 'Course Name', key: 'courseid', align: 'center'},
          { title: 'Remaining', key: 'remaining', align: 'left'},
          
        ]
      }
    },
    methods: {
      getNewStudentList() {
        const token = this.$store.getters.getToken;
        axios.get(this.baseURL+'/getNewStudentList',
        { 
            headers:{ Authorization: `Bearer ${token}`, } 
        })
        .then(response => {
          console.log('getNewStudentList res : ',response)
          if(response.data.results.length == 0) {
            this.newStudentList = []
          }else{
            console.log('getNewStudentList res : ',response.data.results)
            const arrObj = this.convertDate(response.data.results)
            this.newStudentList = arrObj
          }
        })
        .catch(error => {
          console.log(error)
        })
      },
      
      approveNewStudent() {
        console.log('approveNewStudent : ',this.newStudentList)
        console.log('confirmStudentList : ',this.confirmStudentList)
        const apprObj = this.convertToSQL(this.confirmStudentList)
        const token = this.$store.getters.getToken;
        axios.post(this.baseURL+'/approveNewStudent', {
          apprObj: apprObj
        },
        { 
            headers:{ Authorization: `Bearer ${token}`, } 
        })
        .then(response => {
          console.log(response)
          this.dialogConfirmApprove = false;
          this.getNewStudentList()
          this.$emit('onSuccessHandler');
          this.$emit('onInfoHandler', response.data.message || 'Approve new student success');
          
        })
        .catch(error => {
          this.dialogConfirmApprove = false;
          this.$emit('onErrorHandler', error.message || 'Approve new student failed');
          console.log(error)
        })
      },

      clickApprove() {
        this.dialogConfirmApprove = true
      },
      clickConfirmApprove() {
        this.dialogConfirmApprove = false
        this.approveNewStudent()
      },
      clickCancelApprove() {
        this.dialogConfirmApprove = false
      },
      convertDate (arrObj) {
        arrObj.forEach(obj => {
          obj.dateofbirthshow = this.format_date(obj.dateofbirth);
        });
        return arrObj;
      },
      convertToSQL (arrObj) {
        arrObj.forEach(obj => {
          obj.dateofbirth = this.SQLDate(obj.dateofbirth);
        });
        return arrObj;
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
    created() {
      this.getNewStudentList()
    },
    computed: {
      ...mapGetters({
          token: 'getToken',
      }),
    }
  }
</script>
