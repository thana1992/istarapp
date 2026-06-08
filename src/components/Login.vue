<template>
  <div v-if="showLogin" class="lg-wrap">
    <!-- LEFT: gradient hero -->
    <section class="lg-hero">
      <span class="lg-spark" style="left:14%;top:18%;--o:.6;font-size:22px"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-spark" style="left:78%;top:30%;--o:.5;font-size:16px;animation-delay:1s"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-spark" style="left:60%;top:72%;--o:.45;font-size:18px;animation-delay:.6s"><span class="mdi mdi-star-four-points"></span></span>
      <div>
        <div class="lg-logo"><img src="../assets/logo/logo-2.png" alt="iStar" /></div>
        <div class="lg-brand">iStar Gymnastics</div>
        <div class="lg-sub">Gymnastics · Class System</div>
      </div>
      <div>
        <div class="lg-tag">จองคลาส เช็คอิน<br />จัดการคอร์ส<br />ครบ จบ ในที่เดียว</div>
        <div class="lg-blurb">ผู้ปกครองจองคลาสให้ลูกได้เองบนมือถือ แอดมินดูตารางและเช็คอินได้ในจอเดียว</div>
      </div>
      <div class="lg-foot">© 2026 iStar Gymnastics</div>
    </section>

    <!-- RIGHT: login form -->
    <section class="lg-form">
      <!-- twinkling sparkles (shown only on narrow screens where the hero is hidden) -->
      <span class="lg-form-spark" style="left:12%;top:14%;font-size:20px"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-form-spark" style="left:82%;top:22%;font-size:15px;animation-delay:1s"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-form-spark" style="left:18%;top:80%;font-size:18px;animation-delay:.5s"><span class="mdi mdi-star-four-points"></span></span>
      <span class="lg-form-spark" style="left:74%;top:86%;font-size:14px;animation-delay:.8s"><span class="mdi mdi-star-four-points"></span></span>
      <div class="lg-card">
        <div class="lg-mbrand">
          <div class="lg-logo"><img src="../assets/logo/logo-2.png" alt="iStar" /></div>
          <div class="lg-brand">iStar Gymnastics</div>
          <div class="lg-sub">Gymnastics · Class System</div>
        </div>
        <h2 class="lg-title">{{ $t('auth.loginTitle') }}</h2>
        <p class="lg-welcome">{{ $t('auth.welcome') }} {{ $t('auth.welcomeSub') }}</p>
        <v-card class="pa-5" rounded="xl" elevation="2">
          <v-form ref="login_form" v-model="login_form" @submit.prevent="doLogin">
            <v-text-field class="mb-3" variant="solo-filled" flat prepend-inner-icon="mdi-account-outline"
              v-model="username" :label="$t('auth.username')" :rules="nameRules"
              @input="removeSpaces('username')" :placeholder="$t('auth.username')" name="username"
              autocomplete="username" required></v-text-field>
            <v-text-field class="mb-4" variant="solo-filled" flat prepend-inner-icon="mdi-lock-outline"
              v-model="password" :label="$t('auth.password')"
              :type="showpassword ? 'text' : 'password'" :rules="passwordRules" :placeholder="$t('auth.password')"
              :append-inner-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showpassword = !showpassword" name="password" autocomplete="current-password"
              required></v-text-field>
            <button type="submit" class="id-btn id-btn-primary lg-submit">
              <span class="mdi mdi-login"></span> {{ $t('auth.loginBtn') }}
            </button>
            <div class="lg-links">
              <button type="button" class="id-btn id-btn-soft id-btn-sm" @click="registerClick">
                <span class="mdi mdi-account-plus-outline"></span> {{ $t('auth.registerBtn') }}
              </button>
              <button type="button" class="id-btn id-btn-ghost id-btn-sm" @click="forgotpassword">
                <span class="mdi mdi-lock-question"></span> {{ $t('auth.forgotBtn') }}
              </button>
            </div>
          </v-form>
        </v-card>
      </div>
    </section>
  </div>
  <div v-else></div>
</template>

