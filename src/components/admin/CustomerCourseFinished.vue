<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-clipboard-text-clock"></span></div>
      <div>
        <div class="id-h1">{{ $t('courseHistory.title') }}</div>
        <div class="pg-sub">{{ $t('courseHistory.ourCourses') }}</div>
      </div>
    </div>

    <!-- server-side search + pagination preserved (getCustomerCourseList / tableOptions / totalItems / search watcher) -->
    <div class="grid-toolbar">
      <label class="grid-search"><span class="mdi mdi-magnify"></span>
        <input class="id-input" v-model="search" :placeholder="$t('btn.search')" /></label>
      <id-select class="grid-filter" v-model="filterCoursetype" placeholder="ประเภททั้งหมด" @update:model-value="applyFilter"
        :options="[{ value: '', label: 'ประเภททั้งหมด' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Limited', label: 'Limited' }]"></id-select>
      <span class="grid-spacer"></span>
      <button class="id-btn id-btn-sm" @click="initialize"><span class="mdi mdi-refresh"></span> {{ $t('btn.refresh') }}</button>
    </div>
    <div class="scard" style="padding:14px">
      <div style="overflow-x:auto">
        <table class="idt">
          <thead>
            <tr>
              <th v-for="h in headers" :key="h.key" :class="{ 'idt-action': ['view', 'edit', 'delete', 'finish'].includes(h.key) }" :style="{ textAlign: (h.align === 'center' || h.align === 'end') ? 'center' : 'left' }">{{ h.title }}</th>
            </tr>
          </thead>
          <tbody v-if="loadingCustomerCourse" class="id-fade-in" key="sk">
            <tr v-for="i in 6" :key="'sk' + i">
              <td v-for="h in headers" :key="h.key"><div class="id-skel" style="height:18px"></div></td>
            </tr>
          </tbody>
          <tbody v-else class="id-fade-in" :key="tableOptions.page">
            <tr v-for="item in courselist" :key="item.courserefer">
              <td v-for="h in headers" :key="h.key" :class="{ 'idt-action': ['view', 'edit', 'delete', 'finish'].includes(h.key) }" :style="{ textAlign: (h.align === 'center' || h.align === 'end') ? 'center' : 'left' }">
                <template v-if="h.key === 'courserefer'"><span class="id-copy">{{ item.courserefer }}<span class="mdi mdi-content-copy id-copy-btn" :title="$t('btn.copy')" @click="copyToClipboard(item.courserefer)"></span></span></template>
                <template v-else-if="h.key === 'startdate'">{{ format_date(item.startdate) }}</template>
                <template v-else-if="h.key === 'expiredate'"><span :style="{ color: (item.expiredate != null && isExpiredDate(item.expiredate)) ? 'var(--c-error)' : '' }">{{ expireDateLeft(item.expiredate) }}</span></template>
                <template v-else-if="h.key === 'remaining'">
                  <span v-if="item.coursetype === 'Monthly'" class="badge badge-primary">{{ $t('home.monthly') }}</span>
                  <span v-else-if="item.remaining !== null && item.remaining !== ''" class="badge badge-primary">{{ item.remaining }} {{ $t('common.times') }}</span>
                  <span v-else>-</span>
                </template>
                <template v-else-if="h.key === 'paid'">
                  <span v-if="item.paid == 1" class="badge badge-success">{{ $t('customerCourse.paid') }}</span>
                  <span v-else class="badge badge-error">{{ $t('customerCourse.unpaid') }}</span>
                </template>
                <template v-else-if="h.key === 'view'"><span class="mdi mdi-eye" style="color:var(--c-info);cursor:pointer;font-size:20px" @click="editItem(item)"></span></template>
                <template v-else>{{ item[h.key] }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loadingCustomerCourse && courselist.length === 0" class="grid-empty"><span class="mdi mdi-book-off-outline"></span>{{ $t('customerCourse.noCourseList') }}</div>
      <id-grid-footer v-if="totalItems > 0"
        :page="tableOptions.page"
        :page-count="Math.max(1, Math.ceil(totalItems / tableOptions.itemsPerPage))"
        :per-page="tableOptions.itemsPerPage" :total="totalItems"
        @update:page="(p) => { tableOptions.page = p; getCustomerCourseList(true); }"
        @update:per-page="(n) => { tableOptions.itemsPerPage = n; tableOptions.page = 1; getCustomerCourseList(true); }" />
    </div>

    <id-modal v-model="dialog" size="lg" icon="mdi-book-check-outline" :title="formTitle">
      <div class="modal-sec"><span class="mdi mdi-book-open-variant"></span> {{ $t('courseHistory.courseInfo') }}</div>
      <div class="t-cap" style="margin-bottom:12px">{{ $t('table.courseRefer') }} : <b>{{ editedItem.courserefer }}</b><template v-if="editedItem.course_user"> · {{ editedItem.course_user }}</template></div>
      <div class="form-grid-3">
        <div class="field"><label>{{ $t('table.courseName') }}</label>
          <input class="id-input" :value="editedItem.coursename || (editedItem.course && editedItem.course.coursename)" disabled></div>
        <div class="field"><label>{{ $t('table.courseType') }}</label><input class="id-input" :value="editedItem.coursetype" disabled></div>
        <div class="field"><label>{{ $t('customerCourse.period') }}</label><input class="id-input" :value="editedItem.period" disabled></div>
      </div>
      <div class="form-grid-3" style="margin-top:14px">
        <div class="field"><label>{{ $t('table.remaining') }}</label><input class="id-input" :value="editedItem.remaining" disabled></div>
        <div class="field"><label>{{ $t('table.startDate') }}</label><input class="id-input" :value="editedItem.startdate" disabled></div>
        <div class="field"><label>{{ $t('table.expireDate') }}</label><input class="id-input" :value="editedItem.expiredate" disabled></div>
      </div>

      <div class="modal-sec mt"><span class="mdi mdi-cash-multiple"></span> {{ $t('table.payment') }}</div>
      <div class="form-grid-3" style="align-items:end">
        <label class="id-cbx" style="height:42px">
          <span class="id-check" :class="{ on: editedItem.paid == 1 }"><span class="mdi mdi-check"></span></span>
          {{ editedItem.paid ? $t('customerCourse.paid') : $t('customerCourse.unpaid') }}
        </label>
        <div class="field"><label>{{ $t('customerCourse.payDate') }}</label><input class="id-input" :value="editedItem.paydate" disabled></div>
        <div class="field"><label>{{ $t('customerCourse.uploadSlip') }}</label>
          <a v-if="editedItem.slip_image_url" @click.prevent="showSlipDialog = true" href="#" style="font-size:13px">
            <span class="mdi mdi-image-search"></span> {{ $t('customerCourse.viewSlip') }}</a>
          <span v-else class="t-cap">-</span>
        </div>
      </div>
      <div class="field full" style="margin-top:14px"><label>{{ $t('customerCourse.shortNote') }}</label>
        <textarea class="id-input id-textarea" :value="editedItem.shortnote" readonly></textarea></div>

      <template v-if="editedIndex > -1">
        <div class="modal-sec mt"><span class="mdi mdi-history"></span> {{ $t('table.courseUsageHistory') }}</div>
        <div class="id-modal-grid"><div class="id-modal-grid-scroll" style="max-height:30vh">
          <v-data-table :headers="CourseUsingHeaders" :items="CourseUsingtList" density="compact" :items-per-page="1000">
            <template v-slot:item.index="{ item }">{{ CourseUsingtList.indexOf(item) + 1 }}</template>
            <template v-slot:item.classdate="{ item }"><p>{{ format_date(item.classdate) }} </p></template>
            <template #bottom></template>
          </v-data-table>
        </div></div>
      </template>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="close">{{ $t('btn.close') }}</button>
      </template>
    </id-modal>

    <id-modal v-model="showSlipDialog" size="md" icon="mdi-image-search" :title="$t('customerCourse.slipTitle')">
      <img v-if="editedItem.slip_image_url" :src="editedItem.slip_image_url" style="width:100%;height:auto;border-radius:var(--radius-md)" />
      <template #footer>
        <button class="id-btn id-btn-primary" @click="showSlipDialog = false">{{ $t('btn.close') }}</button>
      </template>
    </id-modal>

    <id-modal v-model="dialogDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
      <p style="margin:0">{{ $t('courseHistory.confirmDelete') }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="closeDelete">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="checkBeforeDelete"><span class="mdi mdi-delete"></span> {{ $t('btn.confirm') }}</button>
      </template>
    </id-modal>
    <id-modal v-model="dialogFinish" size="sm" icon="mdi-check-decagram-outline" :title="$t('table.finish')" persistent>
      <p style="margin:0">{{ $t('gymnasts.confirmFinish') }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="closeFinish">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" @click="finishCourseConfirm"><span class="mdi mdi-check"></span> {{ $t('btn.confirm') }}</button>
      </template>
    </id-modal>
  </div>
</template>
<script>
import axios from "axios";
import { mapGetters } from "vuex";
import moment from "moment";
import { t } from "@/i18n";
export default {
  data: () => ({
    search: "",
    dialog: false,
    dialogFinish: false,
    dialogDelete: false,
    loadingCustomerCourse: false,
    editedIndex: -1,
    editedItem: {
      courserefer: null,
      course: null,
      coursename: null,
      coursetype: null,
      course_shortname: null,
      remaining: null,
      startdate: null,
      expiredate: null,
      course_user: null,
      period: null,
      paid: 0,
      paydate: null,
      slip_customer: '',
      slip_image_url: '',
      shortnote: '',
    },
    defaultItem: {
      courserefer: null,
      course: null,
      coursename: null,
      coursetype: null,
      course_shortname: null,
      remaining: null,
      startdate: null,
      expiredate: null,
      course_user: null,
      period: null,
      paid: 0,
      paydate: null,
      slip_customer: '',
      slip_image_url: '',
      shortnote: '',
    },
    showPreview: false,
    isViewMode: false, // เปลี่ยนเป็น false เมื่ออยู่ในโหมดแก้ไข
    showSlipDialog: false,
    CourseUsingHeadersData: [],
    CourseUsingtList: [],
    courselist: [],
    notNullRules: [
      v => !!v || t('common.required'),
    ],
    totalItems: 0,
    tableOptions: { page: 1, itemsPerPage: 10, sortBy: [] },
    filterCoursetype: '',   // server filter — backend /getFinishedCustomerCourseList must read `coursetype`
    searchTimer: null,
    isMounted: false,
  }),

  computed: {
    ...mapGetters({
      token: "getToken",
    }),
    formTitle() {
      return this.editedIndex === -1 ? this.$t('courses.newCourse') : this.$t('courses.editCourse')
    },
    CourseUsingHeaders() {
      return [
        { title: this.$t('table.name'), key: 'fullname' },
        { title: this.$t('table.date'), key: 'classdate' },
        { title: this.$t('table.time'), key: 'classtime' },
      ]
    },
    headers() {
      return [
        { title: this.$t('table.courseRef'), align: 'start', key: 'courserefer' },
        { title: this.$t('table.courseName'), key: 'coursename' },
        { title: this.$t('table.courseType'), key: 'coursetype' },
        { title: this.$t('table.startDate'), key: 'startdate', align: 'center' },
        { title: this.$t('table.expireDate'), key: 'expiredate', align: 'left' },
        { title: this.$t('table.remaining'), key: 'remaining', align: 'end' },
        { title: this.$t('table.courseUser'), key: 'userlist', align: 'left' },
        { title: this.$t('table.payment'), key: 'paid', align: 'center' },
        { title: this.$t('btn.edit'), key: 'view', align: 'center', sortable: false },
      ]
    },
  },

  watch: {
    search() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.tableOptions.page = 1;
        this.getCustomerCourseList();
      }, 500);
    },
    dialog(val) {
      val || this.close();
    },
    dialogFinish(val) {
      val || this.closeFinish();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  async created() {
    try {
      const token = this.$store.getters.getToken;
      //console.log("token ", token);
      if (!token) {
        this.errorMsg = "Not found token, Please login...";
        this.errorDialog = true;
        this.$emit("onClickChangeState", "login");
        return;
      }

      await axios
        .post(
          this.baseURL + "/verifyToken",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          //console.dir(response);
          if (response.data.success) {
            this.initialize();
          }
        })
        .catch((error) => {
          //console.error(error);
          this.$emit("onErrorHandler", error.response.data.message);
          this.$emit("onClickChangeState", "login");
        });
    } catch (error) {
      this.$emit("onErrorHandler", error.message);
    }
  },

  mounted() {
    this.isMounted = true;
  },

  methods: {
    async initialize() {
      this.tableOptions.page = 1;
      this.$emit("onLoading", true);
      await this.getCustomerCourseList();
      await this.getCourseLookup();
      this.$emit("onLoading", false);
    },
    copyToClipboard(newcourse) {
      if (newcourse) {
        navigator.clipboard.writeText(newcourse)
          .then(() => {
            //consol.log('คัดลอกคอร์สใหม่เรียบร้อยแล้ว');
          })
          .catch(() => {
            //console.error('ไม่สามารถคัดลอกได้: ', err);
          });
      } else {
        //this.$emit("onErrorHandler", "ไม่มีคอร์สใหม่ที่จะคัดลอก");
      }
    },

    async editItem(item) {
      //await this.getCustomerCourseList();
      await this.getCourseLookup();
      this.editedIndex = this.courselist.findIndex(course => course.courserefer === item.courserefer);
      this.editedItem = Object.assign({}, item);
      if(this.editedItem.startdate) this.editedItem.startdate = this.format_date(item.startdate);
      if(this.editedItem.expiredate) this.editedItem.expiredate = this.format_date(item.expiredate);
      let course = this.courseLookup.find(
        (course) => course.courseid == this.editedItem.courseid
      );
      if(this.editedItem.paydate) this.editedItem.paydate = this.format_date(this.editedItem.paydate);
      this.editedItem.course = course;
      this.checkCourseUser();
      if(this.editedItem.slip_image_url) {
        this.isViewMode = true;
      }
      this.dialog = true;
      //console.log("editItem", this.editedItem);
    },
    finishCourse(item) {
      this.editedIndex = this.courselist.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogFinish = true;
    },
    deleteItem(item) {
      this.editedIndex = this.courselist.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    async finishCourseConfirm() {
      this.$emit("onLoading", true);
      const token = this.$store.getters.getToken;
      await axios
        .post(
          this.baseURL + "/finishCustomerCourse",
          {
            courserefer: this.editedItem.courserefer,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          //console.dir(response);
          if (response.data.success) {
            this.dialogFinish = false;
            this.$emit("onInfoHandler", this.$t('msg.courseDone'));
          } else {
            this.dialogFinish = false;
            this.$emit(
              "onErrorHandler",
              response.data.message || this.$t("msg.updateFail")
            );
          }
          this.initialize();
        })
        .catch(() => {
          //console.error(error);
        });
      this.$emit("onLoading", false);
    },
    async checkCourseUser() {
      this.loadingCourse = true;
      await axios
        .get(
          this.baseURL + "/getStudentCourseDetail/" + this.editedItem.courserefer,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        )
        .then((response) => {
          //console.dir(response);
          if (response.data.success) {
            //console.log("getStudentCourseDetail", response.data);
            const res = response.data.results;
            if (res) {
              const data = response.data.results[0];
              //console.log("data", data.user);
              if (data.user > 0) {
                this.editedItem.course_user =
                  this.$t("customerCourse.courseInUseBy", { count: data.user, list: data.userlist });
              } else {
                this.editedItem.course_user = null;
              }
              const data2 = response.data.courseDetail;
              if (data2) {
                  this.CourseUsingtList = data2;
              } else {
                  this.CourseUsingtList = null;
              }
            } else {
              this.editedItem.course_user = null;
            }
          } else {
            this.$emit("onErrorHandler", this.$t("customerCourse.loadFail"));
          }
        })
        .catch((error) => {
          //console.log(error);
          if (error.response && error.response.status == 401) {
            this.$emit("onErrorHandler", error.response.data.message);
            this.$emit("onClickChangeState", "login");
          } else {
            this.$emit("onErrorHandler", error.message);
          }
        });
      this.loadingCourse = false;
    },
    close() {
      this.dialog = false;
      this.isViewMode = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeFinish() {
      this.dialogFinish = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async getCourseLookup() {
      const token = this.$store.getters.getToken;
      await axios
        .get(this.baseURL + "/courseLookup", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          //console.dir(response);
          if (response.data.success) {
            this.courseLookup = response.data.results;
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$emit("onErrorHandler", error.response.data.message);
            this.$emit("onClickChangeState", "login");
          } else {
            this.$emit("onErrorHandler", error.message);
          }
        });
    },
    selectCourse() {
      //console.log("selectCourse");
      let course = this.courseLookup.find(
        (course) => course.courseid == this.editedItem.courseid
      );
      this.editedItem.course_shortname = course.course_shortname;
    },
    applyFilter() { this.tableOptions.page = 1; this.getCustomerCourseList(); },
    // animate = true only for grid page / per-page changes → ≥1s skeleton.
    async getCustomerCourseList(animate = false) {
      this.loadingCustomerCourse = true;
      const t0 = Date.now();
      const token = this.$store.getters.getToken;
      const { page, itemsPerPage, sortBy } = this.tableOptions;
      await axios
        .post(
          this.baseURL + "/getFinishedCustomerCourseList",
          { page, itemsPerPage, search: this.search, sortBy, coursetype: this.filterCoursetype },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(async (response) => {
          if (response.data.success) {
            this.courselist = response.data.results ?? [];
            this.totalItems = response.data.total ?? 0;
          }
          if (animate) await this.$minLoad(t0);
          this.loadingCustomerCourse = false;
        })
        .catch(async (error) => {
          if (animate) await this.$minLoad(t0);
          this.loadingCustomerCourse = false;
          if (error.response?.status == 401) {
            this.$emit("onErrorHandler", error.response.data.message);
            this.$emit("onClickChangeState", "customercourse");
          } else {
            this.$emit("onErrorHandler", error.message);
          }
        });
    },
    onTableOptions({ page, itemsPerPage, sortBy }) {
      this.tableOptions = { ...this.tableOptions, page, itemsPerPage, sortBy };
      if (!this.isMounted) return;
      this.getCustomerCourseList();
    },
    onChangeStartDate() {
      //console.log("onChangeStartDate");
      this.editedItem.expiredate = null;
    },
    SQLDate(date) {
      return moment(date).format("YYYY-MM-DD");
    },
    format_date(value) {
      if (value) {
        return moment(value).format("DD/MM/YYYY");
      }
    },
    expireDateLeft(value) {
        let result = "";
        if (value) {
            let remainingText = this.calExpireText(value);
            result = this.format_date(value) + " (" + remainingText + ")";
        }
        return result;
    },
    isExpiredDate(expdate) {
        if (!expdate) return false;
        return new Date(expdate) < new Date();
    },
    calExpireText(expdate) {
      if (!expdate) return '';
      const today = new Date();
      const expirationDate = new Date(expdate);
      let returnText = '';

      if (expirationDate < today) {
          returnText = this.$t('table.expired');
      } else {
          let years = expirationDate.getFullYear() - today.getFullYear();
          let months = expirationDate.getMonth() - today.getMonth();
          let days = expirationDate.getDate() - today.getDate();

          if (days < 0) {
              months -= 1;
              days += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          }
          if (months < 0) {
              years -= 1;
              months += 12;
          }

          if (years > 0) returnText += `${years} ${this.$t('table.yearAbbr')} `;
          if (months > 0) returnText += `${months} ${this.$t('table.monthAbbr')} `;
          if (days > 0) returnText += `${days} ${this.$t('table.dayAbbr')}`;
      }
      return returnText;
    },
    async showAddNewCustomerCourse() {
      await this.getCustomerCourseList();
      await this.getCourseLookup();
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
    },
  }
};
</script>
<style scoped>
.highlighted-red {
  color: red;
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: lightgray;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background-color: lightgray;
}

.scrollable-content {
  max-height: 950px;
  overflow-y: auto;
}
.v-img {
  border: 1px solid #ccc;
  background-color: white;
}
</style>
