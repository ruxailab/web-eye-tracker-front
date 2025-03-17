<!-- Eye Calibration Component
     This component provides threshold adjustment controls for both eyes in the eye tracking system.
     It uses sliders to fine-tune the detection sensitivity for each eye independently. -->
     <template>
        <div>
          <!-- Left Eye Threshold Slider
               Range: 3-10 with 0.1 step increments
               Used to adjust sensitivity of left eye detection -->
          <Slider 
            :value="leftEyeTreshold" 
            :min="Number(3)" 
            :max="Number(10)" 
            :step="0.1" 
            label="left eye treshold"
            @input="updateLeftTreshold" 
          />
      
          <!-- Right Eye Threshold Slider
               Range: 3-10 with 0.1 step increments
               Used to adjust sensitivity of right eye detection -->
          <Slider 
            :value="rightEyeTreshold" 
            :min="Number(3)" 
            :max="Number(10)" 
            :step="0.1" 
            label="right eye treshold"
            @input="updateRightTreshold" 
          />
        </div>
      </template>
      
      <script>
      import Slider from "@/components/general/Slider.vue";
      
      export default {
        components: {
          Slider,
        },
        
        computed: {
          // Retrieves left eye threshold value from Vuex store
          // Returns as number for precise calibration
          leftEyeThreshold() {
            return Number(this.$store.state.calibration.leftEyeTreshold)
          },
          
          // Retrieves right eye threshold value from Vuex store
          // Returns as number for precise calibration
          rightEyeThreshold() {
            return Number(this.$store.state.calibration.rightEyeTreshold)
          },
        },
        
        methods: {
          // Updates left eye threshold in Vuex store
          // @param {number} value - New threshold value
          updateLeftThreshold(value) {
            this.$store.commit('setLeftTreshold', value);
          },
          
          // Updates right eye threshold in Vuex store
          // @param {number} value - New threshold value
          updateRightThreshold(value) {
            this.$store.commit('setRightTreshold', value);
          },
        },
      }
      </script>