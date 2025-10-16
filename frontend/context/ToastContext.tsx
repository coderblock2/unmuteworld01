import React, { createContext, useState, useCallback } from 'react';
import { Toast as ToastType } from '../types';

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  toasts: ToastType[];
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prevToasts => [
      ...prevToasts,
      { id, message, type }
    ]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
