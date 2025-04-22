import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/auth.js'
import predict from '@/store/predict.js'
import calibration from '@/store/calibration.js'
import detect from '@/store/detect.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // State should be managed in modules
  },
  mutations: {
    // Mutations should be managed in modules
  },
  actions: {
    // Actions should be managed in modules
  },
  modules: {
    auth,
    predict,
    calibration,
    detect
  }
})
