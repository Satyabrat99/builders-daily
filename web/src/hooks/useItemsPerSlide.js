import { useState, useEffect } from 'react';

export function useItemsPerSlide(desktopCount = 3, tabletCount = 2, mobileCount = 1) {
  const [itemsPerSlide, setItemsPerSlide] = useState(desktopCount);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerSlide(mobileCount);
      } else if (window.innerWidth <= 1024) {
        setItemsPerSlide(tabletCount);
      } else {
        setItemsPerSlide(desktopCount);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopCount, tabletCount, mobileCount]);

  return itemsPerSlide;
}
