<template>
  <div class="container">
    <div class="container-header">
        <h1><span class="mdi mdi-book-account"></span> Customer's Courses</h1>
    </div>
    <div class="container-content">
    <v-data-table
      :headers="headers"
      :items="courselist"
      :loading="loadingCustomerCourse"
      :sort-by="[{ key: 'coursename', order: 'asc' }]"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Customer's Courses</v-toolbar-title>
          <v-divider
            class="mx-2"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="750px"
          >
            <template v-slot:activator="{ props }">
              <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-book-plus-multiple"></span> New Customer Course</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="mdi mdi-book-plus-multiple"></span><span>{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="5"
                    >
                    <v-text-field
                        v-model="editedItem.courserefer"
                        label="Course Refer"
                        item-title="courserefer"
                        item-value="courserefer"
                        :items="customerCourseLookup"
                        variant="solo-filled"
                        no-data-text="No course"
                        :rules="notNullRules"
                        readonly
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="4"
                      md="5"
                    >
                      <v-select
                          v-model="editedItem.course"
                          label="Course Name"
                          item-title="coursename"
                          item-value="course"
                          :items="courseLookup"
                          variant="solo-filled"
                          no-data-text="No course"
                          :rules="notNullRules"
                          return-object
                          required
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="4"
                      md="4"
                    >
                    <v-select
                        v-model="editedItem.coursetype"
                        label="Course Type"
                        item-title="coursetype"
                        item-value="coursetype"
                        :items='["Monthly","Limited"]'
                        variant="solo-filled"
                        no-data-text="No course"
                        :rules="notNullRules"
                        required
                      ></v-select>
                    </v-col>

                    <v-col
                      cols="12"
                      sm="4"
                      md="3"
                    >
                      <v-text-field
                        v-model="editedItem.remaining"
                        label="Remaining"
                        variant="solo-filled"
                        :rules="notNullRules"
                        
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <DatePicker 
                          label="Start Date"
                          variant="solo-filled"
                          v-model="editedItem.startdate"
                          @click="onChangeStartDate"
                          :mindate="new Date()"
                          rules="notNullRules"
                          
                      ></DatePicker>
                    </v-col>

                    <v-col cols="12" sm="6" md="6">
                      <DatePicker 
                          label="Expire Date"
                          variant="solo-filled"
                          v-model="editedItem.expiredate"
                          :mindate="editedItem.startdate"
                          rules="notNullRules"
                          
                      ></DatePicker>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
  
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="save"
                >
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
                <v-btn color="#4CAF50" variant="tonal" @click="checkBeforeDelete">ใช่! ลบเลย</v-btn>
                <v-btn color="#F44336" variant="tonal" @click="closeDelete">ไม่ลบละ เปลี่ยนใจ</v-btn>
                
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
                <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">ใช่! ลบเลย</v-btn>
                <v-btn color="#F44336" variant="tonal" @click="closeDeleteNotify">ไม่ลบละ เปลี่ยนใจ</v-btn>
                
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          size="small"
          class="me-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        No Customer's course list
        <br><br>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Reset
        </v-btn>
      </template>
      <template v-slot:loading><v-skeleton-loader type="table-row@20"></v-skeleton-loader></template>
    </v-data-table>
    </div>
  </div>
  </template>
