import axios from 'axios'

export default {
    saveCalibration: (data) => {
        let formData = new FormData()
        formData.append('webcamfile', data.webcamfile)
        formData.append('user_id', data.user_id)
        formData.append('mouse_events', data.mouse_events)

        return axios.post(`/api/calibrate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
}