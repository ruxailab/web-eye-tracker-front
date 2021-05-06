import api from "@/services/session.js";

export default {
    state: {
        sending: false,
        error: null,
        responseStatus: {
            message: 'Sending the data to our server...',
            value: 0
        }
    },
    mutations: {
        setSending: (state,payload) => state.sending = payload,
        setError: (state,payload) => state.error = payload,
        setResponseStatus: (state,payload) => state.responseStatus = payload,
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
            
        }
    }
}