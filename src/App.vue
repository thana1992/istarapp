<template>
  <v-app>
    <LoadingDialog :isLoading="isLoading" />

    <!-- ===== AUTH SCREENS (full-screen, no shell) =====
         (the login screen renders its own seasonal decorations inside its hero) -->
    <Transition v-if="isAuthScreen" name="fade" mode="out-in">
      <Login v-if="state == 'login'" :ui-theme="uiTheme" @onAffterLogin="AffterLogin($event)"
        @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
        @onResigterHandler="onClickChangeState($event)" @onLoading="onLoading($event)"></Login>

      <ForgotPassword v-else-if="state == 'forgotpassword'" @onErrorHandler="onError($event)"
        @onSuccessHandler="onSuccess($event)" @onForgotHandler="onClickChangeState($event)"
        @onLoading="onLoading($event)"></ForgotPassword>

      <Register v-else-if="state == 'register'" @onBacktoLogin="backToLogin" @onErrorHandler="onError($event)"
        @onSuccessHandler="onSuccess($event)" @onCancelHandler="onClickChangeState($event)"
        @onLoading="onLoading($event)"></Register>
    </Transition>

    <!-- ===== iStar APP SHELL (logged-in) ===== -->
    <div v-else class="shell" :class="{ customer: customerflag, collapsed: collapsed }">
      <div class="scrim" :class="{ show: drawer }" @click="drawer = false"></div>

      <!-- customer mobile bottom bar -->
      <nav class="bottombar" v-if="customerflag">
        <div v-for="it in bottomTabs" :key="it.value" class="tab" :class="{ on: state === it.value }"
          @click="onClickChangeState(it.value)">
          <span class="mdi" :class="it.icon"></span><span>{{ it.label }}</span>
        </div>
      </nav>

      <!-- sidebar -->
      <aside class="side" :class="{ open: drawer }">
        <!-- twinkling stars — sit behind the nav (.side > *:not(.side-spark) raises the rest) -->
        <span v-for="(s, i) in sparks" :key="'s' + i" class="side-spark"
          :style="{ left: s.x + '%', top: s.y + '%', '--o': (s.o * 0.8), fontSize: (s.sz * 0.8) + 'px', animationDelay: s.d + 's', animationDuration: s.dur + 's' }">
          <span class="mdi mdi-star-four-points"></span>
        </span>
        <div class="side-brand">
          <div class="side-logo"><span class="mdi mdi-star-four-points"></span></div>
          <div>
            <div class="side-name">iStar Gymnastics</div>
            <div class="side-role">{{ parent }}</div>
          </div>
        </div>

        <template v-for="(grp, gi) in navGroups" :key="gi">
          <div class="nav-sec">{{ grp.label }}</div>
          <div v-for="it in grp.items" :key="it.value" class="nav-item" :class="{ on: state === it.value }"
            :data-label="it.label" @click="onClickChangeState(it.value)">
            <span class="mdi" :class="it.icon"></span><span class="nav-label">{{ it.label }}</span>
          </div>
        </template>

        <div class="nav-item collapse-toggle" :data-label="collapsed ? 'ขยายเมนู' : 'ย่อเมนู'"
          @click="collapsed = !collapsed">
          <span class="mdi" :class="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"></span>
          <span class="nav-label">{{ collapsed ? 'ขยายเมนู' : 'ย่อเมนู' }}</span>
        </div>
        <div style="flex:1"></div>
        <div class="side-divider"></div>
        <div class="nav-item nav-logout" :data-label="$t('nav.logout')" @click="onClickLogout()">
          <span class="mdi mdi-logout"></span><span class="nav-label">{{ $t('nav.logout') }}</span>
        </div>
      </aside>

      <!-- main column -->
      <div class="main">
        <!-- seasonal backdrops — sit behind the page content (z-index:-1), paint only -->
        <MothersDayOverlay v-if="uiTheme === 'mothersday'" />
        <LoyKrathongOverlay v-if="uiTheme === 'loykrathong'" />
        <NewYearOverlay v-if="uiTheme === 'newyear'" />
        <SongkranOverlay v-if="uiTheme === 'songkran'" />
        <HalloweenOverlay v-if="uiTheme === 'halloween'" />
        <ChristmasOverlay v-if="uiTheme === 'christmas'" />
        <FathersDayOverlay v-if="uiTheme === 'fathersday'" />
        <MuayThaiOverlay v-if="uiTheme === 'muaythai'" />

        <div class="topbar">
          <button class="id-btn id-btn-ghost id-btn-sm burger" @click="drawer = !drawer">
            <span class="mdi mdi-menu"></span>
          </button>
          <button v-if="black" class="id-btn id-btn-ghost id-btn-sm" @click="onClickBack(recentState)">
            <span class="mdi mdi-arrow-left"></span>
          </button>
          <strong style="font-family:var(--font-head);color:var(--c-text-heading)">{{ screenTitle }}</strong>
          <div class="sp"></div>

          <!-- theme picker — system-wide setting, head/admin only -->
          <div class="theme-wrap" v-if="canEditTheme">
            <button class="lang-btn theme-btn" :title="$t('dialog.selectTheme')"
              @click="themeMenu = !themeMenu">
              <span class="mdi mdi-palette"></span>
              <span class="theme-btn-label">{{ activeThemeName }}</span>
            </button>
            <template v-if="themeMenu">
              <div class="theme-scrim" @click="themeMenu = false"></div>
              <div class="popmenu theme-menu">
                <div class="popmenu-head">
                  <span class="popmenu-name">{{ $t('dialog.selectTheme') }}</span>
                </div>
                <button v-for="opt in themeOptions" :key="opt.id" class="popmenu-item theme-opt"
                  :class="{ on: uiTheme === opt.id }" @click="selectTheme(opt.id)">
                  <span class="theme-sw" :style="{ background: opt.swatch }"></span>
                  <span class="theme-opt-tx">
                    <span class="theme-opt-name">{{ opt.name }}</span>
                    <span class="theme-opt-sub">{{ opt.sub }}</span>
                  </span>
                  <span v-if="uiTheme === opt.id" class="mdi mdi-check theme-opt-check"></span>
                </button>
                <div class="theme-note">
                  <span class="mdi mdi-information-outline"></span>
                  <span>{{ $t('dialog.themeNote') }}</span>
                </div>
              </div>
            </template>
          </div>

          <button class="lang-circle" title="TH / EN" @click="toggleLocale">
            {{ $i18n.locale === 'th' ? 'TH' : 'EN' }}
          </button>
          <!-- profile avatar → account menu (edit profile / logout) — the ONLY logout
               path on mobile for parents, where the sidebar + burger are hidden -->
          <div class="theme-wrap">
            <span class="tt-avatar" style="background:var(--c-primary);cursor:pointer;overflow:hidden"
              @click="userMenu = !userMenu">
              <img v-if="userProfileImage" :src="userProfileImage" alt=""
                   style="width:100%;height:100%;object-fit:cover;display:block" />
              <template v-else>{{ (parent || '?').charAt(0) }}</template>
            </span>
            <template v-if="userMenu">
              <div class="theme-scrim" @click="userMenu = false"></div>
              <div class="popmenu theme-menu">
                <div class="popmenu-head"><span class="popmenu-name">{{ parent }}</span></div>
                <button class="popmenu-item" @click="userMenu = false; onClickChangeState('editprofile')">
                  <span class="mdi mdi-account-edit"></span> {{ $t('nav.editProfile') }}
                </button>
                <div class="popmenu-divider"></div>
                <button class="popmenu-item" @click="userMenu = false; onClickLogout()">
                  <span class="mdi mdi-logout"></span> {{ $t('nav.logout') }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="page">
            <!-- no page transition: out-in deadlocks into a permanent blank if a child errors during enter -->
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

            <EditProfile v-else-if="state == 'editprofile'"
              @onErrorHandler="onError($event)" @onSuccessHandler="onShowInfoDialog($event)"
              @onInfoHandler="onShowInfoDialog($event)" @onClickChangeState="onClickChangeState($event)"
              @onProfileImageUpdated="onProfileImageUpdated($event)"
              @onLoading="onLoading($event)"></EditProfile>
        </div>
      </div>
    </div>

    <!-- ===== centralized dialogs ===== -->
    <v-dialog v-model="ConfirmLogoutDialog" persistent width="auto" :z-index="2400" scrim="rgba(0,0,0,0.5)">
      <v-card>
        <v-card-text>{{ $t('auth.logoutConfirm') }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" variant="text" @click="logout()">{{ $t('common.yes') }}</v-btn>
          <v-btn color="green-darken-1" variant="text" @click="ConfirmLogoutDialog = false">{{ $t('common.no') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="errorDialog" :z-index="2400" scrim="rgba(0,0,0,0.5)">
      <template v-slot:default>
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

    <v-dialog width="500" v-model="successDialog" :z-index="2400" scrim="rgba(0,0,0,0.5)">
      <template v-slot:default>
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
import EditProfile from './components/EditProfile.vue'
import MothersDayOverlay from './components/theme/MothersDayOverlay.vue'
import LoyKrathongOverlay from './components/theme/LoyKrathongOverlay.vue'
import NewYearOverlay from './components/theme/NewYearOverlay.vue'
import SongkranOverlay from './components/theme/SongkranOverlay.vue'
import HalloweenOverlay from './components/theme/HalloweenOverlay.vue'
import ChristmasOverlay from './components/theme/ChristmasOverlay.vue'
import FathersDayOverlay from './components/theme/FathersDayOverlay.vue'
import MuayThaiOverlay from './components/theme/MuayThaiOverlay.vue'
import { mapGetters } from 'vuex';
import LoadingDialog from './components/LoadingDialog.vue';
export default {
  data() {
    return {
      drawer: false,
      userProfileImage: null,
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
      bookingAccessRestricted: false,
      interval: null,
      ConfirmLogoutDialog: false,
      loadingDialog: false,
      isLoading: false,
      collapsed: false,
      // seasonal theme — persisted per-browser in localStorage (no backend sync)
      uiTheme: localStorage.getItem('uiTheme') || 'default',
      themeMenu: false,
      userMenu: false,
      // twinkling stars rendered inside the side menu only (background decoration)
      sparks: Array.from({ length: 14 }, (_, i) => ({
        x: [10, 26, 16, 34, 8, 28, 46, 60, 80, 90, 70, 88, 78, 92][i],
        y: [12, 28, 52, 72, 86, 94, 18, 8, 14, 30, 44, 58, 76, 88][i],
        sz: 12 + (i % 4) * 5,
        o: 0.4 + (i % 3) * 0.18,
        d: ((i * 0.33) % 3).toFixed(2),
        dur: 2.4 + (i % 4) * 0.5,
      })),
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
    EditProfile,
    MothersDayOverlay,
    LoyKrathongOverlay,
    NewYearOverlay,
    SongkranOverlay,
    HalloweenOverlay,
    ChristmasOverlay,
    FathersDayOverlay,
    MuayThaiOverlay,
    LoadingDialog,
  },
  methods: {
    async AffterLogin() {
      this.userdata = JSON.parse(localStorage.getItem('userdata'))
      //console.log("userdata", this.userdata);
      if(this.userdata) {
        this.parent = this.userdata.firstname
        this.student = null;
        this.bookingAccessRestricted = !!this.userdata.access_restricted;
        this.fetchUserProfileImage();
        this.fetchGlobalTheme();   // pick up the head-controlled global theme on login
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
    async fetchUserProfileImage() {
      // clear first so a previous user's photo never lingers when switching accounts
      // (a new user with no photo would otherwise keep showing the old avatar)
      this.userProfileImage = null;
      try {
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        if (!userdata || !userdata.username) return;
        const token = this.$store.getters.getToken;
        const res = await axios.post(
          this.baseURL + '/getUserProfile',
          { username: userdata.username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && res.data.success && res.data.user && res.data.user.profile_image_url) {
          this.userProfileImage = res.data.user.profile_image_url;
        }
      } catch (e) {
        // backend ยังไม่รองรับ — ใช้รูป default
      }
    },
    onProfileImageUpdated(url) {
      this.userProfileImage = url;
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
    invalidToken() {
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
          .then(() => {
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
      this.bookingAccessRestricted = false
    },
    onLoading(loading) {
      //this.loadingDialog = loading
      this.isLoading = loading;
    },
    handleListClick(event) {
      console.log('List clicked:', event);
    },
    toggleLocale() {
      const next = this.$i18n.locale === 'th' ? 'en' : 'th';
      this.$setLocale(next);
      this.$vuetify.locale.current = next;
    },
    // Swap the festival palette by toggling a class on <html>. The token
    // overrides in istar-themes.css (html.theme-*) win over the :root base,
    // so 'default' simply means "no festival class" → the iStar pink baseline.
    applyUITheme(theme) {
      const el = document.documentElement;
      // every festival id has a matching html.theme-<id> block in istar-themes.css;
      // 'default' = no class (the :root pink baseline)
      const ids = ['mothersday', 'loykrathong', 'newyear', 'songkran', 'halloween', 'christmas', 'fathersday', 'muaythai'];
      ids.forEach((id) => el.classList.remove('theme-' + id));
      if (theme && ids.includes(theme)) el.classList.add('theme-' + theme);
    },
    selectTheme(theme) {
      // System-wide theme: only head/admin may change it (backend must enforce too).
      if (!this.canEditTheme) return;
      this.uiTheme = theme;
      this.applyUITheme(theme);
      try { localStorage.setItem('uiTheme', theme); } catch (e) { /* storage unavailable */ }
      this.themeMenu = false;
      this.saveGlobalTheme(theme);
    },
    // Persist the global theme for everyone. Falls back silently when the backend
    // endpoint isn't available yet — the change still applies locally + is cached,
    // and will propagate to all users once /saveAppSettings exists.
    async saveGlobalTheme(theme) {
      try {
        const token = this.$store.getters.getToken;
        await axios.post(this.baseURL + '/saveAppSettings', { uiTheme: theme }, {
          headers: { Authorization: 'Bearer ' + token },
        });
      } catch (e) {
        // backend settings endpoint not ready — behaves per-browser until then
      }
    },
    // Read the global theme set by the head and apply it to this user. No-op on
    // failure (keeps the cached/default theme), so the app never breaks if the
    // endpoint is missing.
    async fetchGlobalTheme() {
      try {
        const token = this.$store.getters.getToken;
        const res = await axios.post(this.baseURL + '/getAppSettings', {}, {
          headers: token ? { Authorization: 'Bearer ' + token } : {},
        });
        const data = res && res.data ? (res.data.settings || res.data) : null;
        const theme = data && data.uiTheme;
        if (theme && ['default', 'mothersday', 'loykrathong'].includes(theme)) {
          this.uiTheme = theme;
          this.applyUITheme(theme);
          try { localStorage.setItem('uiTheme', theme); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        // no global setting available — keep the cached / default theme
      }
    },
  },
  mounted() {
    // Keep the playful base class for any not-yet-migrated Vuetify pages; the new
    // design system (istar-design.css) is always active on top of it.
    document.documentElement.classList.add('theme-playful');
    document.body.classList.add('theme-playful');
    // Apply the cached seasonal theme instantly (no flash), then sync the
    // head-controlled global theme from the backend.
    this.applyUITheme(this.uiTheme);
    this.fetchGlobalTheme();
  },
  created() {
  },

  computed: {
    ...mapGetters({
      isLoggedIn: 'isLoggedIn',
    }),
    isAuthScreen() {
      return ['login', 'register', 'forgotpassword'].includes(this.state);
    },
    navGroups() {
      const groups = [];
      if (this.managerflag || this.customerflag) {
        groups.push({
          label: this.$t('nav.mainMenu'),
          items: [
            { value: 'home', icon: 'mdi-home-account', label: this.$t('nav.home') },
            { value: 'familylist', icon: 'mdi-account-multiple', label: this.$t('nav.family') },
          ],
        });
      }
      if (this.managerflag || this.customerflag || this.coachflag) {
        groups.push({
          label: this.$t('nav.checkingMenu'),
          items: [
            { value: 'viewclasses', icon: 'mdi-table-eye', label: this.$t('nav.viewClasses') },
          ],
        });
      }
      if (this.managerflag || this.adminflag) {
        groups.push({
          label: this.$t('nav.adminMenu'),
          items: [
            { value: 'dashboard', icon: 'mdi-view-dashboard', label: this.$t('nav.dashboard') },
            { value: 'gymnastmanager', icon: 'mdi-gymnastics', label: this.$t('nav.gymnasts') },
            { value: 'bookingmanager', icon: 'mdi-calendar-edit', label: this.$t('nav.bookingManagement') },
            { value: 'customercourse', icon: 'mdi-book-account', label: this.$t('nav.customerCourse') },
            { value: 'customercoursefinished', icon: 'mdi-clipboard-text-clock', label: this.$t('nav.courseHistory') },
          ],
        });
        const mgmt = [];
        if (this.managerflag) {
          mgmt.push({ value: 'course', icon: 'mdi-star-shooting-outline', label: this.$t('nav.courses') });
          mgmt.push({ value: 'classes', icon: 'mdi-view-dashboard-variant-outline', label: this.$t('nav.classes') });
        }
        mgmt.push({ value: 'holidaymanager', icon: 'mdi-calendar-remove', label: this.$t('nav.holidays') });
        groups.push({ label: this.$t('nav.managementMenu'), items: mgmt });
      }
      if (this.isLoggedIn) {
        groups.push({
          label: 'บัญชี',
          items: [
            { value: 'editprofile', icon: 'mdi-account-edit', label: this.$t('nav.editProfile') },
          ],
        });
      }
      return groups;
    },
    bottomTabs() {
      // EditProfile lives in the top-bar avatar menu now, so the mobile bottom bar
      // keeps just the 3 primary destinations
      return [
        { value: 'home', icon: 'mdi-home-account', label: this.$t('nav.home') },
        { value: 'viewclasses', icon: 'mdi-table-eye', label: this.$t('nav.viewClasses') },
        { value: 'familylist', icon: 'mdi-account-multiple', label: this.$t('nav.family') },
      ];
    },
    screenTitle() {
      for (const g of this.navGroups) {
        const hit = g.items.find((i) => i.value === this.state);
        if (hit) return hit.label;
      }
      const extra = {
        reservation: 'จองคลาส',
        addfamilymember: this.$t('nav.family'),
      };
      return extra[this.state] || '';
    },
    iconUrl() {
      return this.userProfileImage || require('./assets/avatar/1.png');
    },
    themeOptions() {
      return [
        { id: 'default',     name: this.$t('theme.default'),     sub: this.$t('theme.defaultSub'),     swatch: 'linear-gradient(135deg,#ec4899,#a855f7)' },
        { id: 'mothersday',  name: this.$t('theme.mothersday'),  sub: this.$t('theme.mothersdaySub'),  swatch: 'linear-gradient(135deg,#2f8fd6,#5470cf)' },
        { id: 'loykrathong', name: this.$t('theme.loykrathong'), sub: this.$t('theme.loykrathongSub'), swatch: 'linear-gradient(135deg,#e08a2e,#6d3a63)' },
        { id: 'newyear',     name: this.$t('theme.newyear'),     sub: this.$t('theme.newyearSub'),     swatch: 'linear-gradient(135deg,#1e2a52,#d9b14a)' },
        { id: 'songkran',    name: this.$t('theme.songkran'),    sub: this.$t('theme.songkranSub'),    swatch: 'linear-gradient(135deg,#14a9b8,#2f9fe0)' },
        { id: 'halloween',   name: this.$t('theme.halloween'),   sub: this.$t('theme.halloweenSub'),   swatch: 'linear-gradient(135deg,#e8731c,#7c3aed)' },
        { id: 'christmas',   name: this.$t('theme.christmas'),   sub: this.$t('theme.christmasSub'),   swatch: 'linear-gradient(135deg,#c0392b,#1f7a4d)' },
        { id: 'fathersday',  name: this.$t('theme.fathersday'),  sub: this.$t('theme.fathersdaySub'),  swatch: 'linear-gradient(135deg,#cd9b1d,#f0c233)' },
        { id: 'muaythai',    name: this.$t('theme.muaythai'),    sub: this.$t('theme.muaythaiSub'),    swatch: 'linear-gradient(135deg,#b81d2c,#d4a01e)' },
      ];
    },
    activeThemeName() {
      const found = this.themeOptions.find((t) => t.id === this.uiTheme);
      return found ? found.name : this.themeOptions[0].name;
    },
    // Theme is a system-wide setting — only the HEAD (usertype 0) may change it (not admins).
    canEditTheme() {
      return this.managerflag;
    },
  }
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>
/* ===== FIXED-HEIGHT APP SHELL =====
   Shell fills the viewport and does NOT scroll. The sidebar and topbar are
   fixed flex children that stay put; ONLY .page scrolls. Result: one scrollbar
   (the content area), pinned menu + topbar regardless of page length, and
   horizontal overflow contained — no position:sticky, no body overflow hacks. */
.shell {
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  /* NOTE: do NOT set overflow:hidden here — it clips the collapsed-sidebar hover
     tooltips that escape to the right. Children are height:100vh so nothing
     overflows the shell anyway; .page handles its own scroll. */
}

.side {
  height: 100vh;
  z-index: 100; /* keep collapsed-hover tooltips above page cards */
  /* compact spacing so the manager's long menu fits without needing a scrollbar */
  padding: 10px 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
}
.side::-webkit-scrollbar { width: 5px; }
.side::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.35); border-radius: 3px; }
.side::-webkit-scrollbar-track { background: transparent; }
.side-brand { padding: 6px 8px 8px; }
.nav-sec { margin: 7px 10px 2px; }
.nav-item { padding: 7px 11px; margin-bottom: 1px; }
.side-divider { margin: 5px 6px; }

.main {
  min-width: 0;
  max-width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg-grad);
  /* establish a stacking context so the seasonal overlay (position:absolute;
     z-index:-1) paints ABOVE this gradient but BELOW the topbar + page content.
     Safe: every menu/dialog in the app is a Vuetify overlay teleported out of
     here, so nothing in-page relies on escaping this context. */
  position: relative;
  z-index: 0;
}

/* taller, roomier top bar — fixed at the top of the main column */
.topbar {
  height: 78px;
  flex-shrink: 0;
}

.topbar strong {
  font-size: 19px;
}

/* larger profile avatar on the top bar (the shared .tt-avatar stays 30px elsewhere) */
.topbar .tt-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  font-size: 16px;
}

/* circular TH/EN language toggle */
.lang-circle {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text-heading);
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
  transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.lang-circle:hover {
  background: var(--c-surface-3);
  border-color: var(--c-primary);
  color: var(--c-primary);
}

/* the ONE scroll area: fills remaining height, scrolls vertically, clips wide content */
.page {
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  /* always reserve the scrollbar gutter so content width doesn't change when the
     scrollbar appears/disappears — prevents aspect-ratio calendars from oscillating */
  scrollbar-gutter: stable;
}

/* ROOT FIX: not-yet-migrated pages wrap content in .container-content which is
   width:98vw — too wide now that the sidebar takes 264px. Make those fill the
   page instead of the viewport so they no longer spill under the sidebar. */
.page :deep(.container),
.page :deep(.container-header),
.page :deep(.container-content) {
  width: 100%;
  max-width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
