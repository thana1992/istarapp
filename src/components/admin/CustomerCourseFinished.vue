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
          <tbody>
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
      <div class="grid-foot" v-if="totalItems > 0">
        <span class="grid-count">{{ totalItems }}</span>
        <div class="grid-pager">
          <button class="pager-btn" :disabled="tableOptions.page <= 1" @click="tableOptions.page--; getCustomerCourseList()"><span class="mdi mdi-chevron-left"></span></button>
          <span class="pager-now"><b>{{ tableOptions.page }}</b> / {{ Math.max(1, Math.ceil(totalItems / tableOptions.itemsPerPage)) }}</span>
          <button class="pager-btn" :disabled="tableOptions.page >= Math.ceil(totalItems / tableOptions.itemsPerPage)" @click="tableOptions.page++; getCustomerCourseList()"><span class="mdi mdi-chevron-right"></span></button>
        </div>
      </div>
    </div>

    <v-dialog v-model="dialog" max-width="950px">
                <v-card>
                  <v-card-title class="sticky-header">
                    <span class="mdi mdi-book-plus-multiple"></span><span>{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text class="scrollable-content">
                    <v-container>
                      <v-form ref="courseform">
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">{{ $t('courseHistory.courseInfo') }}</h3>
                            <v-divider class="border-opacity-100" color="info" thickness="3"></v-divider>
                            <v-divider color="#fffff" thickness="3"></v-divider>
                          </v-col>
                        </v-row>
                        <v-row></v-row>
                        <v-row>
                          <v-col cols="12" sm="6" md="6">
                            <v-label>{{ $t('table.courseRefer') }} :
                              {{ editedItem.courserefer }}</v-label>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <v-label>{{ editedItem.course_user }}</v-label>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="4" md="5">
                            <v-select v-model="editedItem.course" :label="$t('table.courseName')" item-title="coursename"
                              item-value="course" :items="courseLookup" variant="solo-filled" :no-data-text="$t('common.noCourseData')"
                              disabled ></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="4">
                            <v-select v-model="editedItem.coursetype" :label="$t('table.courseType')" item-title="coursetype"
                              item-value="coursetype" :items="['Monthly', 'Limited']" variant="solo-filled"
                              disabled></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="3">
                            <v-select v-model="editedItem.period" :label="$t('customerCourse.period')" item-title="period"
                              item-value="period" :items="[1, 2, 3, 6, 12]" variant="solo-filled" :rules="notNullRules" disabled></v-select>
                          </v-col>
                          
                        </v-row>
                      </v-form>
                        <v-row>
                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.remaining" :label="$t('table.remaining')" variant="solo-filled" disabled
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.startdate" :label="$t('table.startDate')" variant="solo-filled" disabled></v-text-field>

                          </v-col>

                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.expiredate" :label="$t('table.expireDate')" variant="solo-filled" disabled></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">{{ $t('table.payment') }}</h3>
                            <v-divider class="border-opacity-100" color="info" thickness="3"></v-divider>
                            <v-divider color="#fffff" thickness="3"></v-divider>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="3" sm="3" md="3">
                            <v-checkbox
                              v-model="editedItem.paid"
                              :label="editedItem.paid ? $t('customerCourse.paid') : $t('customerCourse.unpaid')"
                              color="success"
                              class="ma-2"
                              :value="1"
                              disabled
                            />
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.paydate" :label="$t('customerCourse.payDate')" variant="solo-filled" disabled></v-text-field>
                          </v-col>

                          <v-col cols="12" sm="6" md="6">
                            <v-file-input
                              v-model="editedItem.slip_customer"
                              :label="$t('customerCourse.uploadSlip')"
                              accept="image/*"
                              prepend-icon="mdi-camera"
                              outlined
                              disabled
                            ></v-file-input>
                            <div v-if="editedItem.slip_image_url">
                              <a @click.prevent="showSlipDialog = true" href="#">
                                <v-icon>mdi-image-search</v-icon> {{ $t('customerCourse.viewSlip') }}
                              </a>
                              <v-dialog v-model="showSlipDialog" max-width="500">
                                <v-card>
                                  <v-card-title class="headline">{{ $t('customerCourse.slipTitle') }}</v-card-title>
                                  <v-card-text>
                                    <v-img :src="editedItem.slip_image_url" width="100%" height="auto"></v-img>
                                  </v-card-text>
                                  <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" text @click="showSlipDialog = false">{{ $t('btn.close') }}</v-btn>
                                  </v-card-actions>
                                </v-card>
                              </v-dialog>
                            </div>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <v-textarea v-model="editedItem.shortnote" :label="$t('customerCourse.shortNote')" variant="solo-filled" rows="2" readonly></v-textarea>
                          </v-col>
                        </v-row>
                        <v-row v-if="editedIndex > -1">
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">{{ $t('table.courseUsageHistory') }}</h3>
                            <v-divider class="border-opacity-100" color="success" thickness="3"></v-divider>
                            <v-divider color="#fffff" thickness="3"></v-divider>
                          </v-col>
                        </v-row>
                        <v-row v-if="editedIndex > -1">
                          <v-col cols="12" sm="12" md="12">
                                  <v-data-table :headers="CourseUsingHeaders" :items="CourseUsingtList" density="compact"
                                  :items-per-page="1000" >
                                  <template v-slot:item.index="{ item }">
                                      {{ CourseUsingtList.indexOf(item) + 1 }}
                                  </template>
                                  <template v-slot:item.classdate="{ item }">
                                      <p>{{ format_date(item.classdate) }} </p>
                                  </template>
                                  <template #bottom></template>
                              </v-data-table>
                          </v-col>
                      </v-row>
                    
                    </v-container>
                  </v-card-text>

                  <v-card-actions class="sticky-footer">
                    <v-spacer></v-spacer>
                    <v-btn color="red-darken-1" variant="flat" @click="close">
                      {{ $t('btn.close') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>{{ $t('courseHistory.confirmDelete') }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="checkBeforeDelete">{{ $t('btn.confirm') }}</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeDelete">{{ $t('btn.cancel') }}</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogFinish" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>{{ $t('gymnasts.confirmFinish') }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="finishCourseConfirm">{{ $t('btn.confirm') }}</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeFinish">{{ $t('btn.cancel') }}</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
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
    async getCustomerCourseList() {
      this.loadingCustomerCourse = true;
      const token = this.$store.getters.getToken;
      const { page, itemsPerPage, sortBy } = this.tableOptions;
      await axios
        .post(
          this.baseURL + "/getFinishedCustomerCourseList",
          { page, itemsPerPage, search: this.search, sortBy },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.data.success) {
            this.courselist = response.data.results ?? [];
            this.totalItems = response.data.total ?? 0;
          }
          this.loadingCustomerCourse = false;
        })
        .catch((error) => {
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
