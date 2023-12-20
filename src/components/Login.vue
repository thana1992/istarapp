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
      const router = useRouter();
      const $http = inject('$http', null);
  
      const username = ref('');
      const password = ref('');
      const user = ref({});
  
      const login = async () => {
        try {
          if (!$http) {
            console.error('Axios instance not found. Make sure it is provided in main.js.');
            return;
          }
  
          const response = await $http.post('/login', {
            username: username.value,
            password: password.value,
          });
  
          const token = response.data.token;
          localStorage.setItem('token', token);
          
          console.log(response.data.user);
          user.value = response.data.user;

        } catch (error) {
          console.error('Login error:', error);
          // Handle login error, e.g., display an error message
        }
      };
  
      return { username, password, user, login };
    },
    methods: {
      async validate () {
        const { valid } = await this.$refs.login_form.validate()
        if (valid) {
          const logindata = this.login();
          this.$emit('onAffterLogin', logindata)
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