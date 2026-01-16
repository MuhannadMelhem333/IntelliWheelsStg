import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    resolvedTheme: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    resolvedTheme,
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-2xl',
    };

    const variants = {
        primary: resolvedTheme === 'dark'
            ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/20 focus:ring-sky-500'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md focus:ring-emerald-500',
        secondary: resolvedTheme === 'dark'
            ? 'bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600 focus:ring-slate-500'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm focus:ring-slate-200',
        danger: resolvedTheme === 'dark'
            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/20 focus:ring-rose-500'
            : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md focus:ring-rose-400',
        ghost: resolvedTheme === 'dark'
            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:ring-slate-500'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-200',
        outline: resolvedTheme === 'dark'
            ? 'border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800'
            : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
