import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import LandingPage from '@/views/LandingPage.vue'
import Login from '@/views/Login'
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

router.beforeResolve(async (to, from, next) => {
  try {
    let user = store.state.auth.user
    if (!user) {
      user = await store.dispatch('autoSignIn')
    }

    // Redirect authenticated users away from login or root
    if ((to.path === '/login' || to.path === '/') && user) {
      return next('/dashboard')
    }

    // Prevent unauthenticated access to dashboard
    if (to.path === '/dashboard' && !user) {
      return next('/login')
    }

    return next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    return next('/login')
  }
})

export default router

