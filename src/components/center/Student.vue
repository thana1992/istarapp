<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-account-group"></span></div>
            <div><div class="id-h1">{{ $t('gymnasts.listTitle') }}</div></div>
        </div>
        <!-- มาตรฐาน DataGrid: toolbar แถวเดียว [ค้นหา] -> (ดันขวา) [รีเฟรช][เพิ่ม] -->
        <div class="grid-toolbar">
            <label class="grid-search"><span class="mdi mdi-magnify"></span>
                <input class="id-input" v-model="search" :placeholder="$t('btn.search')" /></label>
            <span class="grid-spacer"></span>
            <button class="id-btn id-btn-ghost id-btn-sm" @click="initialize"><span class="mdi mdi-refresh"></span> {{ $t('btn.refresh') }}</button>
            <button class="id-btn id-btn-primary id-btn-sm" @click="showAddNewStudent"><span class="mdi mdi-emoticon-plus-outline"></span> {{ $t('gymnasts.addStudent') }}</button>
        </div>
        <!-- ตาราง .idt: วนหัวจาก StudentListHeaders เดิม (i18n ถูกอัตโนมัติ) -->
        <div class="scard" style="padding:14px">
            <div style="overflow-x:auto">
                <table class="idt">
                    <thead><tr><th v-for="h in StudentListHeaders" :key="h.key" :style="{ textAlign: (h.align==='center'||h.align==='end') ? 'center' : 'left' }">{{ h.title }}</th></tr></thead>
                    <tbody>
                        <tr v-for="item in StudentList" :key="item.studentid">
                            <td v-for="h in StudentListHeaders" :key="h.key" :style="{ textAlign: (h.align==='center'||h.align==='end') ? 'center' : 'left' }">
                                <template v-if="h.key==='fullname'">{{ item.fullname }}</template>
                                <template v-else-if="h.key==='dateofbirth'">{{ calculateAge(item.dateofbirth).int }}</template>
                                <template v-else-if="h.key==='expiredate'"><span :class="{ 'highlighted-red': item.expiredate != null && isExpiredDate(item.expiredate) }">{{ expireDateLeft(item.expiredate) }}</span></template>
                                <template v-else-if="h.key==='edit'"><span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px" @click="clickEditStudent(item)"></span></template>
                                <template v-else-if="h.key==='delete'"><span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px" @click="clickDeleteStudent(item)"></span></template>
                                <template v-else>{{ item[h.key] }}</template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="!loadingStudent && StudentList.length===0" class="grid-empty"><span class="mdi mdi-account-off-outline"></span>{{ $t('common.noStudentList') }}</div>
            <!-- footer: server pagination เดิม (tableOptions + totalStudents) -->
            <div class="grid-foot" v-if="totalStudents > 0">
                <span class="grid-count">{{ totalStudents }}</span>
                <div class="grid-pager">
                    <button class="pager-btn" :disabled="tableOptions.page<=1" @click="tableOptions.page--; getStudentList(currentActive)"><span class="mdi mdi-chevron-left"></span></button>
                    <span class="pager-now"><b>{{ tableOptions.page }}</b> / {{ Math.max(1, Math.ceil(totalStudents / tableOptions.itemsPerPage)) }}</span>
                    <button class="pager-btn" :disabled="tableOptions.page >= Math.ceil(totalStudents / tableOptions.itemsPerPage)" @click="tableOptions.page++; getStudentList(currentActive)"><span class="mdi mdi-chevron-right"></span></button>
                </div>
            </div>
        </div>

        <!-- ===== ไดอะล็อกเดิมทั้งหมด คงไว้ ไม่แตะ logic (เปิดด้วยปุ่ม showAddNewStudent / clickEditStudent) ===== -->
        <v-dialog v-model="dialogStudent" max-width="1080px" style="z-index: 999">
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

                        <v-card>
                            <v-card-title class="sticky-header">
                                <span v-if="editedStudentIndex == -1" class="mdi mdi-emoticon-plus-outline"></span>
                                <span v-if="editedStudentIndex != -1" class="mdi mdi-human-edit"></span>
                                <span>{{ formStudentTitle }}</span>
                            </v-card-title>
                            <v-card-text class="scrollable-content">
                                <v-container>
                                    <v-form ref="newstdform">
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12" style="text-align: center;">
                                                <div style="
                                                    min-height: 150px;
                                                    display: ruby-text;
                                                    cursor: pointer;
                                                ">
                                                    <v-img :src="imagePreview" class="info-photo rounded-circle"
                                                        width="150" height="150" @click="triggerFileInput">
                                                    </v-img>
                                                </div>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12">
                                                <h3 class="group-header">{{ $t('table.studentInfo') }}</h3>
                                                <v-divider class="border-opacity-100" color="success" thickness="3"></v-divider>
                                                <v-divider color="#fffff" thickness="3"></v-divider>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedStudentItem.firstname" :label="$t('table.firstname')"
                                                    variant="solo-filled" :rules="notNullRules" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedStudentItem.middlename" :label="$t('table.middlename')"
                                                    variant="solo-filled" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedStudentItem.lastname" :label="$t('table.lastname')"
                                                    variant="solo-filled" :rules="notNullRules" required></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="3">
                                                <v-text-field v-model="editedStudentItem.nickname" :label="$t('table.nickname')"
                                                    variant="solo-filled" :rules="notNullRules" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="3">
                                                <v-select v-model="editedStudentItem.gender" :label="$t('table.gender')"
                                                    :items="[{ title: $t('common.male'), value: 'ชาย' }, { title: $t('common.female'), value: 'หญิง' }]" variant="solo-filled" :rules="notNullRules"
                                                    required></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="3">
                                                <DatePicker :label="$t('table.dob')" variant="solo-filled"
                                                    v-model="editedStudentItem.dateofbirth" :maxdate="new Date()"
                                                    @click="calculateAgeNewStudent" rules="notNullRules" required>
                                                </DatePicker>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="3">
                                                <v-text-field :label="$t('table.age')" v-model="editedStudentItem.age" readonly
                                                    variant="solo-filled"></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="3">
                                                <v-text-field :label="$t('table.level')" type="number" v-model="editedStudentItem.level" 
                                                    variant="solo-filled" :rules="levelRules" ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="12">
                                                <v-textarea v-model="editedStudentItem.shortnote" :label="$t('table.shortNote')"
                                                    variant="solo-filled" rows="4">
                                                </v-textarea>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="5">
                                                <v-autocomplete v-model="editedStudentItem.familyid" :label="$t('table.parentUsername')"
                                                    item-title="username" item-value="familyid" :items="familyLookup"
                                                    variant="solo-filled" :rules="notNullRules" required filterable>
                                                </v-autocomplete>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="7">
                                                <v-file-input v-model="editedStudentItem.profile_image" :label="$t('table.profileImage')"
                                                    accept="image/*" show-size outlined prepend-icon="mdi-camera"
                                                    :loading="uploadLoading" @change="onFileChange"
                                                    @click:clear="onFileClear" style="display: none" ref="fileInput">
                                                </v-file-input>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="4" md="4">
                                                <v-autocomplete v-model="editedStudentItem.courserefer"
                                                    :label="$t('table.courseRefer')" item-title="courserefer"
                                                    item-value="courserefer" :items="customerCourseLookup"
                                                    variant="solo-filled" :no-data-text="$t('common.noCourseData')"
                                                    editable @update:modelValue="onCourseChange"
                                                    filterable></v-autocomplete>
                                            </v-col>
                                            <v-col cols="12" sm="4" md="4" class="arrow-col">
                                                <div class="arrow">
                                                    <span class="arrow-text">{{ $t('common.nextCourse') }}</span>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" sm="4" md="4">
                                                <v-autocomplete v-model="editedStudentItem.courserefer2"
                                                    :label="$t('table.continueCourseRefer')" item-title="courserefer"
                                                    item-value="courserefer" :items="customerCourseLookup"
                                                    variant="solo-filled" :no-data-text="$t('common.noCourseData')"
                                                    editable
                                                    filterable></v-autocomplete>
                                            </v-col>
                                            <v-col cols="12" sm="2" md="2" v-if="editedStudentIndex != -1">
                                                <v-btn height="55"
                                                    prepend-icon="mdi-check-circle"
                                                    @click="finishCourse()"
                                                    >
                                                    <template v-slot:prepend>
                                                        <v-icon color="success"></v-icon>
                                                    </template>
                                                    {{ $t('table.finish') }}
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12">
                                            <h3 class="group-header">{{ $t('table.courseUsageHistory') }}</h3>
                                            <v-divider class="border-opacity-100" color="success" thickness="3"></v-divider>
                                            <v-divider color="#fffff" thickness="3"></v-divider>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12">
                                                <v-label style="white-space: break-spaces">{{
                                                    editedStudentItem.current_course_detail
                                                }}</v-label>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12">
                                                    <v-data-table :headers="CourseUsingHeaders" :items="CourseUsingtList" density="compact"
                                                    :items-per-page="100" >
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
                                        
                                    </v-form>
                                </v-container>
                            </v-card-text>

                            <v-card-actions class="sticky-footer">
                                <v-spacer></v-spacer>
                                <v-btn color="red-darken-1" variant="flat" @click="closeStudent">
                                    {{ $t('btn.cancel') }}
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="flat" @click="doSaveNewStudent">
                                    {{ $t('btn.save') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogStudentDelete" persistent width="auto">
                        <v-card>
                            <v-card-title></v-card-title>
                            <v-card-text>{{ $t('gymnasts.confirmDelete') }}</v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteStd">{{ $t('btn.ok') }}</v-btn>
                                <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteStd">{{ $t('btn.cancel') }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
    </div>
</template>
<script>
import axios from "axios";
import DatePicker from "@/components/DatePicker.vue";
import moment from "moment";
import { mapGetters } from "vuex";
export default {
    components: {
        DatePicker,
    },
    data() {
        return {
            search: "",
            uploadLoading: false,
            StudentList: [],
            imagePreview: require("@/assets/avatar/2.png"),
            StudentListHeadersData: [],
            editedStudentItem: {
                studentid: null,
                familyid: null,
                firstname: null,
                middlename: null,
                lastname: null,
                nickname: null,
                gender: null,
                dateofbirth: null,
                level: null,
                age: null,
                courserefer: null,
                courserefer2: null,
                current_course_detail: null,
                username: null,
                profile_image: null,
                profile_image_url: null,
                shortnote: null,
            },
            defaultStudentItem: {
                studentid: null,
                familyid: null,
                firstname: null,
                middlename: null,
                lastname: null,
                nickname: null,
                gender: null,
                dateofbirth: null,
                level: null,
                age: null,
                courserefer: null,
                courserefer2: null,
                current_course_detail: null,
                username: null,
                profile_image: null,
                profile_image_url: null,
                shortnote: null,
            },
            CourseUsingHeadersData: [],
            CourseUsingtList: [],
            base64Image: null,
            editedStudentIndex: -1,
            dialogStudent: false,
            dialogStudentDelete: false,
            loadingStudent: false,
            dialogFinish: false,
            notNullRules: [(v) => !!v || this.$t("common.required")],
            totalStudents: 0,
            tableOptions: { page: 1, itemsPerPage: 10, sortBy: [] },
            searchTimer: null,
            isMounted: false,
            currentActive: false,
        };
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
            await this.getCustomerCourseLookup();
            await this.getFamilyLookup();
            await this.getStudentList(false);

            this.$emit("onLoading", false);
        },
        async initializeActive() {
            this.$emit("onLoading", true);
            await this.getCustomerCourseLookup();
            await this.getFamilyLookup();
            await this.getStudentList(true);

            this.$emit("onLoading", false);
        },
        async getStudentList(active) {
            this.currentActive = active;
            this.loadingStudent = true;
            const token = this.$store.getters.getToken;
            const { page, itemsPerPage, sortBy } = this.tableOptions;
            await ComponentAPI.fetchDataStudent({ token, active, page, itemsPerPage, search: this.search, sortBy })
                .then(({ success, results, total, message }) => {
                    if (success) {
                        this.StudentList = results;
                        this.totalStudents = total ?? 0;
                    } else {
                        this.$emit("onErrorHandler", message || this.$t("msg.studentListFail"));
                    }
                    this.loadingStudent = false;
                })
                .catch((error) => {
                    this.loadingStudent = false;
                    if (error.response && error.response.status == 401) {
                        this.$emit("onErrorHandler", error.response.data.message);
                        this.$emit("onClickChangeState", "login");
                    } else {
                        this.$emit("onErrorHandler", error.message);
                    }
                });
        },
        onTableOptions({ page, itemsPerPage, sortBy }) {
            this.tableOptions = { ...this.tableOptions, page, itemsPerPage, sortBy };
            if (!this.isMounted) return;
            this.getStudentList(this.currentActive);
        },
        async doSaveNewStudent() {
            this.$emit("onLoading", true);
            const { valid } = await this.$refs.newstdform.validate();
            if (valid) {
                // Make API request to register the user
                let dob = null;
                if(this.editedStudentItem.dateofbirth){
                    dob = this.SQLDate(this.editedStudentItem.dateofbirth);
                }
                const StudentObj = {
                    studentid: this.editedStudentItem.studentid,
                    firstname: this.editedStudentItem.firstname,
                    middlename: this.editedStudentItem.middlename,
                    lastname: this.editedStudentItem.lastname,
                    nickname: this.editedStudentItem.nickname,
                    gender: this.editedStudentItem.gender,
                    dateofbirth: dob,
                    level: this.editedStudentItem.level,
                    familyid: this.editedStudentItem.familyid,
                    courserefer: this.editedStudentItem.courserefer,
                    courserefer2: this.editedStudentItem.courserefer2,
                    shortnote: this.editedStudentItem.shortnote,
                    profile_image_url: this.editedStudentItem.profile_image_url,
                };

                //console.log(this.editedStudentIndex+ ' StudentObj : ', StudentObj)
                const token = this.$store.getters.getToken;
                if (this.editedStudentIndex > -1) {
                    StudentObj.studentid = this.editedStudentItem.studentid;
                    await axios
                        .post(this.baseURL + "/updateStudentByAdmin", StudentObj, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((response) => {
                            if (response.data.success) {
                                this.handleProfileImageUpload(this.editedStudentItem.profile_image, this.editedStudentItem.studentid);
                                //this.uploadImageProfile(this.editedStudentItem.studentid);
                                this.$emit("onInfoHandler", this.$t('msg.updated'));
                                this.getStudentList();
                                this.dialogStudent = false;
                                this.$emit("onUpdateDataSuccess");
                            } else {
                                this.$emit(
                                    "onErrorHandler",
                                    response.data.message || this.$t('msg.updateFail')
                                );
                            }
                        })
                        .catch((error) => {
                            //console.log(error);
                            if (error.response.status && error.response.status == 401) {
                                this.$emit("onErrorHandler", error.response.data.message);
                                this.$emit("onClickChangeState", "login");
                            } else {
                                this.$emit("onErrorHandler", error.message);
                            }
                        });
                } else {
                    await axios
                        .post(this.baseURL + "/addStudentByAdmin", StudentObj, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((response) => {
                            if (response.data.success) {
                                this.handleProfileImageUpload(this.editedStudentItem.profile_image, response.data.studentid);
                                //this.uploadImageProfile(response.data.studentid);
                                this.$emit("onInfoHandler", this.$t('msg.memberAdded'));
                                this.getStudentList();
                                this.dialogStudent = false;
                            } else {
                                this.$emit(
                                    "onErrorHandler",
                                    response.data.message || this.$t('msg.memberAddFail')
                                );
                            }
                            this.$emit("onUpdateDataSuccess");
                        })
                        .catch((error) => {
                            if (error.response.status && error.response.status == 401) {
                                this.$emit("onErrorHandler", error.response.data.message);
                                this.$emit("onClickChangeState", "login");
                            } else {
                                this.$emit("onErrorHandler", error.message);
                            }
                        });
                }
            }
            this.$emit("onLoading", false);
        },
        finishCourse() {
            this.dialogFinish = true;
        },
        async finishCourseConfirm() {
        this.$emit("onLoading", true);
        const token = this.$store.getters.getToken;
            await axios
                .post(
                this.baseURL + "/finishCustomerCourse",
                {
                    courserefer: this.editedStudentItem.courserefer,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
                )
                .then((response) => {
                //console.dir(response);
                if (response.data.success) {
                    this.dialogFinish = false;
                    this.getCustomerCourseLookup();
                    this.editedStudentItem.courserefer = null;
                    this.editedStudentItem.current_course_detail = null;
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
        closeFinish() {
            this.dialogFinish = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        async getCustomerCourseLookup() {
            const token = this.$store.getters.getToken;
            await axios
                .get(this.baseURL + "/getCustomerCourseLookup", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.customerCourseLookup = response.data.results;
                    }
                })
                .catch((error) => {
                    if (error.response.status && error.response.status == 401) {
                        this.$emit("onErrorHandler", error.response.data.message);
                        this.$emit("onClickChangeState", "login");
                    } else {
                        this.$emit("onErrorHandler", error.message);
                    }
                });
        },
        async getFamilyLookup() {
            const token = this.$store.getters.getToken;
            await axios
                .get(this.baseURL + "/familyLookup", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.familyLookup = response.data.results;
                    }
                })
                .catch((error) => {
                    if (error.response.status && error.response.status == 401) {
                        this.$emit("onErrorHandler", error.response.data.message);
                        this.$emit("onClickChangeState", "login");
                    } else {
                        this.$emit("onErrorHandler", error.message);
                    }
                });
        },
        async clickEditStudent(item) {
            console.log("clickEditStudent : ", item);
            
            this.editedStudentIndex = this.StudentList.indexOf(item);
            this.editedStudentItem = Object.assign({}, item);
            if(this.editedStudentItem.dateofbirth) {
                this.editedStudentItem.dateofbirth = new Date(item.dateofbirth);
                this.editedStudentItem.age = this.calculateAge(item.dateofbirth).text;
            }
            await this.getCustomerCourseLookup();
            await this.getFamilyLookup();
            await this.onCourseChange();
            await this.loadProfileImage();
            this.dialogStudent = true;
        },
        clickDeleteStudent(item) {  
            this.editedStudentIndex = this.StudentList.indexOf(item);
            this.editedStudentItem = Object.assign({}, item);
            this.dialogStudentDelete = true;
        },
        async clickConfirmDeleteStd() {
            this.$emit("onLoading", true);
            const token = this.$store.getters.getToken;
            axios
                .post(
                    this.baseURL + "/deleteStudent",
                    {
                        familyid: this.editedStudentItem.familyid,
                        studentid: this.editedStudentItem.studentid,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .then((response) => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.$emit("onInfoHandler", this.$t("msg.studentDeleted"));
                        this.$emit("onUpdateDataSuccess");
                    } else {
                        this.$emit(
                            "onErrorHandler",
                            response.data.message || this.$t("msg.studentDeleteFail")
                        );
                    }
                    this.dialogStudentDelete = false;
                    this.initialize();
                    this.getStudentList();
                })
                .catch((error) => {
                    if (error.response.status && error.response.status == 401) {
                        this.$emit("onErrorHandler", error.response.data.message);
                        this.$emit("onClickChangeState", "login");
                    } else {
                        this.$emit("onErrorHandler", error.message);
                    }
                });
            this.$emit("onLoading", false);
        },
        closeStudent() {
            this.dialogStudent = false;
            this.$nextTick(() => {
                this.editedStudentItem = Object.assign({}, this.defaultStudentItem);
                this.CourseUsingtList = [];
                this.editedStudentIndex = -1;
                this.imagePreview = this.profileAvatar;
            });
        },
        clickCancelDeleteStd() {
            this.dialogStudentDelete = false;
            this.$nextTick(() => {
                this.editedStudentItem = Object.assign({}, this.defaultStudentItem);
                this.editedStudentIndex = -1;
                this.imagePreview = this.profileAvatar;
            });
        },
        onFileClear() {
            this.editedStudentItem.profile_image = null;
            this.imagePreview = this.profileAvatar;
        },
        async onFileChange(e) {
            const file = e.target.files[0];
            //console.log("file : ", file);

            const maxSize = 4 * 1024 * 1024; // ขนาดสูงสุด 4MB
            if (file.size > maxSize) {
                this.editedStudentItem.profile_image = null;
                this.imagePreview = this.profileAvatar;
                this.$emit("onErrorHandler", this.$t("msg.fileTooLarge"));

                return;
            }
            if (file) {
                this.editedStudentItem.profile_image = file;
                const reader = new FileReader();
                reader.onload = () => {
                    this.imagePreview = reader.result;
                };
                reader.readAsDataURL(file);
            }
        },
        async loadProfileImage() {
            try {
                // Replace 'gymnastId' with the actual ID of the gymnast
                if(this.editedStudentItem.profile_image_url){
                    this.imagePreview = this.editedStudentItem.profile_image_url;
                } else {
                    const response = await axios.get(
                        this.baseURL +
                        `/student/${this.editedStudentItem.studentid}/profile-image`,
                        { headers: { Authorization: `Bearer ${this.token}` } }
                    );
                    //console.log("response : ", response);
                    //this.editedStudentItem.profile_image = response.data.image;
                    let profileImageUrl = response.data.imageUrl;
                    this.base64Image = response.data.image;
                    if (profileImageUrl) {
                        this.imagePreview = profileImageUrl;
                    } else if (response.data.image !== null) {
                        this.imagePreview = `data:image/*;base64,${response.data.image}`;
                    } else {
                        this.imagePreview = this.profileAvatar;
                    }
                }
            } catch (error) {
                //console.error("Error loading profile image:", error);
            }
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        async handleProfileImageUpload(file, sid) {
            if (this.editedStudentItem.profile_image_url && !file) {
                console.log('No new image to upload');
                return;
            }

            let fileToUpload = file;

            // ถ้าไม่มีไฟล์ ให้ตรวจสอบ this.base64Image
            if (!fileToUpload && this.base64Image) {

                let base64String = this.base64Image;
                if (!base64String.startsWith('data:image')) {
                    base64String = `data:image/jpeg;base64,${base64String}`;
                }

                const byteString = atob(base64String.split(',')[1]);
                const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
                }
                fileToUpload = new Blob([ab], { type: mimeString });
                fileToUpload = new File([fileToUpload], `${sid}.png`, { type: mimeString });
            }

            if (!fileToUpload) {
                console.error('No file to upload');
                return;
            }

            const formData = new FormData();
            const newFileName = `${sid}.${fileToUpload.name.split('.').pop()}`;

            // สร้างไฟล์ใหม่ด้วยชื่อไฟล์ใหม่
            const renamedFile = new File([fileToUpload], newFileName, { type: fileToUpload.type });

            formData.append('profileImage', renamedFile);
            formData.append('studentid', sid);

            const response = await fetch(this.baseURL + '/uploadProfileImage', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.token}`, // เพิ่ม token ลงใน headers
                },
                body: formData,
            });

            const data = await response.json();
            const imageUrl = data.url;
            console.log('imageUrl', imageUrl);
        },
        async onCourseChange() {
            this.loadingCourse = true;
            await axios
                .get(
                    this.baseURL +
                    "/getStudentCourseDetail/" + this.editedStudentItem.courserefer,
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
                                this.editedStudentItem.current_course_detail =
                                    this.$t("customerCourse.courseInUseBy", { count: data.user, list: data.userlist });
                            } else {
                                this.editedStudentItem.current_course_detail = null;
                            }
                            const data2 = response.data.courseDetail;
                            if (data2) {
                                this.CourseUsingtList = data2;
                            } else {
                                this.CourseUsingtList = null;
                            }
                        } else {
                            this.editedStudentItem.current_course_detail = null;
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
        calculateAgeNewStudent() {
            this.editedStudentItem.age = this.calculateAge(new Date(this.editedStudentItem.dateofbirth)).text;
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
                text : years + " " + this.$t('table.yearAbbr') + " " + months + " " + this.$t('table.monthAbbr') + " ",
                int : years+'.'+months
            }
        },
        onShowInfoDialog(msg) {
            this.infoMsg = msg;
            this.infoDialog = true;
        },
        SQLDate(date) {
            return moment(date).format("YYYY-MM-DD");
        },
        format_date(value) {
            if (value) {
                return moment(value).format("DD/MM/YYYY");
            }
        },
        convertDate(arrObj) {
            arrObj.forEach((obj) => {
                obj.classdate = this.format_date(obj.classdate);
            });
            return arrObj;
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
        async showAddNewStudent() {
            this.$emit('onLoading', true);
            await this.getCustomerCourseLookup();
            await this.getFamilyLookup();
            this.editedStudentIndex = -1;
            this.editedStudentItem = Object.assign({}, this.defaultStudentItem);
            this.$emit('onLoading', false);
            this.dialogStudent = true;
        },
        async showRetrieveStudent(obj) {
            if (!obj) return;
            this.$emit('onLoading', true);
            this.editedStudentIndex = 0;
            let studentDetail = await this.getStudentInfo(obj.studentid);
            if(studentDetail[0].delflag == 1) {
                this.$emit('onLoading', false);
                this.$emit('onErrorHandler', this.$t('msg.cannotEditDeleted'));
                
                return;
            }
            
            this.editedStudentItem = Object.assign({}, studentDetail[0]);
            await this.getCustomerCourseLookup();
            await this.getFamilyLookup();
            if(this.editedStudentItem.dateofbirth) {
                this.editedStudentItem.dateofbirth = new Date(studentDetail[0].dateofbirth);
                this.editedStudentItem.age = this.calculateAge(studentDetail[0].dateofbirth).text;
            }
            await this.onCourseChange();
            await this.loadProfileImage();
            this.$emit('onLoading', false);
            this.dialogStudent = true;
        },
        async getStudentInfo(studentid) {
            //console.log('getStudentInfo', studentid);
            const token = this.$store.getters.getToken;
            let studentDetail = {};
            await axios
                .get(this.baseURL + "/getStudentInfo/" + studentid, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    //console.dir(response);
                    if (response.data.success) {
                        studentDetail = response.data.results;
                    } else {
                        this.$emit("onErrorHandler", this.$t("msg.loadFail"));
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
            return studentDetail;
        },
    },
    watch: {
        dialogStudent(val) {
            val || this.closeStudent();
        },
        dialogStudentDelete(val) {
            val || this.clickCancelDeleteStd();
        },
        search() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.tableOptions.page = 1;
                this.getStudentList(this.currentActive);
            }, 500);
        },
    },
    computed: {
        ...mapGetters({
            token: "getToken",
        }),
        tomorrow() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d;
        },
        today() {
            return new Date();
        },
        formStudentTitle() {
            return this.editedStudentIndex === -1 ? this.$t('gymnasts.addStudent') : this.$t('gymnasts.editStudent')
        },
        CourseUsingHeaders() {
            return [
                { title: '#', key: 'index', width: '50px', sortable: false },
                { title: this.$t('table.name'), key: 'fullname' },
                { title: this.$t('table.date'), key: 'classdate' },
                { title: this.$t('table.time'), key: 'classtime' },
            ]
        },
        StudentListHeaders() {
            return [
                { title: this.$t('table.name'), key: 'fullname' },
                { title: this.$t('table.nickname'), key: 'nickname', align: 'left' },
                { title: this.$t('table.gender'), key: 'gender', align: 'left' },
                { title: this.$t('table.age'), key: 'dateofbirth', align: 'end' },
                { title: this.$t('table.level'), key: 'level', align: 'center' },
                { title: this.$t('table.courseName'), key: 'coursename', align: 'left' },
                { title: this.$t('table.remaining'), key: 'remaining_label', align: 'center' },
                { title: this.$t('table.expireDate'), key: 'expiredate', align: 'left' },
                { title: this.$t('table.phone'), key: 'mobileno', align: 'center', sortable: false },
                { title: this.$t('table.edit'), key: 'edit', align: 'center', sortable: false },
                { title: this.$t('table.delete'), key: 'delete', align: 'center', sortable: false },
            ]
        },
        profileAvatar() {
            return this.editedStudentItem.gender == 'ชาย' ? require("@/assets/avatar/4.png") : require("@/assets/avatar/2.png");
        },
    },
};

import { Promise } from "core-js";
const ComponentAPI = {
    baseURL: env.SERVER_URL,
    fetchDataStudent({ token, active, page, itemsPerPage, search, sortBy }) {
        return new Promise((resolve) => {
            axios
                .get(this.baseURL + "/getStudentList", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { active, page, itemsPerPage, search, sortBy: JSON.stringify(sortBy ?? []) },
                })
                .then((response) => {
                    if (response.data.success) {
                        resolve({
                            success: true,
                            results: response.data.results,
                            total: response.data.total ?? response.data.results.length,
                        });
                    } else {
                        resolve({ success: true, results: [], total: 0 });
                    }
                })
                .catch((error) => {
                    resolve({ success: false, error: error });
                });
        });
    },
};
</script>
<style scoped>
/* profile photo — pink ring */
.info-photo {
  width: 150px; height: 150px; border-radius: 100%;
  display: flex; justify-content: center;
  box-shadow: 0 0 0 4px var(--c-surface), 0 0 0 7px var(--c-primary-light);
  cursor: pointer; transition: box-shadow .18s ease;
}
.info-photo:hover { box-shadow: 0 0 0 4px var(--c-surface), 0 0 0 7px var(--c-primary); }
.center { display: flex; justify-content: center; align-items: center; }
.highlighted-red { color: var(--c-error); font-weight: 600; }

/* section header — pink label with accent bar */
:deep(.group-header) {
  font-family: var(--font-head); font-weight: 700; font-size: 15px;
  color: var(--c-text-heading); display: flex; align-items: center; gap: 8px; margin: 4px 0 2px;
}
:deep(.group-header)::before {
  content: ''; width: 4px; height: 18px; border-radius: 4px; background: var(--c-primary);
}

/* dialog card — white rounded surface */
:deep(.v-overlay__content > .v-card) {
  background: var(--c-surface) !important; border-radius: var(--radius-lg) !important;
  overflow: hidden !important; box-shadow: var(--shadow-lg) !important;
}

/* sticky header — pink gradient bar, white text */
.sticky-header {
  position: sticky; top: 0; z-index: 10;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-secondary) 100%);
  color: #fff !important; font-family: var(--font-head); font-weight: 700;
  display: flex; align-items: center; gap: 10px; padding: 16px 20px;
}
.sticky-header :deep(.mdi) { font-size: 22px; }

/* sticky footer — light surface, top divider */
.sticky-footer {
  position: sticky; bottom: 0; z-index: 10;
  background: var(--c-surface); border-top: 1px solid var(--c-border); padding: 12px 16px;
}
.sticky-footer :deep(.v-btn) { border-radius: var(--radius-md) !important; text-transform: none !important;
  font-weight: 700; letter-spacing: normal; }

.scrollable-content { max-height: 80vh; overflow-y: auto; padding: 20px !important; }

/* rounded Vuetify form controls to match the design */
:deep(.v-field) { border-radius: 14px !important; }
:deep(.v-field.v-field--variant-solo-filled) { background: var(--c-surface-2); box-shadow: none; }
:deep(.v-field--focused) { box-shadow: 0 0 0 2px var(--c-ring); }

/* toolbar (list view) */
:deep(.v-toolbar) { background: transparent !important; }
:deep(.v-toolbar-title) { font-family: var(--font-head); font-weight: 800; color: var(--c-text-heading); }
.table-search-row { padding: 8px 4px 4px; }

/* "next course" arrow — pink */
.arrow-col { display: flex; justify-content: center; align-items: center; position: relative; }
.arrow {
  width: 80%; height: 5px; position: relative; border-radius: 4px;
  background: linear-gradient(90deg, var(--c-surface-2), var(--c-primary));
  display: flex; align-items: center; justify-content: center;
}
.arrow::after {
  content: ''; position: absolute; width: 0; height: 0;
  border-top: 8px solid transparent; border-bottom: 8px solid transparent;
  border-left: 16px solid var(--c-primary); right: -7px; top: -5px;
}
.arrow-text {
  color: var(--c-primary-dark); font-weight: 700; font-size: 14px;
  position: relative; z-index: 1; top: -15px; background: transparent;
}

/* table surface passthrough (sits inside parent content-card) */
:deep(.v-card), :deep(.v-card--flat) { background: transparent !important; box-shadow: none !important; }
:deep(.v-data-table), :deep(.v-table), :deep(.v-table__wrapper),
:deep(.v-data-table__tr),
:deep(.v-table__wrapper > table > tbody > tr),
:deep(.v-table__wrapper > table > tbody > tr > td) {
  background: transparent !important; background-color: transparent !important;
}
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  color: var(--c-text-heading) !important; font-family: var(--font-head); font-weight: 700;
  border-bottom: 2px solid var(--c-border) !important;
}
:deep(.v-table__wrapper > table > tbody > tr:hover > td) { background: var(--c-surface-3) !important; }
</style>