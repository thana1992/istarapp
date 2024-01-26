// main.js
import { createApp } from 'vue';
import App from './App.vue';
import store from './store';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCamera, faRightToBracket, faUser, faHouse, faHouseUser, faPeopleRoof, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Vue3Autocounter from 'vue3-autocounter';
library.add(faCamera, faRightToBracket, faUser, faHouse, faHouseUser, faPeopleRoof, faCalendarPlus);

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

//app.config.globalProperties.baseURL = 'https://istarserver.vercel.app';
//app.config.globalProperties.baseURL = 'http://localhost:3000';

app.component('font-awesome-icon', FontAwesomeIcon).component('VueDatePicker', VueDatePicker).use(vuetify).use(store).mount('#app');
