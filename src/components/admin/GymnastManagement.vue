<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-gymnastics"></span> Gymnast Management</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <!-- <v-data-table :loading="loadingStudent" :headers="StudentListHeaders" :items="StudentList"
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
                                                    <div style="min-height: 150px; display: ruby-text; cursor: pointer;">
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
            </v-data-table> -->
            <Student
                @onErrorHandler="onErrorHandler"
                @onInfoHandler="onShowInfoDialog"
                ></Student>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from '../center/Student.vue';
import { mapGetters } from 'vuex';

export default {
    components: {
        DatePicker,
        Student,
    },
    data() {
        return {
        }
    },
    async created() {
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
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.dir(response);
                    if (response.data.success) {
                        //this.initialize()
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
        onShowInfoDialog(msg) {
            this.$emit('onInfoHandler', msg)
        },
        onErrorHandler(msg) {
            this.$emit('onErrorHandler', msg)
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
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