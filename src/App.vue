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
        <v-btn v-if="black" @click="onClickBack(recentState)"><span class="mdi mdi-arrow-left"></span></v-btn>
        <p> Login {{ isLoggedIn }}</p>
      </v-app-bar>
      <v-main class="root-container">
        <Login v-if="state=='login'"
        @onAffterLogin="AffterLogin($event)"
        :user_details="user_details"
        @onErrorHandler="onError($event)"
        @onInfoHandler="onShowInfoDialog($event)"
        ></Login>

        <Register v-if="state=='register'" 
        @onBacktoLogin="backToLogin"
        @onErrorHandler="onError($event)"
        @onInfoHandler="onShowInfoDialog($event)"
        ></Register>

        <Family v-if="state=='family'"
        ></Family>

        <Home v-if="state=='home'" 
        @onClickBack="initBlackButton($event)"
        @onInvalidToken="invalidToken($event)"
        @onErrorHandler="onError($event)"
        @onInfoHandler="onShowInfoDialog($event)"
        :homeState="homestate"
        ></Home>

        <FamilyList v-if="state=='familylist'" 
        @onClickBack="initBlackButton($event)"
        @onErrorHandler="onError($event)"
        @onInfoHandler="onShowInfoDialog($event)"
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

  <v-dialog width="500" v-model="infoDialog">
    <template v-slot:default="{ isActive }">
      <v-card title="Success!!" color="#98FB98">
        <v-card-text>
          {{ infoMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="infoDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import tokenService from '@/services/tokenService';
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
        state: 'login',
        isLoggedIn: false,
        black: false,
        blackstate: 'home',
        homestate: 'family',
        errorDialog: false,
        errorMsg: '',
        infoDialog: false,
        inforMsg: '',
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
    AffterLogin () {
      this.user_details = JSON.parse(localStorage.getItem('userdata'))
        if (this.user_details.usertype == 1) {
          this.state = 'home'
          this.homestate = 'family'
        } else {
          this.state = 'admin'
        }
        this.isLoggedIn = tokenService.isLoggedIn();
    },
    toggleRail (page) {
      this.$router.push('/'+page)
    },
    onClickChangeState (state) {
      this.drawer= false
      this.state = state
    },
    onClickBack (recentState) {
      this.black = false
      this.state = recentState[0]
      this.homestate = recentState[1]
    },
    initBlackButton (state) {
      this.black = true
      this.recentState = state
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
    },
    onShowInfoDialog(msg) {
      this.infoMsg = msg
      this.infoDialog = true
    },
    logout () {
      localStorage.removeItem('userdata');
      this.isLoggedIn = tokenService.isLoggedIn();
      this.state = 'login'
      this.drawer = false
    }
  },
  setup() {
    // const isAuthenticated = computed(() => !!localStorage.getItem('token'));
    // const isLoggedIn = ref(false);
    // const state = ref('login');
    // const drawer = ref(false);
    // // Check if the user is logged in
    // const checkLoginStatus = () => {
    //   const token = localStorage.getItem('token');
    //   isLoggedIn.value = !!token;
    // };

    // const logout = () => {
    //   localStorage.removeItem('token');
    //   // Redirect to the login page
    //   checkLoginStatus();
    //   state.value = 'login'
    //   drawer.value = false
    // };

    // checkLoginStatus();

    // return { isAuthenticated, isLoggedIn, logout, state, drawer };
  },
  computed: {
    
  },
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>

</style>