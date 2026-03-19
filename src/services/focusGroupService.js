const STORAGE_KEY = 'ruxailab_fg_prototype';

export const focusGroupService = {
  saveSession(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  },

  getSession() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }
};