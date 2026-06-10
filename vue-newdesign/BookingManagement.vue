<!-- ============================================================
  BookingManagement.vue — NEW DESIGN 1:1 (worked example for Claude Code)
  Drop-in replacement for src/components/admin/BookingManagement.vue
  • <script> = UNCHANGED byte-for-byte (date/selectDate/getReservationList,
    checkin: clickCheckin/clickUndoCheckin, clickEditBooking/deleteBookingItem,
    showAddNewBooking, ทุก API + auto-refresh 60s + ไดอะล็อกฟอร์มจอง).
  • <template> เฉพาะตารางขวาถูกรื้อเป็นดีไซน์ใหม่:
    - v-data-table  ->  toolbar มาตรฐาน (ค้นหา + รีเฟรช + เพิ่มการจอง แถวเดียวกัน)
      + ตาราง .idt (วนหัวจาก BookingListHeaders เดิม) · เช็คชื่อ = ไอคอนกดสลับ checkin
    - ปฏิทินซ้าย (v-date-picker -> date) คงเดิม · ไดอะล็อกทั้งหมดคงไว้
    หมายเหตุ: ถ้าต้องการปิดวันจันทร์/วันหยุดแบบพรีวิว ให้เพิ่ม :allowed-dates ที่ v-date-picker
    (อ่าน config วันหยุดจาก backend) — เป็น enhancement ที่ไม่กระทบ logic เดิม
  Requires: src/assets/istar-design.css + istar-pages.css imported once globally.
