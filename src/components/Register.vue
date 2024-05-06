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
                :rules="usernameRules"
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
                v-model="firstname"
                label="Firstname"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="middlenamename"
                label="Middlename"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="lastname"
                label="Lastname"
                :rules="nameRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="address"
                label="Address"
                type="text"
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="email"
                label="E-mail"
                type="text"
                :rules="emailRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="mobileno"
                label="Mobile Number"
                @input="acceptNumber"
                type="text"
                :rules="mobileRules"
                required
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="lineid"
                label="Line id"
                type="text"
                ></v-text-field>

                <v-text-field
                variant="solo-filled"
                v-model="registercode"
                label="Register Code"
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
                <v-btn
                    color="grey"
                    class="mt-4"
                    block
                    @click="cancel"
                >
                    Cancel
                </v-btn>
            </v-form>
            </div>
        </div>
    </div>
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default {
    data: () => ({
      username: '',
      password: '',
      registercode: '',
      firstname: '',
      middlename: '',
      lastname: '',
      address: '',
      email: '',
      mobileno: '',
      lineid: '',
      usernameRules: [
        v => !!v || 'Username is required',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
      ],
      nameRules: [
        v => !!v || 'Name is required',
      ],
      mobileRules: [
        v => !!v || 'Mobile Number is required',
      ],
      emailRules: [ 
        v => !!v || 'E-mail is required',
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
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

          const encryptedPassword = this.encryptPassword(this.password);
          // Make API request to register the user
          axios
            .post(this.baseURL+'/register', {
              username: this.username,
              password: encryptedPassword,
              firstname: this.firstname,
              middlename: this.middlename,
              lastname: this.lastname,
              address: this.address,
              email: this.email,
              mobileno: this.mobileno,
              lineid: this.lineid
            })
            .then(response => {
              if (response.data.success) {
                this.$emit('onSuccessHandler', response.data.message || 'Registration successful');
              } else {
                this.$emit('onErrorHandler', response.data.message || 'Registration failed');
              }
            })
            .catch(error => {
              console.error(error);
              alert(error.message)
            });
        }
      },
      acceptNumber() {
        var x = this.mobileno.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        this.mobileno = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
      },
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },
      cancel() {
        this.$emit('onCancelHandler', 'login');
      },
      encryptPassword(password) {
      const encryptedPassword = CryptoJS.SHA256(password).toString();
      return encryptedPassword;
    },
    },
}
</script>
<style scoped>

</style>