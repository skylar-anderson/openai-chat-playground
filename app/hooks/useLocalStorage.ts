import { useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const storedValue = window.localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    }
    return defaultValue;
  });

  const setLocalStorageState = (value: T) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    setState(value);
  };

  return [state, setLocalStorageState];
}
