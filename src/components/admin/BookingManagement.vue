<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-calendar-edit"></span></div>
            <div>
                <div class="id-h1">{{ $t('bookingMgmt.title') }}</div>
                <div class="pg-sub">{{ $t('bookingMgmt.viewByDate') }}</div>
            </div>
        </div>

        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px;flex-wrap:wrap">
            <div class="isk-sec">{{ $t('bookingMgmt.allBookingsToday') }}</div>
            <div class="reserve-datebar" style="margin-bottom:0">
                <span class="mdi mdi-calendar-check"></span> <b>{{ format_date(date) }}</b>
            </div>
        </div>

        <div class="grid2 grid2-booking">
            <div class="scard" style="padding:16px;align-self:start;max-width:340px;width:100%">
                <div class="step-head"><span class="mdi mdi-calendar-search" style="color:var(--c-primary);font-size:22px"></span> {{ $t('bookingMgmt.viewByDate') }}</div>
                <id-calendar
                    :model-value="date ? (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()) : ''"
                    @update:model-value="key => { const p = key.split('-'); date = new Date(+p[0], +p[1] - 1, +p[2]); selectDate(); }">
                </id-calendar>
            </div>
            <div>
                <Transition name="fade" mode="out-in">
                    <div v-if="state == 'bookinglist'">
                        <id-data-grid
                            :columns="BookingListHeaders"
                            :rows="sortedBookingList"
                            :search-keys="['fullname', 'coursename', 'classtime']"
                            :filters="bookingFilters"
                            :search-placeholder="$t('btn.search')"
                            :loading="loadingBooking">
                            <template #actions>
                                <button class="id-btn id-btn-ghost id-btn-sm" @click="initialize">
                                    <span class="mdi mdi-refresh"></span> {{ $t('btn.refresh') }}
                                </button>
                                <button class="id-btn id-btn-primary id-btn-sm" @click="showAddNewBooking">
                                    <span class="mdi mdi-emoticon-plus-outline"></span> {{ $t('btn.newBooking') }}
                                </button>
                            </template>
                            <template #cell-checkin="{ row }">
                                <span v-if="parseInt(row.checkedin) === 0" class="mdi mdi-check-bold" style="color:var(--c-success);cursor:pointer;font-size:20px" @click="clickCheckin(row)"></span>
                                <span v-else-if="parseInt(row.checkedin) === 1" class="mdi mdi-close-thick" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="clickUndoCheckin(row)"></span>
                            </template>
                            <template #cell-edit="{ row }">
                                <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px" @click="clickEditBooking(row)"></span>
                            </template>
                            <template #cell-delete="{ row }">
                                <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="deleteBookingItem(row)"></span>
                            </template>
                        </id-data-grid>
                        <!-- booking dialogs (modals — teleported, so layout/placement is unaffected) -->
                                            <id-modal v-model="dialogBookingEdit" size="lg" persistent
                                                :icon="editedBookingIndex == -1 ? 'mdi-emoticon-plus-outline' : 'mdi-human-edit'"
                                                :title="formBookingTitle">
                                                <v-form ref="bookingform">
                                                    <div v-if="editedBookingItem.courseinfo" class="t-cap" :class="courseinfoColor" style="margin-bottom:14px">{{ editedBookingItem.courseinfo }}</div>
                                                    <div class="form-grid">
                                                        <div class="field"><label>{{ $t('table.name') }} <span class="req">*</span></label>
                                                            <id-select v-model="editedBookingItem.studentid" searchable :disabled="editedBookingIndex != -1"
                                                                placeholder="— เลือกนักเรียน —" search-placeholder="พิมพ์ชื่อนักเรียน…"
                                                                :options="studentLookup.map(s => ({ value: s.studentid, label: s.name }))"
                                                                @update:model-value="onStudentChange"></id-select></div>
                                                        <div class="field"><label>{{ $t('table.courseName') }} <span class="req">*</span></label>
                                                            <id-select v-model="editedBookingItem.courseid" searchable placeholder="— เลือกคอร์ส —"
                                                                :options="courseLookup.map(c => ({ value: c.courseid, label: c.coursename }))"
                                                                @update:model-value="getClassTime"></id-select></div>
                                                        <div class="field"><label>{{ $t('table.date') }}</label>
                                                            <id-date v-model="selectedDate" placeholder="เลือกวันที่" @update:model-value="getClassTime"></id-date></div>
                                                        <div class="field"><label>{{ $t('table.classTime') }} <span class="req">*</span></label>
                                                            <id-select :model-value="editedBookingItem.classtime ? editedBookingItem.classtime.classid : ''"
                                                                placeholder="— เลือกรอบเวลา —"
                                                                :options="classtimesData.map(c => ({ value: c.classid, label: c.text }))"
                                                                @update:model-value="id => editedBookingItem.classtime = classtimesData.find(c => c.classid === id)"></id-select></div>
                                                    </div>
                                                    <label class="id-cbx" style="margin-top:16px" :style="{ opacity: editedBookingIndex != -1 ? .5 : 1 }"
                                                        @click="editedBookingIndex == -1 && (editedBookingItem.freeflag = editedBookingItem.freeflag ? 0 : 1)">
                                                        <span class="id-check" :class="{ on: editedBookingItem.freeflag == 1 }"><span class="mdi mdi-check"></span></span>
                                                        {{ $t('bookingMgmt.freeClass') }}
                                                    </label>
                                                </v-form>
                                                <template #footer>
                                                    <button class="id-btn id-btn-ghost" @click="closeEditBooking">{{ $t('btn.cancel') }}</button>
                                                    <button class="id-btn id-btn-primary"
                                                        :disabled="!editedBookingItem.studentid || !editedBookingItem.courseid || !editedBookingItem.classtime"
                                                        @click="doSaveNewBooking">
                                                        <span class="mdi mdi-content-save"></span> {{ $t('btn.save') }}</button>
                                                </template>
                                            </id-modal>
                                            <id-modal v-model="dialogBookingDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
                                                <p style="margin:0">{{ $t('bookingMgmt.confirmDelete', { name: editedBookingItem.fullname }) }}</p>
                                                <template #footer>
                                                    <button class="id-btn id-btn-ghost" @click="clickCancelDeleteBooking">{{ $t('btn.cancel') }}</button>
                                                    <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="clickConfirmDeleteBooking"><span class="mdi mdi-delete"></span> {{ $t('btn.ok') }}</button>
                                                </template>
                                            </id-modal>
                                            <id-modal v-model="dialogCheckin" size="sm" icon="mdi-check-circle-outline" :title="$t('bookingList.menuCheckin')" persistent>
                                                <p style="margin:0">{{ $t('bookingMgmt.confirmCheckin', { name: editedBookingItem.fullname }) }}</p>
                                                <template #footer>
                                                    <button class="id-btn id-btn-ghost" @click="clickCancelCheckinDialog">{{ $t('btn.cancel') }}</button>
                                                    <button class="id-btn id-btn-primary" @click="clickConfirmCheckinDialog"><span class="mdi mdi-check"></span> {{ $t('btn.ok') }}</button>
                                                </template>
                                            </id-modal>
                                            <id-modal v-model="dialogUndoCheckin" size="sm" icon="mdi-undo-variant" :title="$t('bookingList.menuUndoCheckin')" persistent>
                                                <p style="margin:0">{{ $t('bookingMgmt.confirmUndoCheckin', { name: editedBookingItem.fullname }) }}</p>
                                                <template #footer>
                                                    <button class="id-btn id-btn-ghost" @click="clickCancelUndoCheckinDialog">{{ $t('btn.cancel') }}</button>
                                                    <button class="id-btn id-btn-primary" @click="clickConfirmUndoCheckinDialog"><span class="mdi mdi-check"></span> {{ $t('btn.ok') }}</button>
                                                </template>
                                            </id-modal>
                    </div>
                </Transition>
            </div>
        </div>
    <id-modal v-model="errorDialog" size="sm" icon="mdi-alert-circle-outline" :title="$t('dialog.error')">
        <p style="margin:0">{{ errorMsg }}</p>
        <template #footer>
            <button class="id-btn id-btn-primary" @click="errorDialog = false">{{ $t('btn.close') }}</button>
        </template>
    </id-modal>

    <id-modal v-model="infoDialog" size="sm" icon="mdi-check-circle-outline" :title="$t('dialog.success')">
        <p style="margin:0">{{ infoMsg }}</p>
        <template #footer>
            <button class="id-btn id-btn-primary" @click="infoDialog = false">{{ $t('btn.ok') }}</button>
        </template>
    </id-modal>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex';
