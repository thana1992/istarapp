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
                v-model="fullname"
                label="Full Name"
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
                v-model="date"
                ></DatePicker>

                <v-btn
                    color="success"
                    class="mt-4"
                    block
                    @click="validate"
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
import DatePicker from '@/components/DatePicker.vue'

export default {
    components: {
        DatePicker,
    },
    data: () => ({
        date: null,
        fullname: '',
        nickname: '',
        gender: '',
        format: 'dddd MMMM Do, YYYY',
        nameRules: [
            v => !!v || 'Username is required',
        ],
        passwordRules: [
            v => !!v || 'Password is required',
        ]
    }),
    methods: {
        save (date) {
            this.$refs.menudate.save(date)
        },
        async validate () {
            const { valid } = await this.$refs.form.validate()
            .$emit('onClickChangeState', 'list')
        },
        reset () {
            this.$refs.form.reset()
        },
        resetValidation () {
            this.$refs.form.resetValidation()
        },
    },
}
</script>
<style scoped>

</style>