============================================================ -->
<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-calendar-edit"></span> {{ $t('bookingMgmt.title') }}</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="12" md="3" xl="3">
                        <v-card class="mx-0 card-opacity" height="475">
                            <v-list-item class="header-card">
                                <div>{{ $t('bookingMgmt.viewByDate') }}</div>
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
                            <div v-if="state == 'bookinglist'">
                                <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap">
                                    <div class="isk-sec">{{ $t('bookingMgmt.allBookingsToday') }}</div>
                                </div>
                                <!-- มาตรฐาน DataGrid: toolbar แถวเดียว [ค้นหา] -> (ดันขวา) [รีเฟรช][เพิ่มการจอง] -->
                                <div class="grid-toolbar">
                                    <label class="grid-search"><span class="mdi mdi-magnify"></span>
                                        <input class="id-input" v-model="search" :placeholder="$t('btn.search')" /></label>
                                    <span class="grid-spacer"></span>
                                    <button class="id-btn id-btn-ghost id-btn-sm" @click="initialize"><span class="mdi mdi-refresh"></span> {{ $t('btn.refresh') }}</button>
                                    <button class="id-btn id-btn-primary id-btn-sm" @click="showAddNewBooking"><span class="mdi mdi-emoticon-plus-outline"></span> {{ $t('btn.newBooking') }}</button>
                                </div>
                                <!-- ตาราง .idt: วนหัวจาก BookingListHeaders เดิม / checkin = ไอคอนกดสลับเช็คอิน -->
                                <div class="scard" style="padding:14px">
                                    <div style="overflow-x:auto">
                                        <table class="idt">
                                            <thead><tr><th v-for="h in BookingListHeaders" :key="h.key" :style="{ textAlign: h.align==='center' ? 'center' : 'left' }">{{ h.title }}</th></tr></thead>
                                            <tbody>
                                                <tr v-for="item in BookingList" :key="item.reservationid"
                                                    v-show="!search || ((item.fullname||'')+(item.coursename||'')).toLowerCase().includes(search.toLowerCase())">
                                                    <td v-for="h in BookingListHeaders" :key="h.key" :style="{ textAlign: h.align==='center' ? 'center' : 'left' }">
                                                        <template v-if="h.key==='fullname'"><b>{{ item.fullname }}</b></template>
                                                        <template v-else-if="h.key==='classtime'"><span class="badge badge-neutral">{{ item.classtime }}</span></template>
                                                        <template v-else-if="h.key==='checkin'">
                                                            <span v-if="parseInt(item.checkedin)===0" class="mdi mdi-close-circle-outline" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="clickCheckin(item)"></span>
                                                            <span v-else-if="parseInt(item.checkedin)===1" class="mdi mdi-check-circle" style="color:var(--c-success);cursor:pointer;font-size:20px" @click="clickUndoCheckin(item)"></span>
                                                        </template>
                                                        <template v-else-if="h.key==='edit'"><span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px" @click="clickEditBooking(item)"></span></template>
                                                        <template v-else-if="h.key==='delete'"><span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="deleteBookingItem(item)"></span></template>
                                                        <template v-else>{{ item[h.key] }}</template>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div v-if="!loadingBooking && BookingList.length===0" class="grid-empty"><span class="mdi mdi-calendar-blank-outline"></span>{{ $t('bookingMgmt.noBooking') }}</div>
                                </div>
                                <!-- ===== ไดอะล็อกเดิมทั้งหมด คงไว้ ไม่แตะ logic ===== -->
                                <v-dialog v-model="dialogBookingEdit" max-width="800px">
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
                                                                            :label="$t('table.name')" item-title="name"
                                                                            item-value="studentid"
                                                                            :items="studentLookup" variant="solo-filled"
                                                                            :no-data-text="$t('common.noStudentData')"
                                                                            :rules="notNullRules"
                                                                            @update:modelValue="onStudentChange"
                                                                            :readonly="editedBookingIndex != -1"
                                                                            filterable
                                                                            required>
                                                                        </v-autocomplete>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select v-model="editedBookingItem.courseid"
                                                                            :label="$t('table.courseName')" item-title="coursename"
                                                                            item-value="courseid" :items="courseLookup"
                                                                            variant="solo-filled"
                                                                            :no-data-text="$t('common.noCourseData')"
                                                                            :rules="notNullRules"
                                                                            :loading="loadingCourse"
                                                                            @update:modelValue="getClassTime"
                                                                            required></v-select>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="4">
                                                                        <DatePicker :label="$t('table.date')"
                                                                            v-model="selectedDate" variant="solo-filled"
                                                                            @update:modelValue="getClassTime" :rules="requireRules">
                                                                        </DatePicker>
                                                                    </v-col>
                                                                    <v-col cols="12" sm="6" md="6">
                                                                        <v-select v-model="editedBookingItem.classtime"
                                                                            :label="$t('table.classTime')" item-title="text"
                                                                            item-value="classid" :items="classtimesData"
                                                                            variant="solo-filled" :rules="notNullRules"
                                                                            :no-data-text="$t('common.noClassData')"
                                                                            :loading="loadingClassTime"
                                                                            return-object="true" required></v-select>
                                                                    </v-col>
                                                                    <v-col cols="4" sm="4" md="4">
                                                                        <v-checkbox
                                                                        v-model="editedBookingItem.freeflag"
                                                                        :label="$t('bookingMgmt.freeClass')"
                                                                        color="success"
                                                                        class="ma-2"
                                                                        :disabled="editedBookingIndex != -1"
                                                                        :value="1"
                                                                        />
                                                                    </v-col>
                                                                </v-row>
                                                            </v-form>
                                                        </v-container>
                                                    </v-card-text>

                                                    <v-card-actions class="sticky-footer">
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="red-darken-1" variant="flat"
                                                            @click="closeEditBooking">
                                                            {{ $t('btn.cancel') }}
                                                        </v-btn>
                                                        <v-btn color="blue-darken-1" variant="flat"
                                                            @click="doSaveNewBooking">
                                                            {{ $t('btn.save') }}
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogBookingDelete" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>{{ $t('bookingMgmt.confirmDelete', { name: editedBookingItem.fullname }) }}</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmDeleteBooking">{{ $t('btn.ok') }}</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelDeleteBooking">{{ $t('btn.cancel') }}</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogCheckin" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>{{ $t('bookingMgmt.confirmCheckin', { name: editedBookingItem.fullname }) }}</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmCheckinDialog">{{ $t('btn.ok') }}</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelCheckinDialog">{{ $t('btn.cancel') }}</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogUndoCheckin" persistent width="auto">
                                                <v-card>
                                                    <v-card-title></v-card-title>
                                                    <v-card-text>{{ $t('bookingMgmt.confirmUndoCheckin', { name: editedBookingItem.fullname }) }}</v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="#4CAF50" variant="tonal"
                                                            @click="clickConfirmUndoCheckinDialog">{{ $t('btn.ok') }}</v-btn>
                                                        <v-btn color="#F44336" variant="tonal"
                                                            @click="clickCancelUndoCheckinDialog">{{ $t('btn.cancel') }}</v-btn>

                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                </div>
                        </Transition>
                    </v-col>
                </v-row>
                <v-row>
                </v-row>
            </div>
        </div>
    <v-dialog width="500" v-model="errorDialog">
        <template v-slot:default="{ isActive }">
            <v-card :title="$t('dialog.error')" color="#F44336">
                <v-card-text>
                    {{ errorMsg }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" variant="tonal" block @click="errorDialog = false">{{ $t('btn.close') }}</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

    <v-dialog width="500" v-model="infoDialog">
        <template v-slot:default="{ isActive }">
            <v-card :title="$t('dialog.success')" color="#98FB98">
                <v-card-text>
                    {{ infoMsg }}
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" variant="tonal" block @click="infoDialog = false">{{ $t('btn.ok') }}</v-btn>
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
            BookingListHeadersData: [],
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
                freeflag: 0,
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
                freeflag: 0,
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

            notNullRules: [v => !!v || this.$t('common.required'),]
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
                                this.editedBookingItem.courseinfo = this.$t('bookingMgmt.courseInfoMonthly', { ref: res.courserefer, expiry: this.format_date(res.expiredate) })
                            } else {
                                this.editedBookingItem.courseinfo = this.$t('bookingMgmt.courseInfoLimited', { ref: res.courserefer, expiry: this.format_date(res.expiredate), remaining: res.remaining })
                            }
                        } else {
                            this.courseinfoColor = 'courseinfoColorRed'
                            this.editedBookingItem.courseinfo = this.$t('bookingMgmt.noCourse')
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
                    freeflag: this.editedBookingItem.freeflag,
                }
                //console.log(this.editedBookingIndex + ' BookingObj : ', BookingObj)

                const token = this.$store.getters.getToken;
                if (this.editedBookingIndex > -1) {
                    BookingObj.reservationid = this.editedBookingItem.reservationid
                    await axios
                        .post(this.baseURL + '/updateBookingByAdmin', BookingObj, { headers: { Authorization: `Bearer ${token}`, } })
                        .then(response => {
                            if (response.data.success) {
                                this.$emit('onInfoHandler', this.$t('msg.updated'));
                                this.getReservationList()
                                this.dialogBookingEdit = false
                            } else {
                                this.$emit('onErrorHandler', response.data.message || this.$t('msg.updateFail'));
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
                                this.$emit('onInfoHandler', this.$t('msg.bookingAdded'));
                                this.getReservationList()
                                this.dialogBookingEdit = false
                            } else {
                                this.$emit('onErrorHandler', response.data.message || this.$t('msg.bookingAddFail'));
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
                this.$emit('onErrorHandler', this.$t('msg.required'))
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
                        this.$emit('onErrorHandler', response.data.message || this.$t('bookingList.checkinFail'));
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
                        this.$emit('onErrorHandler', response.data.message || this.$t('bookingList.undoCheckinFail'));
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
                        this.$emit('onInfoHandler', response.data.message || this.$t('msg.reservationDeleted'));
                    } else {
                        this.$emit('onErrorHandler', response.data.message || this.$t('msg.reservationDeleteFail'));
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
            return this.editedBookingIndex === -1 ? this.$t('btn.newBooking') : this.$t('btn.edit')
        },
        BookingListHeaders() {
            return [
                { title: this.$t('table.name'), key: 'fullname' },
                { title: this.$t('table.courseName'), key: 'coursename' },
                { title: this.$t('table.time'), key: 'classtime' },
                { title: this.$t('table.checkin'), key: 'checkin', align: 'center', sortable: false },
                { title: this.$t('table.edit'), key: 'edit', align: 'center', sortable: false },
                { title: this.$t('table.delete'), key: 'delete', align: 'center', sortable: false },
            ]
        },
    }

})
import { Promise } from 'core-js';
import { readonly } from 'vue'
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

