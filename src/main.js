import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import './services/axios'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { envConfig } from './config/environment'

Vue.config.productionTip = false

const firebaseConfig = envConfig.firebase;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Connect to Firestore emulator if in development
if (process.env.VUE_APP_USE_EMULATORS === 'true') {
  const db = firebase.firestore();
  db.useEmulator('localhost', 8081);
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
