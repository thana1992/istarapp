// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    user: null,  // Add user property
    token: null,
    userdata: null,
  },
  mutations: {
    setToken(state, { token, user }) {  // Update setToken mutation to include user
      state.token = token;
      state.user = user;
      state.userdata = user;
    },
    clearToken(state) {
      state.token = null;
      state.user = null;  // Clear user information when logging out
      state.userdata = null;
    },
  },
  actions: {
    setToken({ commit }, { token, userdata }) {  // Update setToken action to include user
      commit('setToken', { token, userdata });
    },
    clearToken({ commit }) {
      commit('clearToken');
    },
    logout({ commit }) {
      commit('clearToken');
    },
  },
  getters: {
    isLoggedIn: state => !!state.token,  // Check both token and user
    getToken: (state) => state.token,
    getUser: (state) => state.user,
    getUserdata: (state) => state.userdata
  },
});

export default store;
