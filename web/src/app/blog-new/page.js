import Link from 'next/link';
import localFont from 'next/font/local';
import { ArrowRight, BookOpen, Box, FileText } from 'lucide-react';
import ToolsTiles from './ToolsTiles';
import styles from './page.module.css';

export const metadata = {
  title: 'Builders Daily Blog',
  description: 'Thoughts, experiments and ideas from the frontier of artificial intelligence.',
};

const fkGrotesk = localFont({
  src: '../fonts/FKGroteskTrial-Regular.otf',
  variable: '--font-blog-new',
  display: 'swap',
});

const experiments = [
  {
    category: 'GENERATIVE AI',
    title: 'Generating narratives with long-term memory',
    date: 'May 19, 2024',
    readTime: '5 min read',
    image: '/blog-new/latest-smoke.png',
  },
  {
    category: 'VISUAL MODELING',
    title: 'Visual concepts in synthetic datasets',
    date: 'May 15, 2024',
    readTime: '6 min read',
    image: '/blog-new/latest-cubes.png',
  },
  {
    category: 'EXPERIMENTAL',
    title: 'Compression models with reasoning masks',
    date: 'May 12, 2024',
    readTime: '4 min read',
    image: '/blog-new/latest-waves.png',
  },
];

const featuredSeries = [
  {
    title: 'The Future of\nReasoning Models',
    count: '6 ARTICLES',
    image: '/blog-new/series-reasoning.png',
    tone: 'orange',
  },
  {
    title: 'Synthetic Data\nExplorations',
    count: '5 ARTICLES',
    image: '/blog-new/series-synthetic.png',
    tone: 'light',
  },
  {
    title: 'AI in Creative\nWorkflows',
    count: '4 ARTICLES',
    image: '/blog-new/series-creative.png',
    tone: 'dark',
  },
];