<style scoped>
/* ============================================================
   iStar NEW DESIGN reskin (single theme) — layered overrides.
   Appended on top of the original styles so layout is preserved
   while colours / radius / shadow / fonts adopt the new design.
   Pulls tokens from the global src/assets/istar-design.css.
   ============================================================ */
:deep(.v-card){ border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm) !important; border: 1px solid var(--c-border) !important; }
:deep(.v-btn){ border-radius: var(--radius-md) !important; text-transform: none !important; letter-spacing: normal !important; font-weight: 700 !important; }
:deep(.v-btn.bg-primary), :deep(.v-btn--variant-elevated){ box-shadow: var(--shadow-sm) !important; }
:deep(.v-field){ border-radius: 14px !important; }
:deep(.v-field--variant-solo-filled){ background: var(--c-surface-2) !important; box-shadow: none !important; }
:deep(.v-toolbar){ background: transparent !important; }
:deep(.v-toolbar-title){ font-family: var(--font-head) !important; font-weight: 800 !important; color: var(--c-text-heading) !important; }
:deep(.v-table){ background: transparent !important; }
:deep(.v-table > .v-table__wrapper > table > thead > tr > th){ background: var(--c-surface-2) !important; color: var(--c-text-heading) !important; font-family: var(--font-head) !important; font-weight: 700 !important; border-bottom: 2px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td){ border-bottom: 1px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover > td){ background: var(--c-surface-3) !important; }
:deep(.v-chip){ font-weight: 600; }
:deep(.v-tab){ text-transform: none !important; font-weight: 700 !important; }
:deep(.v-list){ background: transparent !important; }
:deep(.group-header){ font-family: var(--font-head) !important; font-weight: 700 !important; color: var(--c-text-heading) !important; }
</style>
