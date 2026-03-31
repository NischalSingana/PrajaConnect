import { useEffect } from 'react';

type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';

interface Options {
  modifier?: ModifierKey;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: Options = {}
) {
  const { modifier, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (modifier === 'ctrl' && !e.ctrlKey) return;
      if (modifier === 'meta' && !e.metaKey) return;
      if (modifier === 'alt' && !e.altKey) return;
      if (modifier === 'shift' && !e.shiftKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifier, enabled]);
}
