import React, { useState, useEffect } from "react";
import { StyledToastContainer } from "./ToastContainer";
import { AlertIcon, LikeIcon, MessageIcon, SettingsIcon } from "../icon/Icon";

export enum ToastType {
  ALERT = "ALERT",
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  WARNING = "WARNING",
}

interface ToastProps {
  message: string;
  type: ToastType;
  show?: boolean;
  duration?: number;
  onClose?: () => void;
}

const Toast = ({
  message,
  type,
  show,
  duration = 5000,
  onClose,
}: ToastProps) => {
  const [isShown, setIsShown] = useState<boolean>(show ?? true);

  const iconMap = {
    [ToastType.ALERT]: <AlertIcon />,
    [ToastType.SUCCESS]: <LikeIcon />,
    [ToastType.INFO]: <MessageIcon />,
    [ToastType.WARNING]: <SettingsIcon />,
  };

  const toastIcon = iconMap[type] || null;

  const handleClose = () => {
    setIsShown(false);
    onClose?.();
  };

  useEffect(() => {
    if (isShown && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isShown, duration]);

  return (
    <>
      {isShown && (
        <StyledToastContainer type={type} onClick={handleClose}>
          {toastIcon}
          <p>{message}</p>
        </StyledToastContainer>
      )}
    </>
  );
};

export default Toast;
