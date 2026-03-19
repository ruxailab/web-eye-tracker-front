<template>
  <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl transition-all duration-500">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
        <span class="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
        Thematic Pulse Analysis
      </h3>
      
      <select 
        v-model="selectedTopic" 
        class="bg-slate-900 text-xs text-purple-300 border border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-purple-500"
      >
        <option :value="null">All Topics</option>
        <option v-for="id in uniqueTopicIds" :key="id" :value="id">
          Topic #{{ id + 1 }}
        </option>
      </select>
    </div>

    <div class="space-y-6">
      <div v-for="item in chartData" :key="item.label" class="space-y-2 group">
        <div class="flex justify-between text-sm">
          <span class="text-slate-400 flex items-center gap-2 transition-colors group-hover:text-slate-200">
            <span :class="['w-3 h-3 rounded-full shadow-sm', item.bg]"></span>
            {{ item.label }}
          </span>
          <span class="text-slate-100 font-mono">
            {{ item.count }} <span class="text-slate-500 text-xs">({{ item.percent }}%)</span>
          </span>
        </div>
        
        <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
          <div 
            class="h-full transition-all duration-1000 ease-out rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
            :class="item.bg"
            :style="{ width: item.percent + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-4">
      <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Top Driver</div>
        <div class="text-sm font-bold text-slate-200">{{ topDriver }}</div>
      </div>
      <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Engagement Density</div>
        <div class="text-sm font-bold text-slate-200">{{ engagementDensity }} obs/min</div>
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center">
      <p class="text-xs text-slate-500 italic">
        * N={{ filteredTotal }} (Filtered) / Total N={{ observations.length }}
      </p>
      <v-icon x-small color="grey darken-2">mdi-information-outline</v-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  observations: { type: Array, default: () => [] }
});

// Logic: Reactive Filter
const selectedTopic = ref(null);

const uniqueTopicIds = computed(() => {
  const ids = props.observations.map(o => o.topicId);
  return [...new Set(ids)].filter(id => id !== undefined).sort();
});

const filteredObservations = computed(() => {
  if (selectedTopic.value === null) return props.observations;
  return props.observations.filter(o => o.topicId === selectedTopic.value);
});

const filteredTotal = computed(() => filteredObservations.value.length || 0);

const chartData = computed(() => {
  const counts = { consensus: 0, divergence: 0, insight: 0 };
  filteredObservations.value.forEach(o => {
    if (counts[o.type] !== undefined) counts[o.type]++;
  });

  const total = filteredTotal.value || 1; // Avoid division by zero

  return [
    { label: 'Consensus', count: counts.consensus, percent: Math.round((counts.consensus / total) * 100), bg: 'bg-emerald-500' },
    { label: 'Divergence', count: counts.divergence, percent: Math.round((counts.divergence / total) * 100), bg: 'bg-amber-500' },
    { label: 'Key Insights', count: counts.insight, percent: Math.round((counts.insight / total) * 100), bg: 'bg-purple-500' }
  ];
});

// Functional Addition: Research Metrics
const topDriver = computed(() => {
  const data = chartData.value;
  const winner = data.reduce((prev, current) => (prev.count > current.count) ? prev : current, data[0]);
  return winner.count > 0 ? winner.label : 'N/A';
});

const engagementDensity = computed(() => {
  if (props.observations.length < 2) return "0.0";
  const start = new Date(props.observations[0].timestamp);
  const end = new Date(props.observations[props.observations.length - 1].timestamp);
  const diffMinutes = (end - start) / 60000 || 1;
  return (props.observations.length / diffMinutes).toFixed(1);
});
</script>

<style scoped>
.shadow-purple {
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
/* For the select dropdown */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='purple' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  padding-right: 2rem;
}
</style>