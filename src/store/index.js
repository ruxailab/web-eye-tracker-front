import Vue from 'vue'
import Vuex from 'vuex'

import session from '@/store/session.js'
import auth from '@/store/auth.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    session,
    auth,
  }
})
