export default {
    state: {
        model: null,
        predictions: [],
        loaded: false,
    },
    mutations: {
        setModel(state, newModel) {
            state.model = newModel
            console.log('model has updated')
        },
        setLoaded(state, newLoaded) {
            state.loaded = newLoaded
            console.log(`loaded has updated: ${state.loaded}`)
        },
        setPredictions(state, newPredictions){
            state.predictions = newPredictions
            console.log('predictions have been updated')
        }
    },
}