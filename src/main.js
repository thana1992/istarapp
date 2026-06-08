// main.js
import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import { i18nState, t, setLocale } from './i18n';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { th, en } from 'vuetify/locale';
import Vue3Autocounter from 'vue3-autocounter';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// iStar new design system (single theme). Order matters: design tokens first, then page/layout classes.
import './assets/istar-design.css';
import './assets/istar-pages.css';

// iStar shared design components — registered globally so every page can use
// <id-data-grid> / <id-calendar> in its <template> without touching its <script>.
import IdDataGrid from './components/common/IdDataGrid.vue';
import IdCalendar from './components/common/IdCalendar.vue';

const vuetify = createVuetify({
  components,
  directives,
  defaultTheme: 'istar',
  locale: {
    locale: localStorage.getItem('istar_locale') || 'th',
    fallback: 'en',
    messages: { th, en },
  },
  themes: {
    // iStar — light pink theme (matches istar-design.css tokens)
    istar: {
      dark: false,
      colors: {
        background: '#fdf2f8',
        surface: '#ffffff',
        'surface-bright': '#ffffff',
        'surface-variant': '#fce7f3',
        'on-surface-variant': '#831843',
        primary: '#ec4899',
        'primary-darken-1': '#db2777',
        secondary: '#8b5cf6',
        error: '#ef4444',
        info: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        'on-background': '#57323f',
        'on-surface': '#57323f',
        'on-primary': '#ffffff',
      },
    },
    dark: {
      dark: true,
      colors: {
        background: '#121212',
        surface: '#121212',
        primary: '#BB86FC',
        secondary: '#03DAC6',
        error: '#CF6679',
      },
    },
  },
});

const app = createApp(App).component('vue3-autocounter', Vue3Autocounter)

// Check if there is a token in localStorage and set it in the store
const token = localStorage.getItem('token');
if (token) {
  store.dispatch('setToken', token);
}

//console.log("env.SERVER_URL ", env.SERVER_URL);
app.config.globalProperties.baseURL = env.SERVER_URL;
app.config.globalProperties.$t = t;
app.config.globalProperties.$setLocale = setLocale;
app.config.globalProperties.$i18n = i18nState;

app
  .component('VueDatePicker', VueDatePicker)
  .component('IdDataGrid', IdDataGrid)
  .component('IdCalendar', IdCalendar)
  .use(vuetify)
  .use(store)
  .mount('#app');