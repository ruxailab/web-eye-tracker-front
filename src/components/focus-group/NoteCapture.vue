<template>
  <div class="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
    
    <div class="px-4 py-3 bg-slate-800 border-b border-slate-700 d-flex justify-space-between align-center">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Live Observation Feed
      </span>
      <span class="text-[10px] text-slate-500 font-mono">{{ store.observations.length }} entries captured</span>
    </div>

    <div 
      ref="scrollContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-grid-slate-800"
    >
      <div v-if="store.observations.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 italic text-slate-400">
        <v-icon x-large color="grey lighten-1">mdi-text-box-search-outline</v-icon>
        <p class="mt-2 text-sm">Awaiting first research observation...</p>
      </div>

      <transition-group name="list" tag="div" class="space-y-3">
        <div 
          v-for="(obs, index) in store.observations" 
          :key="obs.id" 
          :class="['p-4 rounded-lg border-l-4 transition-all duration-300 hover:scale-[1.01]', getTagClass(obs.type)]"
        >
          <div class="flex justify-between items-start mb-1">
            <span class="text-[10px] font-bold uppercase text-slate-500 tracking-tighter">
              Topic: {{ getTopicLabel(obs.topicId) }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(obs.timestamp) }}</span>
              <button @click="removeNote(index)" class="text-slate-600 hover:text-red-400 transition-colors">
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-slate-200">{{ obs.content }}</p>
        </div>
      </transition-group>
    </div>

    <div class="p-4 bg-slate-800 border-t border-slate-700 shadow-inner">
      <div class="relative group">
        <textarea 
          ref="inputBox"
          v-model="currentNote"
          @keydown.enter.exact.prevent="submitNote('neutral')"
          @keydown.alt.49.prevent="submitNote('consensus')"
          @keydown.alt.50.prevent="submitNote('divergence')"
          @keydown.alt.51.prevent="submitNote('insight')"
          placeholder="Capture insight... (Enter to save)"
          class="w-full bg-slate-900 border border-slate-700 p-4 pb-12 rounded-xl text-slate-100 placeholder-slate-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all resize-none"
          rows="3"
        ></textarea>
        
        <div class="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <PulseButtons @trigger-tag="submitNote" />
          
          <div class="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span class="hidden md:inline">ALT + 1/2/3 to Tag</span>
            <v-btn fab x-small color="purple darken-2" depressed @click="submitNote('neutral')" :disabled="!currentNote.trim()">
              <v-icon small color="white">mdi-send</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useFocusGroupStore } from '@/store/modules/focusGroup';
import PulseButtons from './PulseButtons.vue';

const store = useFocusGroupStore();
const currentNote = ref('');
const scrollContainer = ref(null);
const inputBox = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

const submitNote = (type) => {
  if (!currentNote.value.trim()) return;
  
  store.addObservation({
    content: currentNote.value,
    type: type,
    timestamp: new Date().toISOString(),
    // Logic: Connect note to the currently active topic in the store
    topicId: store.currentTopicId 
  });
  
  currentNote.value = '';
  scrollToBottom();
  focusInput();
};

const removeNote = (index) => {
  store.observations.splice(index, 1);
};

const focusInput = () => {
  nextTick(() => {
    if (inputBox.value) inputBox.value.focus();
  });
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const getTopicLabel = (id) => {
  return id !== null && id !== undefined ? `#${id + 1}` : 'Gen';
};

const getTagClass = (type) => {
  const classes = {
    consensus: 'border-emerald-500 bg-emerald-900/10 text-emerald-100',
    divergence: 'border-amber-500 bg-amber-900/10 text-amber-100',
    insight: 'border-purple-500 bg-purple-900/10 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.05)]',
    neutral: 'border-slate-600 bg-slate-800/50 text-slate-300'
  };
  return classes[type] || classes.neutral;
};

onMounted(() => {
  focusInput();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.95); }

.bg-grid-slate-800 {
  background-image: radial-gradient(#1e293b 1px, transparent 0);
  background-size: 20px 20px;
}
</style>