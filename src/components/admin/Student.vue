<template>
    <v-data-table
        :loading="loadingStudent"
        :headers="StudentListHeaders"
        :items="StudentList"
        :sort-by="[{ key: 'studentid', order: 'asc' }]"
        >
        <template v-slot:top>
            <v-toolbar flat>
                <v-toolbar-title>Gymnasts' List</v-toolbar-title>
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
                    <v-card
                        v-if="progressLoading"
                        class="card-loading mx-auto text-center pt-5"
                        elevation="24"
                        height="150"
                        width="150"
                        style="overflow: hidden;"
                    >
                        <v-card-title>
                        <trinity-rings-spinner
                            :animation-duration="1500"
                            :size="66"
                            color="#ff1d5e"
                            class="mx-auto"
                        />
                        </v-card-title>
                        <v-card-text style="color:#ff1d5e;" class="mx-auto">Loading...</v-card-text>
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
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
import { TrinityRingsSpinner } from 'epic-spinners'

export default {
    components: {
        DatePicker,
        TrinityRingsSpinner
    },
  data () {
    return {
        progressLoading: false,
        StudentList: [],
            StudentListHeaders: [
            { title: 'Name', key: 'fullname' },
            { title: 'Course', key: 'coursename' },
            { title: 'Remaining', key: 'remaining' },
            { title: 'Mobile Number', key: 'mobileno', align: 'center' },
            { title: 'Edit', key: 'edit', align: 'center', sortable: false },
            { title: 'Delete', key: 'delete', align: 'center', sortable: false },
            ],
            editedStudentItem: {
                studentid: null,
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
                studentid: null,
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
    initialize() {
            this.getStudentList()
            this.getCourseLookup()
            this.getFamilyLookup()
        },
    async getStudentList() {
            this.loadingStudent = true
            const token = this.$store.getters.getToken;
            await ComponentAPI.fetchDataStudent({ token})
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
                if(error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
        },
    async doSaveNewStudent () {
        this.progressLoading = true
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
                //console.log(this.editedStudentIndex+ ' StudentObj : ', StudentObj)
                const token = this.$store.getters.getToken;
                if (this.editedStudentIndex > -1) {
                    StudentObj.studentid = this.editedStudentItem.studentid
                    await axios
                    .post(this.baseURL+'/updateStudentByAdmin', StudentObj, { headers:{ Authorization: `Bearer ${token}`, } })
                    .then(response => {
                        if (response.data.success) {
                            this.$emit('onInfoHandler', 'แก้ไขข้อมูลสำเร็จแล้ว');
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'แก้ไขข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะ');
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
                }else{
                    await axios
                    .post(this.baseURL+'/addStudentByAdmin', StudentObj, { headers:{ Authorization: `Bearer ${token}`, } })
                    .then(response => {
                        if (response.data.success) {
                            this.$emit('onInfoHandler', 'เพิ่มสมาชิกสำเร็จแล้ว');
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'เพิ่มสมาชิกไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                        }
                        this.$emit('onUpdateDataSuccess')
                    })
                    .catch(error => {
                        if(error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        }else{
                            this.$emit('onErrorHandler', error.message)
                        }
                    });
                }
                
            }
            this.progressLoading = false
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
        getFamilyLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/familyLookup', { headers:{ Authorization: `Bearer ${token}`, } })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.familyLookup = response.data.results
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
        async clickConfirmDeleteStd() {
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL+'/deleteFamilyMember', {
                familyid: this.editedStudentItem.familyid,
                studentid: this.editedStudentItem.studentid,
            },
            { headers:{ Authorization: `Bearer ${token}`, } 
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Delete Student Successful');
                    this.$emit('onUpdateDataSuccess')
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Delete Student failed');
                }
                this.dialogStudentDelete = false
                this.initialize()
                this.getStudentList()
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
        dialogStudentDelete (val) {
            val || this.clickCancelDeleteStd()
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        tomorrow() {
            const d = new Date()
            d.setDate(d.getDate() +1)
            return d 
        },
        today() {
            return new Date()
        },
        formStudentTitle () {
          return this.editedStudentIndex === -1 ? 'Add a new student' : 'Edit student information'
        },
    }
}

import { Promise } from 'core-js';
const ComponentAPI = {
    baseURL: 'https://istarserver.vercel.app',
    //baseURL: 'http://localhost:3000',
    fetchDataStudent ({ token }) {
        return new Promise(resolve => {
            axios
            .get(this.baseURL+'/getStudentList', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
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
                resolve({ success: false, error: error })
            });
        });
    }
}
</script>
```