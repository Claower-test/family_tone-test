import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[12px]',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
  '2xl': 'w-32 h-32 text-4xl',
};

// Generate a cool, vibrant gradient based on a string (name)
const generateGradient = (name: string) => {
  const colors = [
    ['#FF6B6B', '#FFD93D'], // Sunset
    ['#4E65FF', '#92EFFD'], // Ocean
    ['#614385', '#516395'], // Midnight
    ['#02AAB0', '#00CDAC'], // Emerald
    ['#DA22FF', '#9114FF'], // Purple
    ['#F09819', '#EDDE5D'], // Orange juice
    ['#1D976C', '#93F9B9'], // Forest
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  const [c1, c2] = colors[index];
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
};

export function Avatar({ src, name: propName, size = 'md', className }: AvatarProps) {
  const name = typeof propName === 'string' && propName.trim() !== '' ? propName : 'User';
  const gradient = useMemo(() => generateGradient(name), [name]);
  const initials = useMemo(() => name.charAt(0).toUpperCase(), [name]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative rounded-full flex-shrink-0 overflow-hidden shadow-sm border border-white/20",
        sizeClasses[size],
        className
      )}
    >
      {src && src !== "" ? (
        <img 
          src={src.startsWith('http') ? src : src} 
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center font-black text-white"
          style={{ background: gradient }}
        >
          {initials}
        </div>
      )}
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
    </motion.div>
  );
}
