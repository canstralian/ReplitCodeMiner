
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrlKey === event.ctrlKey &&
          !!s.shiftKey === event.shiftKey &&
          !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalKeyboardShortcuts(onShowHelp?: () => void) {
  const [, setLocation] = useLocation();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      ctrlKey: true,
      action: () => setLocation('/'),
      description: 'Go to Dashboard',
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => setLocation('/search'),
      description: 'Go to Search',
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => setLocation('/recent-searches'),
      description: 'Go to Recent Searches',
    },
    {
      key: ',',
      ctrlKey: true,
      action: () => setLocation('/settings'),
      description: 'Go to Settings',
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[aria-label="Search query"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus Search',
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => onShowHelp?.(),
      description: 'Show Keyboard Shortcuts',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
