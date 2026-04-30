<template>
  <v-app>
    <LoadingDialog :isLoading="isLoading" />
    
    <!-- App Bar - ต้องอยู่นอก v-card เพื่อให้ fixed ได้ -->
    <v-app-bar :elevation="20" app v-if="isLoggedIn" style="position: fixed !important;">
      <v-btn v-if="!black" @click.stop="drawer = !drawer" variant="plain"><span class="mdi mdi-menu"
          style="font-size: large;"></span></v-btn>
      <v-btn v-if="black" @click="onClickBack(recentState)" variant="plain"><span class="mdi mdi-arrow-left"
          style="font-size: large;"></span></v-btn>
      <template v-slot:append v-if="isLoggedIn">
        <v-dialog 
          v-model="ConfirmLogoutDialog" 
          persistent 
          width="auto"
          :z-index="2400"
          scrim="rgba(0,0,0,0.5)"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-logout" @click="onClickLogout()"></v-btn>
          </template>
          <v-card>
            <v-card-text>{{ $t('auth.logoutConfirm') }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green-darken-1" variant="text" @click="logout()">
                {{ $t('common.yes') }}
              </v-btn>
              <v-btn color="green-darken-1" variant="text" @click="ConfirmLogoutDialog = false">
                {{ $t('common.no') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer 
      v-model="drawer" 
      temporary
      location="left"
      width="280"
      scrim="rgba(0,0,0,0.5)"
      @update:model-value="(val) => console.log('Drawer model-value:', val)"
    >
    <v-list-item :prepend-avatar="iconUrl" :title="parent"></v-list-item>
    <v-divider></v-divider>
    <v-list density="compact" nav v-model:selected="selectedMenu" @click="handleListClick">
      <v-label v-if="managerflag || customerflag">{{ $t('nav.mainMenu') }}</v-label>
      <v-list-item v-if="managerflag || customerflag" prepend-icon="mdi-home-account" :title="$t('nav.home')" value="home"
        @click.stop.prevent="onClickChangeState('home')">
      </v-list-item>
      <v-list-item v-if="managerflag || customerflag" prepend-icon="mdi-account-multiple" :title="$t('nav.family')"
        value="familylist" @click.stop.prevent="onClickChangeState('familylist')">
      </v-list-item>
      <v-label v-if="managerflag || customerflag || coachflag">{{ $t('nav.checkingMenu') }}</v-label>
      <v-list-item v-if="managerflag || customerflag || coachflag" prepend-icon="mdi-table-eye" :title="$t('nav.viewClasses')"
        value="viewclasses" @click.stop.prevent="onClickChangeState('viewclasses')">
      </v-list-item>
      <v-label v-if="managerflag || adminflag">{{ $t('nav.adminMenu') }}</v-label>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-view-dashboard" :title="$t('nav.dashboard')"
        value="dashboard" @click.stop.prevent="onClickChangeState('dashboard')">
      </v-list-item>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-gymnastics" :title="$t('nav.gymnasts')"
        value="gymnastmanager" @click.stop.prevent="onClickChangeState('gymnastmanager')">
      </v-list-item>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-calendar-edit" :title="$t('nav.bookingManagement')"
        value="bookingmanager" @click.stop.prevent="onClickChangeState('bookingmanager')">
      </v-list-item>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-book-account" :title="$t('nav.customerCourse')"
        value="customercourse" @click.stop.prevent="onClickChangeState('customercourse')">
      </v-list-item>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-clipboard-text-clock" :title="$t('nav.courseHistory')"
        value="customercoursefinished" @click.stop.prevent="onClickChangeState('customercoursefinished')">
      </v-list-item>

      <v-label v-if="managerflag || adminflag">{{ $t('nav.managementMenu') }}</v-label>
      <v-list-item v-if="managerflag" prepend-icon="mdi-star-shooting-outline" :title="$t('nav.courses')" value="course"
        @click.stop.prevent="onClickChangeState('course')">
      </v-list-item>
      <v-list-item v-if="managerflag" prepend-icon="mdi-view-dashboard-variant-outline" :title="$t('nav.classes')"
        value="classes" @click.stop.prevent="onClickChangeState('classes')">
      </v-list-item>
      <v-list-item v-if="managerflag || adminflag" prepend-icon="mdi-calendar-remove" :title="$t('nav.holidays')"
        value="holidaymanager" @click.stop.prevent="onClickChangeState('holidaymanager')">
      </v-list-item>
      <br>
      <hr>
      <!-- UI Theme Picker — admin only -->
      <v-list-item
        v-if="managerflag || adminflag"
        prepend-icon="mdi-palette"
        :title="$t('nav.theme') + ': ' + currentThemeLabel"
        @click.stop.prevent="openThemePicker"
      ></v-list-item>
      <!-- Language Toggle -->
      <v-list-item
        prepend-icon="mdi-translate"
        :title="$t('nav.language')"
        @click.stop.prevent="toggleLocale"
      ></v-list-item>
      <v-list-item v-if="isLoggedIn" prepend-icon="mdi-logout" :title="$t('nav.logout')" @click="onClickLogout()">
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-card style="width: 100%; max-width: 100%; overflow-x: hidden;">
    <v-layout style="width: 100%; max-width: 100%; overflow-x: hidden;">
      <!-- Floating Christmas Music Control -->
      <v-div class="theme-toggle-global" v-if="isChristmasOn">
        <v-btn
          size="small"
          variant="tonal"
          color="red-darken-2"
          @click="toggleChristmasMusic"
          :icon="currentThemeMusicPlaying ? 'mdi-volume-high' : 'mdi-volume-off'"
          class="christmas-music-btn"
          :title="currentThemeMusicPlaying ? 'หยุดเพลง' : 'เล่นเพลง'"
        ></v-btn>
      </v-div>
      <v-main class="root-container" :style="isLoggedIn ? 'padding-top: 64px; width: 100%; max-width: 100%; overflow-x: hidden;' : 'width: 100%; max-width: 100%; overflow-x: hidden;'">
        <Transition name="fade" mode="out-in">
        <Login v-if="state == 'login'" @onAffterLogin="AffterLogin($event)" :user_details="user_details"
          @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
          @onResigterHandler="onClickChangeState($event)" @onLoading="onLoading($event)"></Login>

        <ForgotPassword v-else-if="state == 'forgotpassword'" @onErrorHandler="onError($event)" 
          @onSuccessHandler="onSuccess($event)" @onForgotHandler="onClickChangeState($event)"
          @onLoading="onLoading($event)"></ForgotPassword>

        <Register v-else-if="state == 'register'" @onBacktoLogin="backToLogin" @onErrorHandler="onError($event)"
          @onSuccessHandler="onSuccess($event)" @onCancelHandler="onClickChangeState($event)"
          @onLoading="onLoading($event)"></Register>
        </Transition>
        <Transition name="fade" mode="out-in">
        <Home v-if="state == 'home'" @collectData="collectData($event)" @initBack="initBlackButton($event)"
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
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)" @onLoading="onLoading($event)"></Dashboard>

        <BookingManagement v-else-if="state == 'bookingmanager'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></BookingManagement>

        <GymnastManagement v-else-if="state == 'gymnastmanager'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></GymnastManagement>

        <CustomerCourse v-else-if="state == 'customercourse'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
          @onLoading="onLoading($event)"></CustomerCourse>

        <CustomerCourseFinished v-else-if="state == 'customercoursefinished'" @onErrorHandler="onError($event)"></CustomerCourseFinished>

        <Course v-else-if="state == 'course'" @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
          @onLoading="onLoading($event)"></Course>

        <Classes v-else-if="state == 'classes'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)"></Classes>

        <HolidayManagment v-else-if="state == 'holidaymanager'" @onErrorHandler="onError($event)"
          @onInfoHandler="onShowInfoDialog($event)" @onLoading="onLoading($event)"></HolidayManagment>
        </Transition>
      </v-main>
    </v-layout>

    <HalloweenOverlay
      v-if="isHalloweenOn"
      ref="halo"
      :behind="true"
      :minDecor="8"
      :maxDecor="14"
      :skullRatio="0.35"
    />

    <ChristmasOverlay
      v-if="isChristmasOn"
      ref="xmas"
      :behind="true"
      :minDecor="6"
      :maxDecor="10"
      @audioStateChanged="onChristmasMusicStateChanged"
    />
  </v-card>

  <!-- Theme Picker Dialog — admin only -->
  <v-dialog
    v-model="themePickerDialog"
    max-width="400"
    :z-index="2400"
    scrim="rgba(0,0,0,0.5)"
  >
    <v-card class="card-opacity theme-picker-card">
      <div class="app-dialog-header" style="background: linear-gradient(to right, #eef0f5, #e5e9f0); color: #334155;">
        <v-icon size="20" color="#6366f1">mdi-palette</v-icon>
        <span>{{ $t('dialog.selectTheme') }}</span>
      </div>
      <v-card-text class="pa-4">
        <div class="theme-grid">
          <div
            v-for="theme in availableThemes"
            :key="theme.id"
            class="theme-tile"
            :class="{ 'theme-tile--active': uiTheme === theme.id }"
            @click="setUITheme(theme.id)"
          >
            <div class="theme-tile-preview" :style="{ background: theme.gradient }">
              <v-icon size="30" :color="theme.previewIconColor" class="theme-tile-icon">{{ theme.icon }}</v-icon>
            </div>
            <div class="theme-tile-label">
              <span>{{ theme.name }}</span>
              <v-icon v-if="uiTheme === theme.id" size="16" color="success">mdi-check-circle</v-icon>
            </div>
          </div>
        </div>
        <p class="theme-note mt-3">{{ $t('dialog.themeNote') }}</p>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog
    width="500"
    v-model="errorDialog"
    :z-index="2400"
    scrim="rgba(0,0,0,0.5)"
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <div class="app-dialog-header app-dialog-header--error">
          <v-icon size="22" color="#dc2626">mdi-alert-circle</v-icon>
          <span>{{ $t('dialog.error') }}</span>
        </div>
        <v-card-text class="app-dialog-body">
          {{ errorMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="#dc2626" variant="tonal" block @click="errorDialog = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <v-dialog
    width="500"
    v-model="successDialog"
    :z-index="2400"
    scrim="rgba(0,0,0,0.5)"
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <div class="app-dialog-header app-dialog-header--success">
          <v-icon size="22" color="#16a34a">mdi-check-circle</v-icon>
          <span>{{ $t('dialog.success') }}</span>
        </div>
        <v-card-text class="app-dialog-body">
          {{ infoMsg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="#16a34a" variant="tonal" block @click="successDialog = false">{{ $t('common.ok') }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  </v-app>
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
import CustomerCourseFinished from './components/admin/CustomerCourseFinished.vue'
import Course from './components/admin/Courses.vue'
import Classes from './components/admin/Classes.vue'
import HolidayManagment from './components/admin/HolidayManagment.vue'
import CryptoJS from 'crypto-js';
import { ref, computed, onMounted, inject } from 'vue';
import { mapGetters } from 'vuex';
import LoadingDialog from './components/LoadingDialog.vue';
import HalloweenOverlay from '@/components/theme/HalloweenOverlay.vue';
import ChristmasOverlay from '@/components/theme/ChristmasOverlay.vue';
export default {
  data() {
    return {
      drawer: false,
      rail: false,
      parent: 'Guest',
      state: 'login',
      black: false,
      blackstate: 'home',
      homestate: 'family',
      errorDialog: false,
      errorMsg: '',
      successDialog: false,
      inforMsg: '',
      userdata: {},
      student: null,
      managerflag: false,
      adminflag: false,
      coachflag: false,
      customerflag: false,
      interval: null,
      ConfirmLogoutDialog: false,
      loadingDialog: false,
      isLoading: false,
      isHalloweenOn: false,
      isChristmasOn: false,
      currentTheme: 'none',
      christmasMusicPlaying: false,
      uiTheme: 'neumorphic',
      themePickerDialog: false,
      availableThemes: [
        {
          id: 'neumorphic',
          name: 'Neumorphic',
          icon: 'mdi-diamond-stone',
          previewIconColor: '#6366f1',
          gradient: 'linear-gradient(145deg, #ffffff 0%, #e8ebf1 100%)',
        },
        {
          id: 'playful',
          name: 'Playful',
          icon: 'mdi-creation',
          previewIconColor: '#f43f5e',
          gradient: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 60%, #fff8f0 100%)',
        },
        {
          id: 'halloween',
          name: 'Halloween',
          icon: 'mdi-ghost',
          previewIconColor: '#ff8c00',
          gradient: 'linear-gradient(145deg, #0d0114 0%, #2d0a50 60%, #3d1800 100%)',
        },
        {
          id: 'christmas',
          name: 'Christmas',
          icon: 'mdi-pine-tree',
          previewIconColor: '#4ade80',
          gradient: 'linear-gradient(145deg, #0a1f0a 0%, #1a3a1a 50%, #4a0d0d 100%)',
        },
      ],
    }
  },
  watch: {
    drawer(newVal) {
      console.log('Drawer state changed to:', newVal);
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
    CustomerCourseFinished,
    Course,
    Classes,
    HolidayManagment,
    LoadingDialog,
    HalloweenOverlay,
    ChristmasOverlay,
  },
  methods: {
    async AffterLogin() {
      await this.loadAppTheme();
      this.userdata = JSON.parse(localStorage.getItem('userdata'))
      //console.log("userdata", this.userdata);
      if(this.userdata) {
        this.parent = this.userdata.firstname
        this.student = null;
        if (this.userdata.usertype == 0) { // head
          this.managerflag = true
          this.state = 'dashboard'
        } else if (this.userdata.usertype == 1) { // admin
          this.adminflag = true
          this.state = 'dashboard'
        } else if (this.userdata.usertype == 2) { // coach
          this.coachflag = true
          this.state = 'viewclasses'
        } else { // customer
          this.customerflag = true
          this.state = 'home'
        }
      }else {
        this.state = 'login'
      }
    },
    toggleRail(page) {
      this.$router.push('/' + page)
    },
    collectData(student) {
      this.student = student
    },
    onClickChangeState(state) {
      console.log('onClickChangeState called with state:', state);
      if (state == 'login') {
        this.$store.dispatch('logout');
        localStorage.removeItem('userdata');
        this.onLoading(false)
      }
      this.drawer = false
      this.black = false
      this.state = state
      console.log('State changed to:', this.state, 'Drawer closed:', !this.drawer);
    },
    onClickBack(state) {
      this.black = false
      this.state = state
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
      this.successDialog = true
    },
    onSuccess(msg) {
      this.infoMsg = msg
      this.successDialog = true
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
            //console.log(response)
            this.$store.dispatch('logout');
            localStorage.removeItem('userdata');
            localStorage.removeItem('token');
            this.state = 'login'
            this.drawer = false
          })
      } catch (error) {
        // Handle errors
        //console.error('Error during logout:', error);
        localStorage.removeItem('userdata');
        localStorage.removeItem('token');
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
    handleListClick(event) {
      console.log('List clicked:', event);
    },
    toggleTheme() {
      const now = new Date();
      const monthNumber = now.toLocaleString('en-US', { month: 'numeric' });
      if(monthNumber == 10) {
        this.setHalloween(!this.isHalloweenOn);
      } else if(monthNumber == 12) {
        this.setChristmas(!this.isChristmasOn);
      }
    },
    setHalloween(v) {
      this.isHalloweenOn = v;
      this.isChristmasOn = false;
      this.currentTheme = v ? 'halloween' : 'none';
      localStorage.setItem('currentTheme', this.currentTheme);
      
      document.documentElement.classList.toggle('theme-halloween', v);
      document.body.classList.toggle('theme-halloween', v);
      document.documentElement.classList.remove('theme-christmas');
      document.body.classList.remove('theme-christmas');
      
      if (this.$refs.halo && this.$refs.halo.setVisible) {
        this.$refs.halo.setVisible(v);
      }
      if (this.$refs.xmas && this.$refs.xmas.setVisible) {
        this.$refs.xmas.setVisible(false);
      }
    },
    setChristmas(v) {
      this.isChristmasOn = v;
      this.isHalloweenOn = false;
      this.currentTheme = v ? 'christmas' : 'none';
      localStorage.setItem('currentTheme', this.currentTheme);
      
      document.documentElement.classList.toggle('theme-christmas', v);
      document.body.classList.toggle('theme-christmas', v);
      document.documentElement.classList.remove('theme-halloween');
      document.body.classList.remove('theme-halloween');
      
      if (this.$refs.xmas && this.$refs.xmas.setVisible) {
        this.$refs.xmas.setVisible(v);
      }
      if (this.$refs.halo && this.$refs.halo.setVisible) {
        this.$refs.halo.setVisible(false);
      }
      
      // อัปเดตสถานะเพลงตามการเปิด/ปิดธีม
      if (!v) {
        this.christmasMusicPlaying = false;
      } else {
        // เมื่อเปิดธีม รอ audioStateChanged event จาก overlay
        // หรือตรวจสอบ state หลังจาก setVisible เรียก playAudio()
        setTimeout(() => {
          if (this.$refs.xmas) {
            this.christmasMusicPlaying = this.$refs.xmas.audioPlaying;
            console.log('🎵 Initial music state:', this.christmasMusicPlaying);
          }
        }, 500); // รอครึ่งวินาทีให้ playAudio() ทำงาน
      }
    },
    
    toggleChristmasMusic() {
      console.log('🔘 Music button clicked in App.vue');
      if (this.$refs.xmas) {
        this.$refs.xmas.toggleAudio();
      }
    },
    
    onChristmasMusicStateChanged(isPlaying) {
      console.log('🎵 Music state changed:', isPlaying);
      this.christmasMusicPlaying = isPlaying;
    },
    toggleLocale() {
      const next = this.$i18n.locale === 'th' ? 'en' : 'th';
      this.$setLocale(next);
      this.$vuetify.locale.current = next;
    },
    openThemePicker() {
      this.drawer = false;
      this.$nextTick(() => { this.themePickerDialog = true; });
    },
    setUITheme(theme) {
      this.uiTheme = theme;
      this.applyUITheme(theme);
      this.saveAppTheme(theme);
      this.themePickerDialog = false;
    },
    applyUITheme(theme) {
      localStorage.setItem('uiTheme', theme);
      document.documentElement.classList.remove('theme-playful', 'theme-halloween', 'theme-christmas');
      document.body.classList.remove('theme-playful', 'theme-halloween', 'theme-christmas');
      if (theme !== 'neumorphic') {
        document.documentElement.classList.add(`theme-${theme}`);
        document.body.classList.add(`theme-${theme}`);
      }
      this.isHalloweenOn = theme === 'halloween';
      this.isChristmasOn = theme === 'christmas';
    },
    async saveAppTheme(theme) {
      try {
        const token = this.$store.getters.getToken;
        await axios.post(this.baseURL + '/saveAppSettings', { uiTheme: theme }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // backend ยังไม่รองรับ — ใช้ localStorage ไปก่อน
      }
    },
    async loadAppTheme() {
      try {
        const token = this.$store.getters.getToken;
        const res = await axios.post(this.baseURL + '/getAppSettings', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.uiTheme) {
          this.uiTheme = res.data.uiTheme;
          this.applyUITheme(res.data.uiTheme);
          return;
        }
      } catch (e) {
        // backend ยังไม่รองรับ — fallback ใช้ localStorage
      }
      const saved = localStorage.getItem('uiTheme') || 'neumorphic';
      this.uiTheme = saved;
      this.applyUITheme(saved);
    },
  },
  mounted() {
    const savedTheme = localStorage.getItem('uiTheme') || 'neumorphic';
    this.uiTheme = savedTheme;
    this.applyUITheme(savedTheme);
  },
  created() {
    //this.onLoading(true)
    // this.user_details = JSON.parse(localStorage.getItem('userdata'))
    // //console.log("user_details", this.user_details);
    // //console.log("env ", env.SERVER_URL)
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
    selectedMenu() {
      return [this.state];
    },
    iconUrl() {
      return require('./assets/avatar/1.png')
      // The path could be '../assets/img.png', etc., which depends on where your vue file is
    },
    // เช็คว่าธีมปัจจุบันมีเพลงหรือไม่
    currentThemeHasMusic() {
      // Christmas theme มีเพลงเสมอ
      if (this.isChristmasOn) {
        return true;
      }
      // Halloween theme ไม่มีเพลง
      if (this.isHalloweenOn) {
        return false;
      }
      return false;
    },
    // สถานะเพลงของธีมปัจจุบัน
    currentThemeMusicPlaying() {
      if (this.isChristmasOn) {
        return this.christmasMusicPlaying;
      }
      return false;
    },
    currentThemeLabel() {
      const map = { neumorphic: 'Neumorphic', playful: 'Playful', halloween: 'Halloween', christmas: 'Christmas' };
      return map[this.uiTheme] || 'Neumorphic';
    },
  }
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.theme-toggle-global{
  position: fixed;
  left: max(12px, env(safe-area-inset-left));
  bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 50; /* ลดลงเพื่อไม่บล็อก navigation drawer (1000) */
  pointer-events: auto; /* ให้คลิกได้ */
  display: flex;
  gap: 8px; /* ระยะห่างระหว่างปุ่ม */
}

/* กำหนดขนาดปุ่มให้เท่ากัน - ใช้ icon-only button */
.theme-toggle-btn,
.theme-music-btn {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  flex-shrink: 0; /* ห้ามหด */
}

/* ซ่อนปุ่มเพลงธีมด้วย visibility เพื่อไม่ให้ layout shift */
.theme-music-btn.btn-hidden {
  visibility: hidden;
  pointer-events: none;
}

/* Theme Picker Grid */
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.theme-tile {
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 2.5px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.theme-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.theme-tile--active {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.theme-tile-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-tile-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: rgba(255, 255, 255, 0.92);
}

.theme-note {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 0;
}

/* Force navigation drawer to be overlay style */
:deep(.v-navigation-drawer--temporary) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  height: 100vh !important;
  z-index: 1000 !important; /* ลดจาก 2000 เป็น 1000 เพื่อให้ dialog (2400+) อยู่เหนือ */
}

:deep(.v-navigation-drawer--temporary.v-navigation-drawer--left) {
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
}

:deep(.v-navigation-drawer--temporary.v-navigation-drawer--left.v-navigation-drawer--active) {
  transform: translateX(0);
}

/* Fix width shift - บังคับ v-main ให้ไม่ใช้ flex-grow และใช้ width คงที่ */
:deep(.v-main) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
  flex-grow: 0 !important; /* ปิด flex-grow */
  flex-shrink: 0 !important;
  flex-basis: 100% !important;
}

:deep(.root-container) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:deep(.v-application) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:deep(.v-card) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:deep(.v-layout) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

/* Z-index hierarchy */

/* Navigation Drawer - ระดับ 1000 */
:deep(.v-navigation-drawer) {
  z-index: 1000 !important;
}

/* Drawer scrim/backdrop - ระบุแบบเจาะจงเฉพาะ scrim ของ drawer */
:deep(.v-navigation-drawer__scrim) {
  z-index: 999 !important; /* ต่ำกว่า drawer (1000) แต่สูงกว่า content */
}

/* อย่าแก้ v-overlay ทั้งหมด เพราะจะรบกวน dialog */

/* Dialog ใช้ :z-index="2400" prop เพื่อให้อยู่เหนือ drawer */
</style>