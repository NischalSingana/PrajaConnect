import { API_URL } from '../lib/constants';
import { useStore } from '../context/StoreContext';

export { API_URL };

/**
 * useLocalStore (Legacy Wrapper)
 * Redirects to the global StoreContext for unified state management.
 */
export function useLocalStore() {
  return useStore();
}