<script>
  import axios from 'axios'
  import { mapGetters } from 'vuex';
  import DatePicker from '@/components/DatePicker.vue'
  import moment from 'moment'
    export default {
      components: {
        DatePicker
      },
      data: () => ({
        dialog: false,
        dialogDelete: false,
        loadingCustomerCourse: false,
        deleteNotifyMsg: '',
        dialogDeleteNotify: false,
        headers: [
          { title: 'Course No.', align: 'start', key: 'courserefer' },
          { title: 'Course Name', key: 'coursename' },
          { title: 'Course Type', key: 'coursetype' },
          { title: 'Remaining', key: 'remaining' },
          { title: 'Start Date', key: 'startdateshow' },
          { title: 'Expire Date', key: 'expiredateshow' },
          { title: 'Actions', key: 'actions', sortable: false },
        ],
        editedIndex: -1,
        editedItem: {
          courserefer: null,
          course: null,
          coursetype: null,
          course_shortname: null,
          remaining: null,
          startdate: null,
          expiredate: null,
        },
        defaultItem: {
          courserefer: null,
          course: null,
          course: null,
          coursetype: null,
          course_shortname: null,
          remaining: null,
          startdate: null,
          expiredate: null,
        },
        courselist: [],
      }),
  
      computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        formTitle () {
          return this.editedIndex === -1 ? 'New Course' : 'Edit Course'
        },
      },
  
      watch: {
        dialog (val) {
          val || this.close()
        },
        dialogDelete (val) {
          val || this.closeDelete()
        },
        dialogDeleteNotify (val) {
          val || this.closeDeleteNotify()
        }
      },
  
      async created () {
        try {
            const token = this.$store.getters.getToken;
            console.log('token ', token)
            if (!token) {
                this.errorMsg = 'Not found token, Please login...'
                this.errorDialog = true
                this.$emit('onClickChangeState', 'login')
                return;
            }

            await axios
            .post(this.baseURL+'/verifyToken', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.initialize()
                }
            })
            .catch(error => {
                console.error(error);
                this.$emit('onErrorHandler', error.response.data.message)
                this.$emit('onClickChangeState', 'login')
            });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }
        
      },
  
      methods: {
         async initialize () {
          
          await this.getCustomerCourseList()
          await this.getCourseLookup()
        },
  
        editItem (item) {
          this.editedIndex = this.courselist.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.editedItem.startdate = new Date(item.startdate)
          this.editedItem.expiredate = new Date(item.expiredate)
          this.dialog = true
        },
  
        deleteItem (item) {
          this.editedIndex = this.courselist.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        },
        async checkBeforeDelete() {
          const token = this.$store.getters.getToken;
          await axios
            .post(this.baseURL+'/checkBeforeDeleteCustomerCourse', {
              courserefer: this.editedItem.courserefer
            },
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                  this.deleteItemConfirm()
                } else {
                  let nicknameList = []
                  response.data.results.forEach(result => {
                      nicknameList.push(result.nickname);
                  });
                  console.dir(nicknameList)
                  this.deleteNotifyMsg = 'คอร์สเรียนนี้ กำลังถูกใช้โดย ' + nicknameList.join(', ') + ' ไต้องการลบจริงๆหรอ ?'
                  this.dialogDeleteNotify = true
                  this.dialogDelete = false
                  
                }
            })
            .catch(error => {
                console.error(error);
                return false
            });
        },
        async deleteItemConfirm () {
          const token = this.$store.getters.getToken;
          await axios
            .post(this.baseURL+'/deleteCustomerCourse', {
              courserefer: this.editedItem.courserefer
            },
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                  this.dialogDelete = false
                  this.dialogDeleteNotify = false
                  this.$emit('onInfoHandler', 'สำเร็จ ลบคอร์สเรียนแล้ว');
                } else {
                  this.dialogDelete = false
                  this.dialogDeleteNotify = false
                  this.$emit('onErrorHandler', response.data.message || 'เสียใจ ลบไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
            .catch(error => {
                console.error(error);
            });
        },
  
        close () {
          this.dialog = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        closeDelete () {
          this.dialogDelete = false
          if(!this.dialogDeleteNotify) {
            this.$nextTick(() => {
              this.editedItem = Object.assign({}, this.defaultItem)
              this.editedIndex = -1
            })
          }
        },

        closeDeleteNotify () {
          this.dialogDeleteNotify = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        save () {
          const token = this.$store.getters.getToken;
          if (this.editedIndex > -1) {
            let saveObj = {
                courserefer: this.editedItem.courserefer,
                course: this.editedItem.course,
                coursetype: this.editedItem.coursetype,
                course_shortname: this.editItem.course_shortname,
                remaining: this.editedItem.remaining,
                startdate: this.SQLDate(this.editedItem.startdate),
                expiredate: this.SQLDate(this.editedItem.expiredate),
            }
            axios
            .post(this.baseURL+'/updateCustomerCourse', saveObj,
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', response.data.message || 'สำเร็จ แก้ไขข้อมูลคอร์สแล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ แก้ไขไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
          } else {
            let saveObj = {
              courserefer: this.editedItem.courserefer,
              course: this.editedItem.course,
              course: this.editedItem.course,
              coursetype: this.editedItem.coursetype,
              course_shortname: this.editItem.course_shortname,
              remaining: this.editedItem.remaining,
              startdate: this.SQLDate(this.editedItem.startdate),
              expiredate: this.SQLDate(this.editedItem.expiredate),
            }
            axios
            .post(this.baseURL+'/addCustomerCourse', saveObj,
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', response.data.message || 'สำเร็จ สร้างคอร์สใหม่แล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ สร้างคอร์สไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
          }
          this.close()
        },
        getCourseLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/courseLookup', { 
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courseLookup = response.data.results
                }
            })
            .catch(error => {
                if(error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
        },
        selectCourse () {
          console.log('selectCourse')
          let course = this.courseLookup.find(course => course.courseid == this.editedItem.courseid)
          this.editedItem.course_shortname = course.course_shortname
        },
        async getCustomerCourseList() {
          this.loadingCustomerCourse = true
          const token = this.$store.getters.getToken;
          await  axios
          .post(this.baseURL+'/getCustomerCourseList', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
          .then(response => {
              console.dir(response);
              if (response.data.success) {
                if(response.data.results && response.data.results.length > 0) {
                  this.courselist = this.convertDate(response.data.results)
                }
              }
              this.loadingCustomerCourse = false
          })
          .catch(error => {
              console.error(error);
              this.loadingCustomerCourse = false
              if(error.response.status == 401) {
                  this.$emit('onErrorHandler', error.response.data.message)
                  this.$emit('onClickChangeState', 'customercourse')
              }else{
                  this.$emit('onErrorHandler', error.message)
              }
          });
        },
        onChangeStartDate () {
          console.log('onChangeStartDate')
          this.editedItem.expiredate = null
        },
        SQLDate(date) {
          return moment(date).format('YYYY-MM-DD')
        },
        format_date(value){
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
        convertDate (arrObj) {
            arrObj.forEach(obj => {
              obj.startdateshow = this.format_date(obj.startdate);
              obj.expiredateshow = this.format_date(obj.expiredate);
            });
            return arrObj;
        },
      },
    }
  </script>