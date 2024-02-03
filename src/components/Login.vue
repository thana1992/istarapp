<template>
  <div class="login-container">
    <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
    <div class="login-greeting">
      <h1>Login</h1>
      <p>Welcome to the iStar membership system.</p>
    </div>
    <v-card class="login-form px-3 py-3">
        <v-form ref="login_form" v-model="login_form">
          <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field
            variant="solo-filled"
            v-model="username"
            :counter="10"
            label="Username"
            :rules="nameRules"
            placeholder="Enter your username"
            required
          ></v-text-field>
        </v-row>
          <v-row justify="space-around" class="ma-1 pa-1">
          <v-text-field
            variant="solo-filled"
            v-model="password"
            :counter="10"
            label="Password"
            type="password"
            :rules="passwordRules"
            placeholder="Enter your password"
            required
          ></v-text-field>
        </v-row>

        <v-row justify="space-around" class="ma-2 pa-2">
          <v-btn
            color="success"
            class="mt-5"
            block
            @click="doLogin"
          >
            Sign in
          </v-btn>
          <v-btn
            color="blue-grey"
            class="mt-5"
            block
            @click="registerClick"
          >
            Register
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
    
  </div>
  <v-card
    v-if="LogginggIn"
    class="card-loading mx-auto text-center pt-5"
    elevation="24"
    height="150"
    width="150"
  >
    <v-card-title>
      <trinity-rings-spinner
        :animation-duration="1500"
        :size="66"
        color="#ff1d5e"
        class="mx-auto"
      />
      <!-- <atom-spinner
        :animation-duration="1000"
        :size="60"
        color="#ff1d5e"
        class="mx-auto"
      /> -->
    </v-card-title>
    <v-card-text style="color:#ff1d5e;" class="mx-auto">Loading...</v-card-text>
  </v-card>
</template>

<script>

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mapActions } from "vuex";
import { TrinityRingsSpinner } from 'epic-spinners'
export default {
    components: {
      TrinityRingsSpinner
    },
    data: () => ({
      LogginggIn: false,
      login_form: null,
      username: '',
      password: '',
      nameRules: [
        v => !!v || 'Username is required',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
      ]
    }),
    setup() {
    },
    methods: {
      ...mapActions(["setToken"]),
      async doLogin () {
        const { valid } = await this.$refs.login_form.validate()
        if (valid) {
          this.LogginggIn = true;
          const encryptedPassword = this.encryptPassword(this.password);
          axios
          .post(this.baseURL+'/login', {
            username: this.username,
            password: encryptedPassword,
          })
          .then(response => {
            console.dir('login ',response);
            if (response.data.success) {
              //tokenService.setToken(response.data.token);
              // Redirect or perform other actions on successful login
              this.setToken(response.data.token);
              localStorage.setItem('token', response.data.token);
              localStorage.setItem("userdata", JSON.stringify(response.data.userdata));
              // Example usage in Login.vue
              this.$store.dispatch('setToken', { token: response.data.token, user: response.data.userdata });

              this.$emit('onAffterLogin')
            } else {
              this.$emit('onErrorHandler', response.data.message)
            }
            this.LogginggIn = false;
          })
          .catch(error => {
              console.error(error);
              this.LogginggIn = false;
              this.$emit('onErrorHandler', error.message)
          });
        }
      },
      encryptPassword(password) {
        const encryptedPassword = CryptoJS.SHA256(password).toString();

        return encryptedPassword;
      },
      reset () {
        this.LogginggIn = false;
        this.$refs.login_form.reset()
      },
      resetValidation () {
        this.$refs.login_form.resetValidation()
      },
      registerClick() {
        this.$emit('onResigterHandler', 'register')
      }
    },
  }
</script>