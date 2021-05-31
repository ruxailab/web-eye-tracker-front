import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import SessionRecord from '@/views/SessionRecord.vue'
import SessionUpload from '@/views/UploadSession.vue'
import LandingPage from '@/views/LandingPage.vue'
import Login from '@/views/Login'
import About from '@/views/About'
import Dashboard from '@/views/Dashboard'
import SessionView from '@/views/SessionView'

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
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/sessions/:id',
    name: 'SessionView',
    component: SessionView,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeResolve(async (to, from, next) => {
  var user = store.state.auth.user
  user = user ?? await store.dispatch('autoSignIn')
  if((to.path == '/login' || to.path == '/') && user) next('/dashboard')
  else if((to.path == '/dashboard') && !user) next('/login')

  next()
})

export default router
