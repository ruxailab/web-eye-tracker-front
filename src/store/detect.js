/**
 * Vuex store module for detection-related state management.
 *
 * @module detect
 */

export default {
    state: {
        /**
         * The model used for detection.
         * @type {Object|null}
         */
        model: null,

        /**
         * Array of predictions made by the model.
         * @type {Array}
         */
        predictions: [],

        /**
         * Flag indicating whether the model is loaded.
         * @type {boolean}
         */
        loaded: false,
    },
    mutations: {
        /**
         * Mutation to set the detection model.
         * 
         * @param {Object} state - The current state of the module.
         * @param {Object} newModel - The new model to be set.
         */
        setModel(state, newModel) {
            state.model = newModel
        },

        /**
         * Mutation to set the loaded flag.
         * 
         * @param {Object} state - The current state of the module.
         * @param {boolean} newLoaded - The new loaded flag value.
         */
        setLoaded(state, newLoaded) {
            state.loaded = newLoaded
        },

        /**
         * Mutation to set the predictions array.
         * 
         * @param {Object} state - The current state of the module.
         * @param {Array} newPredictions - The new predictions array.
         */
        setPredictions(state, newPredictions) {
            state.predictions = newPredictions
        }
    },
}