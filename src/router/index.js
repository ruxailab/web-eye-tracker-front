import Vue from 'vue'
import VueRouter from 'vue-router'
// import store from '@/store/index'
import LandingPage from '@/views/LandingPage.vue'
// import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import Calibration from '@/views/CalibrationCard'
import CameraConfig from '@/views/CameraConfiguration'
import DoubleCalibrationRecord from '@/views/DoubleCalibrationRecord'
import PostCalibration from '@/views/PostCalibration'
import CalibrationConfig from '@/views/CalibrationConfig'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: Login,
  // },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/calibration',
    name: 'calibration',
    component: Calibration,
  },
  {
    path: '/calibration/camera',
    name: 'camera',
    component: CameraConfig,
  },
  {
    path: '/calibration/record',
    name: 'calibrationRecord',
    component: DoubleCalibrationRecord
  },
  {
    path: '/postCalibration',
    name: 'postCalibration',
    component: PostCalibration,
  },
  {
    path: '/calibration/configuration',
    name: 'calibrationConfig',
    component: CalibrationConfig
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// router.beforeResolve(async (to, from, next) => {
//   var user = store.state.auth.user
//   user = user ?? await store.dispatch('autoSignIn')
//   if ((to.path == '/login' || to.path == '/') && user) next('/dashboard')
//   else if ((to.path == '/dashboard') && !user) next('/login')

//   next()
// })

export default router
