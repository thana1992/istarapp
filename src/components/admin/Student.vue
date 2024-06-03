<template>
    <v-data-table :loading="loadingStudent" :headers="StudentListHeaders" :items="StudentList"
                :sort-by="[{ key: 'studentid', order: 'asc' }]">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Gymnasts' List</v-toolbar-title>
                        <v-dialog v-model="dialogStudent" max-width="800px" style="z-index: 999;">
                            <template v-slot:activator="{ props }">
                                <v-btn color="primary" dark v-bind="props"><span
                                        class="mdi mdi-emoticon-plus-outline"></span> New Student</v-btn>
                            </template>

                            <v-card>
                                <v-card-title>
                                    <span v-if="editedStudentIndex == -1" class="mdi mdi-emoticon-plus-outline"></span>
                                    <span v-if="editedStudentIndex != -1" class="mdi mdi-human-edit"></span>
                                    <span>{{ formStudentTitle }}</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-form ref="newstdform">
                                            <v-row>
                                                <v-col cols="12" sm="12" md="12">
                                                    <div style="min-height: 150px; display: ruby-text;">
                                                        <v-img
                                                            :src="imagePreview" 
                                                            class="info-photo rounded-circle"
                                                            width="150" 
                                                            height="150"
                                                            @click="triggerFileInput"
                                                            >
                                                        </v-img>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="4">
                                                    <v-text-field v-model="editedStudentItem.firstname"
                                                        label="Firstname" variant="solo-filled" :rules="notNullRules"
                                                        required></v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="4">
                                                    <v-text-field v-model="editedStudentItem.middlename"
                                                        label="Middlename" variant="solo-filled"
                                                        required></v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="4">
                                                    <v-text-field v-model="editedStudentItem.lastname" label="Lastname"
                                                        variant="solo-filled" :rules="notNullRules"
                                                        required></v-text-field>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="3">
                                                    <v-text-field v-model="editedStudentItem.nickname" label="Nickname"
                                                        variant="solo-filled" :rules="notNullRules"
                                                        required></v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="3">
                                                    <v-select v-model="editedStudentItem.gender" label="Gender"
                                                        :items="['ชาย', 'หญิง']" variant="solo-filled"
                                                        :rules="notNullRules" required></v-select>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="3">
                                                    <DatePicker label="Date of Birth" variant="solo-filled"
                                                        v-model="editedStudentItem.dateofbirth" :maxdate="new Date()"
                                                        @click="calculateAgeNewStudent" rules="notNullRules" required>
                                                    </DatePicker>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="3">
                                                    <v-text-field label="Age" v-model="editedStudentItem.age" readonly
                                                        variant="solo-filled"></v-text-field>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="6">
                                                    <v-autocomplete v-model="editedStudentItem.courserefer"
                                                        label="Course Refer" item-title="courserefer"
                                                        item-value="courserefer" :items="customerCourseLookup"
                                                        variant="solo-filled" no-data-text="No course"
                                                        :rules="notNullRules" editable
                                                        @update:modelValue="onCourseChange"></v-autocomplete>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6">
                                                    <v-label style="white-space: break-spaces;" >{{ editedStudentItem.current_course_detail }}</v-label>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="12">
                                                    <v-textarea v-model="editedStudentItem.shortnote" label="Short Note"
                                                        variant="solo-filled" rows="4">
                                                    </v-textarea>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="5">
                                                    <v-select v-model="editedStudentItem.familyid"
                                                        label="Parent" item-title="username"
                                                        item-value="familyid" :items="familyLookup"
                                                        variant="solo-filled" :rules="notNullRules"
                                                        required>
                                                    </v-select>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="7">
                                                    <v-file-input v-model="editedStudentItem.profilepic"
                                                        label="รูปโปรไฟล์" accept="image/*" show-size outlined
                                                        prepend-icon="mdi-camera" :loading="uploadLoading"
                                                        @change="onFileChange"
                                                        @click:clear="onFileClear"
                                                        style="display: none;"
                                                        ref="fileInput"
                                                        >
                                                    </v-file-input>
                                                </v-col>
                                            </v-row>
                                        </v-form>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue-darken-1" variant="text" @click="closeStudent">
                                        Cancel
                                    </v-btn>
                                    <v-btn color="blue-darken-1" variant="text" @click="doSaveNewStudent">
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
                                    <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteStd">ใช่!
                                        ลบเลย</v-btn>
                                    <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteStd">เดี๋ยวก่อน
                                        รอแปบ</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.index="{ item }">{{ StudentList.indexOf(item) + 1 }}</template>
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

