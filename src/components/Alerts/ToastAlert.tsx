import React, { FC, useEffect, useState } from "react";

type ToastAlertProps = {
  message: string;
  type?: "success" | "error" | "info"; // Define more types if needed
  duration?: number;
  isActive: boolean;
  onDismissed: () => void;
};

const ToastAlert: FC<ToastAlertProps> = ({
  message,
  type = "success",
  duration = 4000,
  isActive,
  onDismissed,
}) => {
  const [isVisible, setIsVisible] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismissed();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onDismissed]);

  if (!isVisible) return null;

  const getAlertClass = () => {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      case "info":
        return "alert-info";
      default:
        return "alert-success";
    }
  };

  return (
    <div className="toast whitespace-normal w-full md:w-1/2 toast-top toast-center z-50">
      <div
        className={`alert sm:grid-cols-none justify-center ${getAlertClass()}`}
      >
        <span className="lg:text-center">{message}</span>
      </div>
    </div>
  );
};

export default ToastAlert;
