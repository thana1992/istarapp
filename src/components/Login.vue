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
            @click="doLogin"
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
import tokenService from '@/services/tokenService';
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
    },
    methods: {
      async doLogin () {
        const { valid } = await this.$refs.login_form.validate()
        if (valid) {
          // Check if username and password are not empty
        if (!this.username || !this.password) {
          alert('Please enter both username and password.');
          
          return;
        }
        // Make API request to login
        this.$http.post('/login', {
          username: this.username,
          password: this.password,
        })
        .then(response => {
          console.dir(response);
          if (response.data.success) {
            
            tokenService.setToken(response.data.token);
            // Redirect or perform other actions on successful login
            localStorage.setItem("userdata", JSON.stringify(response.data.userdata));
            this.$emit('onAffterLogin')
          } else {
            this.$emit('onErrorHandler', response.data.message)
          }
        });
        // axios
        //   .post('http://localhost:3000/login', {
        //     username: this.username,
        //     password: this.password,
        //   })
        //   .then(response => {
        //     console.dir(response);
        //     if (response.data.success) {
              
        //       tokenService.setToken(response.data.token);
        //       // Redirect or perform other actions on successful login
        //       localStorage.setItem("userdata", JSON.stringify(response.data.userdata));
        //       this.$emit('onAffterLogin')
        //     } else {
        //       this.$emit('onErrorHandler', response.data.message)
        //     }
        //   })
        //   .catch(error => {
        //       console.error(error);
        //       alert(error.message)
        //   });
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