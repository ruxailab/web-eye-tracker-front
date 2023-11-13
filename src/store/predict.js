export default {
    state: {
        fixedTrainData: null,
        predictTrainData: null,
        prediction: null,
    },
    mutations: {
        saveFixed(state, fixedTrainData) {
            state.fixedTrainData = fixedTrainData
        },
        savePredict(state, predictTrainData) {
            state.predictTrainData = predictTrainData
        },
        predictNow(state) {
            console.log(state)
        }
    },
}