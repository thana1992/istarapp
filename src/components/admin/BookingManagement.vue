<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-calendar-edit"></span> Booking Management / จัดการข้อมูลการจองคลาสเรียน</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="12" md="3" xl="3">
                        <v-card class="mx-0" height="450">
                            <v-list-item class="header-card">
                                <div>View class booking by date</div>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker v-model="date" @update:model-value="selectDate"></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="9" xl="9">
                        <Transition name="fade" mode="out-in">
                            <v-card flatclass="mx-0" v-if="state == 'bookinglist'" min-height="400">
                                <v-card-title class="d-flex align-center pe-2">
                                    <v-icon icon="mdi-magnify"></v-icon> &nbsp; Find a Booking

                                    <v-spacer></v-spacer>

                                    <v-text-field v-model="search" density="compact" label="Search"
                                        prepend-inner-icon="mdi-magnify" variant="solo-filled" flat hide-details
                                        single-line></v-text-field>
                                </v-card-title>

                                <v-divider></v-divider>
                                <v-data-table fixed-header height="auto" :loading="loadingBooking"
                                    loading-text="Loading... Please wait" :headers="BookingListHeaders"
                                    :items="BookingList" :sort-by="[{ key: 'classtime', order: 'asc' }]"
                                    :search="search" >
                                    <template v-slot:top>
                                        <v-toolbar flat>
                                            <v-toolbar-title>All class bookings today</v-toolbar-title>
                                            <v-btn color="primary" @click="initialize">
                                                <v-icon left>mdi-refresh</v-icon>
                                                รีเฟรช
                                            </v-btn>
                                            <v-dialog v-model="dialogBookingEdit" max-width="800px">
                                                <template v-slot:activator="{ props }">
                                                    <v-btn color="primary" dark v-bind="props"><span
                                                            class="mdi mdi-emoticon-plus-outline"></span> เพิ่มการจอง</v-btn>
                                                </template>
                                                <v-card>
                                                    <v-card-title class="sticky-header">
                                                        <span v-if="editedBookingIndex == -1"
                                                            class="mdi mdi-emoticon-plus-outline"></span>
                                                        <span v-if="editedBookingIndex != -1"
                                                            class="mdi mdi-human-edit"></span>
                                                        <span>{{ formBookingTitle }}</span>
                                                    </v-card-title>
                                                    <v-card-text class="scrollable-content">
                                                        <v-container>
                                                            <v-form ref="bookingform">
                                                                <v-row>
                                                                    <v-col cols="12" sm="12" md="12">
                                                                        <v-label :class="courseinfoColor">{{ editedBookingItem.courseinfo }}</v-label>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-autocomplete v-model="editedBookingItem.studentid"
                                                                            label="Name" item-title="name"
                                                                            item-value="studentid"
                                                                            :items="studentLookup" variant="solo-filled"
                                                                            no-data-text="No student data"
                                                                            :rules="notNullRules"
                                                                            @update:modelValue="onStudentChange"
                                                                            :readonly="editedBookingIndex != -1"
                                                                            filterable
                                                                            required>
                                                                        </v-autocomplete>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select v-model="editedBookingItem.courseid"
                                                                            label="Course Name" item-title="coursename"
                                                                            item-value="courseid" :items="courseLookup"
                                                                            variant="solo-filled"
                                                                            no-data-text="No course data"
                                                                            :rules="notNullRules"
                                                                            :loading="loadingCourse"
                                                                            @update:modelValue="getClassTime"
                                                                            required></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="4">
                                                                        <DatePicker label="Class date"
                                                                            v-model="selectedDate" variant="solo-filled"
                                                                            @update:modelValue="getClassTime" :rules="requireRules">
                                                                        </DatePicker>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select v-model="editedBookingItem.classtime"
                                                                            label="Class time" item-title="text"
                                                                            item-value="classid" :items="classtimesData"
                                                                            variant="solo-filled" :rules="notNullRules"
                                                                            no-data-text="No class data"
                                                                            :loading="loadingClassTime"
                                                                            return-object="true" required></v-select>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-form>
                                                        </v-container>
                                                    </v-card-text>

                                                    <v-card-actions class="sticky-footer">
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="red-darken-1" variant="flat"
                                                            @click="closeEditBooking">
                                                            Cancel
                                                        </v-btn>
                                                        <v-btn color="blue-darken-1" variant="flat"
                                                            @click="doSaveNewBooking">
                                                            Save
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogBookingDelete" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>ต้องการลบการจองของ {{ editedBookingItem.fullname }}
                                                        ?</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmDeleteBooking">ใช่! ลบเลย</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelDeleteBooking">ไม่ลบละ เปลี่ยนใจ</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogCheckin" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>ต้องการ Check-in สำหรับ {{ editedBookingItem.fullname
                                                        }} ?</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmCheckinDialog">Yes</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelCheckinDialog">Cancel</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogUndoCheckin" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>ต้องการ ยกเลิก Check-in สำหรับ {{ editedBookingItem.fullname
                                                        }} ?</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmUndoCheckinDialog">Yes</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelUndoCheckinDialog">Cancel</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                        </v-toolbar>
                                    </template>
                                    <template v-slot:item.edit="{ item }">
                                        <v-icon size="large" color="info"
                                            @click="clickEditBooking(item)">mdi-pencil</v-icon>
                                    </template>
                                    <template v-slot:item.checkin="{ item }">
                                        <v-icon v-if="parseInt(item.checkedin) == '0'" size="large"
                                            @click="clickCheckin(item)">mdi-check-bold</v-icon>
                                        <v-icon v-else-if="parseInt(item.checkedin) == '1'" size="large"
                                            @click="clickUndoCheckin(item)">mdi-close-thick</v-icon>
                                    </template>
                                    <template v-slot:item.delete="{ item }">
                                        <v-icon size="large" color="error"
                                            @click="deleteBookingItem(item)">mdi-delete-forever</v-icon>
                                    </template>
                                    <template v-slot:loading><v-skeleton-loader
                                            type="table-row@5"></v-skeleton-loader></template>
                                    <template v-slot:no-data> No booking class </template>
                                </v-data-table>
                            </v-card>
                        </Transition>
                    </v-col>
                </v-row>
                <v-row>
                </v-row>
            </div>
        </div>
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
    </div>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from '../center/Student.vue'
