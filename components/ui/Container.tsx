import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Container({
  children,
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`max-w-[1600px] mx-auto px-8 sm:px-16 xl:px-24 w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
