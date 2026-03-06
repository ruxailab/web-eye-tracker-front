import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './services/axios'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { envConfig } from './config/environment'

const firebaseConfig = envConfig.firebase;


Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
