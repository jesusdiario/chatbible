
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={className}>
      <img src="/lovable-uploads/logo-jd-bible-chat.png" alt="BibleChat Logo" className="h-12" />
    </div>
  );
};

export default Logo;
