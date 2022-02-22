import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import SessionRecord from '@/views/SessionRecord.vue'
import LandingPage from '@/views/LandingPage.vue'
import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import SessionView from '@/views/SessionView'
import SessionForm from '@/views/SessionForm'
import Callibration from '@/views/Callibration'
// import CallibrationRecord from '@/views/CallibrationRecord'
import CallibrationRecord from '@/views/MovingCallibrationRecord'

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
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/sessions/view/:id',
    name: 'SessionView',
    component: SessionView,
  },
  {
    path: '/sessions/new',
    name: 'SessionForm',
    component: SessionForm,
  },
  {
    path: '/callibration',
    name: 'Callibration',
    component: Callibration,
  },
  {
    path: '/callibration/record',
    name: 'CallibrationRecord',
    // component: CallibrationRecord,
    component: CallibrationRecord
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
