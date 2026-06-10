<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-account-clock"></span></div>
      <div>
        <div class="id-h1">{{ $t('approve.title') }}</div>
        <div class="pg-sub">รายการรอตรวจสอบ</div>
      </div>
    </div>

    <div class="scard" style="padding:0">
      <div v-if="newStudentList.length === 0" style="padding:24px 18px;color:var(--c-muted);text-align:center">
        {{ $t('approve.noData') }}
      </div>
      <div v-for="(p, i) in newStudentList" :key="i" class="row"
        style="justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--c-border)">
        <div class="row" style="gap:12px">
          <span class="tt-avatar" style="width:44px;height:44px;background:var(--c-primary)">{{ (p.fullname || '?').charAt(0) }}</span>
          <div class="col" style="gap:1px">
            <span class="strong" style="font-size:16px">{{ p.fullname }}</span>
            <span class="t-cap">{{ p.gender }} · {{ calculateAge(p.dateofbirth).text }} · {{ p.school }} · {{ p.username }} · {{ p.mobileno }}</span>
          </div>
        </div>
        <div class="row" style="gap:8px">
          <button class="id-btn id-btn-success id-btn-sm" @click="confirmStudentList = [p]; openConfirmApprove()"><span class="mdi mdi-check"></span> อนุมัติ</button>
          <button class="id-btn id-btn-ghost id-btn-sm" @click="clickDeleteNewStudent(p)">ปฏิเสธ</button>
        </div>
      </div>
    </div>

    <!-- v-dialog ไม่ต้องมี activator slot -->
    <id-modal v-model="dialogConfirmApprove" size="sm" icon="mdi-account-check-outline" :title="$t('btn.confirm')" persistent>
      <p style="margin:0">{{ $t('approve.confirmApprove', { count: confirmStudentList.length }) }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="clickCancelApprove">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" @click="clickConfirmApprove"><span class="mdi mdi-check"></span> {{ $t('btn.ok') }}</button>
      </template>
    </id-modal>
    <id-modal v-model="dialogStudentNewDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
      <p style="margin:0">{{ $t('approve.confirmDelete') }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="clickCancelDeleteStd">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="clickConfirmDeleteStd"><span class="mdi mdi-delete"></span> {{ $t('btn.ok') }}</button>
      </template>
    </id-modal>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';

export default {
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
        .catch(() => {
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
          this.$emit('onInfoHandler', response.data.message || this.$t('msg.studentApproved'));
        })
        .catch(error => {

          this.$emit('onErrorHandler', error.message || this.$t('msg.approveFail'));
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
          this.$emit('onInfoHandler', response.data.message || this.$t('msg.studentDeleted'));
        })
        .catch(error => {
          this.dialogStudentNewDelete = false;
          this.$emit('onErrorHandler', error.message || this.$t('msg.studentDeleteFail'));
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
        return moment(value).format('DD/MM/YYYY')
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
          alert(this.$t("common.invalidDob"));
      }

      const diffTime = currentDate - new Date(birthDate);
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let years = Math.floor(totalDays / 365.25);
      let months = Math.floor((totalDays % 365.25) / 30.4375);
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
