import axios from "axios";
import firebase from "@/firebase";
import router from "@/router";
export default {
  state: {
    calibName: "",
    pointNumber: 9,
    samplePerPoint: 90,
    radius: 20,
    offset: 100,
    backgroundColor: "#FFFFFFFF",
    pointColor: "#000000FF",
    customColors: false,
    models: "Linear Regression",
    blinkFilter: true,
    leftEyeTreshold: 5,
    rightEyeTreshold: 5,
    index: 0,
    msPerCapture: 100,
    pattern: [],
    mockPattern: [],
    threshold: 200,
    calibrations: [],
    fromDashboard: false,
    // New single-point calibration features
    calibrationMode: 'multi-point', // 'multi-point' | 'single-point'
    singlePointPosition: null, // Will be calculated as screen center
    runtime: {
      circleIrisPoints: [],
      calibPredictionPoints: [],
      usedPattern: [],
      finished: false,
    },
  },
  mutations: {
    setCalibrationConfig(state, config) {
      state.pointNumber = config.pointNumber ?? state.pointNumber;
      state.samplePerPoint = config.samplePerPoint ?? state.samplePerPoint;
      state.radius = config.radius ?? state.radius;
      state.offset = config.offset ?? state.offset;
      state.backgroundColor = config.backgroundColor ?? state.backgroundColor;
      state.pointColor = config.pointColor ?? state.pointColor;
      state.customColors = config.customColors ?? state.customColors;
      state.models = config.models ?? state.models;
      state.blinkFilter = config.blinkFilter ?? state.blinkFilter;
      state.leftEyeTreshold = config.leftEyeTreshold ?? state.leftEyeTreshold;
      state.rightEyeTreshold =
        config.rightEyeTreshold ?? state.rightEyeTreshold;
      state.index = config.index ?? state.index;
      state.msPerCapture = config.msPerCapture ?? state.msPerCapture;
      state.pattern = config.pattern ?? state.pattern;
      state.mockPattern = config.mockPattern ?? state.mockPattern;
      state.threshold = config.threshold ?? state.threshold;
      state.calibrations = config.calibrations ?? state.calibrations;
      state.fromDashboard = config.fromDashboard ?? state.fromDashboard;
    },
    setThreshold(state, newThreshold) {
      state.threshold = newThreshold;
    },
    setCalibName(state, newCalibName) {
      state.calibName = newCalibName;
    },
    setSamplePerPoint(state, newSamplePerPoint) {
      state.samplePerPoint = newSamplePerPoint;
    },
    setRadius(state, newRadius) {
      state.radius = newRadius;
    },
    setOffset(state, newOffset) {
      state.offset = newOffset;
    },
    setPointNumber(state, newPointNumber) {
      state.pointNumber = newPointNumber;
    },
    setPattern(state, newPattern) {
      state.pattern = newPattern;
    },
    setMockPatternElement(state, newPatternLike) {
      if (!state.mockPattern.includes(newPatternLike)) {
        state.mockPattern.push(newPatternLike);
      } else {
        const index = state.mockPattern.indexOf(newPatternLike);
        state.mockPattern.splice(index, 1);
      }
    },
    setMockPattern(state, newMockPattern) {
      state.mockPattern = newMockPattern;
    },
    setBackgroundColor(state, newBackgroundColor) {
      state.backgroundColor = newBackgroundColor;
    },
    setPointColor(state, newPointColor) {
      state.pointColor = newPointColor;
    },
    setCustomColors(state, newCustomColors) {
      state.customColors = newCustomColors;
    },
    setModels(state, newModels) {
      state.models = newModels;
    },
    setBlinkFilter(state, newBlinkFilter) {
      state.blinkFilter = newBlinkFilter;
    },
    setLeftTreshold(state, newLeftTreshold) {
      state.leftEyeTreshold = newLeftTreshold;
    },
    setRightTreshold(state, newRightTreshold) {
      state.rightEyeTreshold = newRightTreshold;
    },
    setIndex(state, newIndex) {
      state.index = newIndex;
    },
    setMsPerCapture(state, newMsPerCapture) {
      state.msPerCapture = newMsPerCapture;
    },
    setCalibrations(state, newCalibrations) {
      state.calibrations = newCalibrations;
    },
    setFromDashboard(state, newFromDashboard) {
      state.fromDashboard = newFromDashboard;
    },
    
    // New single-point calibration mutations
    setCalibrationMode(state, mode) {
      state.calibrationMode = mode;
      // If switching to single-point, set pointNumber to 1
      if (mode === 'single-point') {
        state.pointNumber = 1;
      } else {
        state.pointNumber = 9; // Default multi-point
      }
    },
    
    setSinglePointPosition(state, position) {
      state.singlePointPosition = position;
    },
    
    setRuntimeData(state, payload) {
      state.runtime.circleIrisPoints = payload.circleIrisPoints;
      state.runtime.calibPredictionPoints = payload.calibPredictionPoints;
      state.runtime.usedPattern = payload.usedPattern;
    },

    setCalibrationFinished(state, value) {
      state.runtime.finished = value;
    },

    resetRuntime(state) {
      state.runtime.circleIrisPoints = [];
      state.runtime.calibPredictionPoints = [];
      state.runtime.usedPattern = [];
      state.runtime.finished = false;
    },
    resetAll(state) {
      state.calibName = "";
      state.pointNumber = 9;
      state.samplePerPoint = 90;
      state.radius = 20;
      state.offset = 100;
      state.backgroundColor = "#FFFFFFFF";
      state.pointColor = "#000000FF";
      state.customColors = false;
      state.models = "Linear Regression";
      state.blinkFilter = true;
      state.leftEyeTreshold = 5;
      state.rightEyeTreshold = 5;
      state.index = 0;
      state.msPerCapture = 100;
      state.pattern = [];
      state.mockPattern = [];
      state.threshold = 200;
      state.calibrations = [];
      state.fromDashboard = false;
      // Reset single-point calibration properties
      state.calibrationMode = 'multi-point';
      state.singlePointPosition = null;
    },
  },
  actions: {
    generateMockPattern(width, height, offset = 100) {
      const positions = [];
      const cols = 3;
      const rows = 3;

      const usableWidth = width - 2 * offset;
      const usableHeight = height - 2 * offset;

      const stepX = usableWidth / (cols - 1);
      const stepY = usableHeight / (rows - 1);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          positions.push({
            x: offset + j * stepX,
            y: offset + i * stepY,
          });
        }
      }

      return positions;
    },

    // Generate single-point calibration pattern (center of screen)
    generateSinglePointPattern({ commit }, { width, height }) {
      const centerPoint = {
        x: width / 2,
        y: height / 2,
      };
      
      commit('setSinglePointPosition', centerPoint);
      return [centerPoint];
    },
 async saveCalib({ state, dispatch }) {
  try {
    const data = { ...state };
    delete data.calibrations;

    await firebase.firestore().collection("calibrations").add(data);
    dispatch("getAllCalibs");
  } catch (e) {
    console.error("Save failed:", e);
  }
  },

    async finishCalibration({ state, dispatch }) {
      console.log("[Calibration] finishCalibration started");

      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;

      let predictions = await dispatch("sendData", {
        fromRuxailab: state.fromDashboard,
        circleIrisPoints: state.runtime.circleIrisPoints,
        calibPredictionPoints: state.runtime.calibPredictionPoints,
        screenHeight,
        screenWidth,
        k: state.pointNumber,
        threshold: state.threshold,
      });

      if (typeof predictions === "string") {
        predictions = JSON.parse(predictions.replace(/NaN/g, "1"));
      }

      state.runtime.usedPattern.forEach((p) => {
        const data =
          predictions[p.x.toString().split(".")[0]][
            p.y.toString().split(".")[0]
          ];

        p.precision = Number(data.PrecisionSD).toFixed(2);
        p.accuracy = Number(data.Accuracy).toFixed(2);
        p.predictionX = data.predicted_x;
        p.predictionY = data.predicted_y;
      });

      console.log("[Calibration] finishCalibration done");

      return true;
    },
    async selectCalib({ commit }, calibData) {
      commit("setThreshold", calibData.threshold);
      commit("setCalibName", calibData.calibName);
      commit("setSamplePerPoint", calibData.samplePerPoint);
      commit("setRadius", calibData.radius);
      commit("setOffset", calibData.offset);
      commit("setPointNumber", calibData.pointNumber);
      commit("setPattern", calibData.pattern);
      commit("setMockPattern", calibData.mockPattern);
      commit("setBackgroundColor", calibData.backgroundColor);
      commit("setPointColor", calibData.pointColor);
      commit("setCustomColors", calibData.customColors);
      commit("setModels", calibData.models);
      commit("setBlinkFilter", calibData.blinkFilter);
      commit("setLeftTreshold", calibData.leftTreshold);
      commit("setRightTreshold", calibData.rightTreshold);
      commit("setIndex", calibData.index);
      commit("setMsPerCapture", calibData.msPerCapture);
      router.push("/postCalibration");
    },
  async getAllCalibs({ commit }) {
  try {
    const snapshot = await firebase
      .firestore()
      .collection("calibrations")
      .get();

    const calibrations = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      let averageAccuracy = 0;
      let averagePrecision = 0;

      if (data.runtime?.usedPattern?.length) {
        const total = data.runtime.usedPattern.length;

        averageAccuracy =
          data.runtime.usedPattern.reduce(
            (sum, p) => sum + Number(p.accuracy || 0),
            0
          ) / total;

        averagePrecision =
          data.runtime.usedPattern.reduce(
            (sum, p) => sum + Number(p.precision || 0),
            0
          ) / total;
      }

      calibrations.push({
        id: doc.id,
        ...data,
        averageAccuracy: Number(averageAccuracy.toFixed(2)),
        averagePrecision: Number(averagePrecision.toFixed(2)),
      });
    });

    commit("setCalibrations", calibrations);
  } catch (err) {
    console.error("Error getting calibrations:", err);
  }
  },
  async deleteCalib({ dispatch }, calib) {
  try {
    await firebase
      .firestore()
      .collection("calibrations")
      .doc(calib.id)
      .delete();

    dispatch("getAllCalibs");
  } catch (e) {
    console.error("Delete failed:", e);
  }
  },
    async sendData(context, data) {
      let formData = new FormData();

      formData.append("from_ruxailab", JSON.stringify(!!data.fromRuxailab));

      formData.append("file_name", JSON.stringify(context.state.calibName));
      formData.append(
        "fixed_circle_iris_points",
        JSON.stringify(data.circleIrisPoints)
      );
      formData.append(
        "calib_circle_iris_points",
        JSON.stringify(data.calibPredictionPoints)
      );
      formData.append("screen_height", JSON.stringify(data.screenHeight));
      formData.append("screen_width", JSON.stringify(data.screenWidth));
      formData.append("k", JSON.stringify(data.k));
      formData.append("model", JSON.stringify(context.state.models));
      const res = await axios.post(`/api/session/calib_validation`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
      // console.log(res);
    },
  },
};
