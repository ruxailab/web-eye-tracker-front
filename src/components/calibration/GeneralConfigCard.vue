<!-- General Calibration Configuration Component
     Controls core settings for eye tracking calibration including timing, 
     sampling, and threshold parameters -->
     <template>
        <v-container>
          <v-col>
            <v-card outlined>
              <v-card-title>
                general configuration
              </v-card-title>
      
              <!-- Calibration Name Input Section -->
              <div class="custom-outline">
                calib name:
                <TextField 
                  :value="calibName" 
                  @input="updateCalibName" 
                />
              </div>
      
              <!-- Core Calibration Parameters Section -->
              <div class="custom-outline">
                <!-- Fixed at 8 points for calibration -->
                <Slider 
                  :value="pointNumber" 
                  :min="Number(8)" 
                  :max="Number(8)" 
                  label="Point Number"
                  @input="updatePointNumber" 
                />
                
                <!-- Fixed at 90 samples per calibration point -->
                <Slider 
                  :value="samplePerPoint" 
                  :min="Number(90)" 
                  :max="Number(90)" 
                  label="Sample Per Point" 
                  @input="updateSamplePerPoint" 
                />
                
                <!-- Capture timing control (fixed at 100ms) -->
                <Slider 
                  :value="msPerCapture" 
                  :min="Number(100)" 
                  :step="5" 
                  :max="Number(100)"
                  label="Milliseconds Per Point Capture" 
                  @input="updateMsPerCapture" 
                />
                
                <!-- Distance threshold for point validation -->
                <Slider 
                  :value="threshold" 
                  :min="Number(0)" 
                  :step="5" 
                  :max="Number(1000)"
                  label="Points Distance Threshold" 
                  @input="updateThreshold" 
                />
              </div>
      
              <!-- Additional Calibration Parameters -->
              <div class="custom-outline">
                <Radius />
                <Offset />
              </div>
            </v-card>
          </v-col>
        </v-container>
      </template>
      
      <script>
      import Slider from "@/components/general/Slider.vue";
      import TextField from "@/components/general/TextField.vue";
      import Radius from "@/components/calibration/Radius"
      import Offset from "@/components/calibration/Offset.vue";
      
      export default {
        components: {
          Radius,
          Offset,
          Slider,
          TextField,
        },
      
        // Computed properties retrieving values from Vuex store
        computed: {
          // Number of samples to collect per calibration point
          samplePerPoint() {
            return Number(this.$store.state.calibration.samplePerPoint);
          },
          // Total number of calibration points
          pointNumber() {
            return Number(this.$store.state.calibration.pointNumber);
          },
          // Calibration profile name
          calibName() {
            return this.$store.state.calibration.calibName
          },
          // Blink filter state
          blinkFilter() {
            return this.$store.state.calibration.blinkFilter
          },
          // Duration for each point capture
          msPerCapture() {
            return this.$store.state.calibration.msPerCapture
          },
          // Distance threshold for point validation
          threshold() {
            return this.$store.state.calibration.threshold
          },
        },
      
        methods: {
          // Updates distance threshold for point validation
          updateThreshold(value) {
            this.$store.commit('setThreshold', value);
          },
          // Updates number of samples per calibration point
          updateSamplePerPoint(value) {
            this.$store.commit('setSamplePerPoint', value);
          },
          // Updates total number of calibration points
          updatePointNumber(value) {
            this.$store.commit('setPointNumber', value);
          },
          // Updates calibration name with whitespace validation
          updateCalibName(value) {
            const trimmedValue = value.replace(/\s+/g, '');
            if (trimmedValue !== '') {
              this.$store.commit('setCalibName', trimmedValue);
            } else {
              console.log('Value contains only white spaces or is empty');
            }
          },
          // Updates duration for each point capture
          updateMsPerCapture(value) {
            this.$store.commit('setMsPerCapture', value);
          }
        },
      };
      </script>
      
      <style scoped>
      /* Section container styling */
      .custom-outline {
        border: 1px solid #000;
        padding: 10px;
        border-radius: 5px;
        margin: 10px;
      }
      </style>