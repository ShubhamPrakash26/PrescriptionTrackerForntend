import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
