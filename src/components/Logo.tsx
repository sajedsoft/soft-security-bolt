interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <img
      src="/assets/logo.png"
      alt="SOFT SECURITY"
      className={`${sizes[size]} w-auto ${className}`}
    />
  );
}