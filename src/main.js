import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCamera } from '@fortawesome/free-solid-svg-icons'

library.add(faCamera)
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { faHouseUser } from '@fortawesome/free-solid-svg-icons'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons'
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons'
library.add(faRightToBracket, faUser, faHouse, faHouseUser, faPeopleRoof, faCalendarPlus)
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const vuetify = createVuetify({
    components,
    directives,
    defaultTheme: 'dark',
  })
  
const app = createApp(App)
app.config.globalProperties.baseURL = 'https://istardb.cyclic.app/'
//app.config.globalProperties.baseURL = 'http://localhost:3000'

app.component('font-awesome-icon', FontAwesomeIcon).component('VueDatePicker', VueDatePicker).use(vuetify).mount('#app')
