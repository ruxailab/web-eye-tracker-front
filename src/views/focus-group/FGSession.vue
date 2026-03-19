<template>
  <v-container class="dashboard-bg fill-height pa-0" fluid>
    <v-row no-gutters class="fill-height">
      
      <v-col cols="12" md="4" class="glass-pane border-right-glow d-flex flex-column h-screen">
        <div class="pa-6">
          <h2 class="text-overline purple--text text--lighten-2 mb-4">ACTIVE GUIDE</h2>
          <div class="guide-scroll-area">
            <v-scroll-y-transition group>
              <v-card 
                v-for="(topic, index) in guide" 
                :key="'topic-'+index"
                :class="['mb-4 guide-item', currentTopicIndex === index ? 'active-glow' : '']"
                @click="currentTopicIndex = index"
              >
                <div class="d-flex align-center pa-4">
                  <div :class="['index-circle mr-4', currentTopicIndex === index ? 'purple darken-1' : 'grey darken-3']">
                    {{ index + 1 }}
                  </div>
                  <div class="white--text font-weight-medium">{{ topic.prompt }}</div>
                </div>
              </v-card>
            </v-scroll-y-transition>
          </div>
        </div>

        <v-spacer></v-spacer>

        <div class="pa-6 border-top-glow">
          <v-btn 
            block 
            x-large 
            color="purple darken-2" 
            class="white--text glow-button"
            @click="goToAnalysis"
          >
            <v-icon left>mdi-chart-box-outline</v-icon>
            FINISH & ANALYZE
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column h-screen overflow-hidden">
        
        <div class="pa-4 px-6 d-flex justify-space-between align-center glass-header">
          <div class="d-flex align-center">
            <v-chip x-small color="red" class="pulse-dot mr-2">REC</v-chip>
            <h2 class="text-overline white--text mb-0">LIVE OBSERVATION FEED</h2>
          </div>
          <div class="timer-text px-4 py-1 rounded-lg">
            <v-icon small color="purple lighten-3" class="mr-2">mdi-clock-outline</v-icon>
            {{ sessionTimer }}
          </div>
        </div>

        <div class="flex-grow-1 overflow-y-auto pa-6 custom-scrollbar" ref="feed">
          <v-fade-transition group>
            <v-card 
              v-for="obs in observations" 
              :key="obs.id" 
              class="mb-4 observation-note"
              :class="obs.type"
            >
              <div class="d-flex justify-space-between text-caption grey--text pa-2 px-4">
                <span class="font-weight-bold uppercase">Topic: {{ getTopicName(obs.topicId) }}</span>
                <span>{{ formatTime(obs.timestamp) }}</span>
              </div>
              <v-divider dark class="mx-4 opacity-10"></v-divider>
              <div class="white--text pa-4 pt-2 text-body-1">{{ obs.content }}</div>
            </v-card>
          </v-fade-transition>
          
          <div v-if="observations.length === 0" class="text-center pa-12 grey--text opacity-50">
            <v-icon x-large class="mb-2">mdi-comment-text-multiple-outline</v-icon>
            <p>Ready for input. Use Alt + 1/2/3 for quick tagging.</p>
          </div>
        </div>

        <v-card class="glass-card ma-6 mt-0 pa-4 rounded-xl border-purple shadow-lg">
          <v-textarea
            ref="inputCursor"
            v-model="newNote"
            placeholder="Type observation here... (Alt+1: Cons, Alt+2: Div, Alt+3: Ins)"
            solo flat dark
            background-color="transparent"
            hide-details
            rows="2"
            class="capture-input"
            autofocus
            @keydown.alt.49.prevent="addNote('consensus')"
            @keydown.alt.50.prevent="outputTag('divergence')"
            @keydown.alt.51.prevent="addNote('insight')"
            @keydown.enter.exact.prevent="addNote('neutral')"
          ></v-textarea>
          
          <v-divider class="my-3 grey darken-3"></v-divider>

          <div class="d-flex align-center gap-3">
            <v-btn rounded color="success" class="tag-btn" @click="addNote('consensus')">
              <v-icon left>mdi-check-circle</v-icon> CONSENSUS
            </v-btn>
            
            <v-btn rounded color="amber darken-2" class="tag-btn" @click="addNote('divergence')">
              <v-icon left>mdi-fire</v-icon> DIVERGENCE
            </v-btn>
            
            <v-btn rounded color="purple lighten-1" class="tag-btn" @click="addNote('insight')">
              <v-icon left>mdi-lightbulb-on</v-icon> INSIGHT
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn fab small color="grey darken-3" @click="addNote('neutral')">
              <v-icon color="white">mdi-send</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useFocusGroupStore } from '@/store/modules/focusGroup';

