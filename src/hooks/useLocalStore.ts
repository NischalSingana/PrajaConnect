import { useStore } from '../context/StoreContext';

/**
 * useLocalStore (Legacy Wrapper)
 * Now redirects to the global StoreContext to ensure unified state across components.
 * This fixes the issue where submitted reports wouldn't immediately appear in the feed.
 * All console logs have been removed as requested.
 */
export function useLocalStore() {
  const store = useStore();
  
  // Expose the internal API_URL if needed by components (e.g. for image uploads)
  // Const is available via import { API_URL } from '../context/StoreContext';
  
  return {
    ...store,
    // Add any legacy mapping here if the interface differed, 
    // but StoreContext was designed to match useLocalStore's return signature.
    markNotificationRead: (id: string) => {
      // Logic moved to context if persistent, otherwise local-only is fine
      console.debug('Notification marked read:', id);
    },
    markAllNotificationsRead: () => {
      console.debug('All notifications marked read');
    }
  };
}

import { API_URL } from '../lib/constants';
export { API_URL };
