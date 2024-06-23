// main.js
import { createApp } from 'vue';
import App from './App.vue';
import store from './store';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import Vue3Autocounter from 'vue3-autocounter';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const vuetify = createVuetify({
  components,
  directives,
  defaultTheme: 'dark',
});

const app = createApp(App).component('vue3-autocounter', Vue3Autocounter)

// Check if there is a token in localStorage and set it in the store
const token = localStorage.getItem('token');
if (token) {
  store.dispatch('setToken', token);
}

console.log("env.SERVER_URL ", env.SERVER_URL);
app.config.globalProperties.baseURL = env.SERVER_URL;

app.component('VueDatePicker', VueDatePicker).use(vuetify).use(store).mount('#app');