export default {
  name: 'FGSession',
  data: () => ({
    newNote: '',
    currentTopicIndex: 0,
    guide: [],
    store: null,
    // Timer Logic
    startTime: null,
    elapsedTime: 0,
    timerId: null
  }),
  computed: {
    observations() { return this.store ? this.store.observations : []; },
    sessionTimer() {
      const hrs = Math.floor(this.elapsedTime / 3600).toString().padStart(2, '0');
      const mins = Math.floor((this.elapsedTime % 3600) / 60).toString().padStart(2, '0');
      const secs = (this.elapsedTime % 60).toString().padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
    }
  },
  created() {
    this.store = useFocusGroupStore();
    const sessionData = JSON.parse(localStorage.getItem('ruxailab_fg_prototype'));
    if (sessionData) {
      this.guide = sessionData.guide || [];
    }
    this.startTime = Date.now();
  },
  mounted() {
    // Start Recording Timer
    this.timerId = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
    
    // Set initial focus
    this.focusInput();
  },
  beforeDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  },
  methods: {
    addNote(type) {
      if (!this.newNote.trim()) return;
      
      this.store.addObservation({
        content: this.newNote,
        type: type,
        topicId: this.currentTopicIndex
      });

      this.newNote = '';
      
      // Return cursor focus to the textarea immediately
      this.focusInput();
      
      // Fix: Auto-Scroll Bug
      this.$nextTick(() => {
        const feed = this.$refs.feed;
        if (feed) feed.scrollTop = feed.scrollHeight;
      });
    },
    // The "Native Cursor" Fix
    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.inputCursor) {
          // Accessing the native textarea inside Vuetify's component wrapper
          const el = this.$refs.inputCursor.$el.querySelector('textarea');
          if (el) el.focus();
        }
      });
    },
    // Wrapper for Divergence specifically to ensure key binding works
    outputTag(type) {
      this.addNote(type);
    },
    getTopicName(id) {
      return this.guide[id] ? this.guide[id].prompt : 'General';
    },
    formatTime(ts) {
      return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
    goToAnalysis() {
      this.$router.push('/focus-group/analysis');
    }
  }
};
</script>

<style scoped>
.dashboard-bg { background: #0f172a; height: 100vh; overflow: hidden; }
.glass-pane { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(15px); }
.glass-header { background: rgba(15, 23, 42, 0.4); border-bottom: 1px solid rgba(168, 85, 247, 0.1); }
.border-right-glow { border-right: 1px solid rgba(168, 85, 247, 0.2); }
.border-top-glow { border-top: 1px solid rgba(168, 85, 247, 0.2); }
.h-screen { height: 100vh; }

/* Premium Timer Styling */
.timer-text { 
  font-family: 'Courier New', Courier, monospace; 
  background: rgba(168, 85, 247, 0.1); 
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #e0b0ff;
  font-weight: bold;
  font-size: 1.1rem;
}

.guide-item { 
  background: rgba(30, 41, 59, 0.5) !important; 
  border: 1px solid rgba(255,255,255,0.05) !important; 
  cursor: pointer; 
  transition: 0.3s; 
}
.active-glow { 
  border-color: #a855f7 !important; 
  background: rgba(168, 85, 247, 0.15) !important;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
}

.observation-note { 
  background: rgba(30, 41, 59, 0.8) !important; 
  border-left: 5px solid #64748b !important; 
}
.observation-note.consensus { border-left-color: #10b981 !important; }
.observation-note.divergence { border-left-color: #f59e0b !important; }
.observation-note.insight { border-left-color: #a855f7 !important; }

.tag-btn { font-size: 11px !important; font-weight: 800; color: white !important; }
.index-circle { 
  width: 28px; height: 28px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 12px; font-weight: bold; 
}

.border-purple { border: 1px solid rgba(168, 85, 247, 0.4) !important; }
.gap-3 { gap: 12px; }
.pulse-dot { animation: blink 1.5s infinite; }

@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.glow-button { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); transition: 0.3s; }
.glow-button:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(168, 85, 247, 0.6); }
</style>