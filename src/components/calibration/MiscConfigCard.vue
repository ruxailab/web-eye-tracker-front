<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    Miscellaneous Configuration
                </v-card-title>
                <div class="custom-outline">
                    <v-checkbox v-model="customColors" label="Use Custom Colors" color="green"></v-checkbox>
                    <p class="help-text">Customize calibration point and background colors</p>
                </div>
                <transition name="slide-fade">
                    <div v-if="customColors">
                        <div class="custom-outline">
                            <div class="color-label">Background Color:</div>
                            <v-color-picker v-model="backgroundColor" hide-inputs></v-color-picker>
                        </div>
                        <div class="custom-outline">
                            <div class="color-label">Point Color:</div>
                            <v-color-picker v-model="pointColor" hide-inputs></v-color-picker>
                        </div>
                    </div>
                </transition>
                <div class="custom-outline">
                    <div class="config-label">Model Selection:</div>
                    <v-select v-model="selectedModel" :items="modelOptions" outlined clearable placeholder="Select Model"></v-select>
                    <p class="help-text">Choose the regression model for eye tracking predictions</p>
                </div>
                <div class="custom-outline note-box">
                    <v-icon small color="info" class="mr-2">mdi-information</v-icon>
                    <span class="note-text">
                        <strong>Note:</strong> The default model is Linear Regression. 
                        Some models may take longer to train. Please be patient during processing.
                    </span>
                </div>
            </v-card>
        </v-col>
    </v-container>
</template>
  
<script>
export default {
    data() {
        return {
            backgroundColor: '#FFFFFFFF',
            pointColor: '#000000FF',
            customColors: false,
            selectedModel: 'Linear Regression',
            modelOptions: ['Linear Regression', 'Ridge Regression', 'Lasso Regression', 'Elastic Net', 'Bayesian Ridge', 'SGD Regressor', 'Support Vector Regressor']
        }
    },
    watch: {
        backgroundColor(value) {
            this.updateBackgroundColor(value)
        },
        pointColor(value) {
            this.updatePointColor(value)
        },
        customColors(value) {
            this.updateCustomColors(value)
        },
        selectedModel(value){
            this.updateModels(value)
        }
    },
    methods: {
        updateBackgroundColor(value) {
            this.$store.commit('setBackgroundColor', value);
        },
        updatePointColor(value) {
            this.$store.commit('setPointColor', value);
        },
        updateCustomColors(value) {
            this.$store.commit('setCustomColors', value);
        },
        updateModels(value){
            this.$store.commit('setModels', value);
        }
    }
}
</script>

<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}

.config-label, .color-label {
    font-weight: 600;
    font-size: 15px;
    color: #2c3e50;
    margin-bottom: 8px;
}

.help-text {
    font-size: 12px;
    color: #666;
    margin: -8px 0 0 0;
    font-style: italic;
}

.note-box {
    background: #e3f2fd;
    border-color: #2196f3;
    display: flex;
    align-items: flex-start;
}

.note-text {
    font-size: 13px;
    color: #555;
    line-height: 1.5;
}

/* Slide fade transition */
.slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>