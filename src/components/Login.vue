<template>
  <div v-if="showLogin" class="login-page">
    <div class="login-inner">
      <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
      <div class="login-greeting">
        <h1>{{ $t('auth.loginTitle') }}</h1>
        <p>{{ $t('auth.welcome') }}</p>
        <p>{{ $t('auth.welcomeSub') }}</p>
      </div>
      <v-card class="login-card card-opacity px-6 py-4">
        <v-form ref="login_form" v-model="login_form" @submit.prevent="doLogin">
          <v-text-field class="mb-3" variant="solo-filled" v-model="username" :label="$t('auth.username')" :rules="nameRules"
            @input="removeSpaces('username')" :placeholder="$t('auth.username')" name="username"
            autocomplete="username" required></v-text-field>
          <v-text-field class="mb-4" variant="solo-filled" v-model="password" :label="$t('auth.password')"
            :type="showpassword ? 'text' : 'password'" :rules="passwordRules" :placeholder="$t('auth.password')"
            :append-inner-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showpassword = !showpassword" name="password" autocomplete="current-password"
            required></v-text-field>
          <v-btn color="success" block type="submit" size="large" class="mb-3">{{ $t('auth.loginBtn') }}</v-btn>
          <v-btn color="blue" block @click="registerClick" class="mb-3">{{ $t('auth.registerBtn') }}</v-btn>
          <v-btn color="error" block @click="forgotpassword">{{ $t('auth.forgotBtn') }}</v-btn>
        </v-form>
      </v-card>
    </div>
  </div>
  <div v-else></div>
</template>

<script>

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
export default {
  data: () => ({
    LogginggIn: false,
    login_form: null,
    username: '',
    password: '',
    showpassword: false,
    nameRules: [
      v => !!v || 'Username is required',
      v => !/\s/.test(v) || 'Username must not contain spaces. / ห้ามมีเว้นวรรค',
      v => /^[\x00-\x7F]+$/.test(v) || 'Username must be English letters, numbers, or special characters only.',
    ],
    passwordRules: [
      v => !!v || 'Password is required',
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
            const userdata = JSON.parse(localStorage.getItem('userdata'));
            //console.log ('check userdata '+ userdata)
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
                .then(response => {
                    //console.dir(response);
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
.login-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8ebf1 0%, #cfd6e4 50%, #e8ebf1 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 5vh 20px 5vh;
}

.login-inner {
  width: 90vw;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-greeting {
  width: 100%;
  margin-bottom: 16px;
}

.login-greeting h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}

.login-greeting p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.login-card {
  width: 100%;
}

.istar-logo {
  width: 300px;
  margin-bottom: 20px;
}
</style>