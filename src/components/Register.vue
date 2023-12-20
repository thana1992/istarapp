<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-account-plus"></span> Register</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto px-2 py-1">
            <v-form ref="form">
                <v-text-field
                variant="solo-filled"
                v-model="username"
                :counter="10"
                label="Username"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="password"
                :counter="10"
                label="Password"
                type="password"
                :rules="passwordRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="fullname"
                label="Full Name"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="address"
                label="Address"
                type="text"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="email"
                label="E-mail"
                type="text"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="phone"
                label="Phone Number"
                placeholder="123-456-7890"
                    type="tel"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="lineid"
                label="Line id"
                type="text"
                ></v-text-field>

                <v-btn
                    color="success"
                    class="mt-1"
                    block
                    @click="validate"
                >
                    Submit
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

export default {
    data: () => ({
      username: '',
      password: '',
      fullname: '',
      address: '',
      email: '',
      phone: '',
      lineid: '',
      nameRules: [
        v => !!v || 'Username is required',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
      ]
    }),
    methods: {
      async validate () {
        const { valid } = await this.$refs.form.validate()

        if (valid) alert('Form is valid')
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