<!-- Blink Filter Configuration Component
     Provides user interface for enabling/disabling blink detection
     and configuring associated threshold settings -->
     <template>
        <v-container>
          <v-col>
            <!-- Main configuration card -->
            <v-card outlined>
              <v-card-title>
                blink filter config:
              </v-card-title>
              
              <!-- Blink filter toggle section -->
              <div class="custom-outline">
                Control:
                <v-checkbox 
                  v-model="blinkFilter" 
                  label="Blink Filter" 
                  color="black"
                ></v-checkbox>
              </div>
              
              <!-- Conditional rendering of blink threshold configuration
                   Only visible when blink filter is enabled -->
              <div v-if="blinkFilter" class="custom-outline">
                <BlinkTreshold />
              </div>
            </v-card>
          </v-col>
        </v-container>
      </template>
      
      <script>
      import BlinkTreshold from './BlinkTreshold.vue'
      
      export default {
        components: {
          BlinkTreshold,
        },
        
        // Initial state of the blink filter
        data() {
          return {
            blinkFilter: true  // Enabled by default
          }
        },
        
        // Watch for changes in blink filter state
        watch: {
          blinkFilter(value) {
            this.updateBlinkFilter(value)
          },
        },
        
        methods: {
          // Updates blink filter state in Vuex store
          // @param {boolean} value - New filter state
          updateBlinkFilter(value) {
            this.$store.commit('setBlinkFilter', value)
          },
        },
      }
      </script>
      
      <style scoped>
      /* Custom border styling for configuration sections */
      .custom-outline {
        border: 1px solid #000;
        padding: 10px;
        border-radius: 5px;
        margin: 10px;
      }
      </style>