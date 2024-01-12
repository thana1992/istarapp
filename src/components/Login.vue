<template>
  <div class="container">
    <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
    <div class="login-greeting">
      <h1>Login</h1>
      <p>Welcome to iStar Gymnastics!</p>
    </div>
    
    <v-card class="login-form px-3 py-4">
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
            class="mt-4"
            block
            @click="validate"
          >
            Sign in
          </v-btn>
          <v-btn
            color="error"
            class="mt-4"
            block
            @click="reset"
          >
            Clear
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
 
      <div class="link-footer">
        <p><a style="color:red;" href="">Forgot Password?</a></p>
      </div>
    
  </div>
</template>

<script>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
export default {
    data: () => ({
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
      const $http = inject('$http', null);
    //   const router = useRouter();
    //   const $http = inject('$http', null);
  
    //   const username = ref('');
    //   const password = ref('');
    //   const user = ref({});
  
    //   const login = async () => {
    //     try {
    //       if (!$http) {
    //         console.error('Axios instance not found. Make sure it is provided in main.js.');
    //         return;
    //       }
  
    //       const response = await $http.post('/login', {
    //         username: username.value,
    //         password: password.value,
    //       });
  
    //       const token = response.data.token;
    //       localStorage.setItem('token', token);
    //       return token
    //     } catch (error) {
    //       console.error('Login error:', error);
    //       this.$emit("onErrorHandler", error.message)
    //     }
    //   };
  
    //   return { username, password, user, login };
     },
    methods: {
      async validate () {
        const { valid } = await this.$refs.login_form.validate()
        if (valid) {
          this.login();
        }
      },
      async login () {
        const axios = require('axios');
        //const $http = inject('$http', null);
        try {
          const username = ref('');
          const password = ref('');
          if (!axios) {
            console.error('Axios instance not found. Make sure it is provided in main.js.');
            this.$emit("onErrorHandler", 'Client Error')
            return;
          }else{
            const response = await axios.post('http://192.168.1.59:3000/login', {
              username: this.username,
              password: this.password,
            });
            
            console.log(response)
            const token = response.data.token;
            localStorage.setItem('token', token);
            this.$emit('onAffterLogin', token)
            return token
          }
        } catch (error) {
          console.error('Login error:', error);
          if(error.response){
            this.$emit("onErrorHandler", error.response.data.message)
          }else{
            this.$emit("onErrorHandler", error.message)
          }
        }
      },
      reset () {
        this.$refs.login_form.reset()
      },
      resetValidation () {
        this.$refs.login_form.resetValidation()
      },
    },
  }
</script>
<style>

</style>