import BookingList from '../center/BookingList.vue'
import ApproveNewStudent from './ApproveNewStudent.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
import Vue3autocounter from 'vue3-autocounter';
import { TrinityRingsSpinner } from 'epic-spinners'
export default ({
    components: {
        TrinityRingsSpinner,
        DatePicker,
        Student,
        BookingList,
        ApproveNewStudent,
        'vue3-autocounter': Vue3autocounter
    },
    data() {
        return {
            search: '',
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval: null,
            date: new Date(),
            classday: '',
            pulse: '',
            classtimesData: [],
            loadingCourse: false,
            loadingClassTime: false,
            BookingList: [],
            BookingListHeaders: [
                { title: 'ชื่อ', key: 'fullname' },
                { title: 'ชื่อคอร์ส', key: 'coursename' },
                { title: 'เวลา', key: 'classtime' },
                { title: 'เช็คชื่อ', key: 'checkin', align: 'center', sortable: false },
                { title: 'แก้ไข', key: 'edit', align: 'center', sortable: false },
                { title: 'ลบ', key: 'delete', align: 'center', sortable: false },
            ],
            editedBookingItem: {
                fullname: null,
                reservationid: null,
                studentid: null,
                courseid: null,
                classid: null,
                classdate: null,
                classtime: null,
                courseinfo: null,
                courserefer: null,
            },
            defaultBookingItem: {
                fullname: null,
                reservationid: null,
                studentid: null,
                courseid: null,
                classid: null,
                classdate: null,
                classtime: null,
                courseinfo: null,
                courserefer: null,
            },
            courseinfoColor: 'courseinfoColorGreen',
            selectedDate: null,
            editedBookingIndex: -1,
            dialogBookingEdit: false,
            dialogCheckin: false,
            dialogBookingDelete: false,
            loadingBooking: false,
            dialogUndoCheckin: false,
            state: 'bookinglist',

            notNullRules: [v => !!v || 'This field is required',]
        }
    },

    async created() {
        //console.log('BookingManagement created...' + new Date())
        this.$emit('onLoading', true)
        await this.initialize()
        this.$emit('onLoading', false)
    },
    mounted() {
        //console.log('mounted...' + new Date())
        this.interval = setInterval(() => {
            this.refreshData()
        }, 60000)
    },
    unmounted() {
        //console.log('unmounted...' + new Date())
        clearInterval(this.interval)
    },
    methods: {
        async initialize() {
            await this.getReservationList()
            await this.getCourseLookup()
            await this.getFamilyLookup()
            await this.getStudentLookup()
        },
        async refreshData() {
            //console.log('refreshData...' + new Date())
            await this.getReservationList()
        },
        async selectDate() {
            this.state = 'bookinglist'
            await this.getReservationList()
        },
        async onStudentChange(studentid) {
            //console.log('Student selected:', studentid);
            this.loadingCourse = true
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/getCustomerCourseInfo', {
                studentid: this.editedBookingItem.studentid,
            },
                {
                    headers: { Authorization: `Bearer ${token}`, }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        //console.log('getCustomerCourseInfo', response.data.results);
                        const res = response.data.results[0];
                        if (res) {
                            this.courseinfoColor = 'courseinfoColorGreen'
                            this.editedBookingItem.courseid = res.courseid
                            if (res.coursetype == 'Monthly') {
                                this.editedBookingItem.courseinfo = 'หมายเลขคอร์ส: ' + res.courserefer + ' วันหมดอายุ: ' + this.format_date(res.expiredate) + ' รายเดือน'
                            } else {
                                this.editedBookingItem.courseinfo = 'หมายเลขคอร์ส: ' + res.courserefer + ' วันหมดอายุ: ' + this.format_date(res.expiredate) + ' เหลือ: ' + res.remaining + ' ครั้ง'
                            }
                        } else {
                            this.courseinfoColor = 'courseinfoColorRed'
                            this.editedBookingItem.courseinfo = 'นักเรียนคนนี้ยังไม่มี Course ที่สมัครเรียน'
                        }
                    } else {
                        this.$emit('onErrorHandler', 'getCustomerCourseInfo failed');
                    }
                })
                .catch(error => {
                    //console.log(error)
                    if (error.response && error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
            this.loadingCourse = false
        },
        async getClassTime() {
            if (this.editedBookingItem.courseid == null) return;
            if (this.selectedDate == null) return;
            this.loadingClassTime = true
            this.classtimesData = []
            let req = {
                classdate: this.SQLDate(this.selectedDate),
                classday: new Date(this.selectedDate).toLocaleDateString('en-US', { weekday: 'long' }),
                courseid: this.editedBookingItem.courseid
            }
            //console.log("request", req)
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/getClassTime', req, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        const data = response.data.results
                        if (data.length == 0) {
                            this.classtimesData = []
                            this.editedBookingItem.classtime = null
                        } else {
                            this.classtimesData = data;
                            if (this.editedBookingItem.classtime != null) {
                                if (typeof this.editedBookingItem.classtime === 'object' && this.editedBookingItem.classtime !== null) {
                                    this.editedBookingItem.classtime = this.classtimesData.find(x => x.classtime == this.editedBookingItem.classtime.classtime)
                                } else {
                                    this.editedBookingItem.classtime = this.classtimesData.find(x => x.classtime == this.editedBookingItem.classtime)
                                }
                            }
                        }
                    } else {
                        this.classtimesData = []
                        this.editedBookingItem.classtime = null
                    }
                    this.loadingClassTime = false
                })

        },
        async getCourseLookup() {
            const token = this.$store.getters.getToken;
            await axios
                .get(this.baseURL + '/courseLookup', {
                    headers: {
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
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        async getFamilyLookup() {
            const token = this.$store.getters.getToken;
            await axios
                .get(this.baseURL + '/familyLookup', { headers: { Authorization: `Bearer ${token}`, } })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.familyLookup = response.data.results
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        async getStudentLookup() {
            const token = this.$store.getters.getToken;
            await axios
                .post(this.baseURL + '/studentLookup', {}, { headers: { Authorization: `Bearer ${token}`, } },)
                .then(response => {
                    //console.dir('studentLookup', response);
                    if (response.data.success) {
                        this.studentLookup = response.data.results
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        async doSaveNewBooking() {
            this.$emit('onLoading', true)
            const { valid } = await this.$refs.bookingform.validate()
            
            if (valid) {
                this.$emit('onLoading', true)
                // Make API request to register the user
                const BookingObj = {
                    studentid: this.editedBookingItem.studentid,
                    courseid: this.editedBookingItem.courseid,
                    classid: this.editedBookingItem.classtime.classid,
                    classdate: this.SQLDate(this.selectedDate),
                    classtime: this.editedBookingItem.classtime.classtime,
                    classday: this.editedBookingItem.classtime.classday,
                    reservationid: this.editedBookingItem.reservationid,
                }
                //console.log(this.editedBookingIndex + ' BookingObj : ', BookingObj)

                const token = this.$store.getters.getToken;
                if (this.editedBookingIndex > -1) {
                    BookingObj.reservationid = this.editedBookingItem.reservationid
                    await axios
                        .post(this.baseURL + '/updateBookingByAdmin', BookingObj, { headers: { Authorization: `Bearer ${token}`, } })
                        .then(response => {
                            if (response.data.success) {
                                this.$emit('onInfoHandler', 'แก้ไขข้อมูลสำเร็จแล้ว');
                                this.getReservationList()
                                this.dialogBookingEdit = false
                            } else {
                                this.$emit('onErrorHandler', response.data.message || 'แก้ไขข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                            }
                        })
                        .catch(error => {
                            if (error.response.status == 401) {
                                this.$emit('onErrorHandler', error.response.data.message)
                                this.$emit('onClickChangeState', 'login')
                            } else {
                                this.$emit('onErrorHandler', error.message)
                            }
                        });
                } else {
                    await axios
                        .post(this.baseURL + '/addBookingByAdmin', BookingObj, { headers: { Authorization: `Bearer ${token}`, } })
                        .then(response => {
                            if (response.data.success) {
                                this.$emit('onInfoHandler', 'เพิ่มการจองคลาสสำเร็จแล้ว');
                                this.getReservationList()
                                this.dialogBookingEdit = false
                            } else {
                                this.$emit('onErrorHandler', response.data.message || 'เพิ่มการจองคลาสไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                            }
                            this.$emit('onUpdateDataSuccess')
                        })
                        .catch(error => {
                            if (error.response.status == 401) {
                                this.$emit('onErrorHandler', error.response.data.message)
                                this.$emit('onClickChangeState', 'login')
                            } else {
                                this.$emit('onErrorHandler', error.message)
                            }
                        });
                }
                this.$emit('onLoading', false)
            } else {
                this.$emit('onErrorHandler', 'กรุณากรอกข้อมูลให้ครบถ้วน')
                this.$emit('onLoading', false)
                return
            }

        },
        deleteBookingItem(item) {
            this.editedBookingIndex = this.BookingList.indexOf(item)
            this.editedBookingItem = Object.assign({}, item)
            this.dialogBookingDelete = true
        },
        async clickConfirmUndoCheckinDialog() {
            try {
                // ยิงไปหลังบ้านเพื่ออัพเดทข้อมูล checkin
                await this.updateUndoCheckinStatus();

                // บันทึกตำแหน่งการ scroll ของหน้าจอ
                const scrollTop = window.scrollY;

                // โหลดข้อมูลใหม่
                await this.getReservationList();

                // คืนค่าตำแหน่งการ scroll ของหน้าจอ
                this.$nextTick(() => {
                window.scrollTo(0, scrollTop);
                });
            } catch (error) {
                console.error('Error in clickConfirmUndoCheckinDialog:', error);
            }
            },
            async clickConfirmCheckinDialog() {
            try {
                // ยิงไปหลังบ้านเพื่ออัพเดทข้อมูล checkin
                await this.updateCheckinStatus();

                // บันทึกตำแหน่งการ scroll ของหน้าจอ
                const scrollTop = window.scrollY;

                // โหลดข้อมูลใหม่
                await this.getReservationList();

                // คืนค่าตำแหน่งการ scroll ของหน้าจอ
                this.$nextTick(() => {
                window.scrollTo(0, scrollTop);
                });
            } catch (error) {
                console.error('Error in clickConfirmCheckinDialog:', error);
            }
        },
        async updateCheckinStatus() {
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/checkinByAdmin', {
                reservationid: this.editedBookingItem.reservationid,
                studentid: this.editedBookingItem.studentid,
            },
                {
                    headers: { Authorization: `Bearer ${token}`, }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        //this.$emit('onInfoHandler', 'Check-in Successful');
                    } else {
                        this.$emit('onErrorHandler', response.data.message || 'Check-in failed');
                    }
                    this.dialogCheckin = false
                })
                .catch(error => {
                    console.log(error)
                    if (error.response.status && error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        async updateUndoCheckinStatus() {
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/undoCheckinByAdmin', {
                reservationid: this.editedBookingItem.reservationid,
                studentid: this.editedBookingItem.studentid,
            },
                {
                    headers: { Authorization: `Bearer ${token}`, }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        //this.$emit('onInfoHandler', 'Cancel Check-in Successful');
                    } else {
                        this.$emit('onErrorHandler', response.data.message || 'Cancel Check-in failed');
                    }
                    this.dialogUndoCheckin = false
                })
                .catch(error => {
                    console.log(error)

                    if (error.response.status && error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        async clickConfirmDeleteBooking() {
            this.$emit('onLoading', true)
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/cancelBookingByAdmin', {
                reservationid: this.editedBookingItem.reservationid,
                studentid: this.editedBookingItem.studentid,
                courserefer: this.editedBookingItem.courserefer,
            },
                {
                    headers: { Authorization: `Bearer ${token}`, }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.$emit('onInfoHandler', response.data.message || 'Delete Reservation Successful');
                    } else {
                        this.$emit('onErrorHandler', response.data.message || 'Delete Reservation failed');
                    }
                    this.dialogBookingDelete = false
                    this.getReservationList()
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
            this.$emit('onLoading', false)
        },
        async clickEditBooking(item) {
            //console.log('clickEditBooking', item)
            await this.getCourseLookup()
            await this.getFamilyLookup()
            await this.getStudentLookup()
            this.courseinfoColor = 'courseinfoColorGreen'
            this.editedBookingIndex = this.BookingList.indexOf(item)
            this.editedBookingItem = Object.assign({}, item)
            this.selectedDate = new Date(this.editedBookingItem.classdate)
            this.getClassTime();
            this.dialogBookingEdit = true
        },
        clickCheckin(item) {
            //console.log('clickCheckin', item)
            this.editedBookingIndex = this.BookingList.indexOf(item)
            this.editedBookingItem = Object.assign({}, item)
            this.clickConfirmCheckinDialog()
        },
        clickUndoCheckin(item) {
            //console.log('clickUndoCheckin', item)
            this.editedBookingIndex = this.BookingList.indexOf(item)
            this.editedBookingItem = Object.assign({}, item)
            this.clickConfirmUndoCheckinDialog()
        },
        clickCancelCheckinDialog() {
            this.dialogCheckin = false
            setTimeout(() => {
                this.$nextTick(() => {
                    this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
                    this.editedBookingIndex = -1
                })
            }, 300)
        },
        clickCancelUndoCheckinDialog() {
            this.dialogUndoCheckin = false
            setTimeout(() => {
                this.$nextTick(() => {
                    this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
                    this.editedBookingIndex = -1
                })
            }, 300)
        },
        closeEditBooking() {
            this.dialogBookingEdit = false
            setTimeout(() => {
                this.$nextTick(() => {
                    this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
                    this.selectedDate = null
                    this.editedBookingIndex = -1
                    this.classtimesData = []
                })
            }, 300)
        },
        clickCancelDeleteBooking() {
            this.dialogBookingDelete = false
            setTimeout(() => {
                this.$nextTick(() => {
                    this.editedBookingItem = Object.assign({}, this.defaultBookingItem)
                    this.editedBookingIndex = -1
                })
            }, 300)
        },
        addOneDay(date = new Date()) {
            date.setDate(date.getDate() + 1);
            return date;
        },
        async getReservationList() {
            const reservedate = this.SQLDate(this.date)
            this.loadingBooking = true
            const token = this.$store.getters.getToken;
            await DashboardAPI.fetchDataBooking({ token, reservedate })
                .then(({ success, results, message, error }) => {
                    if (success) {
                        this.BookingList = results
                        if (reservedate == this.SQLDate(this.date)) {
                            this.loadingBooking = false
                        }
                    } else {
                        this.loadingBooking = false
                        this.$emit('onErrorHandler', message || 'Get Reservation failed')
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    } else {
                        this.$emit('onErrorHandler', error.message)
                    }
                });
        },
        onClickChangeState(state) {
            this.state = state
            this.$emit('onClickChangeState', state)
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
        format_date(value) {
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
        async showAddNewBooking() {
            this.$emit('onLoading', true)
            await this.getCourseLookup()
            await this.getFamilyLookup()
            await this.getStudentLookup()
            this.editedBookingIndex = -1;
            this.editedBookingItem = Object.assign({}, this.defaultBookingItem);
            this.$emit('onLoading', false)
            this.dialogBookingEdit = true;
        },
    },
    watch: {
        dialogBookingEdit(val) {
            val || this.closeEditBooking()
        },
        dialogCheckin(val) {
            val || this.clickCancelCheckinDialog()
        },
        dialogUndoCheckin(val) {
            val || this.clickCancelUndoCheckinDialog()
        },
        dialogBookingDelete(val) {
            val || this.clickCancelDeleteBooking()
        },

    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        tomorrow() {
            const d = new Date()
            d.setDate(d.getDate() + 1)
            return d
        },
        today() {
            return new Date()
        },
        formBookingTitle() {
            return this.editedBookingIndex === -1 ? 'Add a new booking' : 'Edit booking information'
        },
    }

})
import { Promise } from 'core-js';
const DashboardAPI = {
    baseURL: env.SERVER_URL,
    fetchDataBooking({ token, reservedate }) {
        return new Promise(resolve => {
            //console.log('DashboardAPI : ' + this.baseURL+'/getReservationList')
            axios
                .post(this.baseURL + '/getReservationList', {
                    classdate: reservedate
                },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                .then(response => {
                    //console.log('fetchDataBooking result',response);
                    if (response.data.success) {
                        const datalist = response.data.results
                        resolve({ success: true, results: datalist })
                    } else {
                        resolve({ success: true, results: [] })
                    }
                })
                .catch(error => {
                    resolve({ success: false, error: error })
                });
        });
    },
}
</script>
<style scoped>
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

.courseinfoColorRed {
    color: red;
}

.courseinfoColorGreen {
    color: green;
}

.font-card {
    font-size: 20px;
    font-weight: bold;
}

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

.pulse {
    cursor: pointer;
    /*box-shadow: 0 0 0 rgba(204,169,44, 0.4);*/
    box-shadow: 0px 2px 1px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12));
    animation: pulse 2s infinite;
}

.pulse:hover {
    animation: none;
}

@-webkit-keyframes pulse {
    0% {
        -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.2)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
    }

    70% {
        -webkit-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }

    100% {
        -webkit-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }
}

@keyframes pulse {
    0% {
        -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(255, 0, 0, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
        box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0.4)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(255, 0, 0, 0.12));
    }

    70% {
        -moz-box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
        box-shadow: 0 0 0 10px var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }

    100% {
        -moz-box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
        box-shadow: 0 0 0 0 var(--v-shadow-key-umbra-opacity, rgba(204, 169, 44, 0)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.14)), 0px 1px 3px 0px var(--v-shadow-key-penumbra-opacity, rgba(204, 169, 44, 0.12));
    }
}
</style>