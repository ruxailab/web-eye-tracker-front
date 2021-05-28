import Vue from 'vue'
import VueRouter from 'vue-router'
import SessionRecord from '@/views/SessionRecord.vue'
import SessionUpload from '@/views/UploadSession.vue'
import LandingPage from '@/views/LandingPage.vue'
import Login from '@/views/Login'
import About from '@/views/About'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/session-record',
    name: 'SessionRecord',
    component: SessionRecord,
  },
  {
    path: '/session-upload',
    name: 'SessionUpload',
    component: SessionUpload,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
