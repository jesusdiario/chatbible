
import React from 'react';

interface OnboardingStepLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const OnboardingStepLayout: React.FC<OnboardingStepLayoutProps> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-gray-600">{subtitle}</p>
        )}
      </div>
      
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

export default OnboardingStepLayout;