export default function BlogNewLanding() {
  return (
    <main className={`${styles.page} ${fkGrotesk.variable}`}>
      <section className={styles.hero} aria-label="Builders Daily Blog landing hero">
        <div className={styles.heroImage} aria-hidden="true" />
        <div className={styles.heroWash} aria-hidden="true" />
        <div className={styles.gridField} aria-hidden="true">
          <span className={styles.gridDotOne} />
          <span className={styles.gridDotTwo} />
          <span className={styles.gridDotThree} />
          <span className={styles.gridLabel}>001</span>
        </div>

        <aside className={styles.progressRail} aria-hidden="true">
          <span className={styles.issue}>01</span>
          <span className={styles.railTrack}>
            <span className={styles.railFill} />
            <span className={styles.railNode} />
          </span>
        </aside>

        <nav className={styles.nav} aria-label="Blog navigation">
          <Link href="/" className={styles.brand} aria-label="Builders Daily home">
            <span className={styles.brandText}>
              Builders Daily <span>Blog</span>
            </span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/blog-new">Experiments</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/">About</Link>
            <Link href="/">Resources</Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/blog" className={styles.subscribe}>
              Subscribe
            </Link>
          </div>
        </nav>

        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Builders Daily Blog</p>
          <h1>
            <span>Exploring AI.</span>
            <strong>Experimenting<br />with Tomorrow.</strong>
          </h1>
          <p className={styles.subcopy}>
            Thoughts, experiments and ideas<br />
            from the frontier of artificial intelligence.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/blog" className={styles.primaryCta}>
              Explore Experiments
            </Link>
            <Link href="#latest" className={styles.secondaryCta}>
              Learn More
              <span>
                <ArrowRight size={22} strokeWidth={2.2} />
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.orbitMark} aria-hidden="true">
          <span />
        </div>
      </section>

      <section className={styles.experimentsSection} id="latest" aria-label="Latest experiments">
        <aside className={styles.experimentsRail} aria-hidden="true">
          <span className={styles.experimentsIssue}>02</span>
          <span className={styles.experimentsLine}>
            <span className={styles.experimentsFill} />
            <span className={styles.experimentsDot} />
          </span>
        </aside>

        <div className={styles.experimentsIntro}>
          <h2>
            <span>Latest</span>
            <strong>Experiments</strong>
          </h2>
          <p>A collection of recent AI projects with real outcomes.</p>
          <Link href="/blog" className={styles.viewAll}>
            View All
            <ArrowRight size={30} strokeWidth={1.7} />
          </Link>
        </div>

        <div className={styles.experimentCards}>
          {experiments.map((item) => (
            <article className={styles.experimentCard} key={item.title}>
              <div className={styles.experimentImage}>
                <img src={item.image} alt="" />
              </div>
              <div className={styles.experimentBody}>
                <time>{item.date}</time>
                <h3>{item.title}</h3>
                <div className={styles.experimentMeta}>
                  <span>{item.readTime}</span>
                  <ArrowRight size={32} strokeWidth={1.45} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.aboutSection} id="about" aria-label="About AI Experiments">
        <aside className={styles.aboutRail} aria-hidden="true">
          <span className={styles.aboutIssue}>03</span>
          <span className={styles.aboutLine}>
            <span className={styles.aboutFill} />
            <span className={styles.aboutDot} />
          </span>
        </aside>

        <div className={styles.aboutCopy}>
          <h2>
            <span>About</span>
            <strong>AI Experiments</strong>
          </h2>
          <p>
            We run experiments to understand how AI systems think, learn and evolve. Starting from
            the proxies, and up the meta stack.
          </p>
          <Link href="/blog" className={styles.aboutLink}>
            Read More
            <ArrowRight size={30} strokeWidth={1.7} />
          </Link>
        </div>

        <div className={styles.aboutVisualWrap}>
          <div className={styles.aboutEyebrow}>
            <span>Explore.</span>
            <i />
          </div>
          <div className={styles.aboutVisual}>
            <img src="/blog-new/about-profile.png" alt="" />
          </div>
        </div>
      </section>

      <section className={styles.seriesSection} id="series" aria-label="Featured series">
        <aside className={styles.seriesRail} aria-hidden="true">
          <span className={styles.seriesIssue}>04</span>
          <span className={styles.seriesLine}>
            <span className={styles.seriesFill} />
            <span className={styles.seriesDot} />
          </span>
        </aside>

        <div className={styles.seriesIntro}>
          <h2>
            <span>Featured</span>
            <strong>Series</strong>
          </h2>
          <p>Deep dives into themes we{'â€™'}re actively exploring.</p>
          <Link href="/blog" className={styles.seriesBrowse}>
            Browse Series
            <span>
              <ArrowRight size={24} strokeWidth={1.7} />
            </span>
          </Link>
        </div>

        <div className={styles.seriesCardsWrap}>
          <div className={styles.seriesCards}>
            {featuredSeries.map((item) => (
              <article className={`${styles.seriesCard} ${styles[`seriesCard${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]}`} key={item.title}>
                <img src={item.image} alt="" />
                <div className={styles.seriesOverlay} />
                <div className={styles.seriesCardBody}>
                  <h3>
                    {item.title.split('\n').map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p>{item.count}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.seriesDots} aria-hidden="true">
            <span className={styles.seriesDotActive} />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className={styles.loopSection} id="subscribe" aria-label="Subscribe to Builders Daily Blog">
        <aside className={styles.loopRail} aria-hidden="true">
          <span className={styles.loopIssue}>05</span>
          <span className={styles.loopLine}>
            <span className={styles.loopFill} />
            <span className={styles.loopDot} />
          </span>
        </aside>

        <div className={styles.loopBackdrop} aria-hidden="true" />

        <div className={styles.loopCopy}>
          <h2>
            <span>Stay in the</span>
            <strong>Loop</strong>
          </h2>
          <p>
            Get the latest experiments, ideas<br />
            and insights delivered to your inbox.
          </p>

          <form className={styles.loopForm}>
            <label className={styles.loopLabel} htmlFor="loop-email">
              Email address
            </label>
            <input id="loop-email" name="email" type="email" placeholder="Enter your email" />
            <button type="button">
              Subscribe
              <ArrowRight size={30} strokeWidth={1.7} />
            </button>
          </form>
        </div>
      </section>

      <section className={styles.toolsSection} id="tools" aria-label="Tools I use">
        <aside className={styles.toolsRail} aria-hidden="true">
          <span className={styles.toolsIssue}>06</span>
          <span className={styles.toolsLine}>
            <span className={styles.toolsFill} />
            <span className={styles.toolsDot} />
          </span>
        </aside>

        <div className={styles.toolsCopy}>
          <p className={styles.toolsEyebrow}>TOOLS I USE</p>
          <h2>The <span>Essentials.</span></h2>
          <p className={styles.toolsDesc}>
            A curated list of tools that power my workflow.
          </p>
          <Link href="/blog" className={styles.toolsLink}>
            See the full list
            <ArrowRight size={24} strokeWidth={1.7} />
          </Link>
        </div>

        <ToolsTiles />
      </section>

      <section className={styles.futureSection} id="future" aria-label="Let's build the future">
        <aside className={styles.futureRail} aria-hidden="true">
          <span className={styles.futureIssue}>07</span>
          <span className={styles.futureLine}>
            <span className={styles.futureFill} />
            <span className={styles.futureDot} />
          </span>
        </aside>

        <div className={styles.futureBackdrop} aria-hidden="true" />

        <div className={styles.futureCopy}>
          <h2>
            <span>Let&apos;s Build</span>
            <span>the <strong>Future.</strong></span>
          </h2>
          <p>
            Ideas, experiments, and future data.<br />
            The future is built today.
          </p>
          <Link href="/" className={styles.futureLink}>
            Get in Touch
            <ArrowRight size={26} strokeWidth={1.7} />
          </Link>
        </div>
      </section>

      <section className={styles.resourcesSection} id="resources" aria-label="Tools and resources">
        <div className={styles.resourcesPanel}>
          <aside className={styles.resourcesRail} aria-hidden="true">
            <span className={styles.resourcesIssue}>08</span>
            <span className={styles.resourcesLine}>
              <span className={styles.resourcesFill} />
              <span className={styles.resourcesDot} />
            </span>
          </aside>

          <div className={styles.resourcesVisual} aria-hidden="true" />

          <div className={styles.resourcesCopy}>
            <h2>
              <span>Tools &amp;</span>
              <strong>Resources</strong>
            </h2>
            <p>
              Curated resources, tools, and<br />
              references from our lab.
            </p>
          </div>

          <div className={styles.resourcesList}>
            <article className={styles.resourceItem}>
              <Box size={30} strokeWidth={1.8} />
              <div>
                <h3>Datasets</h3>
                <p>Curated data</p>
              </div>
            </article>
            <article className={styles.resourceItem}>
              <BookOpen size={30} strokeWidth={1.8} />
              <div>
                <h3>Open Source</h3>
                <p>Git repos</p>
              </div>
            </article>
            <article className={styles.resourceItem}>
              <FileText size={30} strokeWidth={1.8} />
              <div>
                <h3>Guides</h3>
                <p>In-depth docs</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
