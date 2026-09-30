// Icon component — wraps Material Symbols Outlined
// Usage: <Icon name="dark_mode" size={24} className="text-accent" />

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export function Icon({ name, size = 20, className = '', 'aria-hidden': hidden = true }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{ fontSize: size }}
      aria-hidden={hidden}
    >
      {name}
    </span>
  );
}
