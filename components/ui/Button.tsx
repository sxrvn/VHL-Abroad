import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-orange-500 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] text-white',
    secondary: 'bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-charcoal/10 dark:border-white/20 hover:shadow-md',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-600/10 hover:scale-[1.02] text-white',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg hover:shadow-red-600/10 hover:scale-[1.02] text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-white/10 hover:shadow-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ${
        variants[variant]
      } ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
