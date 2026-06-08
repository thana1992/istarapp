<template>
  <div class="lg-wrap fp-wrap">
    <section class="lg-form fp-form">
      <span class="lg-form-spark fp-spark fp-spark-a"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-form-spark fp-spark fp-spark-b"><span class="mdi mdi-star-four-points"></span></span>
      <div class="lg-card">
        <div class="lg-mbrand">
          <div class="lg-logo"><img src="../assets/logo/logo-2.png" alt="iStar" /></div>
          <div class="lg-brand">iStar Gymnastics</div>
          <div class="lg-sub">Gymnastics · Class System</div>
        </div>
        <h2 class="fp-title">{{ $t('forgot.title') }}</h2>
        <p class="fp-subtitle">{{ $t('forgot.subtitle') }}</p>
        <v-card class="pa-5" rounded="xl" elevation="2">
          <v-form ref="forgotpassword_form" v-model="forgotpassword_form" v-if="firstProcess">
            <v-text-field class="mb-3" variant="solo-filled" flat prepend-inner-icon="mdi-account-outline"
              v-model="username" :label="$t('forgot.username')" :rules="nameRules"
              @input="removeSpaces('username')" :readonly="verifyBtn" required></v-text-field>
            <v-text-field class="mb-3" variant="solo-filled" flat prepend-inner-icon="mdi-phone-outline"
              v-model="phonenumber" @input="debouncedAcceptNumber" :label="$t('forgot.phone')"
              :rules="phonenumberRules" :readonly="verifyBtn" required></v-text-field>
            <transition>
              <v-alert v-if="phoneMatchError" type="error" class="mb-3">
                {{ phoneMatchError }}
              </v-alert>
            </transition>

            <transition>
              <v-text-field v-if="!requestOTPBtn" class="mb-3" variant="solo-filled" flat
                prepend-inner-icon="mdi-shield-key-outline"
                v-model="otppassword" ref="otpField" type="number" counter="6" @input="onInputOTP"
                :label="$t('forgot.otp')" :rules="otpRules" :disabled="requestOTPBtn" required></v-text-field>
            </transition>

            <button v-show="verifyBtn" id="verrify" class="id-btn id-btn-success fp-btn" @click.prevent="doVerify">
              <span class="mdi mdi-check"></span> {{ $t('forgot.submit') }}
            </button>
            <button v-show="requestOTPBtn" id="request-otp" class="id-btn id-btn-primary fp-btn"
              :disabled="!isPhoneMatched" @click.prevent="doRequestOTP">
              <span class="mdi mdi-message-text-outline"></span> {{ $t('forgot.requestOTP') }}
            </button>
            <button class="id-btn id-btn-ghost fp-btn" @click.prevent="cancel">
              <span class="mdi mdi-arrow-left"></span> {{ $t('forgot.cancel') }}
            </button>
          </v-form>

          <v-form ref="changepassword_form" v-model="changepassword_form" v-else>
            <v-text-field class="mb-3" variant="solo-filled" flat prepend-inner-icon="mdi-lock-outline"
              v-model="newPassword" ref="newPassword" :type="show1 ? 'text' : 'password'"
              :label="$t('forgot.newPassword')" :rules="newPassRules"
              :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1"
              required></v-text-field>
            <v-text-field class="mb-3" variant="solo-filled" flat prepend-inner-icon="mdi-lock-check-outline"
              v-model="confirmNewPassword" :type="show2 ? 'text' : 'password'"
              :label="$t('forgot.confirmPassword')" :rules="newPassRules"
              :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show2 = !show2"
              required></v-text-field>

            <button class="id-btn id-btn-success fp-btn" @click.prevent="doChangePassword">
              <span class="mdi mdi-check"></span> {{ $t('forgot.submit') }}
            </button>
            <button class="id-btn id-btn-ghost fp-btn" @click.prevent="cancel">
              <span class="mdi mdi-arrow-left"></span> {{ $t('forgot.cancel') }}
            </button>
          </v-form>
        </v-card>
      </div>
    </section>
  </div>
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
        v => !!v || this.$t('validation.newPasswordRequired'),
        v => (v && v.length <= 10) || this.$t('validation.newPasswordMaxLength'),
      ],
      nameRules: [
        v => !!v || this.$t('validation.usernameRequired'),
        v => !/\s/.test(v) || this.$t('validation.usernameNoSpaces'),
        // eslint-disable-next-line no-control-regex
        v => /^[\x00-\x7F]+$/.test(v) || this.$t('validation.usernameEnglishOnly'),
      ],
      phonenumberRules: [
        v => !!v || this.$t('validation.phoneRequired'),
      ],
      otpRules: [
        v => !!v || this.$t('validation.otpRequired'),
        v => (v && v.length === 6) || this.$t('validation.otpLength'),
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
        //console.log("phoneMatch", response);
        valid = response.data.success;
        this.isPhoneMatched = valid;
        this.phoneMatchError = valid ? '' : this.$t('forgot.phoneMatchError');
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
        //console.log("doRequestOTP", response);
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
        //console.log("doRequestOTP", error);
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
        //console.log("doVerify", response);
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
            this.$emit('onErrorHandler', this.$t('forgot.otpInvalid'));
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
      this.$emit('onLoading', true);
      if (this.checkNewPassword()) {
        
        const token = this.$store.getters.getToken;
        const encryptedPassword = this.encryptPassword(this.newPassword);
        try {
          const response = await axios.post(this.baseURL + '/change-password', {
            username: this.username,
            newPassword: encryptedPassword,
          },{
              headers: { Authorization: `Bearer ${token}`, }
          });
          if (response.data.success) {
            // ลบ token จาก localStorage
            localStorage.removeItem('token');
            console.log("doChangePassword Success", response);
            this.$emit('onSuccessHandler', this.$t('forgot.passwordChangedSuccess'));
            this.$emit('onForgotHandler', 'login');
          } else {
            // ลบ token จาก localStorage
            localStorage.removeItem('token');
            this.$emit('onErrorHandler', response.data.message);
            this.$emit('onForgotHandler', 'login');
          }
        } catch (error) {
          // ลบ token จาก localStorage
          localStorage.removeItem('token');
          this.$emit('onErrorHandler', error.message);
          this.$emit('onForgotHandler', 'login');
        }
      }
    },
    checkNewPassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        this.$emit('onErrorHandler', this.$t('forgot.passwordMismatch'));
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
    removeSpaces(field) {
      this[field] = this[field].replace(/\s+/g, '');
    }
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