export default {
    components: {
        DatePicker,
    },
  data () {
    return {
        uploadLoading: false,
        StudentList: [],
        imagePreview: require('@/assets/avatar/2.png'),
        StudentListHeaders: [
        { title: 'Name', key: 'fullname' },
        //{ title: 'Date of Birth', key: 'dateofbirthshow' },
        { title: 'Gender', key: 'gender' },
        { title: 'Course Start', key: 'startdate', align: 'center'},
        { title: 'Course Expire', key: 'expiredate', align: 'center' },
        { title: 'Remaining' , key: 'remaining', align: 'end'},
        { title: 'Mobile Number', key: 'mobileno', sortable: false },
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
            courserefer: null,
            current_course_detail: null,
            username: null,
            profile_image: null,
            shortnote: null,
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
            courserefer: null,
            current_course_detail: null,
            username: null,
            profile_image: null,
            shortnote: null,
        },
        base64Image: null,
        editedStudentIndex: -1,
        dialogStudent: false,
        dialogStudentDelete: false,
        loadingStudent: false,
        notNullRules: [
            v => !!v || 'field is required',
        ],
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
            this.getCustomerCourseLookup()
            this.getFamilyLookup()
        },
    async getStudentList() {
            this.loadingStudent = true
            const token = this.$store.getters.getToken;
            await ComponentAPI.fetchDataStudent({ token })
            .then(({ success, results, message }) => {
                if(success) {
                    this.StudentList = this.convertDate(results)
                    console.log('StudentList : ', this.StudentList)
                    this.loadingStudent = false
                }else{
                    this.$emit('onErrorHandler', message || 'Get Student list failed')
                    this.loadingStudent = false
                }
            })
            .catch(error => {
                if(error.response.status && error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
        },
    async doSaveNewStudent () {
        this.$emit('onLoading', true)
            const { valid } = await this.$refs.newstdform.validate()
            if (valid) {
                
                // Make API request to register the user
                const StudentObj = {
                    studentid: this.editedStudentItem.studentid,
                    firstname: this.editedStudentItem.firstname,
                    middlename: this.editedStudentItem.middlename,
                    lastname: this.editedStudentItem.lastname,
                    nickname: this.editedStudentItem.nickname,
                    gender: this.editedStudentItem.gender,
                    dateofbirth: this.SQLDate(this.editedStudentItem.dateofbirth),
                    familyid: this.editedStudentItem.familyid,
                    courserefer: this.editedStudentItem.courserefer,
                    shortnote: this.editedStudentItem.shortnote,
                }
                //console.log(this.editedStudentIndex+ ' StudentObj : ', StudentObj)
                const token = this.$store.getters.getToken;
                if (this.editedStudentIndex > -1) {
                    StudentObj.studentid = this.editedStudentItem.studentid
                    await axios
                    .post(this.baseURL+'/updateStudentByAdmin', StudentObj, { headers:{ Authorization: `Bearer ${token}`, } })
                    .then(response => {
                        if (response.data.success) {
                            this.uploadImageProfile(this.editedStudentItem.studentid)
                            this.$emit('onInfoHandler', 'แก้ไขข้อมูลสำเร็จแล้ว');
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'แก้ไขข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        if(error.response.status && error.response.status == 401) {
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
                            this.uploadImageProfile(response.data.studentid)
                            this.$emit('onInfoHandler', 'เพิ่มสมาชิกสำเร็จแล้ว');
                            this.getStudentList()
                            this.dialogStudent = false
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'เพิ่มสมาชิกไม่สำเร็จ ลองใหม่อีกครั้งนะ');
                        }
                        this.$emit('onUpdateDataSuccess')
                    })
                    .catch(error => {
                        if(error.response.status && error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        }else{
                            this.$emit('onErrorHandler', error.message)
                        }
                    });
                }
                
            }
            this.$emit('onLoading', false)
        },
        getCustomerCourseLookup () {
            const token = this.$store.getters.getToken;
            axios
            .get(this.baseURL+'/getCustomerCourseLookup', { 
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    this.customerCourseLookup = response.data.results
                }
            })
            .catch(error => {
                if(error.response.status && error.response.status == 401) {
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
                if(error.response.status && error.response.status == 401) {
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
          this.onCourseChange()
          this.loadProfileImage()
          this.dialogStudent = true
        },
        clickDeleteStudent (item) {
          this.editedStudentIndex = this.StudentList.indexOf(item)
          this.editedStudentItem = Object.assign({}, item)
          this.dialogStudentDelete = true
        },
        async clickConfirmDeleteStd() {
            this.$emit('onLoading', true)
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL+'/deleteStudent', {
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
                if(error.response.status && error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
            this.$emit('onLoading', false)
        },
        closeStudent () {
          this.dialogStudent = false
          this.$nextTick(() => {
            this.editedStudentItem = Object.assign({}, this.defaultStudentItem)
            this.editedStudentIndex = -1
            this.imagePreview = this.profileAvatar
          })
        },
        clickCancelDeleteStd () {
          this.dialogStudentDelete = false
          this.$nextTick(() => {
            this.editedStudentItem = Object.assign({}, this.defaultStudentItem)
            this.editedStudentIndex = -1
            this.imagePreview = this.profileAvatar
          })
        },
        onFileClear() {
            this.editedStudentItem.profile_image = null;
            this.imagePreview = this.profileAvatar;
        },
        onFileChange(e) {
            const file = e.target.files[0];
            console.log('file : ', file)

            const maxSize = 4 * 1024 * 1024; // ขนาดสูงสุด 4MB
            if (file.size > maxSize) {
                this.editedStudentItem.profile_image = null;
                this.imagePreview = this.profileAvatar;
                this.$emit('onErrorHandler', 'จำกัดขนาดไฟล์ไม่เกิน 4MB');
                
                return;
            }
            if(file) {
                this.editedStudentItem.profile_image = file;
                const reader = new FileReader();
                reader.onload = () => {
                    this.imagePreview = reader.result;
                    this.base64Image = reader.result.split(',')[1]; // เก็บเฉพาะส่วนข้อมูล Base64
                };
                reader.readAsDataURL(file);
            }
        },
        async uploadImageProfile(sid) {
            if (!this.editedStudentItem.profile_image) {
                this.$emit('onErrorHandler', 'Please select an image to upload');
                return;
            }
            this.uploadLoading = true;
            try {
                await this.saveImage(sid);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
            this.uploadLoading = false;
        },
        async saveImage(sid) {
            const image = this.base64Image;
            try {
                // Replace 'gymnastId' with the actual ID of the gymnast
                const token = this.$store.getters.getToken;
                const response = await axios.put(this.baseURL + `/student/${sid}/profile-image`, { image }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Upload Image Successful');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Upload Image failed');
                }
            } catch (error) {
                console.error('Error saving profile image URL:', error);
            }
        },
        async loadProfileImage() {
            try {
                // Replace 'gymnastId' with the actual ID of the gymnast
                const response = await axios.get(this.baseURL + `/student/${this.editedStudentItem.studentid}/profile-image`,
                    { headers: { Authorization: `Bearer ${this.token}` } });
                console.log('response : ', response)
                //this.editedStudentItem.profile_image = response.data.image;
                this.base64Image = response.data.image;
                if(response.data.image !== null) {
                    this.imagePreview = `data:image/*;base64,${response.data.image}`;
                } else {
                    this.imagePreview = this.profileAvatar;
                }
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        async onCourseChange() {
            this.loadingCourse = true
            await axios.get(this.baseURL+"/getStudentUseCourse/"+this.editedStudentItem.courserefer,  { 
                headers:{ Authorization: `Bearer ${this.token}` } 
            },)
            .then(response => {
                //console.dir(response);
                if (response.data.success) {
                    console.log('getStudentUseCourse', response.data);
                    const res = response.data.results;
                    if(res) {
                        const data = response.data.results[0];
                        console.log('data', data.user);
                        if(data.user > 0) {
                            this.editedStudentItem.current_course_detail = 'มีผู้กำลังใช้คอร์สนี้ '+data.user+' คน '+data.userlist;
                        } else {
                            this.editedStudentItem.current_course_detail = null;
                        }
                    } else {
                        this.editedStudentItem.current_course_detail = null;
                    }
                } else {
                    this.$emit('onErrorHandler', 'getCustomerCourseInfo failed');
                }
            })
            .catch(error => {
                console.log(error)
                if(error.response && error.response.status == 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                }else{
                    this.$emit('onErrorHandler', error.message)
                }
            });
            this.loadingCourse = false
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
        convertDate (arrObj) {
            arrObj.forEach(obj => {
            obj.dateofbirthshow = this.format_date(obj.dateofbirth);
            obj.startdate = this.format_date(obj.startdate);
            obj.expiredate = this.format_date(obj.expiredate);
            });
            return arrObj;
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
        profileAvatar() {
            return require('@/assets/avatar/2.png')
        },
    }
}

import { Promise } from 'core-js';
const ComponentAPI = {
    baseURL: env.SERVER_URL,
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
<style scoped>
.info-photo {
    width: 150px;
    height: 150px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
}
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
```