import axios from 'axios'

export default {
    createSession: (data, webcamFile, screenCapFile) => {
        let formData = new FormData()
        formData.append('webcamfile', webcamFile)
        formData.append('screenfile', screenCapFile)
        formData.append('title', data.title)
        formData.append('description', data.description)
        formData.append('website_url', data.website_url)
        formData.append('user_id', data.user_id)

        return axios.post(`/api/session`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    getUserSessions: (userid) => {
        return axios.get(`/api/user/sessions?user_id=${userid}`)
    },
    checkResponseStatus: () => {
        return {msg: 'Sending Video...', value: 2}
    },
    getSessionById: (id) => {
        return axios.get(`/api/session?id=${id}`)
    }
}