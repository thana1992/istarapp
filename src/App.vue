<template>
  <LoadingDialog :isLoading="isLoading" />
  <v-card>
    <v-layout>
      <v-navigation-drawer v-model="drawer" temporary>
        <v-list-item :prepend-avatar="iconUrl" :title="parent"></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-label v-if="managerflag || customerflag">Main menu</v-label>
          <v-list-item v-if="managerflag || customerflag" prepend-icon="mdi-home-account" title="HOME" value="home"
            @click="onClickChangeState('home')">
          </v-list-item>
          <v-list-item v-if="managerflag || customerflag" prepend-icon="mdi-account-multiple" title="FAMILY"
            value="familylist" @click="onClickChangeState('familylist')">
          </v-list-item>
          <v-label v-if="managerflag || customerflag || coach">Checking menu</v-label>
          <v-list-item v-if="managerflag || customerflag || coachflag" prepend-icon="mdi-table-eye" title="VIEW CLASSES"
            value="viewclasses" @click="onClickChangeState('viewclasses')">
          </v-list-item>
          <v-label v-if="managerflag || adminflag">Admin menu</v-label>
          <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-view-dashboard" title="หน้าแรก"
            value="dashboard" @click="onClickChangeState('dashboard')">
          </v-list-item>
          <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-calendar-edit" title="การจองคลาสเรียน"
            value="bookingmanager" @click="onClickChangeState('bookingmanager')">
          </v-list-item>
          <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-book-account" title="คอร์สของลูกค้า"
            value="customercourse" @click="onClickChangeState('customercourse')">
          </v-list-item>
          <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-gymnastics" title="รายชื่อเด็ก"
            value="studentmanager" @click="onClickChangeState('gymnastmanager')">
          </v-list-item>
          <v-label v-if="managerflag">Management menu</v-label>
          <v-list-item v-if="managerflag" prepend-icon="mdi-star-shooting-outline" title="จัดการคอร์ส" value="course"
            @click="onClickChangeState('course')">
          </v-list-item>
          <v-list-item v-if="managerflag" prepend-icon="mdi-view-dashboard-variant-outline" title="จัดการคลาสเรียน"
            value="classes" @click="onClickChangeState('classes')">
          </v-list-item>
          <br>
          <hr>
          <v-list-item v-if="isLoggedIn" prepend-icon="mdi-logout" title="LOGOUT" @click="onClickLogout()">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar :elevation="20" v-if="isLoggedIn">
        <v-btn v-if="!black" @click.stop="drawer = !drawer" variant="tonal"><span class="mdi mdi-menu"
            style="font-size: large;"></span></v-btn>
        <v-btn v-if="black" @click="onClickBack(recentState)" variant="tonal"><span class="mdi mdi-arrow-left"
            style="font-size: large;"></span></v-btn>
        <template v-slot:append v-if="isLoggedIn">
          <v-dialog v-model="ConfirmLogoutDialog" persistent width="auto">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-logout" @click="onClickLogout()"></v-btn>
            </template>
            <v-card>
              <v-card-text>Do you want to logout ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="logout()">
                  Yes
                </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="ConfirmLogoutDialog = false">
                  No
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-app-bar>
      <v-main class="root-container">
        <Login v-if="state == 'login'" @onAffterLogin="AffterLogin($event)" :user_details="user_details"
          @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
          @onResigterHandler="onClickChangeState($event)" @onLoading="onLoading($event)"></Login>

        <ForgotPassword v-else-if="state == 'forgotpassword'" @onErrorHandler="onError($event)" 
          @onInfoHandler="onShowInfoDialog($event)" @onForgotHandler="onClickChangeState($event)"
          @onLoading="onLoading($event)"></ForgotPassword>

        <Register v-else-if="state == 'register'" @onBacktoLogin="backToLogin" @onErrorHandler="onError($event)"
          @onSuccessHandler="onRegisterSuccess($event)" @onCancelHandler="onClickChangeState($event)"
          @onLoading="onLoading($event)"></Register>

        <Home v-else-if="state == 'home'" @collectData="collectData($event)" @initBack="initBlackButton($event)"
          @onInvalidToken="invalidToken($event)" @onClickChangeState="onClickChangeState($event)"
          @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)" :student="student"
          @onLoading="onLoading($event)"></Home>

        <ViewClasses v-else-if="state == 'viewclasses'" @collectData="collectData($event)"
          @initBack="initBlackButton($event)" @onInvalidToken="invalidToken($event)"
          @onClickChangeState="onClickChangeState($event)" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)">
        </ViewClasses>

        <Reservation v-else-if="state == 'reservation'" @initBack="initBlackButton($event)"
          @onInvalidToken="invalidToken($event)" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onSuccessHandler="onClickBack($event)" :student="student"
          @onLoading="onLoading($event)"></Reservation>

        <FamilyList v-else-if="state == 'familylist'" @initBack="initBlackButton($event)"
          @onClickChangeState="onClickChangeState($event)" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)"></FamilyList>

        <AddFamily v-else-if="state == 'addfamilymember'" @initBack="initBlackButton($event)"
          @onClickChangeState="onClickChangeState($event)" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)"></AddFamily>

        <Dashboard v-else-if="state == 'dashboard'" @onErrorHandler="onError($event)"
          @onClickChangeState="onClickChangeState($event)" @onLoading="onLoading($event)"></Dashboard>

        <BookingManagement v-else-if="state == 'bookingmanager'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></BookingManagement>

        <GymnastManagement v-else-if="state == 'gymnastmanager'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></GymnastManagement>

        <CustomerCourse v-else-if="state == 'customercourse'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></CustomerCourse>

        <Course v-else-if="state == 'course'" @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
          @onLoading="onLoading($event)"></Course>

        <Classes v-else-if="state == 'classes'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)"></Classes>

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
import axios from 'axios'
import Login from './components/Login.vue'
import ForgotPassword from './components/ForgotPassword.vue'
import Register from './components/Register.vue'
import Home from './components/Home.vue'
import ViewClasses from '@/components/ViewClasses.vue'
import Reservation from '@/components/Reservation.vue'
import FamilyList from './components/FamilyList.vue'
import AddFamily from './components/AddFamily.vue';
import Dashboard from './components/admin/Dashboard.vue'
import GymnastManagement from '@/components/admin/GymnastManagement.vue';
import BookingManagement from '@/components/admin/BookingManagement.vue';
import CustomerCourse from '@/components/admin/CustomerCourse.vue';
import Course from './components/admin/Courses.vue'
import Classes from './components/admin/Classes.vue'
import CryptoJS from 'crypto-js';
import { ref, computed, onMounted, inject } from 'vue';
import { mapGetters } from 'vuex';
import LoadingDialog from './components/LoadingDialog.vue';

