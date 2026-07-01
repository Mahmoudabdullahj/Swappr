import type { UserSession, SessionView } from './types';

const SESSION_KEY = 'tx_session';

export const Session = {
  get(): UserSession | null {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  save(data: UserSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  create(identifier: string): UserSession {
    const display = identifier.trim();
    const userId = display.toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
    const session: UserSession = {
      userId,
      displayName: display,
      loginAt: new Date().toISOString(),
      views: [],
      searches: [],
      profile: { topCategories: [], topKeywords: [], medianPrice: null },
    };
    Session.save(session);
    return session;
  },

  destroy(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  addView(session: UserSession, item: Omit<SessionView, 'ts'>): UserSession {
    const views = [{ ...item, ts: Date.now() }, ...session.views].slice(0, 100);
    const updated = { ...session, views };
    const rebuilt = Session.rebuildProfile(updated);
    Session.save(rebuilt);
    return rebuilt;
  },

  addSearch(session: UserSession, query: string): UserSession {
    if (!query.trim()) return session;
    const searches = [
      { query: query.trim().toLowerCase(), ts: Date.now() },
      ...session.searches,
    ].slice(0, 50);
    const updated = { ...session, searches };
    const rebuilt = Session.rebuildProfile(updated);
    Session.save(rebuilt);
    return rebuilt;
  },

  rebuildProfile(session: UserSession): UserSession {
    const catFreq: Record<string, number> = {};
    session.views.forEach((v) => {
      catFreq[v.category] = (catFreq[v.category] || 0) + 1;
    });
    const topCategories = Object.entries(catFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    const STOPWORDS = new Set([
      'with', 'from', 'that', 'this', 'have', 'will', 'like', 'just',
      'your', 'into', 'they', 'them', 'what', 'when', 'then', 'than',
      'also', 'some',
    ]);
    const kwFreq: Record<string, number> = {};
    const addTokens = (str: string) =>
      str.toLowerCase().split(/\s+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w))
        .forEach((w) => { kwFreq[w] = (kwFreq[w] || 0) + 1; });

    session.searches.forEach((s) => addTokens(s.query));
    session.views.forEach((v) => addTokens(v.title));

    const topKeywords = Object.entries(kwFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([kw]) => kw);

    const prices = session.views.map((v) => v.price).filter(Boolean).sort((a, b) => a - b);
    const medianPrice = prices.length ? prices[Math.floor(prices.length / 2)] : null;

    return { ...session, profile: { topCategories, topKeywords, medianPrice } };
  },
};
