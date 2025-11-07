import { createRouter, createWebHashHistory } from 'vue-router';
import BaseLayout from '../layout/BaseLayout.vue';
import LoginView from '../views/LoginView.vue';
import ChatView from '../views/ChatView.vue';
import LiveView from '../views/LiveView.vue';

const routes = [
  {
    path: '/',
    name: 'BaseLayout',
    component: BaseLayout,
    redirect: '/login',
    children: [
      { path: '/login', name: 'LoginView', component: LoginView },
      { path: '/chat', name: 'ChatView', component: ChatView },
      { path: '/live', name: 'LiveView', component: LiveView }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;