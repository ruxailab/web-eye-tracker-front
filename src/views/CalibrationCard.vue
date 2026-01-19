<template>
  <div id="box">
    <Toolbar />
    <v-container class="mt-12">
      <v-row justify="center" align="start">
        <v-col cols="12" lg="6" md="8">
          <v-card outlined class="calibration-card">
            <v-card-title class="headline-title">
              <v-icon left size="32" color="green">mdi-eye-settings-outline</v-icon>
              Eye Tracking Calibration
            </v-card-title>
            
            <v-card-text class="px-6 py-4">
              <div class="info-section">
                <div class="info-item">
                  <v-icon color="green" class="mr-3">mdi-information-outline</v-icon>
                  <div>
                    <h3 class="section-subtitle">How It Works</h3>
                    <p class="section-text">
                      The calibration associates your eye iris position with specific points on the screen,
                      creating a personalized eye-tracking model.
                    </p>
                  </div>
                </div>

                <v-divider class="my-4"></v-divider>

                <div class="info-item">
                  <v-icon color="blue" class="mr-3">mdi-camera-outline</v-icon>
                  <div>
                    <h3 class="section-subtitle">Before You Start</h3>
                    <p class="section-text">
                      • Ensure your camera is on and both eyes are clearly visible<br>
                      • Find a comfortable position and stay still during calibration<br>
                      • Make sure you have good lighting on your face
                    </p>
                  </div>
                </div>

                <v-divider class="my-4"></v-divider>

                <div class="info-item">
                  <v-icon color="orange" class="mr-3">mdi-eye-outline</v-icon>
                  <div>
                    <h3 class="section-subtitle">During Calibration</h3>
                    <p class="section-text">
                      Follow each point with your eyes, keeping your head still. 
                      Press <kbd>S</kbd> when you're ready to record each point. 
                      Blinking is fine, but try not to look away.
                    </p>
                  </div>
                </div>
              </div>
            </v-card-text>
            
            <v-card-actions class="px-6 pb-6 pt-2">
              <v-btn 
                block 
                x-large
                color="green" 
                dark
                @click="goToCameraConfig()"
                class="start-button"
              >
                <v-icon left>mdi-play-circle-outline</v-icon>
                Start Calibration
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="errorDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="error">mdi-alert-circle</v-icon>
          Error
        </v-card-title>
        <v-card-text class="pt-4">{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="errorDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.v-dialog__content {
  align-items: center !important;
  justify-content: center !important;
  width: 100vw !important;
}

.v-dialog {
  margin: 0 !important;
}

.calibration-card {
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
}

.headline-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  padding: 24px 24px 16px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.info-section {
  padding: 16px 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.section-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-text {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 0;
}

.start-button {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  padding: 28px 0 !important;
}

kbd {
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  font-family: monospace;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
</style>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import axios from "axios";

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      errorDialog: false,
      errorMessage: "",
    };
  },
  methods: {
    async goToCameraConfig() {
      try {
        const res = await axios.get("/api/session/health");

        if (res.status === 200 && res.data.status === "ok") {
          this.$router.push("/calibration/configuration");
        } else {
          this.errorMessage = "API is not ready. Please try again later.";
          this.errorDialog = true;
        }
      } catch (err) {
        this.errorMessage = "Cannot reach backend. Is the API running?";
        this.errorDialog = true;
      }
    },
  },
};
</script>
