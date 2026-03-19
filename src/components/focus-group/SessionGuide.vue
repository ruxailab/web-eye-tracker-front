<template>
  <div class="flex flex-col h-full bg-slate-900 border-r border-slate-700/50 shadow-2xl">
    <div class="p-6 pb-2">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Mission Script
        </h2>
        <v-chip x-small outlined color="purple lighten-3" class="font-mono opacity-70">
          {{ guide.length }} STAGES
        </v-chip>
      </div>
      <p class="text-[10px] text-slate-600 italic mb-4 leading-tight">
        Click a stage to sync your observations with the timeline.
      </p>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-6 space-y-3 custom-scrollbar">
      <transition-group name="stagger" tag="div" class="space-y-3">
        <div 
          v-for="(topic, index) in guide" 
          :key="topic.id || index"
          @click="selectTopic(topic.id)"
          :class="[
            'group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden',
            store.currentTopicId === topic.id 
              ? 'bg-purple-600/15 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30' 
              : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
          ]"
        >
          <div v-if="store.currentTopicId === topic.id" class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent animate-pulse-slow"></div>

          <div class="relative flex items-start gap-4 z-10">
            <div class="relative">
              <span :class="[
                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-300',
                store.currentTopicId === topic.id 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 rotate-3' 
                  : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
              ]">
                {{ (index + 1).toString().padStart(2, '0') }}
              </span>
              <div 
                v-if="getNoteCount(topic.id) > 0"
                class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center"
              >
                <v-icon x-small color="white" style="font-size: 6px;">mdi-check</v-icon>
              </div>
            </div>

            <div class="flex-grow">
              <p :class="[
                'text-sm transition-colors duration-300 leading-snug',
                store.currentTopicId === topic.id ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'
              ]">
                {{ topic.prompt }}
              </p>
              
              <div class="mt-2 flex items-center gap-2">
                <div class="h-1 flex-grow bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-purple-500/40 transition-all duration-500" 
                    :style="{ width: Math.min(getNoteCount(topic.id) * 20, 100) + '%' }"
                  ></div>
                </div>
                <span class="text-[9px] font-mono text-slate-600 uppercase">
                  {{ getNoteCount(topic.id) }} obs
                </span>
              </div>
            </div>
          </div>
          
          <div 
            v-if="store.currentTopicId === topic.id" 
            class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_#a855f7]"
          ></div>
        </div>
      </transition-group>

      <div v-if="guide.length === 0" class="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
        <v-icon color="slate-700" large>mdi-script-text-outline</v-icon>
        <p class="text-xs text-slate-600 mt-2">No discussion points loaded from setup.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFocusGroupStore } from '@/store/modules/focusGroup';

const store = useFocusGroupStore();
const props = defineProps({
  guide: { type: Array, required: true }
});

// Functional Addition: Calculate note density per topic for progress bars
const getNoteCount = (topicId) => {
  return store.observations.filter(o => o.topicId === topicId).length;
};

const selectTopic = (id) => {
  store.setTopic(id);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.animate-pulse-slow {
  animation: pulse-slow 4s infinite ease-in-out;
}

/* Staggered Entry Animation */
.stagger-enter-active {
  transition: all 0.5s ease;
}
.stagger-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.shadow-purple {
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}

.bg-purple-600\/15 {
  background-color: rgba(147, 51, 234, 0.15);
}
</style>