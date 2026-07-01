'use client';

import React from 'react';

interface IconProps {
  icon: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export default function Icon({ icon, className, width, height }: IconProps) {
  return React.createElement('iconify-icon', {
    icon,
    class: className,
    width,
    height,
  });
}
