import React from 'react';

interface StatusMessageProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  className?: string;
}

const statusStyles = {
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
  },
  info: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    borderRadius: '4px',
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
  },
};

export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  type,
  className,
}) => {
  return (
    <div
      style={{
        padding: '10px',
        marginBottom: '20px',
        ...statusStyles[type],
      }}
      className={className}
      role="status"
    >
      {message}
    </div>
  );
};
