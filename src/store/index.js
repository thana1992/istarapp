// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    user: null,  // Add user property
    token: null,
  },
  mutations: {
    setToken(state, { token, user }) {  // Update setToken mutation to include user
      state.token = token;
      state.user = user;
    },
    clearToken(state) {
      state.token = null;
      state.user = null;  // Clear user information when logging out
    },
  },
  actions: {
    setToken({ commit }, { token, user }) {  // Update setToken action to include user
      commit('setToken', { token, user });
    },
    clearToken({ commit }) {
      commit('clearToken');
    },
    logout({ commit }) {
      commit('clearToken');
    },
  },
  getters: {
    isLoggedIn: state => !!state.token && !!state.user,  // Check both token and user
    getToken: (state) => state.token,
    getUser: (state) => state.user,
  },
});

export default store;
