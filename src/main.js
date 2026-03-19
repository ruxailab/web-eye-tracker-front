import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api' // MUST be first
import { createPinia, PiniaVuePlugin } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

// 1. Initialize the Bridge
Vue.use(VueCompositionAPI)

// 2. Initialize Pinia
Vue.use(PiniaVuePlugin)
const pinia = createPinia()

Vue.config.productionTip = false

new Vue({
  router,
  store, // Existing Vuex
  pinia, // Your New Pinia
  vuetify,
  render: h => h(App)
}).$mount('#app')