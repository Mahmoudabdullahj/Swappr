export interface MyItem {
  id: string;
  title: string;
  category: string;
  ts: number;
}

const KEY = 'tx_my_items';

export const MyItems = {
  get(): MyItem[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  },

  add(draft: { title: string; category: string }): MyItem {
    const item: MyItem = {
      id: `my_${Date.now()}`,
      title: draft.title,
      category: draft.category || 'Other',
      ts: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify([item, ...MyItems.get()]));
    return item;
  },

  remove(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(MyItems.get().filter(i => i.id !== id)));
  },
};
