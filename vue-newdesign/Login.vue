<!-- ============================================================
  Login.vue — option B (new iStar design on Vuetify)
  Drop-in replacement for src/components/Login.vue
  • Logic is UNCHANGED from your current Login.vue:
      SHA256(password) → POST /login → setToken + localStorage
      → emit('onAffterLogin')  (App.vue routes by userdata.usertype)
      created() still auto-verifies an existing token (session restore)
  • Only the <template> + <style> are new (the redesigned look).
  • Reuses your existing i18n keys (auth.*). New copy falls back to Thai.
  ============================================================ -->
<template>
  <div v-if="showLogin" class="lg-wrap">
    <!-- brand hero (desktop only) -->
    <section class="lg-hero">
      <span v-for="(s, i) in sparks" :key="i" class="lg-spark"
        :style="{ left: s.x + '%', top: s.y + '%', '--o': s.o, fontSize: s.sz + 'px', animationDelay: s.d + 's', animationDuration: s.dur + 's' }">
        <v-icon icon="mdi-star-four-points"></v-icon>
      </span>
      <div class="lg-brandtop">
        <div class="lg-logo"><img src="../assets/logo/logo-2.png" alt="iStar" /></div>
        <div>
          <div class="lg-brand-name">iStar Gymnastics</div>
          <div class="lg-brand-sub">Gymnastics · Class System</div>
        </div>
      </div>
      <div>
        <h1 class="lg-tag">{{ $t('auth.welcome') }}</h1>
        <p class="lg-blurb">{{ $t('auth.welcomeSub') }}</p>
      </div>
      <div class="lg-foot">© 2026 iStar Gymnastics</div>
    </section>

    <!-- form -->
    <section class="lg-formside">
      <div class="lg-card">
        <div class="lg-mbrand">
          <div class="lg-mlogo"><img src="../assets/logo/logo-2.png" alt="iStar" /></div>
          <div class="lg-mname">iStar Gymnastics</div>
          <div class="lg-mtag">Gymnastics · Class System</div>
        </div>

        <h2 class="lg-title">{{ $t('auth.loginTitle') }}</h2>
        <p class="lg-sub">{{ $t('auth.welcome') }}</p>

        <v-card class="pa-6 lg-formcard" elevation="3" rounded="xl">
          <v-form ref="login_form" v-model="login_form" @submit.prevent="doLogin">
            <v-text-field class="mb-3" variant="solo-filled" flat v-model="username" hide-details="auto"
              :label="$t('auth.username')" :rules="nameRules" @input="removeSpaces('username')"
              prepend-inner-icon="mdi-account-outline" name="username" autocomplete="username" required></v-text-field>

            <v-text-field class="mb-2" variant="solo-filled" flat v-model="password" hide-details="auto"
              :label="$t('auth.password')" :type="showpassword ? 'text' : 'password'" :rules="passwordRules"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showpassword = !showpassword" name="password" autocomplete="current-password"
              required></v-text-field>

            <div class="d-flex justify-end mb-4">
              <v-btn variant="text" color="primary" size="small" @click="forgotpassword">{{ $t('auth.forgotBtn') }}</v-btn>
            </div>

            <v-btn color="primary" block type="submit" size="large" flat append-icon="mdi-arrow-right"
              class="lg-btn mb-3">{{ $t('auth.loginBtn') }}</v-btn>
            <v-btn variant="tonal" color="primary" block size="large" flat class="lg-btn"
              @click="registerClick">{{ $t('auth.registerBtn') }}</v-btn>
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
      v => /^[\x00-\x7F]+$/.test(v) || t('validation.usernameEnglishOnly'),
    ],
    passwordRules: [
      v => !!v || t('validation.passwordRequired'),
    ],
    showLogin: false,
    // decorative sparkles for the hero (presentation only)
    sparks: Array.from({ length: 14 }, (_, i) => ({
      x: [10, 26, 16, 34, 8, 28, 46, 60, 80, 90, 70, 88, 78, 92][i],
      y: [12, 28, 52, 72, 86, 94, 18, 8, 14, 30, 44, 58, 76, 88][i],
      sz: 12 + (i % 4) * 5, o: 0.4 + (i % 3) * 0.18,
      d: ((i * 0.33) % 3).toFixed(2), dur: 2.4 + (i % 4) * 0.5,
    })),
  }),
  methods: {
    ...mapActions(["setToken"]),
    async doLogin() {
      const { valid } = await this.$refs.login_form.validate();
      if (valid) {
        this.$emit('onLoading', true);
        setTimeout(() => {
          const encryptedPassword = this.encryptPassword(this.password);
          axios
            .post(this.baseURL + '/login', {
              username: this.username,
              password: encryptedPassword,
            })
            .then(response => {
              if (response.data.success) {
                this.setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem("userdata", JSON.stringify(response.data.userdata));
                this.$store.dispatch('setToken', { token: response.data.token, userdata: response.data.userdata });
                this.$emit('onAffterLogin');
              } else {
                this.$emit('onErrorHandler', response.data.message);
              }
              this.$emit('onLoading', false);
            })
            .catch(error => {
              this.$emit('onLoading', false);
              this.$emit('onErrorHandler', error.message);
            });
        }, 1500);
      }
    },
    encryptPassword(password) {
      return CryptoJS.SHA256(password).toString();
    },
    reset() {
      this.LogginggIn = false;
      this.$refs.login_form.reset();
    },
    resetValidation() {
      this.$refs.login_form.resetValidation();
    },
    registerClick() {
      this.$emit('onResigterHandler', 'register');
    },
    forgotpassword() {
      this.$emit('onResigterHandler', 'forgotpassword');
    },
    removeSpaces(field) {
      this[field] = this[field].replace(/\s+/g, '');
    },
  },
  async created() {
    this.$emit('onLoading', true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.showLogin = true;
        this.$emit('onLoading', false);
        return;
      } else {
        await axios
          .post(this.baseURL + '/verifyToken', {}, { headers: { Authorization: `Bearer ${token}` } })
          .then(() => {
            this.$store.dispatch('setToken', { token: token, userdata: localStorage.getItem("userdata") });
            this.$emit('onAffterLogin');
            this.$emit('onLoading', false);
          })
          .catch(error => {
            console.error(error);
            this.showLogin = true;
            this.$emit('onLoading', false);
          });
      }
    } catch (error) {
      this.$emit('onErrorHandler', error.message);
      this.showLogin = true;
      this.$emit('onLoading', false);
    }
    this.$emit('onLoading', false);
  },
  computed: {
    ...mapGetters({ token: 'getToken' }),
  },
};
</script>

