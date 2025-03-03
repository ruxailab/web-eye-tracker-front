import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/auth.js'
import predict from '@/store/predict.js'
import calibration from '@/store/calibration.js'
import detect from '@/store/detect.js'

Vue.use(Vuex)

// Define default values
const DEFAULT_CALIB_NAME = "";
const DEFAULT_POINT_NUMBER = 5;
const DEFAULT_SAMPLE_PER_POINT = 20;
const DEFAULT_MS_PER_CAPTURE = 10;
const DEFAULT_THRESHOLD = 200;
const DEFAULT_RADIUS = 20; // Assuming a default value
const DEFAULT_OFFSET = { x: 100, y: 100 }; // Assuming default values

export default new Vuex.Store({
  state: {
    calibration: {
      calibName: DEFAULT_CALIB_NAME,
      pointNumber: DEFAULT_POINT_NUMBER,
      samplePerPoint: DEFAULT_SAMPLE_PER_POINT,
      msPerCapture: DEFAULT_MS_PER_CAPTURE,
      threshold: DEFAULT_THRESHOLD,
      radius: DEFAULT_RADIUS,
      offset: DEFAULT_OFFSET
      // ...other state properties
    }
  },
  mutations: {
    // Existing mutations
    setCalibName(state, value) {
      state.calibration.calibName = value;
    },
    setPointNumber(state, value) {
      state.calibration.pointNumber = value;
    },
    setSamplePerPoint(state, value) {
      state.calibration.samplePerPoint = value;
    },
    setMsPerCapture(state, value) {
      state.calibration.msPerCapture = value;
    },
    setThreshold(state, value) {
      state.calibration.threshold = value;
    },
    setRadius(state, value) {
      state.calibration.radius = value;
    },
    setOffset(state, value) {
      state.calibration.offset = value;
    },

    // Reset mutations
    resetCalibName(state) {
      state.calibration.calibName = DEFAULT_CALIB_NAME;
    },
    resetPointNumber(state) {
      state.calibration.pointNumber = DEFAULT_POINT_NUMBER;
    },
    resetSamplePerPoint(state) {
      state.calibration.samplePerPoint = DEFAULT_SAMPLE_PER_POINT;
    },
    resetMsPerCapture(state) {
      state.calibration.msPerCapture = DEFAULT_MS_PER_CAPTURE;
    },
    resetThreshold(state) {
      state.calibration.threshold = DEFAULT_THRESHOLD;
    },
    resetRadius(state) {
      state.calibration.radius = DEFAULT_RADIUS;
    },
    resetOffset(state) {
      state.calibration.offset = DEFAULT_OFFSET;
    }
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
