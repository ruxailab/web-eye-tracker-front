import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import './services/axios'
import firebase from 'firebase/app'
import 'firebase/firestore'  // ← ADD THIS LINE

Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

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
