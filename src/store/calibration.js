import axios from 'axios';
export default {
    state: {
        calibName: '',
        pointNumber: 5,
        samplePerPoint: 10,
        radius: 20,
        offset: 50,
        backgroundColor: '#FFFFFFFF',
        pointColor: '#000000FF',
        customColors: false,
        blinkFilter: true,
        leftEyeTreshold: 5,
        rightEyeTreshold: 5,
        index: 0,
    },
    mutations: {
        setCalibName(state, newCalibName) {
            state.calibName = newCalibName;
        },
        setSamplePerPoint(state, newSamplePerPoint) {
            state.samplePerPoint = newSamplePerPoint;
        },
        setRadius(state, newRadius) {
            state.radius = newRadius;
        },
        setOffset(state, newOffset) {
            state.offset = newOffset;
        },
        setPointNumber(state, newPointNumber) {
            state.pointNumber = newPointNumber;
        },
        setPattern(state, newPattern) {
            state.pattern = newPattern;
        },
        setBackgroundColor(state, newBackgroundColor) {
            state.backgroundColor = newBackgroundColor
        },
        setPointColor(state, newPointColor) {
            state.pointColor = newPointColor
        },
        setCustomColors(state, newCustomColors) {
            state.customColors = newCustomColors
        },
        setBlinkFilter(state, newBlinkFilter) {
            state.blinkFilter = newBlinkFilter
        },
        setLeftTreshold(state, newLeftTreshold) {
            state.leftEyeTreshold = newLeftTreshold
        },
        setRightTreshold(state, newRightTreshold) {
            state.rightEyeTreshold = newRightTreshold
        },
        setIndex(state, newIndex) {
            state.index = newIndex
        },
    },
    actions: {
        async sendData(context, data) {
            let formData = new FormData();
            formData.append(
                "file_name",
                JSON.stringify(context.state.calibName)
            )
            formData.append(
                "fixed_circle_iris_points",
                JSON.stringify(data.circleIrisPoints)
            );
            formData.append(
                "calib_circle_iris_points",
                JSON.stringify(data.calibPredictionPoints)
            );
            formData.append("screen_height",
                JSON.stringify(data.screenHeight)
            );
            formData.append("screen_width",
                JSON.stringify(data.screenWidth)
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