<script>

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import { t } from "@/i18n";
export default {
  data: () => ({
    LogginggIn: false,
    login_form: null,
    username: '',
    password: '',
    showpassword: false,
    nameRules: [
      v => !!v || t('validation.usernameRequired'),
      v => !/\s/.test(v) || t('validation.usernameNoSpaces'),
      // eslint-disable-next-line no-control-regex
      v => /^[\x00-\x7F]+$/.test(v) || t('validation.usernameEnglishOnly'),
    ],
    passwordRules: [
      v => !!v || t('validation.passwordRequired'),
    ],
    showLogin: false,
  }),
  setup() {

  },
  methods: {
    ...mapActions(["setToken"]),
    async doLogin() {
      const { valid } = await this.$refs.login_form.validate()
      if (valid) {
        this.$emit('onLoading', true)
        setTimeout(() => {
          const encryptedPassword = this.encryptPassword(this.password);
          axios
            .post(this.baseURL + '/login', {
              username: this.username,
              password: encryptedPassword,
            })
            .then(response => {
              //console.log('login ', response);

              if (response.data.success) {
                //tokenService.setToken(response.data.token);
                // Redirect or perform other actions on successful login
                this.setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem("userdata", JSON.stringify(response.data.userdata));
                //console.log("USER DATA " + localStorage.getItem("userdata"));
                // Example usage in Login.vue
                this.$store.dispatch('setToken', { token: response.data.token, userdata: response.data.userdata });

                this.$emit('onAffterLogin')
              } else {
                this.$emit('onErrorHandler', response.data.message)
              }

              this.$emit('onLoading', false)
            })
            .catch(error => {
              //console.log('error '+ error);
              //console.error(error);
              this.$emit('onLoading', false)
              this.$emit('onErrorHandler', error.message)
            });
        }, 1500);
      }
    },
    encryptPassword(password) {
      const encryptedPassword = CryptoJS.SHA256(password).toString();

      return encryptedPassword;
    },
    reset() {
      this.LogginggIn = false;
      this.$refs.login_form.reset()
    },
    resetValidation() {
      this.$refs.login_form.resetValidation()
    },
    registerClick() {
      this.$emit('onResigterHandler', 'register')
    },
    forgotpassword() {
      this.$emit('onResigterHandler', 'forgotpassword')
    },
    removeSpaces(field) {
      this[field] = this[field].replace(/\s+/g, '');
    }
  },
  async created() {
        this.$emit('onLoading', true)
        try {
            const token = localStorage.getItem('token');
            //console.log('check token '+ token)
            if (!token) {

                this.showLogin = true;
                this.$emit('onLoading', false)
                return;
            } else {

            await axios
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(() => {
                    this.$store.dispatch('setToken', { token: token, userdata: localStorage.getItem("userdata") });
                    this.$emit('onAffterLogin');
                    this.$emit('onLoading', false)
                })
                .catch(error => {
                    console.error(error);
                    this.showLogin = true;
                    this.$emit('onLoading', false)
                });
              }
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
            this.showLogin = true;
            this.$emit('onLoading', false)
        }
        this.$emit('onLoading', false)
      
    },
    computed: {
      ...mapGetters({
          token: 'getToken',
      })
    },
}
</script>

<style scoped>
/* iStar pink split login. Layout classes (.lg-wrap / .lg-hero / .lg-form /
   .lg-card / .lg-logo / .lg-brand / .lg-sub / .lg-tag / .lg-blurb / .lg-foot /
   .lg-mbrand / .lg-spark) come from the global src/assets/istar-pages.css.
   These scoped rules only cover this page's heading copy + button block. */

/* Make this screen full-bleed above any themed body background. */
.lg-wrap {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow-y: auto;
}

.lg-title {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 26px;
  color: var(--c-text-heading);
  margin: 0 0 4px;
}

.lg-welcome {
  color: var(--c-text-muted);
  margin: 0 0 20px;
}

.lg-submit {
  width: 100%;
  height: 46px;
}

.lg-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.lg-links .id-btn {
  width: 100%;
}

/* narrow screen: heading copy sits on the dark pink->purple gradient -> make it white */
@media (max-width: 900px) {
  .lg-title { color: #fff; }
  .lg-welcome { color: rgba(255, 255, 255, 0.85); }
}
</style>