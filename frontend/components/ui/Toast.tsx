import React from 'react';
import { Toast as ToastType } from '../../types';
import { XIcon } from '../icons';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const baseClasses = 'relative w-full max-w-sm p-4 border-l-4 rounded-md shadow-lg';
  const typeClasses = {
      success: 'bg-green-50 border-green-500 text-green-800',
      error: 'bg-red-50 border-red-500 text-red-800'
  };

  const typeLabels = {
    success: 'Success',
    error: 'Error'
  };

  return (
      <div className={`${baseClasses} ${typeClasses[toast.type]}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{typeLabels[toast.type]}</p>
              <p className="text-sm">{toast.message}</p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="p-1 rounded-full hover:bg-black/10"
            >
                <XIcon className="w-4 h-4" />
            </button>
          </div>
      </div>
  );
};

export default Toast;
