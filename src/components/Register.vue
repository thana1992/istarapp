<template>
  <div class="lg-wrap reg-wrap">
    <section class="lg-form reg-form">
      <span class="lg-form-spark reg-spark reg-spark-1"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-form-spark reg-spark reg-spark-2"><span class="mdi mdi-star-four-points"></span></span>
      <div class="lg-card reg-card-wrap">
        <div class="lg-mbrand reg-mbrand">
          <div class="lg-logo"><span class="mdi mdi-star-four-points"></span></div>
          <div class="lg-brand">iStar Gymnastics</div>
          <div class="lg-sub">Gymnastics · Class System</div>
        </div>
        <h2 class="reg-heading"><span class="mdi mdi-account-plus"></span> {{ $t('register.title') }}</h2>
        <p class="reg-subhead">{{ $t('register.privacyOf') }}</p>
        <div class="scard reg-scard">
          <v-form ref="form">
            <div class="modal-sec"><span class="mdi mdi-card-account-details-outline"></span> {{ $t('register.title') }}</div>
            <div class="form-grid">
              <div class="field full"><label>{{ $t('register.username') }} <span class="req">*</span></label>
                <input class="id-input" v-model="username" @input="removeSpaces('username')"></div>
              <div class="field full"><label>{{ $t('register.password') }} <span class="req">*</span></label>
                <input class="id-input" type="password" v-model="password"></div>
              <div class="field"><label>{{ $t('register.firstname') }} <span class="req">*</span></label>
                <input class="id-input" v-model="firstname"></div>
              <div class="field"><label>{{ $t('register.lastname') }} <span class="req">*</span></label>
                <input class="id-input" v-model="lastname"></div>
              <div class="field full"><label>{{ $t('register.middlename') }}</label>
                <input class="id-input" v-model="middlename"></div>
              <div class="field full"><label>{{ $t('register.address') }}</label>
                <input class="id-input" v-model="address"></div>
              <div class="field full"><label>{{ $t('register.email') }} <span class="req">*</span></label>
                <input class="id-input" type="email" v-model="email" @input="removeSpaces('email')"></div>
              <div class="field"><label>{{ $t('register.mobile') }} <span class="req">*</span></label>
                <input class="id-input" v-model="mobileno" @input="acceptNumber"></div>
              <div class="field"><label>{{ $t('register.code') }} <span class="req">*</span></label>
                <input class="id-input" v-model="registercode" @input="removeSpaces('registercode')"></div>
            </div>

            <label class="id-cbx" style="align-items:flex-start;margin-top:16px" @click="acceptPrivacyPolicy = !acceptPrivacyPolicy">
              <span class="id-check" :class="{ on: acceptPrivacyPolicy }" style="margin-top:1px;flex:0 0 auto"><span class="mdi mdi-check"></span></span>
              <span style="font-size:12.5px">{{ $t('register.privacyConsent') }}
                <a href="https://pdpa.pro/policies/view/en/UPCCiojcXUZQNYALpC1phePL" target="_blank" @click.stop>
                  {{ $t('register.privacyOf') }} {{ $t('register.privacyPolicy') }}</a>
              </span>
            </label>

            <button type="button" class="id-btn id-btn-primary reg-btn mt-4" :disabled="!acceptPrivacyPolicy" @click="doRegister">
              <span class="mdi mdi-account-plus"></span> {{ $t('register.submit') }}
            </button>
            <button type="button" class="id-btn id-btn-soft reg-btn mt-3" @click="reset">
              <span class="mdi mdi-restart"></span> {{ $t('register.clear') }}
            </button>
            <button type="button" class="id-btn id-btn-ghost reg-btn mt-3" @click="cancel">
              <span class="mdi mdi-arrow-left"></span> {{ $t('register.cancel') }}
            </button>
          </v-form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { t } from "@/i18n";

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
    acceptPrivacyPolicy: false,
    usernameRules: [
      v => !!v || t('validation.usernameRequired'),
      v => !/\s/.test(v) || t('validation.usernameNoSpaces'),
      // eslint-disable-next-line no-control-regex
      v => /^[\x00-\x7F]+$/.test(v) || t('validation.usernameEnglishOnly'),
    ],
    passwordRules: [
      v => !!v || t('validation.passwordRequired'),
    ],
    nameRules: [
      v => !!v || t('validation.nameRequired'),
    ],
    mobileRules: [
      v => !!v || t('validation.mobileRequired'),
    ],
    emailRules: [
      v => !!v || t('validation.emailRequired'),
      v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || t('validation.emailInvalid')
    ]
  }),
  methods: {
    async doRegister() {
      this.$emit('onLoading', true)
      const { valid } = await this.$refs.form.validate()

      if (valid) {
        // Check if username and password are not empty
        if (!this.username || !this.password) {
          alert(t('msg.bothCredsRequired'));
          return;
        }

        const encryptedPassword = this.encryptPassword(this.password);
        // Make API request to register the user
        axios
          .post(this.baseURL + '/register', {
            username: this.username,
            password: encryptedPassword,
            firstname: this.firstname,
            middlename: this.middlename,
            lastname: this.lastname,
            address: this.address,
            email: this.email,
            mobileno: this.mobileno,
            registercode: this.registercode.trim(),
            acceptPrivacyPolicy: this.acceptPrivacyPolicy
          })
          .then(response => {
            if (response.data.success) {
              this.$emit('onSuccessHandler', response.data.message || t('msg.registerSuccess'));
            } else {
              this.$emit('onErrorHandler', response.data.message || t('msg.registerFail'));
            }
          })
          .catch(error => {
            //console.error(error);
            alert(error.message)
          });
      }
      this.$emit('onLoading', false)
    },
    acceptNumber() {
      var x = this.mobileno.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      this.mobileno = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
    },
    reset() {
      // plain .id-input fields aren't Vuetify inputs → clear the bound data directly
      this.username = ''
      this.password = ''
      this.registercode = ''
      this.firstname = ''
      this.middlename = ''
      this.lastname = ''
      this.address = ''
      this.email = ''
      this.mobileno = ''
      this.acceptPrivacyPolicy = false
      if (this.$refs.form) this.$refs.form.resetValidation()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    cancel() {
      this.$emit('onCancelHandler', 'login');
    },
    encryptPassword(password) {
      const encryptedPassword = CryptoJS.SHA256(password).toString();
      return encryptedPassword;
    },
    removeSpaces(field) {
      this[field] = this[field].replace(/\s+/g, '');
    }
  },
}
</script>
<style scoped>
/* Full-screen pink-gradient auth page (no hero panel for Register).
   Reuses the app-wide .lg-* / .id-btn classes from istar-pages.css +
   istar-design.css; the reg-* modifiers below only force the single-column
   gradient + always-visible brand at every viewport width and allow the tall
   register form to scroll. Paint-only — no layout tokens overridden globally. */
