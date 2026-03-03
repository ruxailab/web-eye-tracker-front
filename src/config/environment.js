const rawEnv = (process.env.VUE_APP_ENV || process.env.NODE_ENV || "development").toLowerCase();
const isProd = rawEnv === "production" || rawEnv === "prod";
const target = isProd ? "PROD" : "DEV";

const read = (key) => process.env[`${key}_${target}`] || "";

export const envConfig = {
  appEnv: isProd ? "prod" : "dev",
  firebase: {
    apiKey: read("VUE_APP_FIREBASE_API_KEY"),
    authDomain: read("VUE_APP_FIREBASE_AUTH_DOMAIN"),
    projectId: read("VUE_APP_FIREBASE_PROJECT_ID"),
    storageBucket: read("VUE_APP_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read("VUE_APP_FIREBASE_MESSAGING_SENDER_ID"),
    appId: read("VUE_APP_FIREBASE_APP_ID"),
    measurementId: read("VUE_APP_FIREBASE_MEASUREMENT_ID"),
  },
  apiBaseUrl: read("VUE_APP_API_BASE_URL"),
  ruxailabUrl: read("VUE_APP_RUXAILAB_URL"),
};
