import { createRouter, createWebHashHistory } from 'vue-router';
import BaseLayout from '../layout/BaseLayout.vue';
import LoginView from '../views/LoginView.vue';
import ChatView from '../views/ChatView.vue';
import LiveView from '../views/LiveView.vue';
import LitHealView from '../views/LitHealView.vue';
import BookSearchView from '../views/BookSearchView.vue';

const routes = [
  {
    path: '/',
    name: 'BaseLayout',
    component: BaseLayout,
    redirect: '/login',
    children: [
      { path: '/login', name: 'LoginView', component: LoginView },
      { path: '/chat', name: 'ChatView', component: ChatView },
      { path: '/live', name: 'LiveView', component: LiveView },
      { path: '/litheal', name: 'LitHealView', component: LitHealView },
      { path: '/booksearch', name: 'BookSearchView', component: BookSearchView }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;