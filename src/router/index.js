import { createRouter,createWebHistory } from 'vue-router';
import Login from '@/components/Login.vue';
import Register from '@/components/Register.vue';
import Home from '../components/Home.vue';
import FamilyList from '../components/FamilyList.vue';
import AddFamily from '../components/AddFamily.vue';
const routes = [
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', name: 'home', component: Home, meta: { requiresAuth: true } },
  { path: '/familylist', name: 'familylist', component: FamilyList, meta: { requiresAuth: true } },
  { path: '/addfamily', name: 'addfamily', component: AddFamily, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
