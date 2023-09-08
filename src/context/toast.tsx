import ToastAlert from "@/components/Alerts/ToastAlert";
import React, { FC, createContext, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type: ToastType) => void;
}
type ProviderProps = {
  children: React.ReactNode;
};

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: FC<ProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);

  const addToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toast && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          isActive={!!toast}
          onDismissed={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