.reg-wrap {
  grid-template-columns: 1fr;
  min-height: 100vh;
}

.reg-form {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 100vh;
  align-items: flex-start;
  padding: clamp(28px, 5vh, 56px) 20px clamp(28px, 5vh, 56px);
  background: linear-gradient(160deg, #fde8f3 0%, #f3e9ff 55%, #fff7ed 100%);
}

.reg-form > *:not(.reg-spark) {
  position: relative;
  z-index: 1;
}

/* Static decorative sparkles (no script data) */
.reg-spark {
  display: block;
  position: absolute;
  z-index: 0;
  color: rgba(168, 85, 247, 0.35);
  pointer-events: none;
}
.reg-spark .mdi { display: block; }
.reg-spark-1 { top: 8%; left: 8%; font-size: 26px; }
.reg-spark-2 { bottom: 10%; right: 9%; font-size: 34px; }

.reg-card-wrap {
  max-width: 460px;
}

/* Brand block always visible on this dedicated full-screen page */
.reg-mbrand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  margin-bottom: 18px;
}
.reg-mbrand .lg-logo {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: var(--sidebar-bg);
}
.reg-mbrand .lg-logo .mdi { font-size: 46px; color: #fff; }
.reg-mbrand .lg-brand { color: var(--c-primary-dark); font-size: 24px; margin-top: 6px; }
.reg-mbrand .lg-sub { color: var(--c-text-muted); }

.reg-heading {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 24px;
  color: var(--c-text-heading);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.reg-heading .mdi { font-size: 26px; color: var(--c-primary); }

.reg-subhead {
  color: var(--c-text-muted);
  margin: 0 0 18px;
  font-size: 13px;
}

/* Full-width pill-style action buttons */
.reg-btn {
  width: 100%;
  height: 46px;
}
.reg-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>