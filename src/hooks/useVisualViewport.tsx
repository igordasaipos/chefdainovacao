import { useState, useEffect } from 'react';

interface VisualViewportState {
  height: number;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
}

export function useVisualViewport(): VisualViewportState {
  const [viewportState, setViewportState] = useState<VisualViewportState>({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isKeyboardOpen: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const updateViewport = () => {
      // Clear any existing timeout to debounce rapid changes
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const keyboardHeight = Math.max(0, initialHeight - currentHeight);
        const isKeyboardOpen = keyboardHeight > 150; // iOS keyboard is usually 200-300px
        
        setViewportState({
          height: currentHeight,
          isKeyboardOpen,
          keyboardHeight,
        });
      }, 100);
    };

    // Primary method: Visual Viewport API (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    // Fallback: window resize for older iOS versions
    window.addEventListener('resize', updateViewport);

    // Initial state
    updateViewport();

    return () => {
      clearTimeout(timeoutId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return viewportState;
}