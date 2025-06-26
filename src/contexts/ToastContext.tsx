import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Toast, { ToastType } from "../components/toast/Toast";
import { createGlobalErrorHandler } from "../util/ErrorHandler";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const showToast = (message: string, type: ToastType, duration = 5000) => {
    const id = generateId();
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const showSuccess = (message: string, duration = 5000) => {
    showToast(message, ToastType.SUCCESS, duration);
  };

  const showError = (message: string, duration = 5000) => {
    showToast(message, ToastType.ALERT, duration);
  };

  const showInfo = (message: string, duration = 5000) => {
    showToast(message, ToastType.INFO, duration);
  };

  const showWarning = (message: string, duration = 5000) => {
    showToast(message, ToastType.WARNING, duration);
  };

  // Set up global error handler
  useEffect(() => {
    const globalErrorHandler = createGlobalErrorHandler(
      (message: string, type: string) => {
        showToast(message, type as ToastType);
      }
    );

    // Store it globally so React Query can access it
    (window as any).__globalErrorHandler = globalErrorHandler;

    return () => {
      delete (window as any).__globalErrorHandler;
    };
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={0} // We handle duration in the context
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
