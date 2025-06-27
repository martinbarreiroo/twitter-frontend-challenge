import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  elementId?: string;
}

const Portal: React.FC<PortalProps> = ({
  children,
  elementId = "portal-root",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const portalRoot =
    typeof document !== "undefined" ? document.getElementById(elementId) : null;

  return mounted && portalRoot ? createPortal(children, portalRoot) : null;
};

export default Portal;
export { Portal };
export type { PortalProps };
