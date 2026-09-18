import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './CollectionCard.module.css';

const PRINT_FALLBACKS = [
  '/blog-page/fallback-wafers.jpg',
  '/blog-page/fallback-desk.jpg',
  '/blog-page/fallback-archive.jpg',
];

export default function CollectionCard({ bundle, articles }) {
  const prints = (articles || []).slice(0, 3);
  const count = Array.isArray(articles) ? articles.length : 0;
  const firstHref = prints[0]?.slug ? `/blog/${prints[0].slug}` : null;

  const tiles = prints.length > 0
    ? prints
    : [
        { title: '', cover_image: bundle.cover_image || PRINT_FALLBACKS[0], slug: null },
        { title: '', cover_image: PRINT_FALLBACKS[1], slug: null },
        { title: '', cover_image: PRINT_FALLBACKS[2], slug: null },
      ];
  const isDormant = prints.length === 0;

  return (
    <article className={styles.card}>
      <div className={styles.deck} aria-hidden={prints.length === 0}>
        {tiles.map((article, index) => {
          const cover = article.cover_image || PRINT_FALLBACKS[index % PRINT_FALLBACKS.length];
          const part = isDormant ? null : `Part ${index + 1}`;
          const pose =
            tiles.length === 1
              ? styles.printSolo
              : tiles.length === 2
                ? (index === 0 ? styles.print1 : styles.print3)
                : styles[`print${index + 1}`];
          const className = `${styles.print} ${pose || ''}`;
          const inner = (
            <>
              {part ? <span className={styles.part}>{part}</span> : null}
              <span className={styles.printFrame}>
                <img
                  src={cover}
                  alt={article.title || ''}
                  className={styles.printImage}
                />
              </span>
            </>
          );

          if (article.slug) {
            return (
              <Link
                key={article.id || article.slug || index}
                href={`/blog/${article.slug}`}
                className={className}
              >
                {inner}
              </Link>
            );
          }

          return (
            <div key={bundle.id || index} className={className}>
              {inner}
            </div>
          );
        })}
      </div>

      <div className={styles.body}>
        <div className={styles.bodyTop}>
          <h3 className={styles.name}>{bundle.name}</h3>
          <span className={styles.count}>
            {count} {count === 1 ? 'Story' : 'Stories'}
          </span>
        </div>
        {firstHref ? (
          <Link href={firstHref} className={styles.explore}>
            Explore series
            <ArrowRight size={15} strokeWidth={1.75} />
          </Link>
        ) : isDormant ? null : (
          <span className={styles.exploreDisabled}>Series in progress</span>
        )}
      </div>
    </article>
  );
}
