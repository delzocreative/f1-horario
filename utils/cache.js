const CACHE_PREFIX = 'f1_dashboard:';

export const cache = {
  set(key, data, ttlMinutes = 60) {
    const item = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + (ttlMinutes * 60000)
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  },

  get(key) {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expires) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.data;
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};