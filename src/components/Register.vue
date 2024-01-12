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
                v-model="mobileno"
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
                    @click="doRegister"
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
import axios from 'axios';

export default {
    data: () => ({
      username: '',
      password: '',
      fullname: '',
      address: '',
      email: '',
      mobileno: '',
      lineid: '',
      nameRules: [
        v => !!v || 'Username is required',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
      ]
    }),
    methods: {
      async doRegister () {
        const { valid } = await this.$refs.form.validate()

        if (valid) {
          // Check if username and password are not empty
          if (!this.username || !this.password) {
            alert('Please enter both username and password.');
            return;
          }

          // Make API request to register the user
          axios
            .post('http://localhost:3000/register', {
              username: this.username,
              password: this.password,
              fullname: this.fullname,
              address: this.address,
              email: this.email,
              mobileno: this.mobileno,
              lineid: this.lineid
            })
            .then(response => {
              if (response.data.success) {
                alert('Registration successful');
                // Redirect or perform other actions on successful registration
                this.$emit('onBacktoLogin')
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
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },
      register() {
      
      },
    },
}
</script>
<style scoped>

</style>