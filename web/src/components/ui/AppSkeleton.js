"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function AppSkeleton({ children }) {
  // Configured to match the dark glassmorphic UI
  return (
    <SkeletonTheme baseColor="rgba(255, 255, 255, 0.05)" highlightColor="rgba(255, 255, 255, 0.1)">
      {children}
    </SkeletonTheme>
  );
}
