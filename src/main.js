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

// iStar new design system. Order matters: design tokens first, then page/layout
// classes, then the seasonal theme overrides (they re-paint the tokens per festival).
import './assets/istar-design.css';
import './assets/istar-pages.css';
import './assets/istar-themes.css';

// iStar shared design components — registered globally so every page can use
// <id-data-grid> / <id-calendar> in its <template> without touching its <script>.
import IdDataGrid from './components/common/IdDataGrid.vue';
import IdCalendar from './components/common/IdCalendar.vue';
import IdPager from './components/common/IdPager.vue';
import IdGridFooter from './components/common/IdGridFooter.vue';
import IdModal from './components/common/IdModal.vue';
import IdSelect from './components/common/IdSelect.vue';
import IdDateField from './components/common/IdDateField.vue';

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
// $minLoad — keep a loading/skeleton state visible for at least `ms` (default 1000ms)
// so fast responses don't make the skeleton flash. Call with the start timestamp:
//   const t0 = Date.now(); ...await fetch...; await this.$minLoad(t0); this.loadingX = false;
app.config.globalProperties.$minLoad = function (startedAt, ms = 1000) {
  const elapsed = Date.now() - startedAt;
  return elapsed >= ms ? Promise.resolve() : new Promise((r) => setTimeout(r, ms - elapsed));
};
// $bustCache — append a timestamp so a re-uploaded image (S3 reuses the same object key,
// so the URL is byte-identical) is re-fetched instead of shown from the browser cache.
app.config.globalProperties.$bustCache = function (url) {
  return url ? url + (url.includes('?') ? '&' : '?') + 't=' + Date.now() : url;
};
// single-column sort cycle for server tables (Vuetify v-data-table-server `sort-by` shape):
// none → asc → desc → none. Returns the new sortBy array; $sortDir gives the active column's order.
app.config.globalProperties.$toggleSort = function (current, key) {
  const order = (Array.isArray(current) && current[0] && current[0].key === key) ? current[0].order : null;
  if (order === 'asc') return [{ key, order: 'desc' }];
  if (order === 'desc') return [];
  return [{ key, order: 'asc' }];
};
app.config.globalProperties.$sortDir = function (current, key) {
  return (Array.isArray(current) && current[0] && current[0].key === key) ? current[0].order : '';
};
app.config.globalProperties.$t = t;
app.config.globalProperties.$setLocale = setLocale;
app.config.globalProperties.$i18n = i18nState;

app
  .component('VueDatePicker', VueDatePicker)
  .component('IdDataGrid', IdDataGrid)
  .component('IdCalendar', IdCalendar)
  .component('IdPager', IdPager)
  .component('IdGridFooter', IdGridFooter)
  .component('IdModal', IdModal)
  .component('IdSelect', IdSelect)
  .component('IdDate', IdDateField)
  .use(vuetify)
  .use(store)
  .mount('#app');