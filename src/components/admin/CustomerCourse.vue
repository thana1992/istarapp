<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-book-account"></span> Customer's Course / คอร์สของลูกค้า</h1>
    </div>
    <div class="container-content">
      <v-card flat>
        <v-card-title class="d-flex align-center pe-2">
          <v-icon icon="mdi-magnify"></v-icon> &nbsp; Find a Customer's Course

          <v-spacer></v-spacer>

          <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
            variant="solo-filled" flat hide-details single-line></v-text-field>
        </v-card-title>

        <v-divider></v-divider>
        <v-data-table :headers="headers" :items="courselist" :loading="loadingCustomerCourse"
          :sort-by="[{ key: 'coursename', order: 'asc' }]" :search="search">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Customer's Courses</v-toolbar-title>
              <v-divider class="mx-2" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="initialize">
                <v-icon left>mdi-refresh</v-icon>
                รีเฟรช
              </v-btn>
              <v-dialog v-model="dialog" max-width="950px">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-book-plus-multiple"></span> สร้างคอร์สใหม่</v-btn>
                </template>
                <v-card>
                  <v-card-title class="sticky-header">
                    <span class="mdi mdi-book-plus-multiple"></span><span>{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text class="scrollable-content">
                    <v-container>
                      <v-form ref="courseform">
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">Course Infomation</h3>
                            <v-divider class="border-opacity-100" color="info" thickness="3"></v-divider>
                            <v-divider color="#fffff" thickness="3"></v-divider>
                          </v-col>
                        </v-row>
                        <v-row></v-row>
                        <v-row>
                          <v-col cols="12" sm="6" md="6">
                            <v-label>Course Refer :
                              {{ editedItem.courserefer }}</v-label>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <v-label>{{ editedItem.course_user }}</v-label>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="4" md="5">
                            <v-select v-model="editedItem.course" label="Course Name" item-title="coursename"
                              item-value="course" :items="courseLookup" variant="solo-filled" no-data-text="No course"
                              :readonly="editedIndex > -1" :rules="notNullRules" return-object required></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="4">
                            <v-select v-model="editedItem.coursetype" label="ประเภท" item-title="coursetype"
                              item-value="coursetype" :items="['Monthly', 'Limited']" variant="solo-filled"
                              no-data-text="No course" :rules="notNullRules" :readonly="editedIndex !== -1" required></v-select>
                          </v-col>
                          <v-col cols="12" sm="4" md="3">
                            <v-select v-model="editedItem.period" label="ระยะเวลา (เดือน)" item-title="period"
                              item-value="period" :items="[1, 2, 3, 6, 12]" variant="solo-filled" :rules="notNullRules" :readonly="editedIndex !== -1" required></v-select>
                          </v-col>
                          
                        </v-row>
                      </v-form>
                        <v-row>
                          <v-col cols="12" sm="3" md="3">
                            <v-text-field v-model="editedItem.remaining" label="คงเหลือ" variant="solo-filled" :readonly="editedIndex !== -1"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <DatePicker label="วันที่เริ่มต้น" variant="solo-filled" v-model="editedItem.startdate"
                              @click="onChangeStartDate"></DatePicker>
                          </v-col>

                          <v-col cols="12" sm="3" md="3">
                            <DatePicker label="วันหมดอายุ" variant="solo-filled" v-model="editedItem.expiredate"
                              :mindate="editedItem.startdate"></DatePicker>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">Course Payment</h3>
                            <v-divider class="border-opacity-100" color="info" thickness="3"></v-divider>
                            <v-divider color="#fffff" thickness="3"></v-divider>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="3" sm="3" md="3">
                            <v-checkbox
                              v-model="editedItem.paid"
                              :label="editedItem.paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'"
                              color="success"
                              class="ma-2"
                              :value="1"
                            />
                          </v-col>
                          <v-col cols="12" sm="3" md="3">
                            <DatePicker label="วันที่ชำระ" variant="solo-filled" v-model="editedItem.paydate"
                              :mindate="editedItem.startdate"></DatePicker>
                          </v-col>
                          
                          <v-col cols="12" sm="6" md="6">
                            <v-file-input
                              v-model="editedItem.slip_customer"
                              label="อัพโหลดสลิป"
                              accept="image/*"
                              prepend-icon="mdi-camera"
                              outlined
                            ></v-file-input>
                            <div v-if="editedItem.slip_image_url">
                              <a @click.prevent="showSlipDialog = true" href="#">
                                <v-icon>mdi-image-search</v-icon> ดูสลิปที่อัพโหลดแล้ว
                              </a>
                              <v-dialog v-model="showSlipDialog" max-width="500">
                                <v-card>
                                  <v-card-title class="headline">สลิปการชำระเงิน</v-card-title>
                                  <v-card-text>
                                    <v-img :src="editedItem.slip_image_url" width="100%" height="auto"></v-img>
                                  </v-card-text>
                                  <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" text @click="showSlipDialog = false">ปิด</v-btn>
                                  </v-card-actions>
                                </v-card>
                              </v-dialog>
                            </div>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="12" md="12">
                            <v-textarea v-model="editedItem.shortnote" label="Short Note" variant="solo-filled" rows="2"></v-textarea>
                          </v-col>
                        </v-row>
                        <v-row v-if="editedIndex > -1">
                          <v-col cols="12" sm="12" md="12">
                            <h3 class="group-header">Course usage history</h3>
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
                      Cancel
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="flat" @click="save">
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>ต้องการลบคอร์สเรียนนี้จริงๆหรอ ?</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="checkBeforeDelete">ยืนยัน</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeDelete">ยกเลิก</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogFinish" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>ยืนยันการจบคอร์ส และเก็บประวัติ ?</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="finishCourseConfirm">ยืนยัน</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeFinish">ยกเลิก</v-btn>

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
                    <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">ยืนยัน</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeDeleteNotify">ยกเลิก</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.startdate="{ item }">
              <p>{{ format_date(item.startdate) }}</p>
          </template>
          <template v-slot:item.expiredate="{ item }">
                <p :class="{ 'highlighted-red': item.expiredate != null && expireDateLeft(item.expiredate).indexOf('หมดอายุ') > -1 }">
                    {{ expireDateLeft(item.expiredate) }}
                </p>
            </template>
          <!-- <template v-slot:item.actions="{ item }">
            <v-icon size="small" class="me-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
          </template> -->
          <template v-slot:no-data>
            No Customer's course list
            <br /><br />
            <v-btn color="primary" @click="initialize"> Reset </v-btn>
          </template>
          <template v-slot:item.paid="{ item }">
            <v-chip color="success" v-if="item.paid == 1">จ่ายแล้ว</v-chip>
            <v-chip color="error" v-else>ยังไม่จ่าย</v-chip>
          </template>
          <template v-slot:item.edit="{ item }">
              <v-icon size="large" color="info" @click="editItem(item)">mdi-pencil</v-icon>
          </template>
          <template v-slot:item.finish="{ item }">
              <v-icon size="large" color="error" @click="finishCourse(item)">mdi-check</v-icon>
          </template>
          <template v-slot:item.delete="{ item }">
              <v-icon size="large" color="error" @click="deleteItem(item)">mdi-delete-forever</v-icon>
          </template>
          <template v-slot:loading><v-skeleton-loader type="table-row@20"></v-skeleton-loader></template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { mapGetters } from "vuex";
import DatePicker from "@/components/DatePicker.vue";
import moment from "moment";
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
    headers: [
      { title: "หมายเลขคอร์ส", align: "start", key: "courserefer" },
      { title: "ชื่อคอร์ส", key: "coursename" },
      { title: "ประเภท", key: "coursetype" },
      { title: "วันเริ่มต้น", key: "startdate", align: "center" },
      { title: "วันหมดอายุ", key: "expiredate", align: "left" },
      { title: "คงเหลือ", key: "remaining", align: "end" },
      { title: "ผู้ใช้คอร์ส", key: "userlist", align: "left" },
      { title: "ชำระเงิน", key: "paid", align: "center" },
      //{ title: "", key: "actions", sortable: false },
      { title: "แก้ไข", key: "edit", sortable: false, align: "center" },
      { title: "ลบ", key: "delete", sortable: false, align: "center" },
      { title: "จบคอร์ส", key: "finish", sortable: false, align: "center" },
    ],
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
      shortnote: null,
      slip_customer: '',
      slip_image_url: '',
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
      shortnote: null,
      slip_customer: '',
      slip_image_url: '',
    },
    showPreview: false,
    isViewMode: false, // เปลี่ยนเป็น false เมื่ออยู่ในโหมดแก้ไข
    showSlipDialog: false,
    CourseUsingHeaders: [
        { text: 'No.', value: 'index' },
        { title: 'Name', value: 'fullname' },
        { title: 'Class Date', value: 'classdate' },
        { title : 'Classtime', value: 'classtime'},
        { title: 'CreateBy', value: 'createby' },
        { title: 'UpdateBy', value: 'updateby' },
    ],
    CourseUsingtList: [],
    courselist: [],
    notNullRules: [
      v => !!v || 'Field is required',
    ],
  }),

  computed: {
    ...mapGetters({
      token: "getToken",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "New Course" : "Edit Course";
    },
  },

  watch: {
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

  methods: {
    async initialize() {
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
          .catch(err => {
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
              "คอร์สเรียนนี้ กำลังถูกใช้โดย " +
              nicknameList.join(", ") +
              " ต้องการลบใช่ไหม ?";
            this.dialogDeleteNotify = true;
            this.dialogDelete = false;
            this.$emit("onLoading", false);
          }
        })
        .catch((error) => {
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
            this.$emit("onInfoHandler", "สำเร็จ จบคอร์สแล้ว");
          } else {
            this.dialogFinish = false;
            this.$emit(
              "onErrorHandler",
              response.data.message || "เสียใจ จบคอร์สไม่ได้ ลองใหม่อีกครั้งนะ"
            );
          }
          this.initialize();
        })
        .catch((error) => {
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
            this.$emit("onInfoHandler", "สำเร็จ ลบคอร์สเรียนแล้ว");
          } else {
            this.dialogDelete = false;
            this.dialogDeleteNotify = false;
            this.$emit(
              "onErrorHandler",
              response.data.message || "เสียใจ ลบไม่ได้ ลองใหม่อีกครั้งนะ"
            );
          }
          this.initialize();
        })
        .catch((error) => {
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
                  "มีผู้กำลังใช้คอร์สนี้ " + data.user + " คน " + data.userlist;
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
            this.$emit("onErrorHandler", "getCustomerCourseInfo failed");
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
            };
            const response = await axios.post(this.baseURL + "/updateCustomerCourse", saveObj, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              await this.handleUploadSlip(this.editedItem.slip_customer, this.editedItem.courserefer);
              this.$emit("onInfoHandler", response.data.message || "สำเร็จ แก้ไขข้อมูลคอร์สใหม่แล้ว");
            } else {
              
              this.$emit("onErrorHandler", response.data.message || "เสียใจ แก้ไขคอร์สไม่ได้ ลองใหม่อีกครั้งนะ");
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
            };
            const response = await axios.post(this.baseURL + "/addCustomerCourse", saveObj, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              await this.handleUploadSlip(this.editedItem.slip_customer, response.data.courserefer);
              this.$emit("onInfoHandler", response.data.message || "สำเร็จ สร้างคอร์สใหม่แล้ว");
              this.copyToClipboard(response.data.courserefer);
            } else {
              this.$emit("onErrorHandler", response.data.message || "เสียใจ สร้างคอร์สไม่ได้ ลองใหม่อีกครั้งนะ");
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
            this.$emit("onErrorHandler", error.response.data.message || "เกิดข้อผิดพลาดในการสื่อสารกับ Server");
          } else if (error.request) {
            // Request ถูกส่งไปแต่ไม่ได้รับการตอบกลับ
            console.log("Error Request:", error.message);
            this.$emit("onErrorHandler", "ไม่ได้รับการตอบกลับจาก Server " + error.message);
          } else {
            // เกิดข้อผิดพลาดอื่นๆ ในการตั้งค่า request
            console.log("Error Message:", error.message);
            this.$emit("onErrorHandler", "เกิดข้อผิดพลาด: " + error.message);
          }
        } finally { // <--- (ทางเลือก) finally block จะทำงานเสมอ ไม่ว่าจะมี error หรือไม่
          this.close();
          this.$emit("onLoading", false);
        }
        this.close();
        this.$emit("onLoading", false);
      } else {
          this.$emit('onErrorHandler', 'กรุณากรอกข้อมูลให้ครบถ้วน')
          this.$emit('onLoading', false)
          return
      }
    },
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
      await axios
        .post(
          this.baseURL + "/getCustomerCourseList",
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
            if (response.data.results && response.data.results.length > 0) {
              this.courselist = response.data.results;
            }
          }
          this.loadingCustomerCourse = false;
        })
        .catch((error) => {
          //console.error(error);
          this.loadingCustomerCourse = false;
          if (error.response.status == 401) {
            this.$emit("onErrorHandler", error.response.data.message);
            this.$emit("onClickChangeState", "customercourse");
          } else {
            this.$emit("onErrorHandler", error.message);
          }
        });
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
        return moment(String(value)).format("DD/MM/YYYY");
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
    calExpireText(expdate) {
      if (!expdate) return '';
      const today = new Date();
      const expirationDate = new Date(expdate);
      let returnText = '';

      if (expirationDate < today) {
          returnText = 'หมดอายุ';
      } else {
          let years = expirationDate.getFullYear() - today.getFullYear();
          let months = expirationDate.getMonth() - today.getMonth();
          let days = expirationDate.getDate() - today.getDate();

          // Adjust days if negative
          if (days < 0) {
              months -= 1;
              days += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // จำนวนวันในเดือนปัจจุบัน
          }

          // Adjust months if negative
          if (months < 0) {
              years -= 1;
              months += 12;
          }

          if (years > 0) {
              returnText += `${years} ปี `;
          }
          if (months > 0) {
              returnText += `${months} เดือน `;
          }
          if (days > 0) {
              returnText += `${days} วัน`;
          }
      }

      // //console.log('today', this.format_date(today, 'YYYY-MM-DD'));
      // //console.log('expirationDate', this.format_date(expirationDate, 'YYYY-MM-DD'));
      // //console.log('returnText', returnText);
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
