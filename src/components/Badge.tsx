interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'muted' | 'success' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  accent: 'bg-[--accent] text-[--accent-contrast]',
  muted: 'bg-[--surface-2] text-[--text-muted] border border-[--border]',
  success: 'bg-[--viz-visited] text-[--viz-success]',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
};

export function Badge({ children, variant = 'muted', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
