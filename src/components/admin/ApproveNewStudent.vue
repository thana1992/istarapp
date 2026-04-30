<template>
  <v-div>
  <v-data-table v-model="confirmStudentList" :items="newStudentList" return-object :headers="newStudentlistHeaders"
    show-select :loading="loadingNewStudentList" loading-text="Loading... Please wait">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('approve.title') }}</v-toolbar-title>
        <!-- ปุ่ม Approve ที่คุณคุมเอง -->
<v-btn color="primary" dark @click="openConfirmApprove">
  <span class="mdi mdi-emoticon-plus-outline"></span> {{ $t('btn.approve') }}
</v-btn>

<!-- v-dialog ไม่ต้องมี activator slot -->
<v-dialog v-model="dialogConfirmApprove" persistent width="auto">
  <v-card>
    <v-card-title></v-card-title>
    <v-card-text>{{ $t('approve.confirmApprove', { count: confirmStudentList.length }) }}</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmApprove">{{ $t('btn.ok') }}</v-btn>
      <v-btn color="#F44336" variant="tonal" @click="clickCancelApprove">{{ $t('btn.cancel') }}</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</v-dialog>
        <v-dialog v-model="dialogStudentNewDelete" persistent width="auto">
          <v-card>
            <v-card-title></v-card-title>
            <v-card-text>{{ $t('approve.confirmDelete') }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteStd">{{ $t('btn.ok') }}</v-btn>
              <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteStd">{{ $t('btn.cancel') }}</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.dateofbirth="{ item }">
                {{ calculateAge(item.dateofbirth).text }}
            </template>
    <template v-slot:item.delete="{ item }">
      <v-icon size="large" color="error" @click="clickDeleteNewStudent(item)">mdi-delete-forever</v-icon>
    </template>
    <template v-slot:loading><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
    <template v-slot:no-data> {{ $t('approve.noData') }} </template>
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
      newStudentlistHeadersData: []
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
          //console.log('getNewStudentList res : ', response)
          if (response.data.results.length == 0) {
            this.newStudentList = []
            this.loadingNewStudentList = false
          } else {
            //console.log('getNewStudentList res : ', response.data.results)
            this.newStudentList = response.data.results
            this.loadingNewStudentList = false
          }
        })
        .catch(error => {
          //console.log(error)
        })
    },

    async approveNewStudent() {
      this.$emit('onLoading', true)
      //console.log('approveNewStudent : ', this.newStudentList)
      //console.log('confirmStudentList : ', this.confirmStudentList)
      const apprObj = this.confirmStudentList
      const token = this.$store.getters.getToken;
      await axios.post(this.baseURL + '/approveNewStudent', {
        apprObj: apprObj
      },
        {
          headers: { Authorization: `Bearer ${token}`, }
        })
        .then(response => {
          //console.log(response)

          this.$emit('onUpdateDataSuccess');
          this.$emit('onInfoHandler', response.data.message || 'Approve new student success');
        })
        .catch(error => {

          this.$emit('onErrorHandler', error.message || 'Approve new student failed');
          //console.log(error)
        })

      this.dialogConfirmApprove = false;
      this.confirmStudentList = []
      this.$emit('onLoading', false)
    },
    async deleteNewStudent() {
      this.$emit('onLoading', true)
      //console.log('deleteNewStudent : ', this.studentNewDeleteObj)
      const token = this.$store.getters.getToken;
      await axios.post(this.baseURL + '/deleteStudent', {
        familyid: this.studentNewDeleteObj.familyid,
        studentid: this.studentNewDeleteObj.studentid,
        journal: "1"
      },
        {
          headers: { Authorization: `Bearer ${token}`, }
        })
        .then(response => {
          //console.log(response)
          this.dialogStudentNewDelete = false;

          this.$emit('onUpdateDataSuccess');
          this.$emit('onInfoHandler', response.data.message || 'Delete new student success');
        })
        .catch(error => {
          this.dialogStudentNewDelete = false;
          this.$emit('onErrorHandler', error.message || 'Delete new student failed');
          //console.log(error)
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
    calculateAge(birthDate) {
      if (!birthDate) return { text: "", int: 0 };

      const currentDate = new Date();
      if (new Date(birthDate) > currentDate) {
          this.birthDate = null;
          this.years = null;
          this.months = null;
          this.days = null;
          alert("Invalid Date of Birth");
      }

      const diffTime = currentDate - new Date(birthDate);
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let years = Math.floor(totalDays / 365.25);
      let months = Math.floor((totalDays % 365.25) / 30.4375);
      let days = Math.floor((totalDays % 365.25) % 30.4375);
      return {
          text : years + " " + this.$t('table.yearAbbr') + " " + months + " " + this.$t('table.monthAbbr'),
          int : years+'.'+months
      }
    },
    openConfirmApprove() {
      if (this.confirmStudentList.length === 0) {
        this.$emit('onErrorHandler', this.$t('approve.selectAtLeastOne'));
        return;
      }
      this.dialogConfirmApprove = true;
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
    newStudentlistHeaders() {
      return [
        { title: this.$t('table.name'), key: 'fullname' },
        { title: this.$t('table.gender'), key: 'gender', align: 'left' },
        { title: this.$t('table.age'), key: 'dateofbirth', align: 'left' },
        { title: this.$t('table.school'), key: 'school', align: 'left' },
        { title: this.$t('table.parentUsername'), key: 'username', align: 'center' },
        { title: this.$t('table.phone'), key: 'mobileno', align: 'center' },
        { title: this.$t('table.delete'), key: 'delete', align: 'center', sortable: false },
      ]
    },
  },
}
</script>
