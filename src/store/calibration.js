import axios from 'axios';
import firebase from 'firebase/app';
import router from '@/router';
/**
 * Vuex store module for calibration settings and actions.
 * 
 * @module store/calibration
 */

/**
 * State object for calibration settings.
 * 
 * @typedef {Object} State
 * @property {string} calibName - Name of the calibration.
 * @property {number} pointNumber - Number of points in the calibration.
 * @property {number} samplePerPoint - Number of samples per point.
 * @property {number} radius - Radius of the calibration points.
 * @property {number} offset - Offset value for calibration.
 * @property {string} backgroundColor - Background color for calibration.
 * @property {string} pointColor - Color of the calibration points.
 * @property {boolean} customColors - Flag to indicate if custom colors are used.
 * @property {string} models - Model used for calibration.
 * @property {boolean} blinkFilter - Flag to indicate if blink filter is used.
 * @property {number} leftEyeThreshold - Threshold for left eye.
 * @property {number} rightEyeThreshold - Threshold for right eye.
 * @property {number} index - Index of the current calibration.
 * @property {number} msPerCapture - Milliseconds per capture.
 * @property {Array} pattern - Pattern data for calibration.
 * @property {Array} mockPattern - Mock pattern data for calibration.
 * @property {number} threshold - Threshold value for calibration.
 * @property {Array} calibrations - List of calibrations.
 * @property {boolean} fromDashboard - Flag to indicate if calibration is from dashboard.
 */

/**
 * Mutations for updating the state.
 * 
 * @typedef {Object} Mutations
 * @property {Function} setThreshold - Sets the threshold value.
 * @property {Function} setCalibName - Sets the calibration name.
 * @property {Function} setSamplePerPoint - Sets the number of samples per point.
 * @property {Function} setRadius - Sets the radius of the calibration points.
 * @property {Function} setOffset - Sets the offset value.
 * @property {Function} setPointNumber - Sets the number of points in the calibration.
 * @property {Function} setPattern - Sets the pattern data.
 * @property {Function} setMockPatternElement - Adds or removes an element from the mock pattern.
 * @property {Function} setMockPattern - Sets the mock pattern data.
 * @property {Function} setBackgroundColor - Sets the background color.
 * @property {Function} setPointColor - Sets the color of the calibration points.
 * @property {Function} setCustomColors - Sets the custom colors flag.
 * @property {Function} setModels - Sets the model used for calibration.
 * @property {Function} setBlinkFilter - Sets the blink filter flag.
 * @property {Function} setLeftThreshold - Sets the threshold for the left eye.
 * @property {Function} setRightThreshold - Sets the threshold for the right eye.
 * @property {Function} setIndex - Sets the index of the current calibration.
 * @property {Function} setMsPerCapture - Sets the milliseconds per capture.
 * @property {Function} setCalibrations - Sets the list of calibrations.
 * @property {Function} setFromDashboard - Sets the from dashboard flag.
 * @property {Function} resetAll - Resets all state properties to their default values.
 */

/**
 * Actions for performing asynchronous operations.
 * 
 * @typedef {Object} Actions
 * @property {Function} saveCalib - Saves the current calibration to the database.
 * @property {Function} selectCalib - Selects a calibration and updates the state.
 * @property {Function} getAllCalibs - Retrieves all calibrations from the database.
 * @property {Function} deleteCalib - Deletes a calibration from the database.
 * @property {Function} sendData - Sends calibration data to the server.
 */
