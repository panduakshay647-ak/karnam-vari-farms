import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-base sm:text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  };

  return (
    <Link to="/" className="inline-flex items-center gap-3 group select-none">
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${
          isDark
            ? 'bg-[#1b4332] text-[#fdfbf7] border border-[#2d5a27]'
            : 'bg-[#faf7f2] text-[#1b4332] border border-[#f4eee2]'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Farm Sun & Golden Rays */}
          <circle cx="20" cy="18" r="7" fill="#C58940" fillOpacity="0.85" />
          {/* Traditional Pestle / Wooden Churn & Leaves */}
          <path
            d="M20 7V28"
            stroke={isDark ? '#FDFBF7' : '#1B4332'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left Grain / Leaf Sprout */}
          <path
            d="M20 21C16 19 13 14 13 14C13 14 17.5 14 20 18"
            stroke="#D4A373"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Grain / Leaf Sprout */}
          <path
            d="M20 17C24 15 27 10 27 10C27 10 22.5 10 20 14"
            stroke="#D4A373"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Terracotta Pot / Earth Base */}
          <path
            d="M12 28C12 32 16 34 20 34C24 34 28 32 28 28H12Z"
            fill={isDark ? '#D4A373' : '#8B4513'}
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif tracking-tight font-bold ${titleSizes[size]} ${
            isDark ? 'text-[#1b4332]' : 'text-[#fdfbf7]'
          }`}
        >
          Karnam Vari Farms
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] md:text-[11px] font-medium tracking-widest uppercase ${
              isDark ? 'text-[#8b4513]' : 'text-[#d4a373]'
            }`}
          >
            Made with Love
          </span>
        )}
      </div>
    </Link>
  );
};