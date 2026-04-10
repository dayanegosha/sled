import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function Button({ children, variant = 'primary', className = '', ...props }: Props) {
  const base = 'rounded-xl px-4 py-2 text-sm font-medium transition text-center';
  const map: Record<Variant, string> = {
    primary: 'bg-blue-500/85 text-white hover:bg-blue-500',
    ghost: 'border border-white/15 bg-white/5 text-white/85 hover:bg-white/12',
    danger: 'bg-red-500/80 text-white hover:bg-red-500',
  };

  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
}