export default {
  data() {
    return {
      drawer: false,
      rail: true,
      parent: 'Guest',
      state: 'login',
      black: false,
      blackstate: 'home',
      homestate: 'family',
      errorDialog: false,
      errorMsg: '',
      infoDialog: false,
      inforMsg: '',
      user_details: {},
      student: null,
      managerflag: false,
      adminflag: false,
      coachflag: false,
      customerflag: false,
      interval: null,
      ConfirmLogoutDialog: false,
      loadingDialog: false,
      isLoading: false,
    }
  },
  name: 'App',
  components: {
    Login,
    ForgotPassword,
    Register,
    Reservation,
    Home,
    ViewClasses,
    FamilyList,
    AddFamily,
    Dashboard,
    GymnastManagement,
    BookingManagement,
    CustomerCourse,
    Course,
    Classes,
    LoadingDialog
  },
  methods: {

    AffterLogin() {
      this.user_details = JSON.parse(localStorage.getItem('userdata'))
      console.log("user_details", this.user_details);
      this.parent = this.user_details.firstname
      this.student = null;
      if (this.user_details.usertype == 0) { // head
        this.managerflag = true
        this.state = 'dashboard'
      } else if (this.user_details.usertype == 1) { // admin
        this.adminflag = true
        this.state = 'dashboard'
      } else if (this.user_details.usertype == 2) { // coach
        this.coachflag = true
        this.state = 'viewclasses'
      } else { // customer
        this.customerflag = true
        this.state = 'home'
      }
    },
    toggleRail(page) {
      this.$router.push('/' + page)
    },
    collectData(student) {
      this.student = student
    },
    onClickChangeState(state) {
      if (state == 'login') {
        this.$store.dispatch('logout');
        localStorage.removeItem('userdata');
        this.onLoading(false)
      }
      this.drawer = false
      this.black = false
      this.state = state
    },
    onClickBack(recentState) {
      this.black = false
      this.state = recentState
    },
    initBlackButton(state) {
      this.black = true
      this.recentState = state
    },
    backToLogin() {
      this.state = 'login'
    },
    invalidToken(state) {
      this.$router.push('/')
    },
    onError(msg) {
      this.errorMsg = msg
      this.errorDialog = true
      this.$emit('onLoading', false)
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
    onClickLogout() {
      this.ConfirmLogoutDialog = true
    },
    async logout() {
      this.ConfirmLogoutDialog = false;
      try {
        const token = this.$store.getters.getToken;

        await axios.post(this.baseURL + '/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => {
            console.log(response)
            this.$store.dispatch('logout');
            localStorage.removeItem('userdata');
            this.state = 'login'
            this.drawer = false
          })
      } catch (error) {
        // Handle errors
        console.error('Error during logout:', error);
        localStorage.removeItem('userdata');
        this.state = 'login'
        this.drawer = false
      }
      this.adminflag = false
      this.managerflag = false
      this.coachflag = false
      this.customerflag = false
    },
    onLoading(loading) {
      //this.loadingDialog = loading
      this.isLoading = loading;
    },
  },
  created() {
    //this.onLoading(true)
    // this.user_details = JSON.parse(localStorage.getItem('userdata'))
    // console.log("user_details", this.user_details);
    // console.log("env ", env.SERVER_URL)
    // if (this.user_details) {
    //   this.parent = this.user_details.firstname
    //   this.student = null;
    //   if (this.user_details.usertype == 1) {
    //       this.adminflag = true
    //       this.state = 'dashboard'
    //     } else {
    //       this.adminflag = false
    //       this.state = 'home'
    //     }
    // }
  },

  computed: {
    ...mapGetters({
      isLoggedIn: 'isLoggedIn',
    }),
    iconUrl() {
      return require('./assets/avatar/1.png')
      // The path could be '../assets/img.png', etc., which depends on where your vue file is
    },
  }
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped></style>