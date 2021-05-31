import axios from 'axios'

export default {
    createSession: (webcamFile, screenCapFile) => {
        let formData = new FormData()
        formData.append('webcamfile', webcamFile)
        formData.append('screenfile', screenCapFile)

        return axios.post(`/api/session`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    checkResponseStatus: () => {
        return {msg: 'Hello', value: 2}
    }
}