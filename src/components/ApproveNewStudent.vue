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
    </v-data-table>
  </template>

<script>
import axios from 'axios'
  export default {
    data () {
      return {
        confirmStudentList: [],
        newStudentList: [],
        dialogConfirmApprove: false,

        newStudentlistHeaders: [
          { title: 'Firstname', key: 'fullname', },
          { title: 'Gender', key: 'gender', align: 'center' },
          { title: 'Date of birth', key: 'dateofbirth', align: 'center' },
          { title: 'Username', key: 'familyid', align: 'center' },
          { title: 'Course Name', key: 'courseid', align: 'center'},
          { title: 'Remaining', key: 'remaining', align: 'left'},
          
        ]
      }
    },
    methods: {
      getNewStudentList() {
        axios.get(this.baseURL+'/getNewStudentList')
        .then(response => {
            console.log('newstudent : ',response)
          this.newStudentList = response.data.results
        })
        .catch(error => {
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
      approveNewStudent() {
        console.log('approveNewStudent : ',this.newStudentList)
        console.log('confirmStudentList : ',this.confirmStudentList)
        axios.post(this.baseURL+'/approveFamilyMember', {
          confirmStudentList: this.confirmStudentList
        })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      }
    },
    created() {
      this.getNewStudentList()
    },
    destroyed(){
        console.log('destroyed...'+new Date())
    },
  }
</script>
