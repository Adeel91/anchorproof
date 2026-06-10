import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wider shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40 border border-indigo-500/30 rounded-lg',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50 rounded-lg',
    outline:
      'border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white bg-slate-900/20 backdrop-blur-sm rounded-lg',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
