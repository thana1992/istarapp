<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-account-multiple-plus"></span> Add Member</h1>
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
                :items="['Male', 'Female']"
                variant="solo-filled"
                required
                ></v-select>

                <DatePicker 
                label="Date of Birth"
                v-model="dateofbirth"
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
        format: 'dddd MMMM Do, YYYY',
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

            // Make API request to register the user
            axios
                .post('http://localhost:3000/addFamilyMember', {
                firstname: this.firstname,
                lastname: this.lastname,
                nickname: this.nickname,
                gender: this.gender,
                dateofbirth: this.format_date(this.dateofbirth),
                familyid: user.familyid,
                remaining: 0,
                })
                .then(response => {
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Add Family Member Successful');
                    this.$emit('onBlackToFamilylist')
                } else {
                    alert(response.data.message || 'Registration failed');
                }
                })
                .catch(error => {
                console.error(error);
                alert(error.message)
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
}
</script>
<style scoped>

</style>