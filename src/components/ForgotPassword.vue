<template>
  <v-div class="main-container">
    <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
    <div class="main-greeting">
      <h1>Forgot Password</h1>
      <p>Kindly enter your registered</p>
      <p>phone number and username.</p>
    </div>
    <v-card class="main-form px-3 py-3">
      <v-form ref="forgotpassword_form" v-model="forgotpassword_form" v-if="firstProcess">
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="username" label="Username" 
          :rules="nameRules" :readonly="verifyBtn" required></v-text-field>
        </v-row>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="phonenumber" @input="debouncedAcceptNumber" label="Phone number" 
            :rules="phonenumberRules" :readonly="verifyBtn" required></v-text-field>
        </v-row>
        <transition>
          <v-row v-if="phoneMatchError" justify="space-around" class="ma-1 pa-1">
            <v-alert type="error" class="mt-1">
              {{ phoneMatchError }}
            </v-alert>
          </v-row>
        </transition>

        <transition>
        <v-row v-if="!requestOTPBtn" justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="otppassword" ref="otpField" type="number" counter="6" @input="onInputOTP" label="OTP Password" 
            :rules="otpRules" :disabled="requestOTPBtn" required></v-text-field>
        </v-row>
      </transition>

        <v-row justify="space-around" class="ma-3 pa-3">
          <v-btn v-show="verifyBtn" id="verrify" color="success" class="mt-4" block @click="doVerify">
            Submit
          </v-btn>
          <v-btn v-show="requestOTPBtn" id="request-otp" color="info" class="mt-4" block @click="doRequestOTP" :disabled="!isPhoneMatched">
            Request OTP
          </v-btn>
          <v-btn color="grey" class="mt-4" block @click="cancel">
            Cancel
          </v-btn>
        </v-row>
      </v-form>
      <v-form ref="changepassword_form" v-model="changepassword_form" v-else>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="newPassword" ref="newPassword" :type="show1 ? 'text' : 'password'" label="New Password" 
          :rules="newPassRules" :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1" required></v-text-field>
        </v-row>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="confirmNewPassword" :type="show2 ? 'text' : 'password'" label="Confirm New Password" 
            :rules="newPassRules" :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show2 = !show2" required></v-text-field>
        </v-row>

        <v-row justify="space-around" class="ma-3 pa-3">
          <v-btn color="success" class="mt-4" block @click="doChangePassword">
            Submit
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
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      firstProcess: true,
      username: '',
      phonenumber: '',
      otppassword: '',
      verifyBtn: false,
      requestOTPBtn: true,
      sid: null,
      newPassword: '',
      confirmNewPassword: '',
      show1: false,
      show2: false,
      isPhoneMatched: false,
      phoneMatchError: '', // For storing phone match error message
      newPassRules: [
        v => !!v || 'New Password is required',
        v => (v && v.length <= 10) || 'New Password must be 10 characters or less',
      ],
      nameRules: [
        v => !!v || 'Username is required',
      ],
      phonenumberRules: [
        v => !!v || 'Phone number is required',
      ],
      otpRules: [
        v => !!v || 'OTP is required',
        v => (v && v.length === 6) || 'OTP must be 6 characters long',
      ],
    };
  },
  methods: {
    async checkPhoneMatch() {
      let valid = false;
      try {
        const response = await axios.post(this.baseURL + '/checkmobileno', {
          username: this.username,
          mobileno: this.phonenumber,
        });
        console.log("phoneMatch", response);
        valid = response.data.success;
        this.isPhoneMatched = valid;
        this.phoneMatchError = valid ? '' : 'The Phone no. and username you entered don\'t match';
      } catch (error) {
        this.$emit('onErrorHandler', error.message);
      }
      return valid;
    },
    debouncedAcceptNumber() {
      if (this.phonenumber.replace(/\D/g, '').length === 10) { // Check if length is 10 digits
        this.checkPhoneMatch();
      }
      const x = this.phonenumber.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      this.phonenumber = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
    },
    async doRequestOTP() {
      this.$emit('onLoading', true);
      try {
        const response = await axios.post(this.baseURL + '/request-otp', {
          username: this.username,
          phoneNumber: this.phonenumber,
        });
        this.$emit('onLoading', false);
        console.log("doRequestOTP", response);
        if (response.data.success) {
          this.sid = response.data.message.sid;
          this.verifyBtn = true;
          this.requestOTPBtn = false;
          this.$nextTick(() => {
            this.$refs.otpField.focus();
          });
        } else {
          //this.$emit('onErrorHandler', 'Failed to send OTP, Please try again later');
          this.$emit('onErrorHandler', response.data.message || 'Invalid OTP');
        }
      } catch (error) {
        console.log("doRequestOTP", error);
        this.$emit('onLoading', false);
        this.$emit('onErrorHandler', error.message);
      }
    },
    async doVerify() {
      this.$emit('onLoading', true);
      try {
        const response = await axios.post(this.baseURL + '/verify-otp', {
          sid: this.sid,
          otp: this.otppassword,
        });
        this.$emit('onLoading', false);
        console.log("doVerify", response);
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          this.$store.dispatch('setToken', { token: response.data.token });
          this.firstProcess = false;
          
          this.$nextTick(() => {
            this.$refs.newPassword.focus();
          });
        } else {
          if (response.data.message.valid) {
            this.$emit('onErrorHandler', response.data.message);
          } else {
            this.$emit('onErrorHandler', 'OTP is invalid');
            this.otppassword = '';
            this.$nextTick(() => {
              this.$refs.otpField.focus();
            });
          }
        }
      } catch (error) {
        this.$emit('onLoading', false);
        this.$emit('onErrorHandler', error.message);
      }
    },
    async doChangePassword() {
      if (this.checkNewPassword()) {
        this.$emit('onLoading', true);
        const token = this.$store.getters.getToken;
        const encryptedPassword = this.encryptPassword(this.newPassword);
        try {
          const response = await axios.post(this.baseURL + '/change-password', {
            username: this.username,
            password: encryptedPassword,
          },{
              headers: { Authorization: `Bearer ${token}`, }
          });
          this.$emit('onLoading', false);
          console.log("doChangePassword", response);
          if (response.data.success) {
            this.$emit('onSuccessHandler', 'Password changed successfully');
            this.$emit('onForgotHandler', 'login');
          } else {
            this.$emit('onErrorHandler', response.data.message);
          }
        } catch (error) {
          this.$emit('onLoading', false);
          this.$emit('onErrorHandler', error.message);
        }
      }
    },
    checkNewPassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.$emit('onErrorHandler', 'Password does not match');
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.$nextTick(() => {
          this.$refs.newPassword.focus();
        });
        return false;
      }
      return true;
    },
    cancel() {
      this.$emit('onForgotHandler', 'login');
    },
    encryptPassword(password) {
      return CryptoJS.SHA256(password).toString();
    },
  },
  computed: {
        ...mapGetters({
            token: 'getToken',
        }),
    },
};
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
