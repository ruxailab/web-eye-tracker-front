import { describe, it, expect, beforeEach } from 'vitest';
import { useFocusGroupStore } from '@/store/modules/focusGroup';
import { setActivePinia, createPinia } from 'pinia';

describe('Focus Group Logic Engine', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('correctly tags an observation with the active topic ID', () => {
    const store = useFocusGroupStore();
    store.setTopic(5); // Simulate selecting the 5th topic
    
    store.addObservation({ content: 'Test Insight', type: 'insight' });
    
    expect(store.observations[0].topicId).toBe(5);
    expect(store.observations[0].type).toBe('insight');
  });

  it('generates a valid ISO timestamp for each note', () => {
    const store = useFocusGroupStore();
    store.addObservation({ content: 'Timer test', type: 'neutral' });
    
    const timestamp = store.observations[0].timestamp;
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });
});