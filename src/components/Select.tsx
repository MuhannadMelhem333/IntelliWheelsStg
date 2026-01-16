import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    resolvedTheme: 'light' | 'dark';
    // options prop is optional; if provided, render them, otherwise render children
    options?: { value: string; label: string }[];
    children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ resolvedTheme, options, children, className = '', ...props }) => {
    const baseClasses = `rounded-xl border ${resolvedTheme === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-700'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500`;
    return (
        <select className={`${baseClasses} ${className}`} {...props}>
            {options ? (
                options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))
            ) : (
                children
            )}
        </select>
    );
};
