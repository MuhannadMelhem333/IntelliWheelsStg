import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    resolvedTheme: 'light' | 'dark';
}

export const Input: React.FC<InputProps> = ({ resolvedTheme, className = '', ...props }) => {
    const baseClasses = `w-full rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-sky-500 ${resolvedTheme === 'dark' ? 'bg-slate-800/95 text-slate-100 placeholder-slate-400' : 'bg-white/95 text-slate-900 placeholder-slate-500'} py-3 px-4 shadow-lg backdrop-blur-sm`;
    return <input className={`${baseClasses} ${className}`} {...props} />;
};
