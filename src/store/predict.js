export default {
    state: {
        fixedTrainData: [],
        predictTrainData: [],
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