<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-view-dashboard"></span> Dashboard</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="onClickCardTotalStudent" >
                            <v-list-item class="header-card" min-height="60">
                                <div>Total <br>Students</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">{{ totalStudents }}</v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-face-man-shimmer"></span>
                                <span class="mdi mdi-face-woman-shimmer"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="onClickCardToday" >
                            <v-list-item class="header-card" height="60">
                                <div>Bookings Today</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">{{ totalBookingToday }}</v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="2" xl="2">
                        <v-card class="mx-auto" link @click="oncClickCardTomorrow">
                            <v-list-item class="header-card" height="60">
                                <div>Bookings Tomorrow</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card" >
                                <v-list-item-title class="headline mb-1">{{ totalBookingTomorrow }}</v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-gymnastics"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link @click="onClickCardNewStudent">
                            <v-list-item class="header-card" height="60">
                                <div>Approve New Students</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">{{ totalWaitingNewStudents }}</v-list-item-title>
                                <v-list-item-subtitle>Students</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link>
                            <v-list-item class="header-card" height="60">
                                <div>Approve Cancel booking</div>
                            </v-list-item>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-title class="headline mb-1">{{ totalWaitCancelBooking }}</v-list-item-title>
                                <v-list-item-subtitle>Bookings</v-list-item-subtitle>
                                <span class="mdi mdi-account-multiple-check"></span>
                            </v-list-item>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="12" md="5" xl="3">
                        <v-card class="mx-0" height="400">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker
                                        v-model="date"
                                        @click="selectDate"
                                    ></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="7" xl="9">
                        <Transition name="fade" mode="out-in">
                            <v-card class="mx-0" v-if="state=='bookinglist'" min-height="400">
                                <v-data-table
                                    fixed-header
                                    height="580"
                                    :loading="loadingBooking"
                                    :headers="BookingListHeaders"
                                    :items="BookingList"
                                    :sort-by="[{ key: 'classtime', order: 'asc' }]"
                                    >
                                    <template v-slot:top>
                                        <v-toolbar flat>
                                            <v-toolbar-title>All class bookings today</v-toolbar-title>
                                                <v-dialog v-model="dialogBookingDelete" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>ต้องการลบการจองนี้ ?</v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteBooking">ใช่! ลบเลย</v-btn>
                                                    <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteBooking">ไม่ลบละ เปลี่ยนใจ</v-btn>
                                                    
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                        </v-toolbar>
                                    </template>
                                    <template v-slot:item.index="{ item }">{{ BookingList.indexOf(item) + 1 }}</template>
                                    <template v-slot:item.checkin="{ item }">
                                        <v-icon size="large" @click="checkin(item)">mdi-check-bold</v-icon>
                                    </template>
                                    <template v-slot:item.delete="{ item }">
                                        <v-icon size="large" color="error" @click="deleteBookingItem(item)">mdi-delete-forever</v-icon>
                                    </template>
                                    <template v-slot:loadingBooking><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
                                    <template v-slot:no-data> No booking class </template>
                                </v-data-table>
                            </v-card>

                            <v-card class="mx-0" v-else-if="state=='studentlist'">
                                <v-data-table
                                    :loading="loadingStudent"
                                    :headers="StudentListHeaders"
                                    :items="StudentList"
                                    :sort-by="[{ key: 'childid', order: 'asc' }]"
                                    >
                                    <template v-slot:top>
                                        <v-toolbar flat>
                                            <v-toolbar-title>Student list</v-toolbar-title>
                                            <v-dialog v-model="dialogStudent" max-width="800px">
                                                <template v-slot:activator="{ props }">
                                                    <v-btn color="primary" dark v-bind="props"><span class="mdi mdi-emoticon-plus-outline"></span> New Student</v-btn>
                                                </template>
                                                <v-card>
                                                    <v-card-title>
                                                        <span v-if="editedStudentIndex==-1" class="mdi mdi-emoticon-plus-outline"></span>
                                                        <span v-if="editedStudentIndex!=-1" class="mdi mdi-human-edit"></span>
                                                        <span>{{ formStudentTitle }}</span>
                                                    </v-card-title>
                                                    <v-card-text>
                                                        <v-container>
                                                            <v-form ref="newstdform">
                                                                <v-row>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-text-field
                                                                            v-model="editedStudentItem.firstname"
                                                                            label="Firstname"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-text-field>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-text-field
                                                                            v-model="editedStudentItem.lastname"
                                                                            label="Lastname"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-text-field>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-text-field
                                                                            v-model="editedStudentItem.nickname"
                                                                            label="Nickname"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-text-field>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-select
                                                                            v-model="editedStudentItem.gender"
                                                                            label="Gender"
                                                                            :items="['ชาย', 'หญิง']"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <DatePicker 
                                                                            label="Date of Birth"
                                                                            variant="solo-filled"
                                                                            v-model="editedStudentItem.dateofbirth"
                                                                            :maxdate="new Date()"
                                                                            @click="calculateAgeNewStudent"
                                                                            rules="notNullRules"
                                                                            required
                                                                        ></DatePicker>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-text-field 
                                                                            label="Age"
                                                                            v-model="editedStudentItem.age"
                                                                            readonly
                                                                            variant="solo-filled"
                                                                        ></v-text-field>
                                                                    </v-col>

                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select
                                                                            v-model="editedStudentItem.courseid"
                                                                            label="Course Name"
                                                                            item-title="coursename"
                                                                            item-value="courseid"
                                                                            :items="courseLookup"
                                                                            variant="solo-filled"
                                                                            no-data-text="No course data"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-text-field
                                                                            v-model="editedStudentItem.remaining"
                                                                            label="Class Remaining"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-text-field>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="3">
                                                                        <v-select
                                                                            v-model="editedStudentItem.familyid"
                                                                            label="Parent"
                                                                            item-title="username"
                                                                            item-value="familyid"
                                                                            :items="familyLookup"
                                                                            variant="solo-filled"
                                                                            :rules="notNullRules"
                                                                            required
                                                                        ></v-select>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-form>
                                                        </v-container>
                                                    </v-card-text>
                                        
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn
                                                        color="blue-darken-1"
                                                        variant="text"
                                                        @click="closeStudent"
                                                        >
                                                        Cancel
                                                        </v-btn>
                                                        <v-btn
                                                        color="blue-darken-1"
                                                        variant="text"
                                                        @click="doSaveNewStudent"
                                                        >
                                                        Save
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogStudentDelete" persistent width="auto">
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
                                    <template v-slot:item.index="{ item }">{{ StudentList.indexOf(item)+1 }}</template>
                                    <template v-slot:item.edit="{ item }">
                                        <v-icon size="large" color="info" @click="clickEditStudent(item)">mdi-pencil</v-icon>
                                    </template>
                                    <template v-slot:item.delete="{ item }">
                                        <v-icon size="large" color="error" @click="clickDeleteStudent(item)">mdi-delete-forever</v-icon>
                                    </template>
                                    <template v-slot:loadingStudent><v-skeleton-loader type="table-row@5"></v-skeleton-loader></template>
                                    <template v-slot:no-data> No Student list </template>
                                </v-data-table>
                            </v-card>
                            <v-card v-else-if="state=='approvenewstudent'">
                                <ApproveNewStudent
                                    @onErrorHandler="onError($event)"
                                    @onInfoHandler="onShowInfoDialog($event)"
                                    @onSuccessHandler="refreshData"
                                    >
                                </ApproveNewStudent>
                            </v-card>
                        </Transition>
                    </v-col>
                </v-row>
                <v-row>
                </v-row>
            </div>
        </div>
        {{ this.tomorrow }}
    </div>
    {{ test }}
    <v-dialog width="500" v-model="errorDialog">
        <template v-slot:default="{ isActive }">
        <v-card title="ผิดพลาด!!" color="#F44336">
            <v-card-text>
            {{ errorMsg }}
            </v-card-text>
            <v-card-actions>
            <v-btn color="primary" variant="tonal" block @click="errorDialog = false">ปิด</v-btn>
            </v-card-actions>
        </v-card>
        </template>
    </v-dialog>

    <v-dialog width="500" v-model="infoDialog">
        <template v-slot:default="{ isActive }">
        <v-card title="สำเร็จ!!" color="#98FB98">
            <v-card-text>
            {{ infoMsg }}
            </v-card-text>
            <v-card-actions>
            <v-btn color="primary" variant="tonal" block @click="infoDialog = false">โอเค</v-btn>
            </v-card-actions>
        </v-card>
        </template>
    </v-dialog>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import ApproveNewStudent from './ApproveNewStudent.vue'
