import React from 'react';

interface SubmitButtonProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  loadingText = 'Loading...',
  children,
  className = 'btn btn-primary',
  disabled = false,
}) => {
  return (
    <button type="submit" className={className} disabled={loading || disabled}>
      {loading ? loadingText : children}
    </button>
  );
};
