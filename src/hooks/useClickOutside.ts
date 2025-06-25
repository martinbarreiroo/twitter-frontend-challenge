import { useEffect, useRef } from "react";

/**
 * Custom hook that handles clicks outside of a referenced element
 * @param handler - Function to call when clicking outside
 * @returns ref - Reference to attach to the element
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler]);

  return ref;
};

export default useClickOutside;
