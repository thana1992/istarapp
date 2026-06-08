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
        <v-card class="reg-card pa-6" rounded="xl" elevation="2">
          <v-form ref="form">
            <v-text-field variant="solo-filled" v-model="username" :label="$t('register.username')" :rules="usernameRules" @input="removeSpaces('username')" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="password" :label="$t('register.password')" type="password" :rules="passwordRules" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="firstname" :label="$t('register.firstname')" :rules="nameRules" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="middlename" :label="$t('register.middlename')"></v-text-field>

            <v-text-field variant="solo-filled" v-model="lastname" :label="$t('register.lastname')" :rules="nameRules" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="address" :label="$t('register.address')" type="text" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="email" :label="$t('register.email')" type="text" :rules="emailRules" @input="removeSpaces('email')" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="mobileno" :label="$t('register.mobile')" @input="acceptNumber" type="text" :rules="mobileRules" required></v-text-field>

            <v-text-field variant="solo-filled" v-model="registercode" :label="$t('register.code')" type="text" @input="removeSpaces('registercode')" required></v-text-field>

            <v-checkbox v-model="acceptPrivacyPolicy">
              <template v-slot:label>
                <div style="font-size: 12px;">
                  {{ $t('register.privacyConsent') }}
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <a
                        href="https://pdpa.pro/policies/view/en/UPCCiojcXUZQNYALpC1phePL"
                        target="_blank"
                        v-bind="props"
                        @click.stop
                      >
                        {{ $t('register.privacyOf') }} {{ $t('register.privacyPolicy') }}
                      </a>
                    </template>
                    {{ $t('register.privacyPolicy') }}
                  </v-tooltip>
                </div>
              </template>
            </v-checkbox>

            <button type="button" class="id-btn id-btn-primary reg-btn mt-1" :disabled="!acceptPrivacyPolicy" @click="doRegister">
              <span class="mdi mdi-account-plus"></span> {{ $t('register.submit') }}
            </button>
            <button type="button" class="id-btn id-btn-soft reg-btn mt-3" @click="reset">
              <span class="mdi mdi-restart"></span> {{ $t('register.clear') }}
            </button>
            <button type="button" class="id-btn id-btn-ghost reg-btn mt-3" @click="cancel">
              <span class="mdi mdi-arrow-left"></span> {{ $t('register.cancel') }}
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
      this.$refs.form.reset()
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

.reg-form .reg-card.reg-card {
  background: var(--c-surface) !important;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-md) !important;
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