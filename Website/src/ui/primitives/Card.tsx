// Card Primitive (Platform-Agnostic Pattern)

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onPress?: () => void;
}

const variantStyles = {
  default: 'bg-white border border-neutral-200',
  outlined: 'bg-transparent border-2 border-neutral-300',
  elevated: 'bg-white shadow-lg border border-neutral-100',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onPress,
}: CardProps) {
  const Component = onPress ? 'button' : 'div';
  
  return (
    <Component
      onClick={onPress}
      className={`
        rounded-lg transition-shadow
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${onPress ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-600' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
