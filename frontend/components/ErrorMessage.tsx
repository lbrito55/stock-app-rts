import React from 'react';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = 'error-message',
}) => {
  if (!message) return null;

  return <div className={className}>{message}</div>;
};
