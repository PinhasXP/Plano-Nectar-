import React from 'react';
import { HummingbirdIcon } from './HummingbirdIcon';

interface HummingbirdLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Exact replica of the user's attached logo:
 * - Square with blue background (#3884cb)
 * - Pure white hummingbird silhouette facing right with notched wing and fanned tail
 * - Optimized for both screen UI and high-resolution print/PDF reports
 */
export const HummingbirdLogo: React.FC<HummingbirdLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-md p-0.5',
    md: 'w-9 h-9 rounded-lg p-1',
    lg: 'w-12 h-12 rounded-lg p-1.5',
    xl: 'w-16 h-16 rounded-xl p-2',
  };

  return (
    <div
      className={`bg-[#3884cb] flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden ${sizeMap[size]} ${className}`}
      style={{ backgroundColor: '#3884cb' }}
      title="Logotipo Oficial Beija-Flor"
    >
      <HummingbirdIcon className="w-full h-full text-white" />
    </div>
  );
};
