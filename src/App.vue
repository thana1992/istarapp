<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/78.jpg"
          :title="parent"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item v-if="!isLoggedIn" prepend-icon="mdi-login" title="LOGIN" value="login" @click="onClickChangeState('login')">
          </v-list-item>
          <v-list-item v-if="!isLoggedIn" prepend-icon="mdi-account-plus" title="REGISTER" value="register" @click="onClickChangeState('register')">
          </v-list-item>
          <!-- <v-list-item v-if="!isLoggedIn" prepend-icon="mdi-account-plus" title="FAMILY TEST" value="family" @click="onClickChangeState('family')">
          </v-list-item> -->
          <v-list-item v-if="isLoggedIn" prepend-icon="mdi-home-account" title="HOME" value="home" @click="onClickChangeState('home')">
          </v-list-item>
          <v-list-item v-if="isLoggedIn" prepend-icon="mdi-account-multiple" title="FAMILY" value="familylist" @click="onClickChangeState('familylist')">
          </v-list-item>
          <v-list-item v-if="isLoggedIn" prepend-icon="mdi-account-multiple" title="Logout" value="logout" @click="logout()">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar :elevation="20">
        <v-btn v-if="!black" @click.stop="drawer = !drawer"><span class="mdi mdi-menu"></span></v-btn>
        <v-btn v-if="black" @click="onClickChangeState(state)"><span class="mdi mdi-arrow-left"></span></v-btn>
        <p> Login {{ isLoggedIn }}</p>
      </v-app-bar>
      <v-main class="root-container">
        <Login v-if="state=='login'"
        @onAffterLogin="AffterLogin($event)"
        :user_details="user_details"
        @onErrorHandler="onError($event)"
        ></Login>
        
        <Register v-if="state=='register'" 
        @onBacktoLogin="backToLogin"
        @onErrorHandler="onError($event)"
        ></Register>

        <Family v-if="state=='family'"
        ></Family>

        <Home v-if="state=='home'" 
        @onClickBack="initBlackButton($event)"
        @onInvalidToken="invalidToken($event)"
        @onErrorHandler="onError($event)"
        ></Home>

        <FamilyList v-if="state=='familylist'" 
        @onClickBack="initBlackButton($event)"
        @onErrorHandler="onError($event)"
        ></FamilyList>
      </v-main>
    </v-layout>
  </v-card>

  <v-dialog width="500" v-model="errorDialog">
    <template v-slot:default="{ isActive }">
      <v-card title="Error!!" color="#F44336">
        <v-card-text>
          {{ errorMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="errorDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Home from './components/Home.vue'
import Family from './components/Family.vue'
import FamilyList from './components/FamilyList.vue'
import { ref, computed, onMounted, inject } from 'vue';

export default {
  data () {
      return {
        drawer: false,
        rail: true,
        parent: 'Guest',
        // state: 'login',
        // black: false,
        // blackstate: 'home',
        // homestate: 'family',
        errorDialog: false,
        errorMsg: '',
        user_details: {},
      }
    },
  name: 'App',
  components: {
    Login,
    Register,
    Family,
    Home,
    FamilyList,
    
  },
  methods: {
    AffterLogin (user) {
      this.parent = user.name
      if (user.usertype == 1) {
        this.state = 'home'
        this.homestate = 'family'
      } else {
        this.state = 'admin'
      }
    },
    toggleRail (page) {
      this.$router.push('/'+page)
    },
    onClickChangeState (state) {
      this.drawer= false
      this.state = state
    },
    initBlackButton (state) {
      //this.black = true
      //this.blackstate = state
    },
    backToLogin() {
      this.state = 'login'
    },
    invalidToken (state) {
      this.$router.push('/')
    },
    onError(msg) {
      this.errorMsg = msg
      this.errorDialog = true
      this.state = 'login'
    }
  },
  setup() {
    const isAuthenticated = computed(() => !!localStorage.getItem('token'));
    const isLoggedIn = ref(false);
    const state = ref('login');
    const drawer = ref(false);
    // Check if the user is logged in
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;
    };

    const logout = () => {
      localStorage.removeItem('token');
      // Redirect to the login page
      checkLoginStatus();
      state.value = 'login'
      drawer.value = false
    };

    checkLoginStatus();

    return { isAuthenticated, isLoggedIn, logout, state, drawer };
  },
  computed: {
    
  },
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>

</style>