<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-book-account"></span></div>
      <div>
        <div class="id-h1">{{ $t('nav.customerCourse') }}</div>
        <div class="pg-sub">คอร์สของลูกค้า</div>
      </div>
    </div>

    <!-- server-side search + pagination preserved (getCustomerCourseList / tableOptions / totalItems / search watcher) -->
    <div class="grid-toolbar">
      <label class="grid-search"><span class="mdi mdi-magnify"></span>
        <input class="id-input" v-model="search" :placeholder="$t('btn.search')" /></label>
      <span class="grid-spacer"></span>
      <button class="id-btn id-btn-primary id-btn-sm" @click="dialog = true"><span class="mdi mdi-plus"></span> {{ $t('btn.newCourse') }}</button>
    </div>
    <div class="scard" style="padding:14px">
      <div style="overflow-x:auto">
        <table class="idt">
          <thead>
            <tr>
              <th v-for="h in headers" :key="h.key" :class="{ 'idt-action': ['edit', 'delete', 'finish'].includes(h.key) }" :style="{ textAlign: (h.align === 'center' || h.align === 'end') ? 'center' : 'left' }">{{ h.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in courselist" :key="item.courserefer">
              <td v-for="h in headers" :key="h.key" :class="{ 'idt-action': ['edit', 'delete', 'finish'].includes(h.key) }" :style="{ textAlign: (h.align === 'center' || h.align === 'end') ? 'center' : 'left' }">
                <template v-if="h.key === 'courserefer'"><span class="id-copy">{{ item.courserefer }}<span class="mdi mdi-content-copy id-copy-btn" :title="$t('btn.copy')" @click="copyToClipboard(item.courserefer)"></span></span></template>
                <template v-else-if="h.key === 'startdate'">{{ format_date(item.startdate) }}</template>
                <template v-else-if="h.key === 'expiredate'"><span :style="{ color: (item.expiredate != null && isExpiredDate(item.expiredate)) ? 'var(--c-error)' : '' }">{{ expireDateLeft(item.expiredate) }}</span></template>
                <template v-else-if="h.key === 'remaining'">
                  <span v-if="item.coursetype === 'Monthly'" class="badge badge-primary">{{ $t('home.monthly') }}</span>
                  <span v-else-if="item.remaining !== null && item.remaining !== ''" class="badge" :class="Number(item.remaining) <= 2 ? 'badge-warning' : 'badge-primary'">{{ item.remaining }} {{ $t('common.times') }}</span>
                  <span v-else>-</span>
                </template>
                <template v-else-if="h.key === 'paid'">
                  <span v-if="item.paid == 1" class="badge badge-success">{{ $t('customerCourse.paid') }}</span>
                  <span v-else class="badge badge-error">{{ $t('customerCourse.unpaid') }}</span>
                </template>
                <template v-else-if="h.key === 'edit'"><span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px" @click="editItem(item)"></span></template>
                <template v-else-if="h.key === 'delete'"><span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="deleteItem(item)"></span></template>
                <template v-else-if="h.key === 'finish'"><span class="mdi mdi-check" style="color:var(--c-success);cursor:pointer;font-size:20px" @click="finishCourse(item)"></span></template>
                <template v-else>{{ item[h.key] }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loadingCustomerCourse && courselist.length === 0" class="grid-empty"><span class="mdi mdi-book-off-outline"></span>ไม่พบข้อมูล</div>
      <div class="grid-foot" v-if="totalItems > 0">
        <span class="grid-count">{{ totalItems }}</span>
        <div class="grid-pager">
          <button class="pager-btn" :disabled="tableOptions.page <= 1" @click="tableOptions.page--; getCustomerCourseList()"><span class="mdi mdi-chevron-left"></span></button>
          <span class="pager-now"><b>{{ tableOptions.page }}</b> / {{ Math.max(1, Math.ceil(totalItems / tableOptions.itemsPerPage)) }}</span>
          <button class="pager-btn" :disabled="tableOptions.page >= Math.ceil(totalItems / tableOptions.itemsPerPage)" @click="tableOptions.page++; getCustomerCourseList()"><span class="mdi mdi-chevron-right"></span></button>
        </div>
      </div>
    </div>

    <!-- add / edit dialog -->
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
                            <v-label>{{ $t('courseHistory.courseRefer') }}: {{ editedItem.courserefer }}</v-label>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <v-label>{{ editedItem.course_user }}</v-label>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="4" md="5">
                            <v-select v-model="editedItem.course" :label="$t('table.courseName')" item-title="coursename"
                              item-value="course" :items="courseLookup" variant="solo-filled" :no-data-text="$t('common.noCourseData')"
                              :readonly="editedIndex > -1" :rules="notNullRules" return-object required></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="4">
                            <v-select v-model="editedItem.coursetype" :label="$t('table.courseType')" item-title="coursetype"
                              item-value="coursetype" :items="['Monthly', 'Limited']" variant="solo-filled"
                              :no-data-text="$t('common.noCourseData')" :rules="notNullRules" :readonly="editedIndex !== -1" required></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="3">
                            <v-select v-model="editedItem.period" :label="$t('customerCourse.period')" item-title="period"
                              item-value="period" :items="[1, 2, 3, 6, 12]" variant="solo-filled" :rules="notNullRules" :readonly="editedIndex !== -1" required></v-select>
                          </v-col>
                          
                        </v-row>
                      </v-form>
                        <v-row>
                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.remaining" :label="$t('table.remaining')" variant="solo-filled" :readonly="editedIndex !== -1"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <DatePicker :label="$t('table.startDate')" variant="solo-filled" v-model="editedItem.startdate"
                              @click="onChangeStartDate"></DatePicker>
                          </v-col>

                          <v-col cols="12" sm="3" md="3">
                            <DatePicker :label="$t('table.expireDate')" variant="solo-filled" v-model="editedItem.expiredate"
                              :mindate="editedItem.startdate"></DatePicker>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <v-switch
                              v-model.number="editedItem.enable_double_booking"
                              color="success"
                              class="ma-2"
                              :true-value="1"
                              :false-value="0"
                              inset
                            >
                              <template #label>
                                <p>{{ $t('customerCourse.doubleBookingNote') }}</p>
                                <span
                                  :class="{
                                    'double-booking-highlight': editedItem.enable_double_booking == 1
                                  }"
                                  @click.stop.prevent
                                  style="cursor: default;"
                                >
                                  {{
                                    editedItem.enable_double_booking == 1
                                      ? $t('customerCourse.doubleBookingMore')
                                      : ''
                                  }}
                                </span>
                                <p>&nbsp;{{ $t('customerCourse.doubleBookingUnit') }}</p>
                              </template>
                            </v-switch>
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
                          <v-col cols="12" sm="3" md="3">
                            <v-checkbox
                              v-model="editedItem.paid"
                              :label="editedItem.paid ? $t('customerCourse.paid') : $t('customerCourse.unpaid')"
                              color="success"
                              class="ma-2"
                              :true-value="1"
                              :false-value="0"
                            />
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <DatePicker :label="$t('customerCourse.payDate')" variant="solo-filled" v-model="editedItem.paydate"
                              :mindate="editedItem.startdate"></DatePicker>
                          </v-col>

                          <v-col cols="12" sm="6" md="6">
                            <v-file-input
                              v-model="editedItem.slip_customer"
                              :label="$t('customerCourse.uploadSlip')"
                              accept="image/*"
                              prepend-icon="mdi-camera"
                              outlined
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
                            <v-textarea v-model="editedItem.shortnote" :label="$t('customerCourse.shortNote')" variant="solo-filled" rows="2"></v-textarea>
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
                      {{ $t('btn.cancel') }}
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="flat" @click="save">
                      {{ $t('btn.save') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>{{ $t('courses.confirmDelete') }}</v-card-text>
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
                  <v-card-text>{{ $t('btn.finish') }}?</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="finishCourseConfirm">{{ $t('btn.confirm') }}</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeFinish">{{ $t('btn.cancel') }}</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDeleteNotify" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>{{ deleteNotifyMsg }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">{{ $t('btn.confirm') }}</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeDeleteNotify">{{ $t('btn.cancel') }}</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
  </div>
</template>
<script>
import axios from "axios";
import { mapGetters } from "vuex";
import DatePicker from "@/components/DatePicker.vue";
import moment from "moment";
import { t } from "@/i18n";
export default {
  components: {
    DatePicker,
  },
  data: () => ({
    search: "",
    dialog: false,
    dialogFinish: false,
    dialogDelete: false,
    loadingCustomerCourse: false,
    deleteNotifyMsg: "",
    dialogDeleteNotify: false,
    editedIndex: -1,
    editedItem: {
      courserefer: null,
      course: null,
      coursename: null,
      coursetype: null,
      remaining: null,
      startdate: null,
      expiredate: null,
      course_user: null,
      period: null,
      enable_double_booking: 0,
      paid: 0,
      paydate: null,
      shortnote: null,
      slip_customer: '',
      slip_image_url: '',
    },
    defaultItem: {
      courserefer: null,
      course: null,
      coursename: null,
      coursetype: null,
      remaining: null,
      startdate: null,
      expiredate: null,
      course_user: null,
      period: null,
      enable_double_booking: 0,
      paid: 0,
      paydate: null,
      shortnote: null,
      slip_customer: '',
      slip_image_url: '',
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
    headers() {
      return [
        { title: this.$t('table.courseRef'), align: "start", key: "courserefer" },
        { title: this.$t('table.courseName'), key: "coursename" },
        { title: this.$t('table.courseType'), key: "coursetype" },
        { title: this.$t('table.startDate'), key: "startdate", align: "center" },
        { title: this.$t('table.expireDate'), key: "expiredate", align: "left" },
        { title: this.$t('table.remaining'), key: "remaining", align: "end" },
        { title: this.$t('table.courseUser'), key: "userlist", align: "left" },
        { title: this.$t('table.payment'), key: "paid", align: "center" },
        { title: this.$t('table.edit'), key: "edit", sortable: false, align: "center" },
        { title: this.$t('table.delete'), key: "delete", sortable: false, align: "center" },
        { title: this.$t('table.finish'), key: "finish", sortable: false, align: "center" },
      ];
    },
    formTitle() {
      return this.editedIndex === -1 ? this.$t('courses.newCourse') : this.$t('courses.editCourse')
    },
    CourseUsingHeaders() {
      return [
        { title: '#', key: 'index', width: '50px', sortable: false },
        { title: this.$t('table.name'), key: 'fullname' },
        { title: this.$t('table.date'), key: 'classdate' },
        { title: this.$t('table.time'), key: 'classtime' },
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
    dialogDeleteNotify(val) {
      val || this.closeDeleteNotify();
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
      if(this.editedItem.startdate) this.editedItem.startdate = new Date(item.startdate);
      if(this.editedItem.expiredate) this.editedItem.expiredate = new Date(item.expiredate);
      
      let course = this.courseLookup.find(
        (course) => course.courseid == this.editedItem.courseid
      );
      this.editedItem.course = course;
      this.checkCourseUser();
      if(this.editedItem.slip_image_url) {
        this.isViewMode = true;
      }
      this.dialog = true;
      console.log("editItem", this.editedItem);
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
    async checkBeforeDelete() {
      this.$emit("onLoading", true);
      const token = this.$store.getters.getToken;
      await axios
        .post(
          this.baseURL + "/checkBeforeDeleteCustomerCourse",
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
            this.deleteItemConfirm();
          } else {
            let nicknameList = [];
            response.data.results.forEach((result) => {
              nicknameList.push(result.nickname);
            });
            //console.dir(nicknameList);
            this.deleteNotifyMsg =
              this.$t("customerCourse.deleteInUse", { names: nicknameList.join(", ") });
            this.dialogDeleteNotify = true;
            this.dialogDelete = false;
            this.$emit("onLoading", false);
          }
        })
        .catch(() => {
          //console.error(error);
          this.$emit("onLoading", false);
          return false;
        });
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
              response.data.message || this.$t('msg.updateFail')
            );
          }
          this.initialize();
        })
        .catch(() => {
          //console.error(error);
        });
      this.$emit("onLoading", false);
    },
    async deleteItemConfirm() {
      this.$emit("onLoading", true);
      const token = this.$store.getters.getToken;
      await axios
        .post(
          this.baseURL + "/deleteCustomerCourse",
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
            this.dialogDelete = false;
            this.dialogDeleteNotify = false;
            this.$emit("onInfoHandler", this.$t('msg.courseDeleted'));
          } else {
            this.dialogDelete = false;
            this.dialogDeleteNotify = false;
            this.$emit(
              "onErrorHandler",
              response.data.message || this.$t('msg.updateFail')
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

    closeDelete() {
      this.dialogDelete = false;
      if (!this.dialogDeleteNotify) {
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      }
    },

    closeDeleteNotify() {
      this.dialogDeleteNotify = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    /*
    async save() {
      const { valid } = await this.$refs.courseform.validate()
      if(valid) {
        this.$emit("onLoading", true);
        const token = this.$store.getters.getToken;
        //console.log("save", this.editedItem);

        let startdate = null;
        let expiredate = null;
        let paydate = null;
        if (this.editedItem.startdate !==null && this.editedItem.startdate !=="") {
          startdate = this.SQLDate(this.editedItem.startdate);
        }
        if (this.editedItem.expiredate !==null && this.editedItem.expiredate !=="") {
          expiredate = this.SQLDate(this.editedItem.expiredate);
        }
        if (this.editedItem.paydate !==null && this.editedItem.paydate !=="") {
          paydate = this.SQLDate(this.editedItem.paydate);
        }
        if (this.editedItem.shortnote !== null && this.editedItem.shortnote !== "") {
          this.editedItem.shortnote = this.editedItem.shortnote;
        } else {
          this.editedItem.shortnote = "";
        }
        try {
          if (this.editedIndex > -1) {
            let saveObj = {
              courserefer: this.editedItem.courserefer,
              course: this.editedItem.course,
              courseid: this.editedItem.courseid,
              coursetype: this.editedItem.coursetype,
              course_shortname: this.editedItem.course_shortname,
              remaining: this.editedItem.remaining,
              startdate: startdate,
              expiredate: expiredate,
              period: this.editedItem.period,
              paid: this.editedItem.paid,
              paydate: paydate,
              shortnote: this.editedItem.shortnote,
              slip_customer: this.editedItem.slip_customer,
              slip_image_url: this.editedItem.slip_image_url
            };
            const response = await axios.post(this.baseURL + "/updateCustomerCourse", saveObj, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              await this.handleUploadSlip(this.editedItem.slip_customer, this.editedItem.courserefer);
              this.$emit("onInfoHandler", response.data.message || this.$t('msg.courseUpdated'));
            } else {

              this.$emit("onErrorHandler", response.data.message || this.$t('msg.updateFail'));
            }
            this.initialize();
          } else {
            let saveObj = {
              courserefer: this.editedItem.courserefer,
              course: this.editedItem.course,
              coursetype: this.editedItem.coursetype,
              course_shortname: this.editedItem.course_shortname,
              remaining: this.editedItem.remaining,
              startdate: startdate,
              expiredate: expiredate,
              period: this.editedItem.period,
              paid: this.editedItem.paid,
              paydate: paydate,
              shortnote: this.editedItem.shortnote,
              slip_customer: this.editedItem.slip_customer,
              slip_image_url: this.editedItem.slip_image_url
            };
            const response = await axios.post(this.baseURL + "/addCustomerCourse", saveObj, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              await this.handleUploadSlip(this.editedItem.slip_customer, response.data.courserefer);
              this.$emit("onInfoHandler", response.data.message || this.$t('msg.courseCreated'));
              this.copyToClipboard(response.data.courserefer);
            } else {
              this.$emit("onErrorHandler", response.data.message || this.$t('msg.addFail'));
            }
            this.initialize();
          }
        } catch (error) { // <--- เริ่ม catch block
          //console.error("Axios Post Error:", error); // <--- แสดง error ที่เกิดขึ้นใน console
          // คุณสามารถดูรายละเอียดของ error ได้จาก object `error`
          // เช่น error.response (ถ้า server ตอบกลับมาพร้อม error status)
          // หรือ error.request (ถ้า request ถูกส่งไปแต่ไม่ได้รับการตอบกลับ)
          // หรือ error.message
          if (error.response) {
            // Server ตอบกลับมาพร้อม error status (e.g., 4xx, 5xx)
            console.log("Error Response Data:", error.response.data);
            console.log("Error Response Status:", error.response.status);
            console.log("Error Response Headers:", error.response.headers);
            this.$emit("onErrorHandler", error.response.data.message || this.$t("common.serverError"));
          } else if (error.request) {
            // Request ถูกส่งไปแต่ไม่ได้รับการตอบกลับ
            console.log("Error Request:", error.message);
            this.$emit("onErrorHandler", this.$t("common.noServerResponse") + " " + error.message);
          } else {
            // เกิดข้อผิดพลาดอื่นๆ ในการตั้งค่า request
            console.log("Error Message:", error.message);
            this.$emit("onErrorHandler", this.$t("common.errorPrefix") + ": " + error.message);
          }
        } finally { // <--- (ทางเลือก) finally block จะทำงานเสมอ ไม่ว่าจะมี error หรือไม่
          this.close();
          this.$emit("onLoading", false);
        }
        this.close();
        this.$emit("onLoading", false);
      } else {
          this.$emit('onErrorHandler', this.$t('msg.required'))
          this.$emit('onLoading', false)
          return
      }
    },
    */
    async save() {
      const { valid } = await this.$refs.courseform.validate();
      if (!valid) {
        this.$emit('onErrorHandler', this.$t('msg.required'));
        this.$emit('onLoading', false);
        return;
      }

      this.$emit("onLoading", true);
      const token = this.$store.getters.getToken;

      // แปลงวันที่ให้เป็นรูปแบบ SQL
      const startdate = this.editedItem.startdate ? this.SQLDate(this.editedItem.startdate) : null;
      const expiredate = this.editedItem.expiredate ? this.SQLDate(this.editedItem.expiredate) : null;
      const paydate = this.editedItem.paydate ? this.SQLDate(this.editedItem.paydate) : null;
      const shortnote = this.editedItem.shortnote || "";

      try {
        // สร้าง FormData
        const formData = new FormData();
        formData.append('courserefer', this.editedItem.courserefer || '');
        // ถ้า course เป็น object ให้แปลงเป็น JSON string ก่อนส่ง
        formData.append('coursestr', this.editedItem.course ? JSON.stringify(this.editedItem.course) : '');
        formData.append('courseid', this.editedItem.courseid || '');
        formData.append('coursetype', this.editedItem.coursetype);
        formData.append('remaining', this.editedItem.remaining);
        formData.append('startdate', startdate || '');
        formData.append('expiredate', expiredate || '');
        formData.append('period', this.editedItem.period);
        formData.append('enable_double_booking', this.editedItem.enable_double_booking ? 1 : 0);
        formData.append('paid', this.editedItem.paid);
        formData.append('paydate', paydate || '');
        formData.append('shortnote', shortnote);
        formData.append('slip_image_url', this.editedItem.slip_image_url || '');
        // แนบไฟล์รูปภาพหากมี
        if (this.editedItem.slip_customer instanceof File) {
          formData.append('slipImage', this.editedItem.slip_customer);
        }

        const url = this.editedIndex > -1
          ? this.baseURL + "/updateCustomerCourse"
          : this.baseURL + "/addCustomerCourse";

        const response = await axios.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // ไม่ต้องกำหนด 'Content-Type' ให้ Axios จัดการเอง
          },
        });

        if (response.data.success) {
          const message = this.editedIndex > -1
            ? response.data.message || this.$t('msg.courseUpdated')
            : response.data.message || this.$t('msg.courseCreated');
          this.$emit("onInfoHandler", message);

          if (this.editedIndex === -1) {
            this.copyToClipboard(response.data.courserefer);
          }
        } else {
          const errorMsg = this.editedIndex > -1
            ? response.data.message || this.$t('msg.updateFail')
            : response.data.message || this.$t('msg.addFail');
          this.$emit("onErrorHandler", errorMsg);
        }

        this.initialize();
      } catch (error) {
        if (error.response) {
          console.log("Error Response Data:", error.response.data);
          this.$emit("onErrorHandler", error.response.data.message || this.$t("common.serverError"));
        } else if (error.request) {
          console.log("Error Request:", error.message);
          this.$emit("onErrorHandler", this.$t("common.noServerResponse") + " " + error.message);
        } else {
          console.log("Error Message:", error.message);
          this.$emit("onErrorHandler", this.$t("common.errorPrefix") + ": " + error.message);
        }
      } finally {
        this.close();
        this.$emit("onLoading", false);
      }
    },
    /*
    async handleUploadSlip(file, courserefer) {

      if (this.editedItem.slip_image_url && !file) {
          console.log('No new image to upload');
          return;
      }

      if (file) {
        const formData = new FormData();
        const newFileName = `${courserefer}.${file.name.split('.').pop()}`;

        // สร้างไฟล์ใหม่ด้วยชื่อไฟล์ใหม่
        const renamedFile = new File([file], newFileName, { type: file.type });

        formData.append("slipImage", renamedFile);
        formData.append("courserefer", courserefer);

        const response = await fetch(this.baseURL + '/uploadSlipImage', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`, // เพิ่ม token ลงใน headers
            },
            body: formData,
        });

        const data = await response.json();
        const imageUrl = data.url;
        console.log('imageUrl', imageUrl);
        
      }
    },
    */
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
    async getCustomerCourseList() {
      this.loadingCustomerCourse = true;
      const token = this.$store.getters.getToken;
      const { page, itemsPerPage, sortBy } = this.tableOptions;
      await axios
        .post(
          this.baseURL + "/getCustomerCourseList",
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
      this.$emit("onLoading", true);
      await this.getCustomerCourseList();
      await this.getCourseLookup();
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.$emit("onLoading", false);
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
