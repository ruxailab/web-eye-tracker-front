<template>
  <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-md">
    <button 
      @click="emitTag('consensus')" 
      class="btn-pulse group bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600 hover:border-emerald-400"
      title="Agreement between participants [Alt+1]"
    >
      <div class="flex items-center gap-2">
        <v-icon x-small color="emerald lighten-3" class="group-hover:white--text">mdi-check-circle</v-icon>
        <span class="text-xs uppercase tracking-wider text-emerald-400 group-hover:text-white">Consensus</span>
      </div>
      <span class="kb-hint">1</span>
    </button>

    <button 
      @click="emitTag('divergence')" 
      class="btn-pulse group bg-amber-600/20 border border-amber-500/50 hover:bg-amber-600 hover:border-amber-400"
      title="Conflict or different opinions [Alt+2]"
    >
      <div class="flex items-center gap-2">
        <v-icon x-small color="amber lighten-3" class="group-hover:white--text">mdi-fire</v-icon>
        <span class="text-xs uppercase tracking-wider text-amber-400 group-hover:text-white">Divergence</span>
      </div>
      <span class="kb-hint">2</span>
    </button>

    <button 
      @click="emitTag('insight')" 
      class="btn-pulse group bg-purple-600/20 border border-purple-500/50 hover:bg-purple-600 hover:border-purple-400 pulse-glow"
      title="Key finding or new idea [Alt+3]"
    >
      <div class="flex items-center gap-2">
        <v-icon x-small color="purple lighten-3" class="group-hover:white--text">mdi-lightbulb-on</v-icon>
        <span class="text-xs uppercase tracking-wider text-purple-400 group-hover:text-white">Insight</span>
      </div>
      <span class="kb-hint">3</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'PulseButtons',
  setup(props, { emit }) {
    const emitTag = (type) => {
      emit('trigger-tag', type);
    };

    return {
      emitTag
    };
  }
};
</script>

<style scoped>
.btn-pulse {
  position: relative;
  padding: 6px 14px;
  border-radius: 10px;
  font-weight: 800;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.btn-pulse:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.btn-pulse:active {
  transform: translateY(1px) scale(0.96);
}

/* Keyboard Hint Styling */
.kb-hint {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #1e293b;
  border: 1px solid #475569;
  color: #94a3b8;
  font-size: 8px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-family: monospace;
}

/* The "Insight" Pulse Glow */
.pulse-glow {
  animation: glow 3s infinite ease-in-out;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.2); }
  50% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
}

/* Specific hover button states */
.group:hover .kb-hint {
  border-color: white;
  color: white;
}
</style>