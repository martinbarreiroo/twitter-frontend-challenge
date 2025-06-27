import { useEffect, useRef } from "react";

/**
 * Custom hook specifically for modal components using portals
 * This hook handles complex click-outside scenarios where modals contain other portalized elements
 * @param handler - Function to call when clicking outside the modal
 * @param excludeSelectors - Array of CSS selectors that should not trigger close when clicked
 * @returns ref - Reference to attach to the modal element
 */
export const useModalClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void,
  excludeSelectors: string[] = []
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (!ref.current || ref.current.contains(target as Node)) {
        return;
      }

      // Check if the click is on any excluded elements
      for (const selector of excludeSelectors) {
        const excludedElement = target.closest(selector);
        if (excludedElement) {
          return;
        }
      }

      // Check if the click is within the main portal root (for nested modals)
      const portalRoot = document.getElementById("portal-root");
      if (portalRoot && portalRoot.contains(target as Node)) {
        // Check if it's a direct child of portal-root (meaning it's another modal)
        const portalChildren = Array.from(portalRoot.children);
        const clickedModalElement = portalChildren.find((child) =>
          child.contains(target as Node)
        );

        // If the clicked element is not our modal ref, allow the interaction
        if (
          clickedModalElement &&
          !ref.current.contains(clickedModalElement as Node)
        ) {
          return;
        }
      }

      // Special handling for dropdown menus and UI elements that should not close modals
      const ignoredElements = [
        ".profile-info", // Profile logout prompt
        "[data-modal-ignore]", // Any element with this attribute
        ".dropdown-menu",
        ".tooltip",
        ".popover",
      ];

      for (const selector of ignoredElements) {
        const ignoredElement = target.closest(selector);
        if (ignoredElement) {
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
  }, [handler, excludeSelectors]);

  return ref;
};

export default useModalClickOutside;
