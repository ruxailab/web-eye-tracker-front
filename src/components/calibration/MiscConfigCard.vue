<!-- Miscellaneous Configuration Component
     Handles customization options including colors and regression model selection
     for the eye tracking calibration process -->
     <template>
        <v-container>
          <v-col>
            <v-card outlined>
              <v-card-title>
                miscelaneous configuration
              </v-card-title>
      
              <!-- Custom Colors Toggle Section -->
              <div class="custom-outline">
                Control:
                <v-checkbox 
                  v-model="customColors" 
                  label="Use Custom Colors" 
                  color="black"
                ></v-checkbox>
              </div>
      
              <!-- Color Picker Section - Conditionally rendered -->
              <div v-if="customColors">
                <!-- Background Color Selection -->
                <div class="custom-outline">
                  Background Color:
                  <v-color-picker 
                    v-model="backgroundColor" 
                    hide-inputs
                  ></v-color-picker>
                </div>
                
                <!-- Point Color Selection -->
                <div class="custom-outline">
                  Point Color:
                  <v-color-picker 
                    v-model="pointColor" 
                    hide-inputs
                  ></v-color-picker>
                </div>
              </div>
      
              <!-- Regression Model Selection -->
              <div class="custom-outline">
                Model Selection:
                <v-select 
                  v-model="models" 
                  :items="models" 
                  outlined 
                  clearable 
                  placeholder="Select Model"
                ></v-select>
              </div>
      
              <!-- Informational Note -->
              <div class="custom-outline">
                <b>Note:</b> The selected model will be used for the calibration process. 
                The default model is Linear Regression. Some models may take longer to 
                train than others. So please be patient.
              </div>
            </v-card>
          </v-col>
        </v-container>
      </template>
      
      <script>
      export default {
        // Component state management
        data() {
          return {
            backgroundColor: '#FFFFFFFF',  // Default white background
            pointColor: '#000000FF',       // Default black points
            customColors: false,           // Custom colors disabled by default
            models: [                      // Available regression models
              'Linear Regression',
              'Ridge Regression', 
              'Lasso Regression', 
              'Elastic Net', 
              'Bayesian Ridge', 
              'SGD Regressor', 
              'Support Vector Regressor'
            ]
          }
        },
      
        // Watch for changes in configuration values
        watch: {
          // Update background color in store when changed
          backgroundColor(value) {
            this.updateBackgroundColor(value)
          },
          // Update point color in store when changed
          pointColor(value) {
            this.updatePointColor(value)
          },
          // Update custom colors toggle in store
          customColors(value) {
            this.updateCustomColors(value)
          },
          // Update selected model in store
          models(value) {
            this.updateModels(value)
          }
        },
      
        methods: {
          // Updates background color in Vuex store
          updateBackgroundColor(value) {
            this.$store.commit('setBackgroundColor', value);
          },
          // Updates calibration point color in Vuex store
          updatePointColor(value) {
            this.$store.commit('setPointColor', value);
          },
          // Updates custom colors toggle state in Vuex store
          updateCustomColors(value) {
            this.$store.commit('setCustomColors', value);
          },
          // Updates selected regression model in Vuex store
          updateModels(value) {
            this.$store.commit('setModels', value);
          }
        }
      }
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