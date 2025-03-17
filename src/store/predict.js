/**
 * Vuex store module for handling prediction-related state and actions.
 * 
 * @module store/predict
 */

export default {
    state: {
        /**
         * Holds training data with calibration.
         * @type {Object|null}
         */
        fixedTrainData: null,

        /**
         * Holds data to be used for prediction.
         * @type {Object|null}
         */
        predictTrainData: null,

        /**
         * Holds the prediction result.
         * @type {Object|null}
         */
        prediction: null,

        /**
         * Holds the trained TensorFlow model.
         * @type {Object|null}
         */
        model: null
    },
    mutations: {
        /**
         * Mutation to save fixed training data into the state.
         * 
         * @param {Object} state - The current state of the store.
         * @param {Object} fixedTrainData - The fixed training data to be saved.
         */
        saveFixed(state, fixedTrainData) {
            state.fixedTrainData = fixedTrainData;
        },
        
        /**
         * Mutation to save prediction data into the state.
         * 
         * @param {Object} state - The current state of the store.
         * @param {Object} predictTrainData - The prediction data to be saved.
         */
        savePredict(state, predictTrainData) {
            state.predictTrainData = predictTrainData;
        },
        
        /**
         * Mutation to save the trained TensorFlow model into the state.
         * 
         * @param {Object} state - The current state of the store.
         * @param {Object} model - The trained TensorFlow model to be saved.
         */
        saveModel(state, model) {
            state.model = model;
        },
        
        /**
         * Mutation to trigger prediction (currently logs state to console).
         * 
         * @param {Object} state - The current state of the store.
         */
        predictNow(state) {
            console.log(state);
        }
    },
    actions: {
        /**
         * Action to train a TensorFlow model using fixed training data.
         * 
         * @param {Object} context - The Vuex context object.
         * @param {Object} tf - The TensorFlow library.
         */
        async trainModel(context, tf) {
            let model;

            // Creating tensors for input features from fixed training data
            const rightX = tf.tensor2d(context.state.fixedTrainData.rightX, [context.state.fixedTrainData.rightX.length, 1]);
            const rightY = tf.tensor2d(context.state.fixedTrainData.rightY, [context.state.fixedTrainData.rightY.length, 1]);
            const leftX = tf.tensor2d(context.state.fixedTrainData.leftX, [context.state.fixedTrainData.leftX.length, 1]);
            const leftY = tf.tensor2d(context.state.fixedTrainData.leftY, [context.state.fixedTrainData.leftY.length, 1]);

            // Combining tensors for the input (xs)
            const xs = tf.concat([rightX, rightY, leftX, leftY], 1);

            // Creating tensors for output features from fixed training data
            const calibX = tf.tensor2d(context.state.fixedTrainData.calibX, [context.state.fixedTrainData.calibX.length, 1]);
            const calibY = tf.tensor2d(context.state.fixedTrainData.calibY, [context.state.fixedTrainData.calibY.length, 1]);

            // Combining tensors for the output (ys)
            const ys = tf.concat([calibX, calibY], 1);

            // Defining a simple sequential model
            model = tf.sequential();
            model.add(tf.layers.dense({ units: 2, inputShape: [4] }));

            // Compiling the model with SGD optimizer and mean squared error loss
            model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

            // Training the model using the input and output tensors
            await model.fit(xs, ys);

            // Disposing of tensors to free memory
            xs.dispose();
            ys.dispose();

            // Saving the trained model in the state
            context.commit('saveModel', model);
        },

        /**
         * Action to extract iris position and calibration points from data.
         * 
         * @param {Object} context - The Vuex context object.
         * @param {Object} data - The data containing iris positions and calibration points.
         * @param {boolean} data.hasCalib - Flag indicating if calibration data exists.
         * @param {Array} data.extract - Array of data points to extract values from.
         */
        extractXYValues(context, data) {
            const hasCalib = data.hasCalib; // Flag indicating if calibration data exists
            const extract = data.extract; // Array of data points to extract values from
            
            let receiver = {};
            // Initializing receiver object based on the presence of calibration data
            if (hasCalib) {
                receiver = {
                    rightX: [],
                    rightY: [],
                    leftX: [],
                    leftY: [],
                    calibX: [],
                    calibY: [],
                };
            } else {
                receiver = {
                    rightX: [],
                    rightY: [],
                    leftX: [],
                    leftY: [],
                };
            }

            // Iterating over data points and populating the receiver object
            for (let i = 0; i < extract.length; i++) {
                const dataPoint = extract[i];
                receiver.rightX.push(dataPoint.right_iris_x);
                receiver.rightY.push(dataPoint.right_iris_y);
                receiver.leftX.push(dataPoint.left_iris_x);
                receiver.leftY.push(dataPoint.left_iris_y);

                // Adding calibration points if calibration data is present
                if (hasCalib) {
                    receiver.calibX.push(dataPoint.point_x);
                    receiver.calibY.push(dataPoint.point_y);
                }
            }

            // Committing the extracted data to the appropriate state property
            hasCalib ? context.commit('saveFixed', receiver) : context.commit('savePredict', receiver);
        },
    }
}