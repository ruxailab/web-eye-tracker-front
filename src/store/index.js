import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/auth.js'
import predict from '@/store/predict.js'
import calibration from '@/store/calibration.js'
import detect from '@/store/detect.js'

Vue.use(Vuex)

/**
 * Vuex store configuration.
 *
 * This store is used to manage the state of the application.
 * It includes the following modules:
 * - auth: Handles authentication-related state and actions.
 * - predict: Manages state and actions related to predictions.
 * - calibration: Manages state and actions for calibration processes.
 * - detect: Handles state and actions for detection processes.
 *
 * @module store
 */
export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    predict,
    calibration,
    detect
  }
})
