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
          <v-list-item prepend-icon="mdi-login" title="LOGIN" value="login" @click="onClickChangeState('login')">
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-plus" title="REGISTER" value="register" @click="onClickChangeState('register')">
          </v-list-item>
          <v-list-item prepend-icon="mdi-home-account" title="HOME" value="home" @click="onClickChangeState('home')">
          </v-list-item>
          <v-list-item prepend-icon="mdi-account-multiple" title="FAMILY" value="familylist" @click="onClickChangeState('familylist')">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar :elevation="20">
        <v-btn v-if="!black" @click.stop="drawer = !drawer"><span class="mdi mdi-menu"></span></v-btn>
        <v-btn v-if="black" @click="onClickChangeState(state)"><span class="mdi mdi-arrow-left"></span></v-btn>
      </v-app-bar>
      <v-main class="root-container">
        <Login v-if="state=='login'"
        @onAffterLogin="AffterLogin($event)"
        ></Login>
        
        <Register v-if="state=='register'"
        ></Register>

        <Home v-if="state=='home'" 
        @onClickBack="initBlackButton($event)"
        :homestate="homestate"
        ></Home>

        <FamilyList v-if="state=='familylist'" 
        @onClickBack="initBlackButton($event)"
        ></FamilyList>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Home from './components/Home.vue'
import FamilyList from './components/FamilyList.vue'

export default {
  data () {
      return {
        drawer: false,
        rail: true,
        parent: 'Guest',
        state: 'login',
        black: false,
        blackstate: 'home',
        homestate: 'family',
      }
    },
  name: 'App',
  components: {
    Login,
    Register,
    Home,
    FamilyList,
    
  },
  methods: {
    AffterLogin (user) {
      this.parent = user.name
      this.state = 'home'
      this.homestate = 'family'
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
  },
}
</script>
<style src="./styles/global-style.css"></style>
<style scoped>

</style>