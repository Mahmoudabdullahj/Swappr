import type { createClient as _cc } from './client';
type SbClient = ReturnType<typeof _cc>;

let _inst: SbClient | null = null;

export async function getClient(): Promise<SbClient> {
  if (_inst) return _inst;
  const { createClient } = await import('./client');
  _inst = createClient();
  return _inst;
}
