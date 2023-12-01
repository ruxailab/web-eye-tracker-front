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
        formData.append('iris_points', JSON.stringify(data.iris_points))
        formData.append('calib_points', JSON.stringify(data.calib_points))

        return axios.post(`/api/session`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    checkResponseStatus: () => {
        return {msg: 'Sending Video...', value: 2}
    },
    getSessionById: (id) => {
        return axios.get(`/api/session?id=${id}`)
    },
    deleteSession: (id) => {
        return axios.delete(`/api/session?id=${id}`)
    },
    getSessionResults: (id) => {
        return axios.get(`/api/session/results?id=${id}`)
    },
    getSessionScreenRecord: (id) => {
        return axios.get(`/api/session/results/record?id=${id}`, {
            responseType: 'blob',
        })
    }
}