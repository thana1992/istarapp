// src/plugins/vuetify.js หรือ src/plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.css'; // Import CSS ของ @mdi/font
import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi', // ตั้งค่าให้ใช้ 'mdi' ซึ่งเป็น Material Design Icons
  },
});
