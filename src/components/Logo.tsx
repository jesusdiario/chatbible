
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/logo-jd-bible-chat.png"
        alt="BibleChat Logo" 
        className={`${sizeClass[size]} object-contain`}
      />
    </div>
  );
};

export default Logo;
