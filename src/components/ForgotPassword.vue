<template>
    <v-div class="login-container">
    <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
    <div class="login-greeting">
      <h1>Forgot Password</h1>
      <p>Kindly enter your registered</p>
      <p>phone number and username.</p>
    </div>
    <v-card class="login-form px-3 py-3">
      <v-form ref="login_form" v-model="login_form">
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="username" :counter="10" label="Username" :rules="nameRules"
            placeholder="Enter your username" required></v-text-field>
        </v-row>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="phonenumber" :counter="10" type="number" label="Phone munber" 
            :rules="phonenumberRules" placeholder="Enter your phone munber" required></v-text-field>
        </v-row>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="otppassword" :counter="6" label="OPT Password" 
            :rules="otpRules" placeholder="Enter your OTP" required disabled></v-text-field>
        </v-row>

        <v-row justify="space-around" class="ma-2 pa-2">
          <v-btn color="info" class="mt-5" block @click="doForgot">
            Request OTP
          </v-btn>
          <v-btn color="grey" class="mt-4" block @click="cancel">
            Cancel
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </v-div>
</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mapActions } from "vuex";
    export default {
    data: () => ({
    username: '',
    phonenumber: '',
    otppassword: '',
    nameRules: [
      v => !!v || 'Username is required',
    ],
    phonenumberRules: [
      v => !!v || 'Phone number is required',
    ],
    otpRules: [
      v => !!v || 'OTP is required',
    ]
  }),
  methods: {
    async doForgot() {
        this.$emit('onLoading', true)
        axios
            .post(this.baseURL + '/request-otp', {
                username: this.username,
                phoneNumber: this.phonenumber,
            })
            .then(response => {
                this.$emit('onLoading', false)
                if (response.data.status === 'success') {
                    this.otppassword.disabled = false;
                } else {
                    this.$emit('onLoading', false)
                    this.$emit('onErrorHandler', response.data.message);
                }
            })
            .catch(error => {
                this.$emit('onLoading', false)
                this.$emit('onErrorHandler', error.message);
            });
    },
    cancel() {
      this.$emit('onForgotHandler', 'login');
    }
  }
}
</script>