<style scoped>
.lg-wrap { position: fixed; inset: 0; z-index: 1; display: grid; grid-template-columns: 1.05fr 1fr; overflow-y: auto; }
@media (max-width: 900px) { .lg-wrap { grid-template-columns: 1fr; } }

/* hero */
.lg-hero {
  position: relative; overflow: hidden; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between; padding: 54px 52px 44px;
  background: linear-gradient(165deg, #ec4899 0%, #d6489a 55%, #a855f7 100%);
}
.lg-hero > *:not(.lg-spark) { position: relative; z-index: 1; }
.lg-spark { position: absolute; z-index: 0; color: rgba(255, 255, 255, .9); animation: lg-tw 2.8s ease-in-out infinite; }
@keyframes lg-tw { 0%, 100% { opacity: var(--o, .6); transform: scale(1); } 50% { opacity: .12; transform: scale(.55) rotate(12deg); } }
@media (prefers-reduced-motion: reduce) { .lg-spark { animation: none; } }
.lg-brandtop { display: flex; flex-direction: column; gap: 14px; }
.lg-logo { width: 120px; height: 120px; display: grid; place-items: center; }
.lg-logo img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 7px rgba(255, 255, 255, .6)) drop-shadow(0 0 20px rgba(249, 168, 212, .6)); }
.lg-brand-name { font-weight: 800; font-size: 30px; line-height: 1.05; }
.lg-brand-sub { font-size: 12px; letter-spacing: .26em; text-transform: uppercase; opacity: .82; margin-top: 8px; }
.lg-tag { font-weight: 800; font-size: clamp(28px, 3.4vw, 42px); line-height: 1.12; margin: 0; }
.lg-blurb { margin-top: 16px; max-width: 420px; font-size: 15px; line-height: 1.6; opacity: .9; }
.lg-foot { font-size: 12.5px; opacity: .8; }

/* form side */
.lg-formside { display: flex; align-items: center; justify-content: center; padding: 40px 28px;
  background: radial-gradient(700px 420px at 80% -10%, rgba(236, 72, 153, .10), transparent 60%), #f7f5fb; }
.lg-card { width: 100%; max-width: 430px; }
.lg-title { font-weight: 700; font-size: 26px; color: #2a1b30; margin: 0 0 4px; }
.lg-sub { color: #7a6b82; font-size: 14px; margin: 0 0 22px; }
.lg-mbrand { display: none; text-align: center; margin-bottom: 22px; }
.lg-mlogo { width: 96px; height: 96px; margin: 0 auto 12px; }
.lg-mlogo img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 6px rgba(236, 72, 153, .4)); }
.lg-mname { font-weight: 800; font-size: 22px; color: #3a2540; }
.lg-mtag { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #9a7da6; margin-top: 4px; }
@media (max-width: 900px) {
  .lg-hero { display: none; }
  .lg-mbrand { display: block; }
}

/* round Vuetify controls to match the design */
.lg-formcard :deep(.v-field) { border-radius: 14px !important; }
.lg-btn { border-radius: 13px !important; text-transform: none !important; letter-spacing: normal !important; font-weight: 700; }
</style>
