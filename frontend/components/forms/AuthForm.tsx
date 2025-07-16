import React from 'react';
import Link from 'next/link';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  statusMessages?: React.ReactNode;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  statusMessages,
}) => {
  return (
    <div className="form-container">
      <h1>{title}</h1>

      {statusMessages}

      <form onSubmit={onSubmit}>{children}</form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {footerText}{' '}
        <Link href={footerLinkHref} style={{ color: '#4CAF50' }}>
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
};
