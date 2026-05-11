import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  /** Visual style */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Additional CSS classes */
  className?: string;
  /** Content */
  children: React.ReactNode;
  /** HTML id */
  id?: string;
}

interface ButtonAsButton extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'id'> {
  /** Render as <button> (default) */
  as?: 'button';
  to?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  /** Render as react-router <Link> */
  as: 'link';
  to: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-1.5 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `
    bg-tr-accent text-white font-semibold
    hover:bg-tr-accent-hover
    active:scale-[0.97]
    shadow-md shadow-tr-accent/20
  `,
  ghost: `
    text-tr-text-secondary font-medium
    hover:text-tr-text hover:bg-tr-hover
  `,
  outline: `
    text-tr-text-secondary font-medium
    border border-tr-border
    hover:text-tr-text hover:bg-tr-hover
  `,
};

const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    id,
    ...rest
  } = props;

  const classes = `
    inline-flex items-center justify-center gap-1.5
    rounded-lg whitespace-nowrap
    transition-all duration-200
    ${SIZE_CLASSES[size]}
    ${VARIANT_CLASSES[variant]}
    ${className}
  `.trim();

  if (props.as === 'link') {
    return (
      <Link id={id} to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  const { as, ...buttonProps } = rest as ButtonAsButton;
  return (
    <button id={id} className={classes} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;
