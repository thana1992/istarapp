<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-face-man-shimmer"></span> Add Member</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>
            <br>
            <div class="mx-auto px-2 py-1">
                <v-form ref="form">
                    <v-text-field variant="solo-filled" v-model="firstname" label="Firstname / ชื่อ" type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="middlename" label="Middlename / ชื่อกลาง"
                        type="text"></v-text-field>

                    <v-text-field variant="solo-filled" v-model="lastname" label="Lastname / นามสกุล" type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="nickname" label="Nick Name / ชื่อเล่น " type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="school" label="School / โรงเรียน"
                        type="text"></v-text-field>

                    <v-select v-model="gender" label="Gender / เพศ" :items="['ชาย', 'หญิง']" variant="solo-filled"
                    :rules="requireRules" required></v-select>

                    <DatePicker label="Date of Birth / วันเกิด" v-model="dateofbirth" :maxdate="new Date()" :rules="requireRules" >
                    </DatePicker>
                    <br>
                    <v-divider color="#fffff" thickness="3"></v-divider>
                    
                    <v-btn color="success" class="mt-4" block @click="doSave">
                        Submit
                    </v-btn>
                    <v-btn color="pink" class="mt-4" block @click="reset">
                        Clear
                    </v-btn>
                </v-form>
            </div>
        </div>
    </div>
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';

export default {
    components: {
        DatePicker,
    },
    data: () => ({
        date: null,
        firstname: '',
        middlename: '',
        lastname: '',
        nickname: '',
        gender: '',
        dateofbirth: null,
        school: '',
        format: 'dddd MMMM DD, YYYY',
        requireRules: [
            v => !!v || 'field is required',
        ],
    }),
    methods: {
        async doSave() {
            this.$emit('onLoading', true)
            const { valid } = await this.$refs.form.validate()
            if(!valid) {
                this.$emit('onErrorHandler', 'กรุณากรอกข้อมูลให้ครบถ้วน')
                this.$emit('onLoading', false)
                return
            }
            if (valid) {

                const userdata = localStorage.getItem('userdata')
                const user = JSON.parse(userdata)
                const token = this.$store.getters.getToken;
                // Make API request to register the user
                await axios
                    .post(this.baseURL + '/addStudent', {
                        firstname: this.firstname,
                        middlename: this.middlename,
                        lastname: this.lastname,
                        nickname: this.nickname,
                        gender: this.gender,
                        dateofbirth: this.format_date(this.dateofbirth),
                        school: this.school,
                        familyid: user.familyid,
                    },
                        {
                            headers: { Authorization: `Bearer ${token}`, }
                        })
                    .then(response => {
                        //console.log(response)
                        if (response.data.success) {
                            this.$emit('onLoading', false)
                            this.$emit('onInfoHandler', response.data.message || 'เพิ่มสมาชิกครอบครัวสำเร็จแล้ว');
                            this.$emit('onClickChangeState', 'familylist')
                        } else {
                            this.$emit('onErrorHandler', response.data.message || 'เพิ่มสมาชิกครอบครัวไม่สำเร็จ');
                        }
                    })
                    .catch(error => {
                        //console.error(error);
                        if (error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        } else {
                            this.$emit('onErrorHandler', error.message)
                        }
                    });
            }

            this.$emit('onLoading', false)
        },
        async validate() {
            const { valid } = await this.$refs.form.validate()
            this.$emit('onClickChangeState', 'list')
        },
        reset() {
            this.$refs.form.reset()
        },
        resetValidation() {
            this.$refs.form.resetValidation()
        },
        format_date(value) {
            if (value) {
                return moment(String(value)).format('YYYYMMDD')
            }
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
    },
    async created() {
        try {
            const token = this.$store.getters.getToken;
            //console.log('token ', token)
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
                    //console.dir(response);
                })
                .catch(error => {
                    //console.error(error);
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }
    },
}
</script>
<style scoped></style>