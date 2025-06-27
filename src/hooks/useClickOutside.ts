import { useEffect, useRef } from "react";

/**
 * Custom hook that handles clicks outside of a referenced element
 * @param handler - Function to call when clicking outside
 * @param excludePortals - Whether to exclude portal elements from triggering the handler
 * @returns ref - Reference to attach to the element
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void,
  excludePortals = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      // If excludePortals is true, check if the click is within a portal
      if (excludePortals) {
        const portalRoot = document.getElementById("portal-root");
        if (portalRoot && portalRoot.contains(target)) {
          return;
        }
      }

      handler();
    };

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler, excludePortals]);

  return ref;
};

export default useClickOutside;