export default ({
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
        async onStudentChange() {
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
            const t0 = Date.now()
            const token = this.$store.getters.getToken;
            await DashboardAPI.fetchDataBooking({ token, reservedate })
                .then(async ({ success, results, message }) => {
                    if (success) {
                        this.BookingList = results
                        if (reservedate == this.SQLDate(this.date)) {
                            await this.$minLoad(t0)
                            this.loadingBooking = false
                        }
                    } else {
                        await this.$minLoad(t0)
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
                return moment(value).format('DD/MM/YYYY')
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
        // IdDataGrid renders rows in the given order; sort by class time asc here
        // (replaces the v-data-table :sort-by we removed in the grid conversion).
        sortedBookingList() {
            return [...this.BookingList].sort((a, b) => String(a.classtime).localeCompare(String(b.classtime)))
        },
        // toolbar filters (client-side, IdDataGrid): by course + by check-in status
        bookingFilters() {
            const courses = [...new Set(this.BookingList.map(b => b.coursename).filter(Boolean))].map(c => ({ value: c, label: c }))
            return [
                { key: 'coursename', label: this.$t('table.courseName'), options: courses },
                { key: 'checkedin', label: this.$t('table.checkin'), options: [
                    { value: 1, label: this.$t('bookingList.menuCheckedInBadge') },
                    { value: 0, label: this.$t('bookingList.notCheckedIn') },
                ] },
            ]
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