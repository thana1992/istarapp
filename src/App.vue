<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list-item
          :prepend-avatar="iconUrl"
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
          <v-list-item v-if="isLoggedIn && adminflag" prepend-icon="mdi-view-dashboard" title="DASHBOARD" value="dashboard" @click="onClickChangeState('dashboard')">
          </v-list-item>
          <v-list-item v-if="isLoggedIn && adminflag" prepend-icon="mdi-star-shooting-outline" title="COURSES" value="course" @click="onClickChangeState('course')">
          </v-list-item>
          <v-list-item v-if="isLoggedIn && adminflag" prepend-icon="mdi-gymnastics" title="CLASSES" value="classes" @click="onClickChangeState('classes')">
          </v-list-item>
          <v-list-item v-if="isLoggedIn" prepend-icon="mdi-logout" title="Logout" value="logout" @click="logout()">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar :elevation="20">
        <v-btn v-if="!black" @click.stop="drawer = !drawer"  variant="tonal"><span class="mdi mdi-menu" style="font-size: large;"></span></v-btn>
        <v-btn v-if="black" @click="onClickBack(recentState)"  variant="tonal"><span class="mdi mdi-arrow-left" style="font-size: large;" ></span></v-btn>
        
      </v-app-bar>
      <v-main class="root-container">
        <Transition>

          <Login v-if="state=='login'"
          @onAffterLogin="AffterLogin($event)"
          :user_details="user_details"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></Login>
        
          <Register v-else-if="state=='register'" 
          @onBacktoLogin="backToLogin"
          @onErrorHandler="onError($event)"
          @onSuccessHandler="onRegisterSuccess($event)"
          ></Register>

          <Home v-else-if="state=='home'"
          @collectData="collectData($event)"
          @initBack="initBlackButton($event)"
          @onInvalidToken="invalidToken($event)"
          @onClickChangeState="onClickChangeState($event)"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          :student="student"
          ></Home>

          <Reservation v-else-if="state=='reservation'"
          @initBack="initBlackButton($event)"
          @onInvalidToken="invalidToken($event)"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          @onSuccessHandler="onClickBack($event)"
          :student="student"
          ></Reservation>

          <FamilyList v-else-if="state=='familylist'" 
          @initBack="initBlackButton($event)"
          @onClickChangeState="onClickChangeState($event)"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></FamilyList>

          <AddFamily v-else-if="state=='addfamilymember'"
          @initBack="initBlackButton($event)"
          @onClickChangeState="onClickChangeState($event)"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></AddFamily>

          <Dashboard v-else-if="state=='dashboard'"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></Dashboard>

          <Course v-else-if="state=='course'"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></Course>

          <Classes v-else-if="state=='classes'"
          @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)"
          ></Classes>

          

        </Transition>

      </v-main>
    </v-layout>
  </v-card>

  <v-dialog width="500" v-model="errorDialog">
    <template v-slot:default="{ isActive }">
      <v-card title="ผิดพลาด!!" color="#F44336">
        <v-card-text>
          {{ errorMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="tonal" block @click="errorDialog = false">ปิด</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <v-dialog width="500" v-model="infoDialog">
    <template v-slot:default="{ isActive }">
      <v-card title="สำเร็จ!!" color="#98FB98">
        <v-card-text>
          {{ infoMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="tonal" block @click="infoDialog = false">โอเค</v-btn>
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
import Reservation from '@/components/Reservation.vue'
import FamilyList from './components/FamilyList.vue'
import AddFamily from './components/AddFamily.vue';
import Dashboard from './components/Dashboard.vue'
import Course from './components/Courses.vue'
import Classes from './components/Classes.vue'
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
        student: null,
        adminflag: false
      }
    },
  name: 'App',
  components: {
    Login,
    Register,
    Reservation,
    Home,
    FamilyList,
    AddFamily,
    Dashboard,
    Course,
    Classes,
  },
  methods: {
    AffterLogin () {
      this.user_details = JSON.parse(localStorage.getItem('userdata'))
      this.parent = this.user_details.fullname
      this.student = null;
        if (this.user_details.usertype == 1) {
          this.adminflag = true
          this.state = 'dashboard'
        } else {
          this.adminflag = false
          this.state = 'home'
        }
        this.isLoggedIn = tokenService.isLoggedIn();
    },
    toggleRail (page) {
      this.$router.push('/'+page)
    },
    collectData (student) {
      this.student = student
    },
    onClickChangeState (state) {
      this.drawer= false
      this.black = false
      this.state = state
    },
    onClickBack (recentState) {
      this.black = false
      this.state = recentState
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
    onRegisterSuccess(msg) {
      this.infoMsg = msg
      this.infoDialog = true
      this.state = 'login'
    },
    logout () {
      localStorage.removeItem('userdata');
      tokenService.removeToken();
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
  created() {
    this.user_details = JSON.parse(localStorage.getItem('userdata'))
    console.log("user_details", this.user_details);
    if (this.user_details) {
      this.parent = this.user_details.fullname
      this.student = null;
      if (this.user_details.usertype == 1) {
          this.adminflag = true
          this.state = 'dashboard'
        } else {
          this.adminflag = false
          this.state = 'home'
        }
    }
    this.isLoggedIn = tokenService.isLoggedIn();
  },
  mounted() {
    this.isLoggedIn = tokenService.isLoggedIn();
  },
  computed: {
    iconUrl () {
      return require('./assets/avatar/1.png')
      // The path could be '../assets/img.png', etc., which depends on where your vue file is
    }
  }
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>

</style>