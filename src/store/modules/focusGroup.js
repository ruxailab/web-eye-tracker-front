import { defineStore } from 'pinia'; // Recommended for Vue 3

export const useFocusGroupStore = defineStore('focusGroup', {
  state: () => ({
    activeSession: null,
    currentTopicId: null,
    observations: [],
  }),
  actions: {
    setTopic(id) {
      this.currentTopicId = id;
    },
    addObservation(note) {
      const observation = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        topicId: this.currentTopicId,
        ...note
      };
      this.observations.push(observation);
      // Auto-save to local storage for PoW persistence
      localStorage.setItem('temp_obs', JSON.stringify(this.observations));
    }
  }
});