import moment from 'moment'

export default ({
    components: {
        DatePicker,
        ApproveNewStudent
    },
    computed: {
        formStudentTitle () {
          return this.editedStudentIndex === -1 ? 'Add a new student' : 'Edit student information'
        },
      },
      props: {
        test: {
          type: Object,
          default: '{}'
        }
      },
    data() {
        return {
            fetchData: null,
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval:null,
            date: new Date(),
            totalStudents: 0,
            totalBookingToday: 0,
            totalBookingTomorrow: 0,
            totalWaitingNewStudents: 0,
            totalWaitCancelBooking: 0,

            BookingList: [],
            BookingListHeaders: [
            { title: 'No.', key: 'index'},
            { title: 'Name', key: 'fullname' },
            { title: 'Course', key: 'coursename' },
            { title: 'Class Time', key: 'classtime' },
            { title: 'Check-in', key: 'checkin', align: 'center', sortable: false },
            { title: 'Delete', key: 'delete', align: 'center', sortable: false },
            ],
            editedBookingItem: {
                reservationid: null,
                childid: null,
                fullname: null,
                coursename: null,
                classtime: null,
            },
            editedBookingIndex: -1,
            dialogBooking: false,
            dialogBookingDelete: false,
            loadingBooking: false,

            StudentList: [],
            StudentListHeaders: [
            { title: 'No.', key: 'index'},
            { title: 'Name', key: 'fullname' },
            { title: 'Course', key: 'coursename' },
            { title: 'Remaining', key: 'remaining' },
            { title: 'Mobile Number', key: 'mobileno', align: 'center' },
            { title: 'Edit', key: 'edit', align: 'center', sortable: false },
            { title: 'Delete', key: 'delete', align: 'center', sortable: false },
            ],
            editedStudentItem: {
                childid: null,
                familyid: null,
                firstname: null,
                lastname: null,
                nickname: null,
                gender: null,
                dateofbirth: null,
                age: null,
                courseid: null,
                username: null,
            },
            defaultStudentItem: {
                childid: null,
                familyid: null,
                firstname: null,
                lastname: null,
                nickname: null,
                gender: null,
                dateofbirth: null,
                age: null,
                courseid: null,
                username: null,
            },
            editedStudentIndex: -1,
            dialogStudent: false,
            dialogStudentDelete: false,
            loadingStudent: false,

            state: 'bookinglist',

            notNullRules: [ v => !!v || 'This field is required', ]
        }
    },
    
    created() {
        console.log('created...'+new Date())
        clearInterval(this.interval)
        this.initialize()
        
    },
    mounted() {
        console.log('mounted...'+new Date())
        this.interval = setInterval(() =>{
        this.refreshData() }, 30000)
    },
    unmounted() {
        console.log('unmounted...'+new Date())
        clearInterval(this.interval)
  },
    destroyed(){
        console.log('dashboard destroyed...'+new Date())
        clearInterval(this.interval)
    },
    methods: {
        initialize() {
            this.getTotalStudents()
            this.getTotalBookingToday()
            this.getTotalBookingTomorrow()
            this.getTotalWaitingApprove()
            this.getReservationList()
            
            this.courseLookup = this.getCourseLookup()
            this.familyLookup = this.getFamilyLookup()
            //this.getApproveNewStudents()
            //this.getApproveCancelBookingClass()
        },
        refreshData() {
            console.log('refreshData...'+new Date())
            this.getTotalStudents()
            this.getTotalBookingToday()
            this.getTotalBookingTomorrow()
            this.getTotalWaitingApprove()
            //this.getApproveNewStudents()
            //this.getApproveCancelBookingClass()
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getReservationList()
        },
        
        getTotalStudents() {
            axios
            .get(this.baseURL+'/getTotalStudents', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.totalStudents = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getTotalBookingToday() {
            axios
            .get(this.baseURL+'/getTotalBookingToday', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.totalBookingToday = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getTotalBookingTomorrow() {
            axios
            .get(this.baseURL+'/getTotalBookingTomorrow', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.totalBookingTomorrow = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getTotalWaitingApprove() {
            axios
            .get(this.baseURL+'/getTotalWaitingApprove', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.totalWaitingNewStudents = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        
        getApproveNewStudents() {
            axios
            .get(this.baseURL+'/getApproveNewStudents', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getApproveCancelBookingClass() {
            axios
            .get(this.baseURL+'/getApproveCancelBookingClass', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        async doSaveNewStudent () {
            const { valid } = await this.$refs.newstdform.validate()
            if (valid) {
            // Make API request to register the user
                const StudentObj = {
                    firstname: this.editedStudentItem.firstname,
                    lastname: this.editedStudentItem.lastname,
                    nickname: this.editedStudentItem.nickname,
                    gender: this.editedStudentItem.gender,
                    dateofbirth: this.SQLDate(this.editedStudentItem.dateofbirth),
                    familyid: this.editedStudentItem.familyid,
                    courseid: this.editedStudentItem.courseid,
                    remaining: this.editedStudentItem.remaining,
                }
                console.log(this.editedStudentIndex+ ' StudentObj : ', StudentObj)
                if (this.editedStudentIndex > -1) {
                    StudentObj.childid = this.editedStudentItem.childid
                    axios
                    .post(this.baseURL+'/updateStudentByAdmin', StudentObj)
                    .then(response => {
                        if (response.data.success) {
                            this.$emit('onInfoHandler', 'แก้ไขข้อมูลสำเร็จแล้ว');
                            this.initialize()
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'แก้ไขข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }else{
                    axios
                    .post(this.baseURL+'/addStudentByAdmin', StudentObj)
                    .then(response => {
                        if (response.data.success) {
                            this.$emit('onInfoHandler', 'เพิ่มสมาชิกสำเร็จแล้ว');
                            this.initialize()
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'เพิ่มสมาชิกไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }
            }
        },
        getCourseLookup () {
            axios
            .get(this.baseURL+'/courseLookup', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.courseLookup = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getFamilyLookup () {
            axios
            .get(this.baseURL+'/familyLookup', {})
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.familyLookup = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        editBookingItem (item) {
          this.editedBookingIndex = this.BookingList.indexOf(item)
          this.editedBookingItem = Object.assign({}, item)
          this.dialogBooking = true
        },
        deleteBookingItem (item) {
          this.editedBookingIndex = this.BookingList.indexOf(item)
          this.editedBookingItem = Object.assign({}, item)
          this.dialogBookingDelete = true
        },
        clickEditStudent (item) {
          this.editedStudentIndex = this.StudentList.indexOf(item)
          this.editedStudentItem = Object.assign({}, item)
          this.editedStudentItem.dateofbirth = new Date(item.dateofbirth)
          this.editedStudentItem.age = this.calculateAge(item.dateofbirth)
          this.dialogStudent = true
        },
        clickDeleteStudent (item) {
          this.editedStudentIndex = this.StudentList.indexOf(item)
          this.editedStudentItem = Object.assign({}, item)
          this.dialogStudentDelete = true
        },
        async clickConfirmDeleteBooking() {
            // delete booking
        },
        async clickConfirmDeleteStd() {
            axios.post(this.baseURL+'/deleteFamilyMember', {
                familyid: this.editedStudentItem.familyid,
                childid: this.editedStudentItem.childid,
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Delete Student Successful');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Delete Student failed');
                }
                this.dialogStudentDelete = false
                this.initialize()
                this.getStudentList()
            })
        },
        closeBooking () {
          this.dialogBooking = false
          this.$nextTick(() => {
            this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
            this.editedBookingIndex = -1
          })
        },
        clickCancelDeleteBooking () {
          this.dialogBookingDelete = false
          this.$nextTick(() => {
            this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
            this.editedBookingIndex = -1
          })
        },
        closeStudent () {
          this.dialogStudent = false
          this.$nextTick(() => {
            this.editedStudentItem = Object.assign({}, this.defaultStudentItem)
            this.editedStudentIndex = -1
          })
        },
        clickCancelDeleteStd () {
          this.dialogStudentDelete = false
          this.$nextTick(() => {
            this.editedStudentItem = Object.assign({}, this.defaultStudentItem)
            this.editedStudentIndex = -1
          })
        },
        onClickCardTotalStudent () {
            this.state = 'studentlist'
            this.getStudentList()
            this.refreshData()
        },
        onClickCardToday() {
            this.date = new Date()
            this.selectDate()
            this.refreshData()
        },
        oncClickCardTomorrow() {
            this.date = this.addOneDay(new Date())
            console.log(this.date)
            this.selectDate()
            this.refreshData()
        },
        onClickCardNewStudent () {
            this.state = 'approvenewstudent'
            this.refreshData();
        },
        addOneDay(date = new Date()) {
            date.setDate(date.getDate() + 1);
            return date;
        },
        getStudentList() {
            this.loadingStudent = true
            DashboardAPI.fetchDataStudent()
            .then(({ success, results, message }) => {
                if(success) {
                    this.StudentList = results
                    this.loadingStudent = false
                }else{
                    this.$emit('onErrorHandler', message || 'Get Student list failed')
                    this.loadingStudent = false
                }
            })
            .catch(error => {
                alert(error);
            });
        },
        getReservationList() {
            const reservedate = this.SQLDate(this.date)
            this.loadingBooking = true
            DashboardAPI.fetchDataBooking({ reservedate })
            .then(({ success, results, message }) => {
                if(success) {
                    this.BookingList = results
                    this.loadingBooking = false
                }else{
                    this.$emit('onErrorHandler', message || 'Get Reservation failed')
                    this.loadingBooking = false
                }
            })
            .catch(error => {
                alert(error);
            });
        },
        calculateAgeNewStudent () {
            this.editedStudentItem.age = this.calculateAge(new Date(this.editedStudentItem.dateofbirth))
        },
        calculateAge(birthDate) {
          if (!birthDate) return;

          const currentDate = new Date();
          if (new Date(birthDate) > currentDate) {
              this.birthDate = null
              this.years = null;
              this.months = null;
              this.days = null;
              alert('Invalid Date of Birth')
          }

          const diffTime = currentDate - new Date(birthDate);
          const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          let years = Math.floor(totalDays / 365.25);
          let months = Math.floor((totalDays % 365.25) / 30.4375);
          let days = Math.floor((totalDays % 365.25) % 30.4375);
          return years + ' ปี ' + months + ' เดือน '

        },
        onError(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onShowInfoDialog(msg) {
            this.infoMsg = msg
            this.infoDialog = true
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
    watch: {
        dialogStudent (val) {
          val || this.closeStudent()
        },
        dialogBooking (val) {
          val || this.closeBooking()
        },
        dialogStudentDelete (val) {
            val || this.clickCancelDeleteStd()
        },
        dialogBookingDelete (val) {
            val || this.clickCancelDeleteBooking()
        },
    },
    computed: {
    tomorrow() {
        const d = new Date()
        d.setDate(d.getDate() +1)
        return d 
    }
    }

})
import { Promise } from 'core-js';
const DashboardAPI = {
    baseURL: 'https://wild-rose-pigeon-tutu.cyclic.app',
    fetchDataBooking ({ reservedate }) {
        return new Promise(resolve => {
                //console.log('DashboardAPI : ' + this.baseURL+'/getReservationList')
                axios
                    .post(this.baseURL+'/getReservationList', { classdate: reservedate })
                    .then(response => {
                        //console.log('fetchDataBooking result',response);
                        if (response.data.success) {
                            const datalist = response.data.results
                            resolve({ success: true, results: datalist })
                        }else{
                            resolve({ success: true, results: [] })
                        }
                    })
                    .catch(error => {
                        //console.log("fetchDataBooking error",error);
                        resolve({ success: false, message: error.message })
                    });
        });
    },
    fetchDataStudent () {
        return new Promise(resolve => {
                axios
                    .get(this.baseURL+'/getStudentList')
                    .then(response => {
                        //console.log('fetchDataStudent result',response);
                        if (response.data.success) {
                            const datalist = response.data.results
                            resolve({ success: true, results: datalist })
                        }else{
                            resolve({ success: true, results: [] })
                        }
                    })
                    .catch(error => {
                        //console.log("fetchDataStudent error",error);
                        resolve({ success: false, message: error.message })
                    });
            
        });
    }
}
</script>
<style scoped>
button span.mdi,
.dashboard-card span.mdi {
    font-size: 22px;
    margin-right: 5px;
}
.dashboard-card:hover {
    background-color: rgba(187, 187, 187, 0.342);
    cursor: pointer;
}
.header-card {
    background-color: #eeeeee;
    color: black;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

