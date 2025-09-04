
import React from 'react';
import type { Status } from '../types.ts';
import { LoadingSpinner } from './icons/LoadingSpinner.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon.tsx';

interface StatusMessageProps {
  status: Status;
  message: string;
}

const statusConfig = {
  loading: {
    icon: <LoadingSpinner />,
    color: 'text-cyan-400',
  },
  success: {
    icon: <CheckCircleIcon />,
    color: 'text-green-400',
  },
  error: {
    icon: <ExclamationTriangleIcon />,
    color: 'text-red-400',
  },
  idle: {
    icon: null,
    color: 'text-slate-400',
  }
};

export const StatusMessage: React.FC<StatusMessageProps> = ({ status, message }) => {
    if (status === 'idle') return null;

    const { icon, color } = statusConfig[status];

    return (
        <div className={`flex items-center justify-center p-4 rounded-lg bg-slate-800 border border-slate-700 transition-all duration-300 ${color}`}>
            <div className="mr-3">{icon}</div>
            <p className="font-medium">{message}</p>
        </div>
    );
};