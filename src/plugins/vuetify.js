import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/styles/main.sass';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        primary: '#1976D2', // สีฟ้า
        secondary: '#424242', // สีเทาเข้ม
        accent: '#82B1FF', // สีฟ้าอ่อน
        error: '#FF5252', // สีแดง
        info: '#2196F3', // สีฟ้าเข้ม
        success: '#4CAF50', // สีเขียว
        warning: '#FFC107', // สีเหลือง
      },
      dark: {
        primary: '#BB86FC', // สีม่วง
        secondary: '#03DAC6', // สีเขียวอ่อน
        accent: '#03DAC6', // สีเขียวอ่อน
        error: '#CF6679', // สีแดง
        info: '#BB86FC', // สีม่วง
        success: '#4CAF50', // สีเขียว
        warning: '#FFC107', // สีเหลือง
      },
    },
  },
})
