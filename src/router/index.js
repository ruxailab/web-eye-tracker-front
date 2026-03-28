import Vue from 'vue'
import VueRouter from 'vue-router'
// import store from '@/store/index'
import LandingPage from '@/views/LandingPage.vue'
import Auth from '@/views/Auth.vue'
// import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import Calibration from '@/views/CalibrationCard'
import CameraConfig from '@/views/CameraConfiguration'
import DoubleCalibrationRecord from '@/views/DoubleCalibrationRecord'
import PostCalibration from '@/views/PostCalibration'
import CalibrationConfig from '@/views/CalibrationConfig'
import { getCurrentUser } from '@/services/firebaseAuth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
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

router.beforeEach(async (to, from, next) => {
  if (to.path !== '/' && to.path !== '/auth') {
    next()
    return
  }

  try {
    const user = await getCurrentUser()

    if (to.path === '/' && !user) {
      next('/auth')
      return
    }

    if (to.path === '/auth' && user) {
      next('/dashboard')
      return
    }

    next()
  } catch (error) {
    if (to.path === '/') {
      next('/auth')
      return
    }

    next()
  }
})

export default router
