import { forwardRef } from 'react';
import './Button.scss';
import type { ButtonProps } from './types';

/**
 * Button component with variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = 'primary', className, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				// Default to a non-submitting button so a caller that omits `type` inside a <form> does not
				// accidentally submit it. Every intentional submit button in this app passes type="submit"
				// explicitly, and `{...props}` is spread after so those callers still win.
				type="button"
				className={`radix-button radix-button-${variant} ${className || ''}`}
				{...props}
			>
				{children}
			</button>
		);
	}
);

Button.displayName = 'Button';
