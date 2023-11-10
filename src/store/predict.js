export default {
    state: {
        fixedTrainData: [],
        predictTrainData: [],
        prediction: null,
    },
    mutations: {
        saveFixed(state, fixedTrainData) {
            state.fixedTrainData = fixedTrainData
            console.log(state.fixedTrainData)
        },
        savePredict(state, predictTrainData) {
            state.predictTrainData = predictTrainData
            console.log(state.predictTrainData)
        },
        predictNow(state) {
            console.log(state)
        }
    },
}