import axios from 'axios';
export default {
    state: {
        pointNumber: 5,
        samplePerPoint: 10,
        radius: 20,
        offset: 50,
    },
    mutations: {
        setSamplePerPoint(state, value) {
            state.samplePerPoint = value;
        },
        setRadius(state, value) {
            state.radius = value;
        },
        setOffset(state, value) {
            state.offset = value;
        },
        setPointNumber(state, value) {
            state.pointNumber = value
        }
    },
    actions: {
        async sendData(context, data) {
            let formData = new FormData();
            formData.append(
                "fixed_circle_iris_points",
                JSON.stringify(data.circleIrisPoints)
            );
            formData.append(
                "calib_circle_iris_points",
                JSON.stringify(data.calibPredictionPoints)
            );
            const res = await axios.post(`/api/session/calib_validation`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(res);
        }
    }
}