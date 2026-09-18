'use client';

import { useState, useEffect } from 'react';
import styles from '@/app/blog/[slug]/blogPost.module.css';

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // If there are no headings, do nothing
    if (!headings || headings.length === 0) return;

    // Use IntersectionObserver to highlight TOC items as you scroll
    const observerCallback = (entries) => {
      // Find the first heading that is currently intersecting (visible in the top area)
      // or keep track of the headings going out of view
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    // rootMargin '0px 0px -80% 0px' means the top 20% of the screen is the intersection area
    // so when a heading enters the top 20%, it triggers.
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-80px 0px -70% 0px', 
      threshold: 0
    });

    // We also want to find the first heading to highlight initially if we are at the top
    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    
    headingElements.forEach(el => observer.observe(el));

    // Handle scroll to highlight the current section accurately even if scrolling fast
    const handleScroll = () => {
      // Find the heading that is closest to the top but above the middle of the screen
      const currentScrollPosition = window.scrollY + 120; // offset for sticky headers if any
      let currentActiveId = '';
      
      for (const el of headingElements) {
        if (el.offsetTop <= currentScrollPosition) {
          currentActiveId = el.id;
        } else {
          break; // Since headings are in order, we can break early
        }
      }
      
      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => {
      headingElements.forEach(el => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings, activeId]);

  if (!headings || headings.length === 0) return null;

  return (
    <>
      <h3 className={styles.tocTitle}>Table of Contents</h3>
      <ul className={styles.tocList}>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id} className={styles[`tocItemLevel${heading.level}`]}>
              <a 
                href={`#${heading.id}`} 
                className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ''}`}
                onClick={(e) => {
                  // Optional: if you click, instantly set it as active for better UX
                  setActiveId(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
