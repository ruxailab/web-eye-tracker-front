import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/auth.js'
import predict from '@/store/predict.js'
import calibration from '@/store/calibration.js'
import detect from '@/store/detect.js'

Vue.use(Vuex)

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
