import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = (Icons as any)[name] || Icons.HeartHandshake;
  return <IconComponent className={className} />;
};
