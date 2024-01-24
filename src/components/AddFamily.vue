<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-face-man-shimmer"></span> Add Member</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto px-2 py-1">
            <v-form ref="form">
                <v-text-field
                variant="solo-filled"
                v-model="firstname"
                label="First Name"
                type="text"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="lastname"
                label="Last Name"
                type="text"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="nickname"
                label="Nick Name"
                type="text"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-select
                v-model="gender"
                label="Gender"
                :items="['ชาย', 'หญิง']"
                variant="solo-filled"
                required
                ></v-select>

                <DatePicker 
                label="Date of Birth"
                v-model="dateofbirth"
                :maxdate="new Date()"
                ></DatePicker>

                <v-btn
                    color="success"
                    class="mt-4"
                    block
                    @click="doSave"
                >
                    Add
                </v-btn>
                <v-btn
                    color="error"
                    class="mt-4"
                    block
                    @click="reset"
                >
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
        lastname: '',
        nickname: '',
        gender: '',
        dateofbirth: null,
        format: 'dddd MMMM DD, YYYY',
        nameRules: [
            v => !!v || 'Username is required',
        ],
        passwordRules: [
            v => !!v || 'Password is required',
        ]
    }),
    methods: {
        async doSave (date) {
            const { valid } = await this.$refs.form.validate()
            if (valid) {

            const userdata = localStorage.getItem('userdata')
            const user = JSON.parse(userdata)
            const token = this.$store.getters.getToken;
            // Make API request to register the user
            axios
                .post(this.baseURL+'/addFamilyMember', {
                firstname: this.firstname,
                lastname: this.lastname,
                nickname: this.nickname,
                gender: this.gender,
                dateofbirth: this.format_date(this.dateofbirth),
                familyid: user.familyid,
                },
                { 
                    headers:{ Authorization: `Bearer ${token}`, } 
                })
                .then(response => {
                    console.log(response)
                    if (response.data.success) {
                        this.$emit('onInfoHandler', response.data.message || 'เพิ่มสมาชิกครอบครัวสำเร็จแล้ว');
                        this.$emit('onClickChangeState', 'familylist')
                    } else {
                        this.$emit('onErrorHandler', response.data.message || 'เพิ่มสมาชิกครอบครัวไม่สำเร็จ');
                    }
                })
                .catch(error => {
                    console.error(error);
                    if(error.response.status == 401) {
                        this.$emit('onErrorHandler', error.response.data.message)
                        this.$emit('onClickChangeState', 'login')
                    }else{
                        this.$emit('onErrorHandler', error.message)
                    }
                });
            }
        },
        async validate () {
            const { valid } = await this.$refs.form.validate()
            this.$emit('onClickChangeState', 'list')
        },
        reset () {
            this.$refs.form.reset()
        },
        resetValidation () {
            this.$refs.form.resetValidation()
        },
        format_date(value){
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
}
</script>
<style scoped>

</style>