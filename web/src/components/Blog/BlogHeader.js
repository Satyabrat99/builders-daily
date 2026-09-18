"use client";
import Link from 'next/link';
import ThemeToggleSwitch from '@/components/ui/ThemeToggleSwitch';
import styles from './BlogHeader.module.css';

export default function BlogHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.brandGroup}>
            <Link href="/" className={styles.logoLink} title="Builder Daily Home">
              <img 
                src="/builders daily-webp.webp" 
                alt="Builder Daily" 
                className={styles.logoImage}
              />
              <span className={styles.logoText}>Builder Daily</span>
            </Link>
            <Link href="/blog" className={styles.blogTag} title="Blog Archive">
              <span className={styles.slash}>/</span>blog
            </Link>
          </div>
        </div>
        <div className={styles.right}>
          <Link href="/" className={styles.reportBtn}>
            Daily Report
          </Link>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggleSwitch />
          </div>
        </div>
      </div>
    </header>
  );
}