export default {
    state: {
        calibName: '',
        pointNumber: 8,
        samplePerPoint: 90,
        radius: 20,
        offset: 100,
        backgroundColor: '#FFFFFFFF',
        pointColor: '#000000FF',
        customColors: false,
        models: "Linear Regression",
        blinkFilter: true,
        leftEyeThreshold: 5,
        rightEyeThreshold: 5,
        index: 0,
        msPerCapture: 100,
        pattern: [],
        mockPattern: [],
        threshold: 200,
        calibrations: [],
        fromDashboard: false,
    },
    mutations: {
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
                state.mockPattern.push(newPatternLike)
            } else {
                const index = state.mockPattern.indexOf(newPatternLike);
                state.mockPattern.splice(index, 1);
            }
        },
        setMockPattern(state, newMockPattern) {
            state.mockPattern = newMockPattern
        },
        setBackgroundColor(state, newBackgroundColor) {
            state.backgroundColor = newBackgroundColor
        },
        setPointColor(state, newPointColor) {
            state.pointColor = newPointColor
        },
        setCustomColors(state, newCustomColors) {
            state.customColors = newCustomColors
        },
        setModels(state, newModels) {
            state.models = newModels
        },
        setBlinkFilter(state, newBlinkFilter) {
            state.blinkFilter = newBlinkFilter
        },
        setLeftThreshold(state, newLeftThreshold) {
            state.leftEyeThreshold = newLeftThreshold
        },
        setRightThreshold(state, newRightThreshold) {
            state.rightEyeThreshold = newRightThreshold
        },
        setIndex(state, newIndex) {
            state.index = newIndex
        },
        setMsPerCapture(state, newMsPerCapture) {
            state.msPerCapture = newMsPerCapture
        },
        setCalibrations(state, newCalibrations) {
            state.calibrations = newCalibrations
        },
        setFromDashboard(state, newFromDashboard) {
            state.fromDashboard = newFromDashboard
        },
        resetAll(state) {
            state.calibName = ''
            state.pointNumber = 8
            state.samplePerPoint = 90
            state.radius = 20
            state.offset = 100
            state.backgroundColor = '#FFFFFFFF'
            state.pointColor = '#000000FF'
            state.customColors = false
            state.models = "Linear Regression"
            state.blinkFilter = true
            state.leftEyeTreshold = 5
            state.rightEyeTreshold = 5
            state.index = 0
            state.msPerCapture = 100
            state.pattern = []
            state.mockPattern = []
            state.threshold = 200
            state.calibrations = []
            state.fromDashboard = false
        },
    },
    actions: {
        async saveCalib(context) {
            const state = context.state
            const db = firebase.firestore()
            const calibrationData = { ...state }
            delete calibrationData.calibrations
            try {
                const calibrationsCollection = db.collection('calibrations');
                await calibrationsCollection.add(calibrationData);
                console.log('Data successfully saved to calibrations collection!');
                context.dispatch('getAllCalibs')
            } catch (error) {
                console.error('Error saving data to calibrations collection:', error);
            }
        },
        async selectCalib({ commit }, calibData) {
            commit('setThreshold', calibData.threshold)
            commit('setCalibName', calibData.calibName)
            commit('setSamplePerPoint', calibData.samplePerPoint)
            commit('setRadius', calibData.radius)
            commit('setOffset', calibData.offset)
            commit('setPointNumber', calibData.pointNumber)
            commit('setPattern', calibData.pattern)
            commit('setMockPattern', calibData.mockPattern)
            commit('setBackgroundColor', calibData.backgroundColor)
            commit('setPointColor', calibData.pointColor)
            commit('setCustomColors', calibData.customColors)
            commit('setModels', calibData.models)
            commit('setBlinkFilter', calibData.blinkFilter)
            commit('setLeftThreshold', calibData.leftThreshold)
            commit('setRightThreshold', calibData.rightThreshold)
            commit('setIndex', calibData.index)
            commit('setMsPerCapture', calibData.msPerCapture)
            router.push('/postCalibration')
        },
        async getAllCalibs({ commit }) {
            try {
                const db = firebase.firestore();
                const calibrationsCollection = await db.collection('calibrations').get();

                const calibrations = [];
                calibrationsCollection.forEach(doc => {
                    var averageAccuracy = 0
                    var averagePrecision = 0
                    var data = doc.data()
                    data.pattern.forEach(element => {
                        averageAccuracy += Number(element.accuracy);
                        averagePrecision += Number(element.precision);
                    })
                    data.averageAccuracy = averageAccuracy / data.pattern.length
                    data.averagePrecision = averagePrecision / data.pattern.length
                    calibrations.push({
                        id: doc.id, model: doc.data().models, ...data
                    });
                });

                commit('setCalibrations', calibrations)
            } catch (error) {
                console.error('Error getting calibrations:', error);
                throw error;
            }
        },
        async deleteCalib({ dispatch }, calib) {
            try {
                const db = firebase.firestore();
                const calibrationsCollection = db.collection('calibrations');
                await calibrationsCollection.doc(calib.id).delete();
                dispatch('getAllCalibs')
            } catch (error) {
                console.error('Error deleting calibration:', error);
                return { success: false, message: 'Failed to delete calibration' };
            }
        },
        async sendData(context, data) {
            let formData = new FormData();
            formData.append(
                "file_name",
                JSON.stringify(context.state.calibName)
            )
            formData.append(
                "fixed_circle_iris_points",
                JSON.stringify(data.circleIrisPoints)
            );
            formData.append(
                "calib_circle_iris_points",
                JSON.stringify(data.calibPredictionPoints)
            );
            formData.append("screen_height",
                JSON.stringify(data.screenHeight)
            );
            formData.append("screen_width",
                JSON.stringify(data.screenWidth)
            );
            formData.append("k", JSON.stringify(data.k));
            formData.append("model", JSON.stringify(context.state.models));
            const res = await axios.post(`/api/session/calib_validation`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data
            // console.log(res);
        }
    },
}