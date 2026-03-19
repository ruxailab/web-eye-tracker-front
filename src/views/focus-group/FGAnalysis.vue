<template>
  <v-container class="dashboard-bg fill-height pa-8" fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-8">
          <div>
            <h1 class="text-h3 font-weight-black white--text neon-text">INSIGHT SYNTHESIS</h1>
            <p class="subtitle-1 grey--text">Qualitative Data Analytics & Thematic Mapping</p>
          </div>
          <div class="d-flex gap-3">
            <v-btn color="purple lighten-2" outlined rounded @click="exportData('json')">
              <v-icon left>mdi-code-json</v-icon> JSON BUNDLE
            </v-btn>
            <v-btn color="green lighten-2" outlined rounded @click="exportData('csv')">
              <v-icon left>mdi-file-delimited</v-icon> CSV REPORT
            </v-btn>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="3" v-for="(stat, index) in stats" :key="'stat-'+index">
        <v-card class="glass-card pa-6 text-center" dark>
          <v-icon :color="stat.color" class="mb-2">{{ stat.icon }}</v-icon>
          <div class="text-overline grey--text">{{ stat.label }}</div>
          <div class="text-h2 font-weight-black" :style="{ color: stat.color }">{{ stat.value }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="7" class="mt-6">
        <v-card class="glass-card pa-6" dark min-height="500">
          <div class="d-flex justify-space-between align-center mb-6">
            <h2 class="text-h5">THEMATIC OBSERVATION FEED</h2>
            <v-chip-group v-model="activeFilter" mandatory active-class="purple--text text--lighten-3">
              <v-chip value="all" small outlined>ALL</v-chip>
              <v-chip value="insight" small outlined color="purple lighten-2">INSIGHTS</v-chip>
              <v-chip value="consensus" small outlined color="emerald lighten-2">CONSENSUS</v-chip>
              <v-chip value="divergence" small outlined color="amber lighten-2">DIVERGENCE</v-chip>
            </v-chip-group>
          </div>

          <v-divider class="mb-6 grey darken-3"></v-divider>

          <div class="feed-container overflow-y-auto" style="max-height: 600px;">
            <div v-if="filteredObservations.length === 0" class="text-center grey--text pa-10">
              No observations found for this filter.
            </div>
            
            <v-card 
              v-for="obs in filteredObservations" 
              :key="obs.id" 
              class="mb-4 pa-4 list-item-border" 
              color="transparent"
            >
              <div class="d-flex justify-space-between mb-2">
                <v-chip x-small :color="getTypeColor(obs.type)" label>{{ obs.type.toUpperCase() }}</v-chip>
                <span class="text-caption grey--text font-mono">{{ formatTime(obs.timestamp) }}</span>
              </div>
              <p class="white--text mb-1">{{ obs.content }}</p>
              <div class="text-caption purple--text text--lighten-4 italic">
                Ref: {{ getTopicName(obs.topicId) }}
              </div>
            </v-card>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5" class="mt-6">
        <v-card class="glass-card pa-6 mb-6" dark>
          <h2 class="text-h5 mb-6">CONSENSUS MAP</h2>
          <div v-for="topic in analytics" :key="topic.id" class="mb-6">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold truncate-text">{{ topic.prompt }}</span>
              <span class="purple--text font-weight-black">{{ topic.score }}%</span>
            </div>
            <v-progress-linear
              :value="topic.score"
              height="8"
              rounded
              color="purple lighten-1"
              background-color="grey darken-4"
            ></v-progress-linear>
            <div class="text-caption grey--text mt-1 d-flex justify-space-between">
              <span>{{ topic.count }} Observations</span>
              <span>Distribution: {{ topic.dist }}</span>
            </div>
          </div>
        </v-card>

        <v-card class="glass-card pa-6" dark>
          <h2 class="text-h6 mb-4">ACTIONABLE SUMMARY</h2>
          <v-list dense bg-color="transparent" class="pa-0">
            <v-list-item v-for="(insight, i) in topInsights" :key="i" class="pa-0 mb-2">
              <v-list-item-icon class="mr-3">
                <v-icon color="purple lighten-2">mdi-auto-fix</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <div class="text-body-2 white--text">{{ insight.content }}</div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'FGAnalysis',
  data: () => ({
    rawData: null,
    activeFilter: 'all'
  }),
  computed: {
    stats() {
      if (!this.rawData) return [];
      const obs = this.rawData.observations;
      return [
        { label: 'TOTAL NOTES', value: obs.length, color: '#fff', icon: 'mdi-text-box-multiple-outline' },
        { label: 'KEY INSIGHTS', value: obs.filter(o => o.type === 'insight').length, color: '#a855f7', icon: 'mdi-lightbulb-on-outline' },
        { label: 'DIVERGENCE', value: obs.filter(o => o.type === 'divergence').length, color: '#f59e0b', icon: 'mdi-alert-decagram-outline' },
        { label: 'CONSENSUS', value: obs.filter(o => o.type === 'consensus').length, color: '#10b981', icon: 'mdi-check-decagram-outline' }
      ];
    },
    filteredObservations() {
      if (!this.rawData) return [];
      const obs = [...this.rawData.observations].reverse(); // Most recent first
      if (this.activeFilter === 'all') return obs;
      return obs.filter(o => o.type === this.activeFilter);
    },
    analytics() {
      if (!this.rawData) return [];
      return this.rawData.guide.map((topic, index) => {
        const topicObs = this.rawData.observations.filter(o => o.topicId === index);
        const conCount = topicObs.filter(o => o.type === 'consensus').length;
        const divCount = topicObs.filter(o => o.type === 'divergence').length;
        const insCount = topicObs.filter(o => o.type === 'insight').length;

        return {
          id: index,
          prompt: topic.prompt,
          count: topicObs.length,
          score: topicObs.length ? Math.round((conCount / topicObs.length) * 100) : 0,
          dist: `C:${conCount} D:${divCount} I:${insCount}`
        };
      });
    },
    topInsights() {
      if (!this.rawData) return [];
      return this.rawData.observations.filter(o => o.type === 'insight').slice(-5);
    }
  },
  mounted() {
    this.rawData = JSON.parse(localStorage.getItem('ruxailab_fg_prototype'));
  },
  methods: {
    getTypeColor(type) {
      const colors = { insight: 'purple darken-1', divergence: 'amber darken-2', consensus: 'emerald darken-2' };
      return colors[type] || 'grey';
    },
    getTopicName(id) {
      return this.rawData?.guide[id]?.prompt || 'General Discussion';
    },
    formatTime(ts) {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    exportData(format) {
      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.rawData, null, 2));
        this.triggerDownload(dataStr, "research_export.json");
      } else {
        let csv = "Timestamp,Topic,Type,Content\n";
        this.rawData.observations.forEach(o => {
          csv += `"${o.timestamp}","${this.getTopicName(o.topicId)}","${o.type}","${o.content.replace(/"/g, '""')}"\n`;
        });
        const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        this.triggerDownload(csvStr, "research_report.csv");
      }
    },
    triggerDownload(uri, name) {
      const link = document.createElement('a');
      link.setAttribute("href", uri);
      link.setAttribute("download", name);
      link.click();
    }
  }
};
</script>

<style scoped>
.dashboard-bg { background: radial-gradient(circle at top right, #1e1b4b, #0f172a); }
.glass-card { background: rgba(30, 41, 59, 0.7) !important; backdrop-filter: blur(12px); border: 1px solid rgba(168, 85, 247, 0.2) !important; }
.neon-text { text-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
.list-item-border { border-left: 3px solid rgba(168, 85, 247, 0.5) !important; background: rgba(15, 23, 42, 0.4) !important; }
.truncate-text { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gap-3 { gap: 12px; }
.italic { font-style: italic; }
</style>