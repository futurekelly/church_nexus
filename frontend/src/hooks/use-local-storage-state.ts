"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * A generic hook that provides a reactive wrapper around localStorage.
 * It is fully SSR-safe, handles JSON serialization errors gracefully, and
 * synchronizes state across components, tabs, and windows.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void] {
  // Store the defaultValue in a ref to avoid stale closure references
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  // Initial state is always the default value to ensure SSR matches CSR on the first pass
  const [state, setState] = useState<T>(() => {
    return typeof defaultValueRef.current === "function"
      ? (defaultValueRef.current as () => T)()
      : defaultValueRef.current;
  });

  const [isMounted, setIsMounted] = useState(false);

  // Initialize and load value from localStorage only after component mounts (CSR phase)
  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setState(JSON.parse(item));
      } else {
        const initial = typeof defaultValueRef.current === "function"
          ? (defaultValueRef.current as () => T)()
          : defaultValueRef.current;
        window.localStorage.setItem(key, JSON.stringify(initial));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Track the current state in a ref to prevent stale closures in updater function
  const stateRef = useRef<T>(state);
  stateRef.current = state;

  // Safe setter function
  const setLocalStorageState = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(stateRef.current) : value;

        setState(valueToStore);
        stateRef.current = valueToStore;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          // Notify other instances in the same document/tab
          window.dispatchEvent(
            new CustomEvent("local-storage-update", {
              detail: { key, newValue: valueToStore },
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Synchronize state changes from other components/tabs
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    // Synchronize changes made within the same window/tab
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; newValue: any }>;
      if (customEvent.detail && customEvent.detail.key === key) {
        setState(customEvent.detail.newValue);
      }
    };

    // Synchronize changes made from other windows/tabs
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setState(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}" from storage event:`, error);
        }
      }
    };

    window.addEventListener("local-storage-update" as any, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("local-storage-update" as any, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [key, isMounted]);

  return [state, setLocalStorageState];
}
