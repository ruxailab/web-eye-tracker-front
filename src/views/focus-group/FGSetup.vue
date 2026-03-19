<template>
  <v-container class="dashboard-bg fill-height pa-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9">
        
        <v-card class="glass-card pa-10 rounded-xl" dark>
          <div class="d-flex justify-space-between align-start mb-10">
            <div class="header-section">
              <div class="d-flex align-center mb-1">
                <v-icon color="purple lighten-2" class="mr-2">mdi-shield-edit-outline</v-icon>
                <span class="text-overline purple--text text--lighten-3">Configuration Terminal v1.0</span>
              </div>
              <h1 class="text-h3 font-weight-black neon-text">SESSION SETUP</h1>
              <p class="subtitle-1 grey--text text--lighten-1">Define your research parameters and discussion framework</p>
            </div>

            <v-menu offset-y transition="scroll-y-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-btn outlined color="purple lighten-2" rounded v-bind="attrs" v-on="on">
                  <v-icon left>mdi-layers-triple-outline</v-icon>
                  Load Template
                </v-btn>
              </template>
              <v-list dark color="grey darken-4" class="border-purple">
                <v-list-item v-for="(t, i) in templates" :key="i" @click="applyTemplate(t)">
                  <v-list-item-title>{{ t.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <v-row>
            <v-col cols="12" md="5">
              <div class="input-group">
                <div class="d-flex justify-space-between">
                  <label class="custom-label">SESSION IDENTITY</label>
                  <span class="text-caption grey--text">{{ session.title.length }}/50</span>
                </div>
                <v-text-field
                  v-model="session.title"
                  placeholder="e.g., Q1 Product Usability Study"
                  solo flat counter="50"
                  class="custom-input mt-2"
                  prepend-inner-icon="mdi-format-title"
                ></v-text-field>
              </div>

              <div class="input-group mt-6">
                <label class="custom-label">RESEARCH OBJECTIVES</label>
                <v-textarea
                  v-model="session.objective"
                  placeholder="Outline the core hypothesis or goals of this focus group..."
                  solo flat rows="5"
                  class="custom-input mt-2"
                  prepend-inner-icon="mdi-target"
                ></v-textarea>
              </div>

              <v-card color="rgba(168, 85, 247, 0.05)" class="mt-8 pa-4 border-purple dashed">
                <div class="text-caption grey--text mb-2">SYSTEM READINESS</div>
                <div class="d-flex align-center mb-1">
                  <v-icon small :color="session.title ? 'success' : 'grey'">mdi-check-circle</v-icon>
                  <span class="ml-2 text-body-2">Session Title defined</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon small :color="guide.length >= 2 ? 'success' : 'grey'">mdi-check-circle</v-icon>
                  <span class="ml-2 text-body-2">{{ guide.length }} Discussion prompts ready</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="7" class="border-left-glow pl-md-8">
              <div class="d-flex justify-space-between align-center mb-4">
                <label class="custom-label">DISCUSSION GUIDE BUILDER</label>
                <div class="d-flex align-center">
                  <v-btn text x-small color="grey" class="mr-2" @click="clearGuide">Clear All</v-btn>
                  <v-btn fab x-small color="purple lighten-1" @click="addPrompt" class="pulse-btn shadow-purple">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="guide-scroll-container">
                <v-scroll-x-transition group>
                  <div v-for="(item, index) in guide" :key="'prompt-' + index" class="d-flex align-center mb-4">
                    <div class="step-number mr-3">{{ index + 1 }}</div>
                    <v-text-field
                      v-model="item.prompt"
                      :placeholder="'Introduce topic ' + (index + 1) + '...'"
                      solo flat dense hide-details
                      class="custom-input-small flex-grow-1"
                    ></v-text-field>
                    <v-btn icon color="red lighten-3" small class="ml-2" @click="removePrompt(index)" v-if="guide.length > 1">
                      <v-icon small>mdi-delete-outline</v-icon>
                    </v-btn>
                  </div>
                </v-scroll-x-transition>
                
                <div v-if="guide.length === 0" class="text-center pa-10 border-purple dashed rounded-lg">
                  <p class="grey--text mb-0">No discussion prompts. Click the + button to begin.</p>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-card-actions class="mt-12 pt-6 border-top-glow">
            <v-btn text color="grey lighten-1" @click="resetForm">
              RESET ALL
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              x-large
              rounded
              :disabled="!isFormValid"
              :class="['launch-btn px-12', isFormValid ? 'active' : '']"
              @click="startSession"
            >
              DEPLOY MODULE
              <v-icon right>mdi-fire</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { focusGroupService } from '@/services/focusGroupService';

export default {
  name: 'FGSetup',
  data: () => ({
    session: { title: '', objective: '' },
    guide: [{ prompt: '' }],
    templates: [
      { 
        name: 'User Experience Audit', 
        obj: 'Evaluating ease of use, navigation clarity, and visual appeal.',
        steps: ['Initial thoughts on landing', 'Navigation task completion', 'Feature satisfaction', 'Final recommendations']
      },
      { 
        name: 'Brand Identity Feedback', 
        obj: 'Gathering emotional responses to logo, colors, and tone of voice.',
        steps: ['Brand adjectives', 'Visual association', 'Competitor comparison', 'Tone of voice review']
      }
    ]
  }),
  computed: {
    isFormValid() {
      return this.session.title.length > 0 && this.guide.some(g => g.prompt.length > 0);
    }
  },
  methods: {
    addPrompt() {
      this.guide.push({ prompt: '' });
    },
    removePrompt(index) {
      this.guide.splice(index, 1);
    },
    clearGuide() {
      this.guide = [];
    },
    resetForm() {
      if(confirm('Are you sure you want to clear all inputs?')) {
        this.session = { title: '', objective: '' };
        this.guide = [{ prompt: '' }];
      }
    },
    applyTemplate(template) {
      this.session.title = template.name;
      this.session.objective = template.obj;
      this.guide = template.steps.map(s => ({ prompt: s }));
    },
    startSession() {
      const data = { 
        session: this.session, 
        guide: this.guide.filter(g => g.prompt.trim() !== ''), 
        observations: [],
        startedAt: new Date().toISOString()
      };
      focusGroupService.saveSession(data);
      this.$router.push('/focus-group/session');
    }
  }
};
</script>

<style scoped>
.dashboard-bg {
  background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
}

.glass-card {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8) !important;
}

.neon-text {
  color: #fff;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.4);
  letter-spacing: 2px;
}

.custom-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1.5px;
}

.custom-input >>> .v-input__slot, 
.custom-input-small >>> .v-input__slot {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid #334155 !important;
  transition: all 0.3s ease;
}

.custom-input >>> .v-input__slot:focus-within {
  border-color: #a855f7 !important;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}

.launch-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.3) !important;
  font-weight: 900;
  transition: all 0.3s;
}

.launch-btn.active {
  background: linear-gradient(45deg, #7c3aed, #db2777) !important;
  color: white !important;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
}

.launch-btn.active:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 0 30px rgba(219, 39, 119, 0.6);
}

.step-number {
  background: #a855f7;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.border-left-glow {
  border-left: 1px solid rgba(168, 85, 247, 0.1);
}

.border-top-glow {
  border-top: 1px solid rgba(168, 85, 247, 0.1);
}

.border-purple.dashed {
  border: 1px dashed rgba(168, 85, 247, 0.4) !important;
}

.guide-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.guide-scroll-container::-webkit-scrollbar {
  width: 5px;
}
.guide-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.2);
  border-radius: 10px;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}
.pulse-btn {
  animation: pulse 2s infinite;
}
</style>