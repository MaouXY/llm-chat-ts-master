import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '../layout/BaseLayout.vue'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import DigitalPersonPage from '../views/DigitalPersonPage.vue'

const routes = [
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: '',
        redirect: '/login'
      },
      {
        path: '/login',
        name: 'login',
        component: LoginPage
      },
      {
        path: '/home',
        name: 'home',
        component: HomePage
      },
      {
        path: '/digital-person',
        name: 'digitalPerson',
        component: DigitalPersonPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router