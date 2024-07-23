<template>
  <v-div>
  <v-data-table v-model="confirmStudentList" :items="newStudentList" return-object :headers="newStudentlistHeaders"
    show-select :loading="loadingNewStudentList" loading-text="Loading... Please wait">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>New Student Request</v-toolbar-title>
        <v-dialog v-model="dialogConfirmApprove" persistent width="auto">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-emoticon-plus-outline"></span>
              Approve</v-btn>
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
        <v-dialog v-model="dialogStudentNewDelete" persistent width="auto">
          <v-card>
            <v-card-title></v-card-title>
            <v-card-text>ต้องการลบเด็กคนนี้ใช่มั้ย ?</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteStd">ใช่! ลบเลย</v-btn>
              <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteStd">เดี๋ยวก่อน รอแปบ</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.delete="{ item }">
      <v-icon size="large" color="error" @click="clickDeleteNewStudent(item)">mdi-delete-forever</v-icon>
    </template>
    <template v-slot:loading><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
    <template v-slot:no-data> No New Student waiting for approve </template>
  </v-data-table>
</v-div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';
import { TrinityRingsSpinner } from 'epic-spinners'

export default {
  components: {
    TrinityRingsSpinner,
  },
  data() {
    return {
      loadingNewStudentList: false,
      confirmStudentList: [],
      newStudentList: [],
      dialogConfirmApprove: false,
      dialogStudentNewDelete: false,
      studentNewDeleteObj: null,
      newStudentlistHeaders: [
        { title: 'Firstname', key: 'fullname', },
        { title: 'Gender', key: 'gender', align: 'center' },
        { title: 'Date of birth', key: 'dateofbirthshow', align: 'center' },
        { title: 'Username', key: 'username', align: 'center' },
        { title: 'Course Name', key: 'courseid', align: 'center' },
        { title: 'Remaining', key: 'remaining', align: 'left' },
        { title: 'Delete', key: 'delete', align: 'center', sortable: false }
      ]
    }
  },
  methods: {
    async getNewStudentList() {
      this.loadingNewStudentList = true
      const token = this.$store.getters.getToken;
      await axios.get(this.baseURL + '/getNewStudentList',
        {
          headers: { Authorization: `Bearer ${token}`, }
        })
        .then(response => {
          console.log('getNewStudentList res : ', response)
          if (response.data.results.length == 0) {
            this.newStudentList = []
            this.loadingNewStudentList = false
          } else {
            console.log('getNewStudentList res : ', response.data.results)
            const arrObj = this.convertDate(response.data.results)
            this.newStudentList = arrObj
            this.loadingNewStudentList = false
          }
        })
        .catch(error => {
          console.log(error)
        })
    },

    async approveNewStudent() {
      this.$emit('onLoading', true)
      console.log('approveNewStudent : ', this.newStudentList)
      console.log('confirmStudentList : ', this.confirmStudentList)
      const apprObj = this.convertToSQL(this.confirmStudentList)
      const token = this.$store.getters.getToken;
      await axios.post(this.baseURL + '/approveNewStudent', {
        apprObj: apprObj
      },
        {
          headers: { Authorization: `Bearer ${token}`, }
        })
        .then(response => {
          console.log(response)

          this.$emit('onUpdateDataSuccess');
          this.$emit('onInfoHandler', response.data.message || 'Approve new student success');
        })
        .catch(error => {

          this.$emit('onErrorHandler', error.message || 'Approve new student failed');
          console.log(error)
        })

      this.dialogConfirmApprove = false;
      this.confirmStudentList = []
      this.$emit('onLoading', false)
    },
    async deleteNewStudent() {
      this.$emit('onLoading', true)
      console.log('deleteNewStudent : ', this.studentNewDeleteObj)
      const token = this.$store.getters.getToken;
      await axios.post(this.baseURL + '/deleteNewStudent', {
        studentid: this.studentNewDeleteObj.studentid
      },
        {
          headers: { Authorization: `Bearer ${token}`, }
        })
        .then(response => {
          console.log(response)
          this.dialogStudentNewDelete = false;

          this.$emit('onUpdateDataSuccess');
          this.$emit('onInfoHandler', response.data.message || 'Delete new student success');
        })
        .catch(error => {
          this.dialogStudentNewDelete = false;
          this.$emit('onErrorHandler', error.message || 'Delete new student failed');
          console.log(error)
        })
      this.studentNewDeleteObj = null
      this.$emit('onLoading', false)
    },
    async clickConfirmDeleteStd() {
      this.dialogStudentNewDelete = false
      await this.deleteNewStudent()
      await this.getNewStudentList()
    },
    clickCancelDeleteStd() {
      this.studentNewDeleteObj = null
      this.dialogStudentNewDelete = false
    },
    async clickConfirmApprove() {
      this.dialogConfirmApprove = false
      await this.approveNewStudent()
      await this.getNewStudentList()
    },
    clickCancelApprove() {
      this.dialogConfirmApprove = false
    },
    clickDeleteNewStudent(item) {
      this.dialogStudentNewDelete = true
      this.studentNewDeleteObj = item
    },
    convertDate(arrObj) {
      arrObj.forEach(obj => {
        obj.dateofbirthshow = this.format_date(obj.dateofbirth);
      });
      return arrObj;
    },
    convertToSQL(arrObj) {
      arrObj.forEach(obj => {
        obj.dateofbirth = this.SQLDate(obj.dateofbirth);
      });
      return arrObj;
    },
    SQLDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    format_date(value) {
      if (value) {
        return moment(String(value)).format('DD/MM/YYYY')
      }
    },
  },
  async created() {
    this.$emit('onLoading', true)
    await this.getNewStudentList()
    this.$emit('onLoading', false)
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
  },
  watch: {
    // dialogConfirmApprove (val) {
    //   if(this.confirmStudentList.length == 0) {
    //     console.log("check")
    //     this.$emit('onErrorHandler', 'Please select student to approve');
    //     return
    //   }else{
    //     this.dialogConfirmApprove = true
    //   }
    // }
  }
}
</script>
