import Vue from 'vue'
import VueRouter from 'vue-router'
import SessionRecord from '@/views/SessionRecord.vue'
import SessionUpload from '@/views/UploadSession.vue'
import LandingPage from '@/views/LandingPage.vue'

Vue.use(VueRouter)

const routes = [
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
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
