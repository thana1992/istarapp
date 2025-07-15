<template>
  <div v-if="showLogin" class="main-container">
    <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
    <div class="main-greeting">
      <h1>Login</h1>
      <p>Welcome to the iStar Gymnastics,</p>
      <p>Have a wonderful day :D...</p>
    </div>
    <v-card class="main-form px-3 py-3 mb-12">
      <v-form ref="login_form" v-model="login_form" @submit.prevent="doLogin">
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="username" label="Username" :rules="nameRules" @input="removeSpaces('username')"
            placeholder="Enter your username" name="username" autocomplete="username" required></v-text-field>
        </v-row>
        <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field variant="solo-filled" v-model="password" label="Password" :type="showpassword ? 'text' : 'password'"
            :rules="passwordRules" placeholder="Enter your password" :append-inner-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'" 
            @click:append-inner="showpassword = !showpassword" name="password" autocomplete="current-password" required></v-text-field>
        </v-row>

        <v-row justify="space-around" class="ma-2 pa-2">
          <v-btn color="success" class="" block type="submit">
            Login
          </v-btn>
          <v-btn color="blue" class="mt-8" block @click="registerClick">
            Register
          </v-btn>
          <v-btn color="error" class="mt-4" block @click="forgotpassword">
            Forgot Password ?
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </div>
  <div v-else>
  </div>
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
      v => /^[a-zA-Z0-9]*$/.test(v) || 'Username must not contain special characters or spaces. / Username ต้องเป็นภาษาอังกฤษหรือตัวเลข และต้องไม่มีอักขระพิเศษหรือเว้นวรรค',
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