/* ForgotPassword: no hero panel — single full-screen pink-gradient
   stage with a centered card, on every viewport size. */
.fp-wrap {
  grid-template-columns: 1fr;
}

.fp-form {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #fde8f3 0%, #f3e9ff 55%, #fff7ed 100%);
}

.fp-form > *:not(.fp-spark) {
  position: relative;
  z-index: 1;
}

/* Show the mobile brand block on all sizes (no hero here to carry it). */
.fp-form .lg-mbrand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  margin-bottom: 20px;
}

.fp-form .lg-mbrand .lg-logo {
  width: 94px;
  height: 94px;
  background: transparent;
  border-radius: 0;
}

.fp-form .lg-mbrand .lg-logo img {
  filter: drop-shadow(0 4px 14px rgba(236, 72, 153, .35));
}

.fp-form .lg-mbrand .lg-brand {
  color: var(--c-primary-dark);
  font-size: 24px;
  margin-top: 6px;
}

.fp-form .lg-mbrand .lg-sub {
  color: var(--c-text-muted);
}

/* Let the gradient stage show through the card, matching the prototype. */
.fp-form .v-card {
  background: transparent !important;
  box-shadow: none !important;
}

.fp-title {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 26px;
  color: var(--c-text-heading);
  margin: 0 0 4px;
  text-align: center;
}

.fp-subtitle {
  color: var(--c-text-muted);
  margin: 0 0 20px;
  text-align: center;
}

.fp-btn {
  width: 100%;
  margin-top: 12px;
}

.fp-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

/* Static decorative sparkles (no script data) — display:block to override
   the .lg-form-spark default of display:none. */
.fp-spark {
  display: block;
  position: absolute;
  z-index: 0;
  color: rgba(168, 85, 247, .45);
  pointer-events: none;
  font-size: 30px;
  animation: lg-tw 3.2s ease-in-out infinite;
}

.fp-spark-a {
  left: 12%;
  top: 16%;
  animation-delay: .2s;
}

.fp-spark-b {
  right: 14%;
  bottom: 18%;
  font-size: 22px;
  animation-delay: 1.1s;
}
</style>
