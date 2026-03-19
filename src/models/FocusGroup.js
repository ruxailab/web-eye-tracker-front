export const FocusGroupSchema = {
  session: {
    id: null,
    title: "",
    objective: "",
    status: "setup", // setup, live, completed
    startTime: null,
  },
  participants: [], // { id, name, role, tags }
  guide: [], // { id, prompt, duration, order }
  observations: [] // { id, timestamp, topicId, participantId, content, type }
};

export const ObservationTypes = {
  NEUTRAL: 'neutral',
  CONSENSUS: 'consensus',
  DIVERGENCE: 'divergence',
  INSIGHT: 'insight'
};