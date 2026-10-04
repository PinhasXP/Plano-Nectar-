import React from 'react';

interface HummingbirdIconProps {
  className?: string;
  size?: number;
}

/**
 * High-definition vector replica of the hummingbird logo:
 * - Substantially slimmer, slender, and aerodynamic body (corpo esguio e aerodinâmico)
 * - Deep neck/nape contour creating distinct separation between wing and head
 * - Slender waist and streamlined abdomen
 * - Needle-sharp beak pointing upward-right
 * - Notched flight feathers along the wing and fanned tail
 */
export const HummingbirdIcon: React.FC<HummingbirdIconProps> = ({ 
  className = 'w-full h-full', 
  size 
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="Logotipo Oficial Beija-Flor"
    >
      <path
        d="M 97 28.5
           L 75.5 29.5
           C 73.5 33 72.8 37.5 71.5 42.5
           C 69.5 48 65.5 53.5 61 58.5
           C 57.5 62.5 55 66.5 54.5 70.5
           C 56 72 56.5 73.8 55.5 75.5
           C 56.5 78 57.5 81.5 56.5 84.5
           C 54.5 86.5 52.5 87 50.5 85.5
           C 48.5 87.5 46 87.5 44 85
           C 42.5 83 41 79.5 40 75
           C 39.5 69 40 62.5 41.5 56.5
           C 39 55 36.5 53.5 34.5 51.5
           C 32 50 29 48.5 27 46
           C 24.5 44 22 41.5 20 38.5
           C 17.5 35.5 15 32 13.5 28
           C 11.5 24.5 9.5 20.5 8.5 16.5
           C 7 14 6 11 7 8.5
           C 6 7 6 5 7 3.5
           C 8 3 9 3.5 10 4.5
           C 17.5 11 27.5 19.5 38.5 27
           C 44.5 31 50.5 34 55.5 35
           C 54.5 31.5 55.5 28.5 58.5 26
           C 62.5 22.5 68 21.5 73.5 24
           C 74.8 24.8 75.5 26.5 75.5 28
           Z"
      />
    </svg>
  );
};
