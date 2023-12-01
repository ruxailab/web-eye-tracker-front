import api from "@/services/session.js";

export default {
    state: {
        sending: false,
        error: null,
        responseStatus: {
            message: 'Sending the data to our server...',
            value: 0
        },
        sessions: null,
        currentSession: null,
        currentCalibPoints: []
    },
    mutations: {
        setSending: (state,payload) => state.sending = payload,
        setError: (state,payload) => state.error = payload,
        setResponseStatus: (state,payload) => state.responseStatus = payload,
        setSessions: (state, payload) => state.sessions = payload,
        setCurrentSession: (state, payload) => state.currentSession = payload,
        setCurrentCalib: (state, payload) => state.currentCalibPoints = payload
    },
    actions: {
        checkResponseStatus: async ({commit}) => {
            try{
                const res = await api.checkResponseStatus()
                commit('setResponseStatus', {message: res.msg, value: res.value})
            }
            catch(e) {
                commit('setError', e)
            }
            
        },
        getSessionById: async ({commit}, payload) => {
            try {
                const { data } = await api.getSessionById(payload)
                commit('setCurrentSession', data)
            }
            catch (e) {
                commit('setError', e)
            }
        },
    }
}